import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const podcast = await prisma.podcast.findUnique({ where: { id: params.id } });
  if (!podcast) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ podcast });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const podcast = await prisma.podcast.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ podcast });
  } catch (err) {
    console.error("[podcast PATCH]", err);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.podcast.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
