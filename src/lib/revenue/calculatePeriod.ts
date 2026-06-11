import type { RevenuePeriod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRevenueSplit } from "@/lib/config";
import { allocatePool, splitPools } from "@/lib/revenue/allocate";
import { getMonthlyRevenueCents } from "@/lib/revenue/getMonthlyRevenueCents";
import { getUserScores, getWriterScores } from "@/lib/revenue/scores";

/**
 * Month-end close. Creates LEDGER ENTRIES (status pending / held_for_review),
 * never payouts. Idempotent on unique(periodStart, periodEnd): re-running a
 * period that isn't "failed" or "calculating" is a no-op.
 */
export async function calculatePeriod(
  periodStart: Date,
  periodEnd: Date
): Promise<RevenuePeriod> {
  const existing = await prisma.revenuePeriod.findUnique({
    where: { periodStart_periodEnd: { periodStart, periodEnd } },
  });
  if (existing && existing.status !== "failed" && existing.status !== "calculating") {
    return existing;
  }

  const { totalCents } = await getMonthlyRevenueCents(periodStart, periodEnd);
  const split = await getRevenueSplit();
  const pools = splitPools(totalCents, split);

  const period = await prisma.revenuePeriod.upsert({
    where: { periodStart_periodEnd: { periodStart, periodEnd } },
    create: {
      periodStart,
      periodEnd,
      totalRevenueCents: totalCents,
      ownerPoolCents: pools.ownerPoolCents,
      writerPoolCents: pools.writerPoolCents,
      userPoolCents: pools.userPoolCents,
      status: "calculating",
    },
    update: {
      totalRevenueCents: totalCents,
      ownerPoolCents: pools.ownerPoolCents,
      writerPoolCents: pools.writerPoolCents,
      userPoolCents: pools.userPoolCents,
      status: "calculating",
      failureReason: null,
    },
  });

  try {
    // A failed run may have left partial entries behind — clear before rebuilding
    await prisma.ledgerEntry.deleteMany({ where: { revenuePeriodId: period.id } });

    const flaggedUsers = new Set(
      (
        await prisma.user.findMany({ where: { isFlagged: true }, select: { id: true } })
      ).map((u) => u.id)
    );
    // Flagged users' entries are created directly as held_for_review
    const statusFor = (userId: string) =>
      flaggedUsers.has(userId) ? "held_for_review" : "pending";

    const writerScores = await getWriterScores(periodStart, periodEnd);
    const writerAllocations = allocatePool(
      pools.writerPoolCents,
      writerScores.map((s) => ({ key: s, score: s.score }))
    );
    await prisma.$transaction(
      writerAllocations.map(({ key: post, amountCents }) =>
        prisma.ledgerEntry.create({
          data: {
            userId: post.authorId,
            postId: post.postId,
            revenuePeriodId: period.id,
            sourceType: "writer_pool",
            amountCents,
            status: statusFor(post.authorId),
            reviewNote: flaggedUsers.has(post.authorId)
              ? "Auto-held: user is flagged"
              : null,
          },
        })
      )
    );

    const userScores = await getUserScores(periodStart, periodEnd);
    const userAllocations = allocatePool(
      pools.userPoolCents,
      userScores.map((s) => ({ key: s.userId, score: s.score }))
    );
    await prisma.$transaction(
      userAllocations.map(({ key: userId, amountCents }) =>
        prisma.ledgerEntry.create({
          data: {
            userId,
            revenuePeriodId: period.id,
            sourceType: "user_pool",
            amountCents,
            status: statusFor(userId),
            reviewNote: flaggedUsers.has(userId) ? "Auto-held: user is flagged" : null,
          },
        })
      )
    );

    // Stops here, deliberately. Admin reviews, fraud checks run,
    // THEN entries are approved and (Phase 5) paid.
    return await prisma.revenuePeriod.update({
      where: { id: period.id },
      data: { status: "pending_review" },
    });
  } catch (err) {
    await prisma.revenuePeriod.update({
      where: { id: period.id },
      data: {
        status: "failed",
        failureReason: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}
