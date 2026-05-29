import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const workflows = await prisma.osWorkflow.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workflows });
  } catch (err) {
    console.error("[api/workflows GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, name, trigger, action } = body;
    if (!businessId || !name || !trigger || !action) {
      return NextResponse.json({ error: "businessId, name, trigger, action required" }, { status: 400 });
    }

    const workflow = await prisma.osWorkflow.create({
      data: { businessId, name, trigger, action },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (err) {
    console.error("[api/workflows POST]", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, enabled, name, trigger, action } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const workflow = await prisma.osWorkflow.update({
      where: { id },
      data: {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(name ? { name } : {}),
        ...(trigger ? { trigger } : {}),
        ...(action ? { action } : {}),
      },
    });

    return NextResponse.json({ workflow });
  } catch (err) {
    console.error("[api/workflows PATCH]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.osWorkflow.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/workflows DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
