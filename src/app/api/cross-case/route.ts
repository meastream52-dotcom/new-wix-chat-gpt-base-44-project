import { NextRequest, NextResponse } from "next/server";
import { detectCrossCaseContradictions } from "@/agents/crossCaseDetector";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { documentIds } = await req.json() as { documentIds: string[] };

    if (!Array.isArray(documentIds) || documentIds.length < 2) {
      return NextResponse.json(
        { error: "documentIds must be an array of at least 2 IDs" },
        { status: 400 }
      );
    }

    const contradictions = await detectCrossCaseContradictions(documentIds);
    return NextResponse.json({ contradictions, count: contradictions.length });
  } catch (err) {
    console.error("[cross-case]", err);
    return NextResponse.json({ error: "cross-case detection failed" }, { status: 500 });
  }
}

export async function GET() {
  const contradictions = await prisma.contradiction.findMany({
    orderBy: [{ severity: "desc" }, { detectedAt: "desc" }],
    take: 100,
  });
  return NextResponse.json({ contradictions });
}
