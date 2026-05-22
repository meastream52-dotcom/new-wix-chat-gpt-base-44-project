import type { RawClaim, TheoryResult } from "@/lib/types";

export const MOCK_MODE = process.env.MOCK_MODE === "true";

export function mockExtract(text: string): RawClaim[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 30)
    .slice(0, 8);

  return sentences.map((s, i) => ({
    text: s.trim(),
    confidence: parseFloat((0.65 + (i % 4) * 0.08).toFixed(2)),
    timeRef: i % 3 === 0 ? "1962" : undefined,
    entities: extractMockEntities(s),
  }));
}

function extractMockEntities(text: string): string[] {
  const capitalized = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) ?? [];
  return Array.from(new Set(capitalized)).slice(0, 3);
}

export function mockJudge(claims: RawClaim[]) {
  return claims.map((c) => ({
    claim: c,
    status: (c.confidence >= 0.7 ? "ACCEPTED" : c.confidence >= 0.4 ? "WEAK" : "REJECTED") as
      "ACCEPTED" | "WEAK" | "REJECTED",
    adjustedConfidence: c.confidence,
    reason: "Mock judgment based on confidence threshold",
  }));
}

export function mockScoreTheory(): TheoryResult {
  return {
    score: 0.71,
    verdict: "PLAUSIBLE",
    breakdown: {
      supportRatio: 0.78,
      contradictionRatio: 0.15,
      avgConfidence: 0.82,
      coverageScore: 0.58,
    },
    explanation:
      "The selected claims form a plausible but incomplete narrative. " +
      "Two claims show minor temporal inconsistency. " +
      "Additional corroborating evidence would strengthen the theory significantly.",
  };
}

export function mockContradictions(claimIds: string[]) {
  if (claimIds.length < 2) return [];
  return [
    {
      claimAId: claimIds[0],
      claimBId: claimIds[1],
      reason: "Mock: temporal ordering conflict between these two claims",
      severity: 0.65,
    },
  ];
}
