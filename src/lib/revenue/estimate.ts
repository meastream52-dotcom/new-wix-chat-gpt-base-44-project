import { unstable_cache } from "next/cache";
import { startOfMonth } from "date-fns";
import { getRevenueSplit } from "@/lib/config";
import { allocatePool, splitPools } from "@/lib/revenue/allocate";
import { getMonthlyRevenueCents } from "@/lib/revenue/getMonthlyRevenueCents";
import { getUserScores, getWriterScores } from "@/lib/revenue/scores";

export interface EarningsEstimate {
  asOf: string;
  totalRevenueCents: number;
  writerPoolCents: number;
  userPoolCents: number;
  writerEstimateCents: number;
  userEstimateCents: number;
  totalEstimateCents: number;
  perPost: Array<{
    postId: string;
    title: string;
    score: number;
    readMinutes: number;
    uniqueReaders: number;
    subscriberReadMinutes: number;
    comments: number;
    estimateCents: number;
  }>;
}

/**
 * PREVIEW ONLY — no money moves here. Same scores module as the month-end
 * close, so estimates and final entries can't drift; only the revenue input
 * (month-to-date vs closed month) differs. Cached for 1h.
 */
async function computeEstimate(userId: string): Promise<EarningsEstimate> {
  const now = new Date();
  const windowStart = startOfMonth(now);

  const [{ totalCents }, split] = await Promise.all([
    getMonthlyRevenueCents(windowStart, now),
    getRevenueSplit(),
  ]);
  const pools = splitPools(totalCents, split);

  const [writerScores, userScores] = await Promise.all([
    getWriterScores(windowStart, now),
    getUserScores(windowStart, now),
  ]);

  const writerAllocations = allocatePool(
    pools.writerPoolCents,
    writerScores.map((s) => ({ key: s, score: s.score }))
  );
  const userAllocations = allocatePool(
    pools.userPoolCents,
    userScores.map((s) => ({ key: s.userId, score: s.score }))
  );

  const perPost = writerScores
    .filter((s) => s.authorId === userId)
    .map((s) => ({
      postId: s.postId,
      title: s.title,
      score: Math.round(s.score * 100) / 100,
      readMinutes: Math.round(s.readMinutes * 10) / 10,
      uniqueReaders: s.uniqueReaders,
      subscriberReadMinutes: Math.round(s.subscriberReadMinutes * 10) / 10,
      comments: s.comments,
      estimateCents: Number(
        writerAllocations.find((a) => a.key.postId === s.postId)?.amountCents ?? 0n
      ),
    }))
    .sort((a, b) => b.estimateCents - a.estimateCents);

  const writerEstimateCents = perPost.reduce((sum, p) => sum + p.estimateCents, 0);
  const userEstimateCents = Number(
    userAllocations.find((a) => a.key === userId)?.amountCents ?? 0n
  );

  return {
    asOf: now.toISOString(),
    totalRevenueCents: Number(totalCents),
    writerPoolCents: Number(pools.writerPoolCents),
    userPoolCents: Number(pools.userPoolCents),
    writerEstimateCents,
    userEstimateCents,
    totalEstimateCents: writerEstimateCents + userEstimateCents,
    perPost,
  };
}

export function estimateCurrentPeriod(userId: string): Promise<EarningsEstimate> {
  const monthKey = startOfMonth(new Date()).toISOString().slice(0, 7);
  return unstable_cache(
    () => computeEstimate(userId),
    ["earnings-estimate", userId, monthKey],
    { revalidate: 3600 }
  )();
}
