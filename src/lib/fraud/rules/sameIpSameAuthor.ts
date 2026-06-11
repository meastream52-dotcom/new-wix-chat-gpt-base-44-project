import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FraudRule, SignalCandidate } from "@/lib/fraud/types";

/**
 * 3+ distinct reader accounts sharing an ipHash, with 80%+ of their combined
 * qualified time landing on one author. The signal subject is the AUTHOR —
 * that's where the money would flow.
 */
export const sameIpSameAuthor: FraudRule = async (windowStart, windowEnd) => {
  const perAuthor = await prisma.$queryRaw<
    Array<{ ipHash: string; authorId: string; readers: string[]; seconds: number }>
  >(Prisma.sql`
    SELECT rs."ipHash"                          AS "ipHash",
           p."authorId"                         AS "authorId",
           array_agg(DISTINCT rs."userId")      AS "readers",
           SUM(rs."qualifiedSeconds")::int      AS "seconds"
    FROM reading_sessions rs
    JOIN posts p ON p.id = rs."postId"
    WHERE rs."startedAt" >= ${windowStart} AND rs."startedAt" < ${windowEnd}
      AND rs."ipHash" IS NOT NULL
      AND rs."userId" <> p."authorId"
    GROUP BY rs."ipHash", p."authorId"
  `);

  const totalByIp = new Map<string, number>();
  for (const row of perAuthor) {
    totalByIp.set(row.ipHash, (totalByIp.get(row.ipHash) ?? 0) + row.seconds);
  }

  const signals: SignalCandidate[] = [];
  for (const row of perAuthor) {
    const total = totalByIp.get(row.ipHash) ?? 0;
    if (row.readers.length >= 3 && total > 0 && row.seconds / total >= 0.8) {
      signals.push({
        userId: row.authorId,
        signalType: "same_ip_same_author",
        severity: "high",
        evidence: {
          dedupeKey: `${row.ipHash}:${row.authorId}`,
          ipHash: row.ipHash,
          readerIds: row.readers,
          sessionUserIds: row.readers,
          authorId: row.authorId,
          minutes: Math.round(row.seconds / 60),
          windowStart: windowStart.toISOString(),
          windowEnd: windowEnd.toISOString(),
        },
      });
    }
  }
  return signals;
};
