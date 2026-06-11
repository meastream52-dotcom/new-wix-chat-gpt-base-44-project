import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MIN_QUALIFIED_SECONDS } from "@/lib/engagement/constants";

/**
 * THE scoring module. Both the live estimator (lib/revenue/estimate.ts) and
 * the month-end calculation (lib/revenue/calculatePeriod.ts) call these
 * functions, so the preview and the final ledger can never drift.
 *
 * Exclusions applied here (and nowhere else, so they stay consistent):
 * suspicious sessions, self-engagement, sessions under MIN_QUALIFIED_SECONDS,
 * posts that are not PUBLISHED + APPROVED + PUBLIC.
 */

export const WRITER_WEIGHTS = {
  qualifiedReadMinutes: 1.0,
  uniqueReaders: 0.5,
  subscriberReadMinutes: 1.5,
  visibleComments: 0.2,
} as const;

export const USER_WEIGHTS = {
  qualifiedReadMinutes: 1,
  // comment (×2, first 10/day) and post (×5, first 2/day) weights are encoded
  // in EngagementEvent.points at write time — caps included
  uniqueLikersReceived: 1,
} as const;

export interface PostScore {
  postId: string;
  authorId: string;
  title: string;
  readMinutes: number;
  uniqueReaders: number;
  subscriberReadMinutes: number;
  comments: number;
  score: number;
}

export interface UserScore {
  userId: string;
  readMinutes: number;
  eventPoints: number;
  uniqueLikers: number;
  score: number;
}

export function writerScoreOf(parts: {
  readMinutes: number;
  uniqueReaders: number;
  subscriberReadMinutes: number;
  comments: number;
}): number {
  return (
    parts.readMinutes * WRITER_WEIGHTS.qualifiedReadMinutes +
    parts.uniqueReaders * WRITER_WEIGHTS.uniqueReaders +
    parts.subscriberReadMinutes * WRITER_WEIGHTS.subscriberReadMinutes +
    parts.comments * WRITER_WEIGHTS.visibleComments
  );
}

export function userScoreOf(parts: {
  readMinutes: number;
  eventPoints: number;
  uniqueLikers: number;
}): number {
  return (
    parts.readMinutes * USER_WEIGHTS.qualifiedReadMinutes +
    parts.eventPoints +
    parts.uniqueLikers * USER_WEIGHTS.uniqueLikersReceived
  );
}

export async function getWriterScores(
  windowStart: Date,
  windowEnd: Date
): Promise<PostScore[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      postId: string;
      authorId: string;
      title: string;
      readMinutes: number;
      uniqueReaders: number;
      subscriberReadMinutes: number;
      comments: number;
    }>
  >(Prisma.sql`
    SELECT
      p.id            AS "postId",
      p."authorId"    AS "authorId",
      p.title         AS "title",
      COALESCE(r.read_minutes, 0)::float   AS "readMinutes",
      COALESCE(r.unique_readers, 0)::int   AS "uniqueReaders",
      COALESCE(r.sub_minutes, 0)::float    AS "subscriberReadMinutes",
      COALESCE(c.comment_count, 0)::int    AS "comments"
    FROM posts p
    LEFT JOIN (
      SELECT
        rs."postId",
        SUM(rs."qualifiedSeconds") / 60.0  AS read_minutes,
        COUNT(DISTINCT rs."userId")        AS unique_readers,
        SUM(
          CASE WHEN s.status IN ('active', 'trialing')
                AND (s."currentPeriodStart" IS NULL OR rs."startedAt" >= s."currentPeriodStart")
                AND (s."currentPeriodEnd"   IS NULL OR rs."startedAt" <= s."currentPeriodEnd")
               THEN rs."qualifiedSeconds" ELSE 0 END
        ) / 60.0                           AS sub_minutes
      FROM reading_sessions rs
      JOIN posts pp ON pp.id = rs."postId"
      LEFT JOIN subscriptions s ON s."userId" = rs."userId"
      WHERE rs."startedAt" >= ${windowStart}
        AND rs."startedAt" <  ${windowEnd}
        AND rs."isSuspicious" = false
        AND rs."qualifiedSeconds" >= ${MIN_QUALIFIED_SECONDS}
        AND rs."userId" <> pp."authorId"
      GROUP BY rs."postId"
    ) r ON r."postId" = p.id
    LEFT JOIN (
      SELECT cm."postId", COUNT(*) AS comment_count
      FROM comments cm
      JOIN posts pc ON pc.id = cm."postId"
      WHERE cm."createdAt" >= ${windowStart}
        AND cm."createdAt" <  ${windowEnd}
        AND cm.status = 'visible'
        AND cm."authorId" <> pc."authorId"
      GROUP BY cm."postId"
    ) c ON c."postId" = p.id
    WHERE p.status = 'PUBLISHED'
      AND p."moderationStatus" = 'APPROVED'
      AND p.visibility = 'PUBLIC'
      AND (r."postId" IS NOT NULL OR c."postId" IS NOT NULL)
  `);

  return rows.map((row) => ({ ...row, score: writerScoreOf(row) }));
}

export async function getUserScores(
  windowStart: Date,
  windowEnd: Date
): Promise<UserScore[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      userId: string;
      readMinutes: number;
      eventPoints: number;
      uniqueLikers: number;
    }>
  >(Prisma.sql`
    SELECT
      u.id AS "userId",
      COALESCE(rm.minutes, 0)::float     AS "readMinutes",
      COALESCE(ev.event_points, 0)::int  AS "eventPoints",
      COALESCE(lk.likers, 0)::int        AS "uniqueLikers"
    FROM users u
    LEFT JOIN (
      SELECT rs."userId", SUM(rs."qualifiedSeconds") / 60.0 AS minutes
      FROM reading_sessions rs
      JOIN posts p ON p.id = rs."postId"
      WHERE rs."startedAt" >= ${windowStart}
        AND rs."startedAt" <  ${windowEnd}
        AND rs."isSuspicious" = false
        AND rs."qualifiedSeconds" >= ${MIN_QUALIFIED_SECONDS}
        AND rs."userId" <> p."authorId"
      GROUP BY rs."userId"
    ) rm ON rm."userId" = u.id
    LEFT JOIN (
      SELECT e."userId", SUM(e.points) AS event_points
      FROM engagement_events e
      WHERE e."createdAt" >= ${windowStart}
        AND e."createdAt" <  ${windowEnd}
        AND e."eventType" IN ('comment_created', 'post_published')
        AND e."isSuspicious" = false
      GROUP BY e."userId"
    ) ev ON ev."userId" = u.id
    LEFT JOIN (
      SELECT p."authorId" AS author_id, COUNT(DISTINCT rx."userId") AS likers
      FROM reactions rx
      JOIN posts p ON p.id = rx."postId"
      WHERE rx."createdAt" >= ${windowStart}
        AND rx."createdAt" <  ${windowEnd}
        AND rx."userId" <> p."authorId"
      GROUP BY p."authorId"
    ) lk ON lk.author_id = u.id
    WHERE COALESCE(rm.minutes, 0) > 0
       OR COALESCE(ev.event_points, 0) > 0
       OR COALESCE(lk.likers, 0) > 0
  `);

  return rows.map((row) => ({ ...row, score: userScoreOf(row) }));
}
