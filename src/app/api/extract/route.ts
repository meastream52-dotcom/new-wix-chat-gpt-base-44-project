import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractClaims } from "@/agents/extractor";

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      return NextResponse.json({ error: "document not found" }, { status: 404 });
    }

    const rawClaims = await extractClaims(document.text);

    const created = await prisma.$transaction(
      rawClaims.map((c) =>
        prisma.claim.create({
          data: {
            text: c.text,
            confidence: c.confidence,
            status: "PENDING",
            timeRef: c.timeRef,
            entities: c.entities,
            documentId,
          },
        })
      )
    );

    return NextResponse.json({ claims: created, count: created.length });
  } catch (err) {
    console.error("[extract]", err);
    return NextResponse.json({ error: "extraction failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");
  const status = searchParams.get("status");

  const claims = await prisma.claim.findMany({
    where: {
      ...(documentId ? { documentId } : {}),
      ...(status ? { status: status as "PENDING" | "ACCEPTED" | "WEAK" | "REJECTED" } : {}),
    },
    orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
    take: 200,
    include: { document: { select: { title: true, caseTag: true } } },
  });

  return NextResponse.json({ claims });
}
