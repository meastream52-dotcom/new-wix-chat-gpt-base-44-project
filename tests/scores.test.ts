import { describe, expect, it } from "vitest";
import { userScoreOf, writerScoreOf, WRITER_WEIGHTS } from "@/lib/revenue/scores";
import { payoutIdempotencyKey } from "@/lib/payouts/run";

describe("writer score formula", () => {
  it("applies the published weights exactly", () => {
    const score = writerScoreOf({
      readMinutes: 100,
      uniqueReaders: 10,
      subscriberReadMinutes: 20,
      comments: 5,
    });
    // 100*1.0 + 10*0.5 + 20*1.5 + 5*0.2 = 136
    expect(score).toBe(136);
  });

  it("weights match the documented 1.0 / 0.5 / 1.5 / 0.2", () => {
    expect(WRITER_WEIGHTS.qualifiedReadMinutes).toBe(1.0);
    expect(WRITER_WEIGHTS.uniqueReaders).toBe(0.5);
    expect(WRITER_WEIGHTS.subscriberReadMinutes).toBe(1.5);
    expect(WRITER_WEIGHTS.visibleComments).toBe(0.2);
  });
});

describe("user score formula", () => {
  it("sums read minutes, capped event points, and unique likers", () => {
    // 30 read minutes + (4 comments × 2 + 1 post × 5 = 13 event points) + 6 likers
    expect(userScoreOf({ readMinutes: 30, eventPoints: 13, uniqueLikers: 6 })).toBe(49);
  });
});

describe("payout idempotency key", () => {
  it("has the stable `${batchId}:${userId}` format — never change this", () => {
    expect(payoutIdempotencyKey("batch_1", "user_9")).toBe("batch_1:user_9");
  });
});
