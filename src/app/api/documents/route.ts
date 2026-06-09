import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractDocumentData } from "@/agents/documentAgent";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const documents = await prisma.osDocument.findMany({
      where: { businessId },
      include: { extracted: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("[api/documents GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, name, text, fileType, fileSize } = body;
    if (!businessId || !name) {
      return NextResponse.json({ error: "businessId and name required" }, { status: 400 });
    }

    const doc = await prisma.osDocument.create({
      data: {
        businessId,
        name,
        text: text ?? null,
        fileType: fileType ?? "text/plain",
        fileSize: fileSize ?? null,
        status: "PROCESSING",
      },
    });

    if (text) {
      try {
        const extraction = await extractDocumentData(text, name);
        await prisma.extractedDocumentData.createMany({
          data: extraction.fields.map((f) => ({
            documentId: doc.id,
            fieldName: f.fieldName,
            fieldValue: f.fieldValue,
            confidence: f.confidence,
          })),
        });
        await prisma.osDocument.update({
          where: { id: doc.id },
          data: { status: "DONE" },
        });
        const updated = await prisma.osDocument.findUnique({
          where: { id: doc.id },
          include: { extracted: true },
        });
        return NextResponse.json({ document: updated, extraction }, { status: 201 });
      } catch {
        await prisma.osDocument.update({ where: { id: doc.id }, data: { status: "FAILED" } });
      }
    }

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    console.error("[api/documents POST]", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.osDocument.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/documents DELETE]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
