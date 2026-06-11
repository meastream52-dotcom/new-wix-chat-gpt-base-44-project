import { prisma } from "@/lib/prisma";
import type { FraudRule, SignalCandidate } from "@/lib/fraud/types";

/**
 * Sessions claiming 5+ qualified minutes with no scroll movement at all.
 * Real readers scroll; bots holding a heartbeat loop don't.
 */
export const readWithoutScroll: FraudRule = async (windowStart, windowEnd) => {
  const sessions = await prisma.readingSession.groupBy({
    by: ["userId"],
    where: {
      startedAt: { gte: windowStart, lt: windowEnd },
      qualifiedSeconds: { gte: 300 },
      maxScrollPct: { lte: 0 },
    },
    _count: { _all: true },
  });

  return sessions.map(
    (row): SignalCandidate => ({
      userId: row.userId,
      signalType: "read_without_scroll",
      severity: "medium",
      evidence: {
        dedupeKey: `${row.userId}:${windowStart.toISOString().slice(0, 10)}`,
        zeroScrollLongSessions: row._count._all,
        sessionUserIds: [row.userId],
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
    })
  );
};
