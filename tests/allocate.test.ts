import { describe, expect, it } from "vitest";
import { allocatePool, scaleScore, splitPools } from "@/lib/revenue/allocate";

describe("splitPools", () => {
  it("splits 50/40/10 with remainders going to the owner pool", () => {
    const pools = splitPools(1001n, { ownerPct: 50, writerPct: 40, userPct: 10 });
    expect(pools.writerPoolCents).toBe(400n);
    expect(pools.userPoolCents).toBe(100n);
    expect(pools.ownerPoolCents).toBe(501n); // 500 + 1 remainder cent
    expect(pools.ownerPoolCents + pools.writerPoolCents + pools.userPoolCents).toBe(1001n);
  });

  it("respects a changed split from config", () => {
    const pools = splitPools(10000n, { ownerPct: 30, writerPct: 60, userPct: 10 });
    expect(pools.writerPoolCents).toBe(6000n);
    expect(pools.ownerPoolCents).toBe(3000n);
  });
});

describe("allocatePool", () => {
  it("sums exactly to the pool — remainder goes to the largest entry", () => {
    const allocations = allocatePool(1000n, [
      { key: "a", score: 1 },
      { key: "b", score: 1 },
      { key: "c", score: 1 },
    ]);
    const total = allocations.reduce((s, a) => s + a.amountCents, 0n);
    expect(total).toBe(1000n);
    // 333 + 333 + 333 = 999; the extra cent lands on one entry
    expect(allocations.map((a) => a.amountCents).sort()).toEqual([333n, 333n, 334n]);
  });

  it("drops sub-cent entries and still sums to the pool", () => {
    const allocations = allocatePool(100n, [
      { key: "whale", score: 10000 },
      { key: "dust", score: 0.0001 }, // rounds to zero scaled score
    ]);
    expect(allocations.find((a) => a.key === "dust")).toBeUndefined();
    expect(allocations.reduce((s, a) => s + a.amountCents, 0n)).toBe(100n);
  });

  it("returns nothing when total score is zero", () => {
    expect(allocatePool(1000n, [])).toEqual([]);
    expect(allocatePool(1000n, [{ key: "a", score: 0 }])).toEqual([]);
  });

  it("returns nothing for a zero-revenue month (no division errors)", () => {
    expect(allocatePool(0n, [{ key: "a", score: 5 }])).toEqual([]);
  });

  it("keeps exact bigint math on amounts above 2^53", () => {
    const huge = 2n ** 60n; // ~$11.5 quadrillion — synthetic, but proves no Number coercion
    const allocations = allocatePool(huge, [
      { key: "a", score: 1 },
      { key: "b", score: 2 },
    ]);
    expect(allocations.reduce((s, a) => s + a.amountCents, 0n)).toBe(huge);
    const b = allocations.find((a) => a.key === "b")!;
    expect(b.amountCents > 2n ** 59n).toBe(true);
  });

  it("scales fractional scores deterministically", () => {
    expect(scaleScore(1.2345)).toBe(1235n);
    expect(scaleScore(0)).toBe(0n);
  });
});
