import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FraudRule, SignalCandidate } from "@/lib/fraud/types";

const MAX_DAILY_MINUTES = 120;

/**
 * Accounts under 7 days old logging more than 120 qualified minutes in a
 * single day. (The top-decile variant can be layered on once there's enough
 * traffic for a meaningful decile.)
 */
export const newAccountVelocity: FraudRule = async (windowStart, windowEnd) => {
  const rows = await prisma.$queryRaw<
    Array<{ userId: string; day: Date; minutes: number }>
  >(Prisma.sql`
    SELECT rs."userId"                                   AS "userId",
           date_trunc('day', rs."startedAt")             AS "day",
           SUM(rs."qualifiedSeconds") / 60.0             AS "minutes"
    FROM reading_sessions rs
    JOIN users u ON u.id = rs."userId"
    WHERE rs."startedAt" >= ${windowStart} AND rs."startedAt" < ${windowEnd}
      AND rs."startedAt" < u."createdAt" + interval '7 days'
    GROUP BY 1, 2
    HAVING SUM(rs."qualifiedSeconds") / 60.0 > ${MAX_DAILY_MINUTES}
  `);

  const signals: SignalCandidate[] = [];
  for (const row of rows) {
    signals.push({
      userId: row.userId,
      signalType: "new_account_velocity",
      severity: "medium",
      evidence: {
        dedupeKey: `${row.userId}:${row.day.toISOString().slice(0, 10)}`,
        day: row.day.toISOString().slice(0, 10),
        minutes: Math.round(Number(row.minutes)),
        sessionUserIds: [row.userId],
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
    });
  }
  return signals;
};
