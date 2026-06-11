import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import type { SignalCandidate } from "@/lib/fraud/types";
import { sameIpSameAuthor } from "@/lib/fraud/rules/sameIpSameAuthor";
import { newAccountVelocity } from "@/lib/fraud/rules/newAccountVelocity";
import { engagementRing } from "@/lib/fraud/rules/engagementRing";
import { commentDuplication } from "@/lib/fraud/rules/commentDuplication";
import { readWithoutScroll } from "@/lib/fraud/rules/readWithoutScroll";
import { selfDealingProxy } from "@/lib/fraud/rules/selfDealingProxy";

export const ALL_RULES = [
  sameIpSameAuthor,
  newAccountVelocity,
  engagementRing,
  commentDuplication,
  readWithoutScroll,
  selfDealingProxy,
];

/**
 * Nightly scan: run every rule over the window, dedupe against existing
 * open signals (same subject + type + dedupeKey), insert what's new. The
 * scan FLAGS — humans decide via /admin/fraud. High-severity signals do
 * trigger automatic *protective* steps (suspicious sessions, held entries)
 * because leaving money pending while fraud is suspected is the one
 * irreversible mistake; both steps reverse cleanly on dismissal.
 */
export async function runFraudScan(windowStart: Date, windowEnd: Date) {
  const candidates: SignalCandidate[] = [];
  for (const rule of ALL_RULES) {
    candidates.push(...(await rule(windowStart, windowEnd)));
  }

  let inserted = 0;
  for (const candidate of candidates) {
    const existing = await prisma.fraudSignal.findFirst({
      where: {
        userId: candidate.userId,
        signalType: candidate.signalType,
        status: "open",
        evidence: { path: ["dedupeKey"], equals: candidate.evidence.dedupeKey },
      },
    });
    if (existing) continue;

    const signal = await prisma.fraudSignal.create({
      data: {
        userId: candidate.userId,
        signalType: candidate.signalType,
        severity: candidate.severity,
        evidence: JSON.parse(JSON.stringify(candidate.evidence)),
      },
    });
    inserted++;

    if (candidate.severity === "high") {
      await applyHighSeverityConsequences(signal.id);
    }
  }

  return { rulesRun: ALL_RULES.length, candidates: candidates.length, inserted };
}

/**
 * Protective (reversible) consequences for a high-severity open signal:
 * mark the implicated readers' sessions in the window suspicious — which
 * excludes them from every score — and move the subject's pending entries
 * to held_for_review.
 */
export async function applyHighSeverityConsequences(signalId: string): Promise<void> {
  const signal = await prisma.fraudSignal.findUniqueOrThrow({ where: { id: signalId } });
  const evidence = signal.evidence as {
    sessionUserIds?: string[];
    windowStart?: string;
    windowEnd?: string;
  };

  if (evidence.sessionUserIds?.length && evidence.windowStart && evidence.windowEnd) {
    await prisma.readingSession.updateMany({
      where: {
        userId: { in: evidence.sessionUserIds },
        startedAt: {
          gte: new Date(evidence.windowStart),
          lt: new Date(evidence.windowEnd),
        },
      },
      data: { isSuspicious: true },
    });
  }

  const held = await prisma.ledgerEntry.updateMany({
    where: { userId: signal.userId, status: "pending" },
    data: { status: "held_for_review", reviewNote: `Auto-held: fraud signal ${signal.signalType}` },
  });
  if (held.count > 0) {
    await notify(
      signal.userId,
      "payout_held",
      "Some of your pending earnings are being reviewed. No action is needed from you.",
      "/dashboard/earnings"
    );
  }
}

export async function confirmSignal(adminId: string, signalId: string): Promise<void> {
  const signal = await prisma.fraudSignal.update({
    where: { id: signalId },
    data: { status: "confirmed", reviewedById: adminId, reviewedAt: new Date() },
  });
  // Flagged users' future ledger entries auto-create as held_for_review
  await prisma.user.update({ where: { id: signal.userId }, data: { isFlagged: true } });
  await logAudit(adminId, "fraud.confirm", "fraud_signal", signalId, {
    userId: signal.userId,
    signalType: signal.signalType,
  });
}

export async function dismissSignal(adminId: string, signalId: string): Promise<void> {
  const signal = await prisma.fraudSignal.update({
    where: { id: signalId },
    data: { status: "reviewed_ok", reviewedById: adminId, reviewedAt: new Date() },
  });

  // Reverse the protective steps: un-suspect the affected sessions and
  // release entries this signal held. (If multiple open signals overlap on
  // the same sessions, the next nightly scan re-flags them.)
  const evidence = signal.evidence as {
    sessionUserIds?: string[];
    windowStart?: string;
    windowEnd?: string;
  };
  if (evidence.sessionUserIds?.length && evidence.windowStart && evidence.windowEnd) {
    await prisma.readingSession.updateMany({
      where: {
        userId: { in: evidence.sessionUserIds },
        startedAt: {
          gte: new Date(evidence.windowStart),
          lt: new Date(evidence.windowEnd),
        },
      },
      data: { isSuspicious: false },
    });
  }
  await prisma.ledgerEntry.updateMany({
    where: {
      userId: signal.userId,
      status: "held_for_review",
      reviewNote: `Auto-held: fraud signal ${signal.signalType}`,
    },
    data: { status: "pending", reviewNote: null },
  });
  await logAudit(adminId, "fraud.dismiss", "fraud_signal", signalId, {
    userId: signal.userId,
    signalType: signal.signalType,
  });
}
