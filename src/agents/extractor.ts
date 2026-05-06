import { chat } from "@/lib/openai";
import { RawClaim } from "@/lib/types";
import { z } from "zod";

const SYSTEM_PROMPT = `You are an atomic claim extractor for historical and legal document analysis.

Rules:
- Extract ONLY verifiable factual statements — no interpretation, no inference
- Split compound sentences into the smallest possible independent claims
- Each claim must be self-contained and unambiguous
- Assign a confidence score 0.0–1.0 based on how clearly the document states the fact
- Extract time references (dates, relative times) if present in the claim
- Extract named entities (people, places, organizations) mentioned in the claim
- Return ONLY JSON, no commentary

Output format:
{
  "claims": [
    {
      "text": "string — the atomic claim",
      "confidence": 0.0–1.0,
      "timeRef": "string or null",
      "entities": ["array", "of", "named", "entities"]
    }
  ]
}`;

const ClaimSchema = z.object({
  text: z.string().min(10),
  confidence: z.number().min(0).max(1),
  timeRef: z.string().nullable().optional(),
  entities: z.array(z.string()).default([]),
});

const ResponseSchema = z.object({
  claims: z.array(ClaimSchema),
});

export async function extractClaims(documentText: string): Promise<RawClaim[]> {
  const truncated = documentText.slice(0, 12000);
  const raw = await chat(SYSTEM_PROMPT, `Extract all atomic claims from this document:\n\n${truncated}`);

  const parsed = ResponseSchema.parse(JSON.parse(raw));
  return parsed.claims.map((c) => ({
    text: c.text,
    confidence: c.confidence,
    timeRef: c.timeRef ?? undefined,
    entities: c.entities,
  }));
}
