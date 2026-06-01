import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { judgeClaims } from "@/agents/judge";

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const pendingClaims = await prisma.claim.findMany({
      where: { documentId, status: "PENDING" },
    });

    if (pendingClaims.length === 0) {
      return NextResponse.json({ message: "no pending claims", updated: 0 });
    }

    const rawClaims = pendingClaims.map((c) => ({
      text: c.text,
      confidence: c.confidence,
      timeRef: c.timeRef ?? undefined,
      entities: c.entities,
    }));

    const judgments = await judgeClaims(rawClaims);

    const updates = await prisma.$transaction(
      judgments.map((j, i) =>
        prisma.claim.update({
          where: { id: pendingClaims[i].id },
          data: { status: j.status, confidence: j.adjustedConfidence },
        })
      )
    );

    const summary = {
      accepted: updates.filter((u) => u.status === "ACCEPTED").length,
      weak: updates.filter((u) => u.status === "WEAK").length,
      rejected: updates.filter((u) => u.status === "REJECTED").length,
    };

    return NextResponse.json({ updated: updates.length, summary });
  } catch (err) {
    console.error("[judge]", err);
    return NextResponse.json({ error: "judging failed" }, { status: 500 });
  }
}
