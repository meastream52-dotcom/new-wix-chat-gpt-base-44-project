import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ad = await prisma.adCampaign.findUnique({ where: { id: params.id } });
  if (!ad) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ad });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const ad = await prisma.adCampaign.update({ where: { id: params.id }, data: body });
    return NextResponse.json({ ad });
  } catch (err) {
    console.error("[ads PATCH]", err);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.adCampaign.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
