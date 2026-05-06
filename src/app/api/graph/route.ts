import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildGraph, getGraphForDocument, getFullGraph } from "@/agents/graphBuilder";
import { detectContradictions } from "@/agents/contradictionDetector";
import { JudgedClaim } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { claims: { where: { status: { in: ["ACCEPTED", "WEAK"] } } } },
    });

    if (!document) {
      return NextResponse.json({ error: "document not found" }, { status: 404 });
    }

    const judgedClaims: JudgedClaim[] = document.claims.map((c) => ({
      id: c.id,
      text: c.text,
      confidence: c.confidence,
      status: c.status as JudgedClaim["status"],
      timeRef: c.timeRef ?? undefined,
      entities: c.entities,
      documentId: c.documentId,
      createdAt: c.createdAt.toISOString(),
    }));

    await buildGraph(documentId, document.title, judgedClaims);
    const contradictions = await detectContradictions(documentId);
    const graph = await getGraphForDocument(documentId);

    return NextResponse.json({ graph, contradictions, contradictionCount: contradictions.length });
  } catch (err) {
    console.error("[graph]", err);
    return NextResponse.json({ error: "graph build failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");

  try {
    const graph = documentId
      ? await getGraphForDocument(documentId)
      : await getFullGraph();

    return NextResponse.json({ graph });
  } catch (err) {
    console.error("[graph GET]", err);
    return NextResponse.json({ error: "graph fetch failed" }, { status: 500 });
  }
}
