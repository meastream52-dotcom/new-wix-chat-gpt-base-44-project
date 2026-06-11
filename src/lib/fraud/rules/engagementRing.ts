import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FraudRule, SignalCandidate } from "@/lib/fraud/types";

const MIN_EVENTS = 20;
const RECIPROCITY_THRESHOLD = 0.6;

/**
 * User pairs whose engagement is mutually concentrated: 60%+ of each side's
 * events target the other's posts. Candidates are capped to users with 20+
 * events in the window to keep the pairwise pass tractable.
 */
export const engagementRing: FraudRule = async (windowStart, windowEnd) => {
  const edges = await prisma.$queryRaw<
    Array<{ actorId: string; targetAuthorId: string; cnt: number }>
  >(Prisma.sql`
    WITH active AS (
      SELECT e."userId"
      FROM engagement_events e
      WHERE e."createdAt" >= ${windowStart} AND e."createdAt" < ${windowEnd}
      GROUP BY e."userId"
      HAVING COUNT(*) >= ${MIN_EVENTS}
    )
    SELECT e."userId"     AS "actorId",
           p."authorId"   AS "targetAuthorId",
           COUNT(*)::int  AS "cnt"
    FROM engagement_events e
    JOIN posts p ON p.id = e."postId"
    WHERE e."createdAt" >= ${windowStart} AND e."createdAt" < ${windowEnd}
      AND e."userId" IN (SELECT "userId" FROM active)
      AND e."userId" <> p."authorId"
    GROUP BY 1, 2
  `);

  const totals = new Map<string, number>();
  const pairCount = new Map<string, number>();
  for (const edge of edges) {
    totals.set(edge.actorId, (totals.get(edge.actorId) ?? 0) + edge.cnt);
    pairCount.set(`${edge.actorId}→${edge.targetAuthorId}`, edge.cnt);
  }

  const signals: SignalCandidate[] = [];
  const seenPairs = new Set<string>();
  for (const edge of edges) {
    const a = edge.actorId;
    const b = edge.targetAuthorId;
    const pairKey = [a, b].sort().join(":");
    if (seenPairs.has(pairKey)) continue;

    const aToB = pairCount.get(`${a}→${b}`) ?? 0;
    const bToA = pairCount.get(`${b}→${a}`) ?? 0;
    const aTotal = totals.get(a) ?? 0;
    const bTotal = totals.get(b) ?? 0;
    if (aTotal < MIN_EVENTS || bTotal < MIN_EVENTS) continue;

    if (aToB / aTotal >= RECIPROCITY_THRESHOLD && bToA / bTotal >= RECIPROCITY_THRESHOLD) {
      seenPairs.add(pairKey);
      for (const subject of [a, b]) {
        signals.push({
          userId: subject,
          signalType: "engagement_ring",
          severity: "high",
          evidence: {
            dedupeKey: pairKey,
            pair: [a, b],
            aToB,
            bToA,
            aTotal,
            bTotal,
            sessionUserIds: [a, b],
            windowStart: windowStart.toISOString(),
            windowEnd: windowEnd.toISOString(),
          },
        });
      }
    }
  }
  return signals;
};
