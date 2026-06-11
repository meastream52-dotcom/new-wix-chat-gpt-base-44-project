import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FraudRule, SignalCandidate } from "@/lib/fraud/types";

/**
 * A reader whose qualified minutes are 90%+ concentrated on one author AND
 * who registered within 48h of that author. Low severity on purpose:
 * real-life friends look exactly like this.
 */
export const selfDealingProxy: FraudRule = async (windowStart, windowEnd) => {
  const rows = await prisma.$queryRaw<
    Array<{ readerId: string; authorId: string; authorSeconds: number; totalSeconds: number }>
  >(Prisma.sql`
    WITH per_author AS (
      SELECT rs."userId" AS reader_id, p."authorId" AS author_id,
             SUM(rs."qualifiedSeconds") AS author_seconds
      FROM reading_sessions rs
      JOIN posts p ON p.id = rs."postId"
      WHERE rs."startedAt" >= ${windowStart} AND rs."startedAt" < ${windowEnd}
        AND rs."userId" <> p."authorId"
      GROUP BY 1, 2
    ),
    totals AS (
      SELECT reader_id, SUM(author_seconds) AS total_seconds
      FROM per_author GROUP BY 1
    )
    SELECT pa.reader_id        AS "readerId",
           pa.author_id        AS "authorId",
           pa.author_seconds::int AS "authorSeconds",
           t.total_seconds::int   AS "totalSeconds"
    FROM per_author pa
    JOIN totals t ON t.reader_id = pa.reader_id
    JOIN users reader ON reader.id = pa.reader_id
    JOIN users author ON author.id = pa.author_id
    WHERE t.total_seconds >= 600
      AND pa.author_seconds::float / t.total_seconds >= 0.9
      AND abs(extract(epoch FROM reader."createdAt" - author."createdAt")) <= 172800
  `);

  return rows.map(
    (row): SignalCandidate => ({
      userId: row.readerId,
      signalType: "self_dealing_proxy",
      severity: "low",
      evidence: {
        dedupeKey: `${row.readerId}:${row.authorId}`,
        authorId: row.authorId,
        concentrationPct: Math.round((row.authorSeconds / row.totalSeconds) * 100),
        minutes: Math.round(row.authorSeconds / 60),
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
    })
  );
};
