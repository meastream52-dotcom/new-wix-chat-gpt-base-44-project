/**
 * Pure money math. All amounts are integer cents (bigint). Scores are
 * floats upstream; they are scaled to integers here so every division is
 * exact bigint arithmetic — no float ever touches an amount.
 */

export const SCORE_SCALE = 1000n;

export function scaleScore(score: number): bigint {
  return BigInt(Math.round(score * Number(SCORE_SCALE)));
}

export interface PoolSplit {
  ownerPoolCents: bigint;
  writerPoolCents: bigint;
  userPoolCents: bigint;
}

/**
 * Split total revenue into the three pools. Remainders from integer
 * division are credited to the OWNER pool — the platform absorbs rounding,
 * writers/users are never collectively short-changed relative to their
 * stated percentage floor.
 */
export function splitPools(
  totalCents: bigint,
  split: { ownerPct: number; writerPct: number; userPct: number }
): PoolSplit {
  const writerPoolCents = (totalCents * BigInt(split.writerPct)) / 100n;
  const userPoolCents = (totalCents * BigInt(split.userPct)) / 100n;
  const ownerPoolCents = totalCents - writerPoolCents - userPoolCents;
  return { ownerPoolCents, writerPoolCents, userPoolCents };
}

export interface Allocation<K> {
  key: K;
  amountCents: bigint;
}

/**
 * Distribute a pool proportionally to scores. Floor division per entry,
 * with the running remainder added to the largest entry so the allocations
 * sum to exactly the pool. Entries that round to 0 cents are dropped.
 */
export function allocatePool<K>(
  poolCents: bigint,
  scores: Array<{ key: K; score: number }>
): Allocation<K>[] {
  if (poolCents <= 0n) return [];

  const scaled = scores
    .map(({ key, score }) => ({ key, scaled: scaleScore(score) }))
    .filter((s) => s.scaled > 0n);
  const totalScaled = scaled.reduce((sum, s) => sum + s.scaled, 0n);
  if (totalScaled === 0n) return [];

  const allocations = scaled.map(({ key, scaled: s }) => ({
    key,
    amountCents: (poolCents * s) / totalScaled,
  }));

  const allocatedTotal = allocations.reduce((sum, a) => sum + a.amountCents, 0n);
  const remainder = poolCents - allocatedTotal;
  if (remainder > 0n && allocations.length > 0) {
    const largest = allocations.reduce((max, a) =>
      a.amountCents > max.amountCents ? a : max
    );
    largest.amountCents += remainder;
  }

  return allocations.filter((a) => a.amountCents >= 1n);
}
