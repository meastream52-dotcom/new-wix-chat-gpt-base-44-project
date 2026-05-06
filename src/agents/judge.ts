import { chat } from "@/lib/openai";
import { RawClaim, ClaimStatus } from "@/lib/types";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a claim quality judge for a structured evidence analysis system.

Rules:
- ACCEPTED: confidence ≥ 0.7, specific, falsifiable, directly supported by document text
- WEAK: confidence 0.4–0.69, or vague, or partially supported
- REJECTED: confidence < 0.4, too vague, opinion-based, or unverifiable

You may adjust the original confidence score based on your analysis.
Return ONLY JSON, no commentary.

Output format:
{
  "judgments": [
    {
      "index": 0,
      "status": "ACCEPTED" | "WEAK" | "REJECTED",
      "adjustedConfidence": 0.0–1.0,
      "reason": "brief reason"
    }
  ]
}`;

const JudgmentSchema = z.object({
  index: z.number(),
  status: z.enum(["ACCEPTED", "WEAK", "REJECTED"]),
  adjustedConfidence: z.number().min(0).max(1),
  reason: z.string(),
});

const ResponseSchema = z.object({
  judgments: z.array(JudgmentSchema),
});

export interface JudgmentResult {
  claim: RawClaim;
  status: ClaimStatus;
  adjustedConfidence: number;
  reason: string;
}

export async function judgeClaims(claims: RawClaim[]): Promise<JudgmentResult[]> {
  const claimsJson = JSON.stringify(
    claims.map((c, i) => ({ index: i, text: c.text, confidence: c.confidence }))
  );

  const raw = await chat(
    SYSTEM_PROMPT,
    `Judge the quality of these claims:\n${claimsJson}`
  );

  const parsed = ResponseSchema.parse(JSON.parse(raw));

  return parsed.judgments.map((j) => ({
    claim: claims[j.index],
    status: j.status,
    adjustedConfidence: j.adjustedConfidence,
    reason: j.reason,
  }));
}
