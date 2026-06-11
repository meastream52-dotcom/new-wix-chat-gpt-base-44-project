import { unstable_cache } from "next/cache";
import { subDays } from "date-fns";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MIN_QUALIFIED_SECONDS } from "@/lib/engagement/constants";

export type StatRange = "7d" | "30d" | "all";

function rangeStart(range: StatRange): Date {
  if (range === "7d") return subDays(new Date(), 7);
  if (range === "30d") return subDays(new Date(), 30);
  return new Date(0);
}

export interface PostStat {
  postId: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null; // ISO date — kept JSON-safe for unstable_cache
  readMinutes: number;
  uniqueReaders: number;
  comments: number;
  likes: number;
}

/**
 * Self-engagement and suspicious sessions are excluded at write time, but
 * filtered again here defensively — dashboards must match what distribution
 * would pay on.
 */
async function postStatsUncached(authorId: string, range: StatRange): Promise<PostStat[]> {
  const since = rangeStart(range);
  const rows = await prisma.$queryRaw<
    Array<Omit<PostStat, "publishedAt"> & { publishedAt: Date | null }>
  >(Prisma.sql`
    SELECT
      p.id            AS "postId",
      p.title         AS "title",
      p.slug          AS "slug",
      p.status::text  AS "status",
      p."publishedAt" AS "publishedAt",
      COALESCE(r.read_minutes, 0)::float AS "readMinutes",
      COALESCE(r.unique_readers, 0)::int AS "uniqueReaders",
      COALESCE(c.cnt, 0)::int            AS "comments",
      COALESCE(l.cnt, 0)::int            AS "likes"
    FROM posts p
    LEFT JOIN (
      SELECT rs."postId",
             SUM(rs."qualifiedSeconds") / 60.0 AS read_minutes,
             COUNT(DISTINCT rs."userId")       AS unique_readers
      FROM reading_sessions rs
      WHERE rs."startedAt" >= ${since}
        AND rs."isSuspicious" = false
        AND rs."qualifiedSeconds" >= ${MIN_QUALIFIED_SECONDS}
        AND rs."userId" <> ${authorId}
      GROUP BY rs."postId"
    ) r ON r."postId" = p.id
    LEFT JOIN (
      SELECT cm."postId", COUNT(*) AS cnt
      FROM comments cm
      WHERE cm."createdAt" >= ${since} AND cm.status = 'visible'
        AND cm."authorId" <> ${authorId}
      GROUP BY cm."postId"
    ) c ON c."postId" = p.id
    LEFT JOIN (
      SELECT rx."postId", COUNT(*) AS cnt
      FROM reactions rx
      WHERE rx."createdAt" >= ${since} AND rx."userId" <> ${authorId}
      GROUP BY rx."postId"
    ) l ON l."postId" = p.id
    WHERE p."authorId" = ${authorId} AND p.status <> 'DELETED'
    ORDER BY COALESCE(r.read_minutes, 0) DESC
  `);
  return rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    readMinutes: Math.round(r.readMinutes * 10) / 10,
  }));
}

export interface AuthorTotals {
  readMinutes: number;
  uniqueReaders: number;
  comments: number;
  likes: number;
  daily: Array<{ day: string; readMinutes: number }>;
}

async function authorTotalsUncached(authorId: string, range: StatRange): Promise<AuthorTotals> {
  const stats = await postStatsUncached(authorId, range);
  const totals = stats.reduce(
    (acc, s) => ({
      readMinutes: acc.readMinutes + s.readMinutes,
      uniqueReaders: acc.uniqueReaders + s.uniqueReaders,
      comments: acc.comments + s.comments,
      likes: acc.likes + s.likes,
    }),
    { readMinutes: 0, uniqueReaders: 0, comments: 0, likes: 0 }
  );

  const since = subDays(new Date(), 30);
  const daily = await prisma.$queryRaw<Array<{ day: Date; minutes: number }>>(Prisma.sql`
    SELECT date_trunc('day', rs."startedAt") AS day,
           SUM(rs."qualifiedSeconds") / 60.0 AS minutes
    FROM reading_sessions rs
    JOIN posts p ON p.id = rs."postId"
    WHERE p."authorId" = ${authorId}
      AND rs."startedAt" >= ${since}
      AND rs."isSuspicious" = false
      AND rs."qualifiedSeconds" >= ${MIN_QUALIFIED_SECONDS}
      AND rs."userId" <> ${authorId}
    GROUP BY 1 ORDER BY 1
  `);

  return {
    ...totals,
    readMinutes: Math.round(totals.readMinutes * 10) / 10,
    daily: daily.map((d) => ({
      day: d.day.toISOString().slice(0, 10),
      readMinutes: Math.round(Number(d.minutes) * 10) / 10,
    })),
  };
}

// Dashboards don't need to be real-time — 5 min cache
export function postStats(authorId: string, range: StatRange): Promise<PostStat[]> {
  return unstable_cache(
    () => postStatsUncached(authorId, range),
    ["post-stats", authorId, range],
    { revalidate: 300 }
  )();
}

export function authorTotals(authorId: string, range: StatRange): Promise<AuthorTotals> {
  return unstable_cache(
    () => authorTotalsUncached(authorId, range),
    ["author-totals", authorId, range],
    { revalidate: 300 }
  )();
}
