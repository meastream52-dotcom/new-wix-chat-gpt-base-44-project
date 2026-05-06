import { chat } from "@/lib/openai";
import { prisma } from "@/lib/db";
import { TheoryNode, TheoryResult, TheoryScoreBreakdown } from "@/lib/types";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a theory evaluation engine for structured evidence analysis.

Given a set of claims that form a theory, evaluate:
1. Internal consistency — do the claims support each other without contradiction?
2. Evidence coverage — are there known contradictions from the evidence base?
3. Logical coherence — does the chain of claims form a plausible narrative?

Score the theory 0.0–1.0 and classify:
- STRONG: score ≥ 0.75, high consistency, minimal contradictions
- PLAUSIBLE: score 0.50–0.74, mostly consistent
- WEAK: score 0.25–0.49, significant gaps or contradictions
- CONTRADICTED: score < 0.25, directly contradicted by evidence

Return ONLY JSON:
{
  "score": 0.0–1.0,
  "verdict": "STRONG" | "PLAUSIBLE" | "WEAK" | "CONTRADICTED",
  "supportRatio": 0.0–1.0,
  "contradictionRatio": 0.0–1.0,
  "avgConfidence": 0.0–1.0,
  "coverageScore": 0.0–1.0,
  "explanation": "2–3 sentence explanation"
}`;

const ResponseSchema = z.object({
  score: z.number().min(0).max(1),
  verdict: z.enum(["STRONG", "PLAUSIBLE", "WEAK", "CONTRADICTED"]),
  supportRatio: z.number().min(0).max(1),
  contradictionRatio: z.number().min(0).max(1),
  avgConfidence: z.number().min(0).max(1),
  coverageScore: z.number().min(0).max(1),
  explanation: z.string(),
});

export async function scoreTheory(
  theoryId: string,
  nodes: TheoryNode[]
): Promise<TheoryResult> {
  const claimIds = nodes.map((n) => n.claimId);

  // Fetch actual claim data
  const claims = await prisma.claim.findMany({ where: { id: { in: claimIds } } });

  // Fetch contradictions between theory claims
  const contradictions = await prisma.contradiction.findMany({
    where: {
      OR: [
        { claimAId: { in: claimIds }, claimBId: { in: claimIds } },
      ],
    },
  });

  const claimsPayload = claims.map((c) => ({
    id: c.id,
    text: c.text,
    confidence: c.confidence,
    status: c.status,
    role: nodes.find((n) => n.claimId === c.id)?.role ?? "SUPPORT",
  }));

  const raw = await chat(
    SYSTEM_PROMPT,
    JSON.stringify({
      theoryClaims: claimsPayload,
      knownContradictions: contradictions.map((c) => ({
        between: [c.claimAId, c.claimBId],
        reason: c.reason,
        severity: c.severity,
      })),
    })
  );

  const parsed = ResponseSchema.parse(JSON.parse(raw));

  const breakdown: TheoryScoreBreakdown = {
    supportRatio: parsed.supportRatio,
    contradictionRatio: parsed.contradictionRatio,
    avgConfidence: parsed.avgConfidence,
    coverageScore: parsed.coverageScore,
  };

  // Persist score back to theory
  await prisma.theory.update({
    where: { id: theoryId },
    data: { score: parsed.score, scoreBreakdown: breakdown },
  });

  return {
    score: parsed.score,
    breakdown,
    verdict: parsed.verdict,
    explanation: parsed.explanation,
  };
}
