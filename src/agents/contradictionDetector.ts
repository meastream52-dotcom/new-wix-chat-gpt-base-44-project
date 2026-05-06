import { chat } from "@/lib/openai";
import { runQuery } from "@/lib/neo4j";
import { prisma } from "@/lib/db";
import { Contradiction } from "@/lib/types";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a contradiction detector for historical evidence analysis.

Compare pairs of factual claims and identify:
1. Temporal contradictions — two claims assert incompatible time orderings or dates
2. Factual contradictions — two claims make mutually exclusive assertions about the same subject
3. Identity contradictions — two claims assert different identities/locations for the same entity

For each contradicting pair, assess severity 0.0–1.0 (1.0 = direct logical impossibility).

Return ONLY JSON:
{
  "contradictions": [
    {
      "claimAIndex": 0,
      "claimBIndex": 1,
      "reason": "brief description of why they contradict",
      "severity": 0.0–1.0
    }
  ]
}
If no contradictions found, return { "contradictions": [] }`;

const ContraSchema = z.object({
  contradictions: z.array(
    z.object({
      claimAIndex: z.number(),
      claimBIndex: z.number(),
      reason: z.string(),
      severity: z.number().min(0).max(1),
    })
  ),
});

export async function detectContradictions(documentId: string): Promise<Contradiction[]> {
  const claims = await prisma.claim.findMany({
    where: { documentId, status: { in: ["ACCEPTED", "WEAK"] } },
    take: 50,
  });

  if (claims.length < 2) return [];

  const claimList = claims.map((c, i) => ({ index: i, id: c.id, text: c.text }));
  const raw = await chat(
    SYSTEM_PROMPT,
    `Detect contradictions among these claims:\n${JSON.stringify(claimList)}`
  );

  const parsed = ContraSchema.parse(JSON.parse(raw));
  const results: Contradiction[] = [];

  for (const contra of parsed.contradictions) {
    const claimA = claims[contra.claimAIndex];
    const claimB = claims[contra.claimBIndex];
    if (!claimA || !claimB) continue;

    // Persist to Postgres
    const record = await prisma.contradiction.create({
      data: {
        claimAId: claimA.id,
        claimBId: claimB.id,
        reason: contra.reason,
        severity: contra.severity,
      },
    });

    // Mark CONTRADICTS edge in Neo4j
    await runQuery(
      `MATCH (a:Claim {id: $aId}), (b:Claim {id: $bId})
       MERGE (a)-[:CONTRADICTS {reason: $reason, severity: $severity}]->(b)`,
      { aId: claimA.id, bId: claimB.id, reason: contra.reason, severity: contra.severity }
    );

    results.push({
      id: record.id,
      claimAId: claimA.id,
      claimBId: claimB.id,
      claimAText: claimA.text,
      claimBText: claimB.text,
      reason: contra.reason,
      severity: contra.severity,
    });
  }

  return results;
}
