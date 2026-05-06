import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadDocument } from "@/lib/s3";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const source = formData.get("source") as string;
    const caseTag = (formData.get("caseTag") as string) ?? "general";
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    let documentText = text ?? "";
    let s3Key: string | undefined;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      s3Key = `documents/${uuid()}-${file.name}`;
      await uploadDocument(s3Key, buffer, file.type);
      documentText = buffer.toString("utf-8");
    }

    if (!documentText) {
      return NextResponse.json({ error: "file or text content is required" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: { title, source: source ?? "unknown", text: documentText, s3Key, caseTag },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, source: true, caseTag: true, createdAt: true, _count: { select: { claims: true } } },
  });
  return NextResponse.json({ documents });
}
