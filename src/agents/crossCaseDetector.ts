import { chat } from "@/lib/openai";
import { runQuery } from "@/lib/neo4j";
import { MOCK_MODE } from "@/lib/mock";
import { prisma } from "@/lib/db";
import { Contradiction } from "@/lib/types";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a cross-document contradiction detector for historical evidence analysis.

Given claims from MULTIPLE documents (possibly from different cases), identify:
1. Claims from different documents that directly contradict each other
2. Claims from different documents about the same entity that are mutually exclusive
3. Temporal conflicts between documents about related events

Focus only on genuine contradictions — shared entities or overlap alone is not a contradiction.

Return ONLY JSON:
{
  "contradictions": [
    {
      "claimAIndex": 0,
      "claimBIndex": 1,
      "reason": "brief description",
      "severity": 0.0–1.0
    }
  ]
}
If no cross-document contradictions found, return { "contradictions": [] }`;

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

export async function detectCrossCaseContradictions(
  documentIds: string[]
): Promise<Contradiction[]> {
  if (documentIds.length < 2) return [];

  const claims = await prisma.claim.findMany({
    where: {
      documentId: { in: documentIds },
      status: { in: ["ACCEPTED", "WEAK"] },
    },
    include: { document: { select: { title: true, caseTag: true } } },
    take: 80,
  });

  if (claims.length < 2) return [];

  if (MOCK_MODE) {
    const docGroups = documentIds.map((id) => claims.filter((c) => c.documentId === id));
    if (docGroups.some((g) => g.length === 0)) return [];
    const a = docGroups[0][0];
    const b = docGroups[1][0];
    const record = await prisma.contradiction.create({
      data: {
        claimAId: a.id,
        claimBId: b.id,
        reason: "Mock cross-case: entity appears in conflicting contexts across documents",
        severity: 0.55,
      },
    });
    return [{
      id: record.id,
      claimAId: a.id,
      claimBId: b.id,
      claimAText: a.text,
      claimBText: b.text,
      reason: record.reason,
      severity: record.severity,
    }];
  }

  const claimList = claims.map((c, i) => ({
    index: i,
    id: c.id,
    text: c.text,
    documentId: c.documentId,
    documentTitle: c.document.title,
    caseTag: c.document.caseTag,
  }));

  const raw = await chat(
    SYSTEM_PROMPT,
    `Detect cross-document contradictions:\n${JSON.stringify(claimList)}`
  );

  const parsed = ContraSchema.parse(JSON.parse(raw));
  const results: Contradiction[] = [];

  for (const contra of parsed.contradictions) {
    const claimA = claims[contra.claimAIndex];
    const claimB = claims[contra.claimBIndex];
    if (!claimA || !claimB || claimA.documentId === claimB.documentId) continue;

    const record = await prisma.contradiction.create({
      data: {
        claimAId: claimA.id,
        claimBId: claimB.id,
        reason: contra.reason,
        severity: contra.severity,
      },
    });

    await runQuery(
      `MATCH (a:Claim {id: $aId}), (b:Claim {id: $bId})
       MERGE (a)-[:CONTRADICTS {reason: $reason, severity: $severity, crossCase: true}]->(b)`,
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
