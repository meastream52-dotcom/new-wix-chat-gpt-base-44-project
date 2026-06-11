import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

/** Stripe idempotency key — stable format, asserted by tests. Never change. */
export function payoutIdempotencyKey(batchId: string, userId: string): string {
  return `${batchId}:${userId}`;
}

export interface PayoutGroup {
  userId: string;
  username: string;
  connectedAccountId: string | null;
  entryIds: string[];
  totalCents: bigint;
}

export interface PayoutPreview {
  eligible: PayoutGroup[];
  skipped: Array<{ userId: string; username: string; totalCents: bigint; reason: string }>;
  totalCents: bigint;
  minimumPayoutCents: number;
}

/**
 * Dry run — the exact selection the run endpoint uses. Entries: status
 * "approved", unclaimed; users: payouts enabled, group total >= threshold.
 */
export async function previewPayouts(periodId?: string): Promise<PayoutPreview> {
  const minimumPayoutCents = await getConfig<number>("minimum_payout_cents");

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      status: "approved",
      payoutBatchId: null,
      ...(periodId ? { revenuePeriodId: periodId } : {}),
    },
    include: {
      user: {
        select: { id: true, username: true, payoutAccount: true },
      },
    },
  });

  const byUser = new Map<string, PayoutGroup & { payoutsEnabled: boolean }>();
  for (const entry of entries) {
    const group = byUser.get(entry.userId) ?? {
      userId: entry.userId,
      username: entry.user.username,
      connectedAccountId: entry.user.payoutAccount?.stripeConnectedAccountId ?? null,
      payoutsEnabled: entry.user.payoutAccount?.payoutsEnabled ?? false,
      entryIds: [],
      totalCents: 0n,
    };
    group.entryIds.push(entry.id);
    group.totalCents += entry.amountCents;
    byUser.set(entry.userId, group);
  }

  const eligible: PayoutGroup[] = [];
  const skipped: PayoutPreview["skipped"] = [];
  for (const group of byUser.values()) {
    if (!group.payoutsEnabled || !group.connectedAccountId) {
      skipped.push({
        userId: group.userId,
        username: group.username,
        totalCents: group.totalCents,
        reason: "payout account not ready",
      });
    } else if (group.totalCents < BigInt(minimumPayoutCents)) {
      skipped.push({
        userId: group.userId,
        username: group.username,
        totalCents: group.totalCents,
        reason: `below minimum ($${(minimumPayoutCents / 100).toFixed(2)})`,
      });
    } else {
      eligible.push(group);
    }
  }

  return {
    eligible,
    skipped,
    totalCents: eligible.reduce((sum, g) => sum + g.totalCents, 0n),
    minimumPayoutCents,
  };
}

export interface PayoutRunResult {
  batchId: string;
  status: string;
  paid: Array<{ userId: string; amountCents: bigint; transferId: string }>;
  failed: Array<{ userId: string; amountCents: bigint; reason: string }>;
  skipped: PayoutPreview["skipped"];
}

/**
 * The only code path that moves real money. Idempotent at three levels:
 * the atomic claim (an entry can join one batch ever), the Stripe
 * idempotency key per (batch, user), and entries reverting to "approved"
 * on failure so only unpaid users are retried.
 */
export async function runPayouts(actorId: string, periodId?: string): Promise<PayoutRunResult> {
  if (!stripeEnabled) throw new Error("Stripe is not configured — payouts unavailable");
  const stripe = getStripe();
  const preview = await previewPayouts(periodId);

  // Platform balance guard
  const balance = await stripe.balance.retrieve();
  const availableUsd = BigInt(
    balance.available.find((b) => b.currency === "usd")?.amount ?? 0
  );
  if (preview.totalCents > availableUsd) {
    throw new Error(
      `Payout total ${preview.totalCents}¢ exceeds available Stripe balance ${availableUsd}¢ — aborting`
    );
  }

  const batch = await prisma.payoutBatch.create({
    data: { revenuePeriodId: periodId ?? null, createdById: actorId, status: "processing" },
  });
  await logAudit(actorId, "payout_batch.run", "payout_batch", batch.id, {
    periodId: periodId ?? null,
    eligibleUsers: preview.eligible.length,
    totalCents: preview.totalCents.toString(),
  });

  const paid: PayoutRunResult["paid"] = [];
  const failed: PayoutRunResult["failed"] = [];

  for (const group of preview.eligible) {
    // Atomic claim — re-running can never double-claim these entries
    const claimed = await prisma.ledgerEntry.updateMany({
      where: { id: { in: group.entryIds }, status: "approved", payoutBatchId: null },
      data: { payoutBatchId: batch.id },
    });
    if (claimed.count !== group.entryIds.length) {
      // Someone else claimed part of this group since the preview — skip user
      await prisma.ledgerEntry.updateMany({
        where: { id: { in: group.entryIds }, payoutBatchId: batch.id, status: "approved" },
        data: { payoutBatchId: null },
      });
      continue;
    }

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: Number(group.totalCents),
          currency: "usd",
          destination: group.connectedAccountId!,
          transfer_group: batch.id,
          metadata: {
            userId: group.userId,
            batchId: batch.id,
            entryIds: group.entryIds.join(","),
          },
        },
        { idempotencyKey: payoutIdempotencyKey(batch.id, group.userId) }
      );

      await prisma.ledgerEntry.updateMany({
        where: { id: { in: group.entryIds } },
        data: { status: "paid", stripeTransferId: transfer.id },
      });
      await logAudit(actorId, "payout.transfer", "user", group.userId, {
        batchId: batch.id,
        transferId: transfer.id,
        amountCents: group.totalCents.toString(),
      });
      await notify(
        group.userId,
        "payout_sent",
        `A payout of $${(Number(group.totalCents) / 100).toFixed(2)} is on its way.`,
        "/settings/payouts"
      );
      paid.push({ userId: group.userId, amountCents: group.totalCents, transferId: transfer.id });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      // Revert: entries become payable again in the next run
      await prisma.ledgerEntry.updateMany({
        where: { id: { in: group.entryIds } },
        data: { payoutBatchId: null, failureReason: reason },
      });
      await logAudit(actorId, "payout.transfer_failed", "user", group.userId, {
        batchId: batch.id,
        reason,
      });
      failed.push({ userId: group.userId, amountCents: group.totalCents, reason });
    }
  }

  const status = failed.length === 0 ? "completed" : "completed_with_failures";
  await prisma.payoutBatch.update({
    where: { id: batch.id },
    data: { status, completedAt: new Date() },
  });

  return { batchId: batch.id, status, paid, failed, skipped: preview.skipped };
}
