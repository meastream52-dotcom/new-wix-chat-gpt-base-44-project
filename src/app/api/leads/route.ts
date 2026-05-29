import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    const status = req.nextUrl.searchParams.get("status");
    const search = req.nextUrl.searchParams.get("search") ?? "";

    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const leads = await prisma.osLead.findMany({
      where: {
        businessId,
        ...(status ? { status: status as never } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ leads, total: leads.length });
  } catch (err) {
    console.error("[api/leads GET]", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, name, email, phone, company, source, notes, value } = body;
    if (!businessId || !name) {
      return NextResponse.json({ error: "businessId and name required" }, { status: 400 });
    }

    const lead = await prisma.osLead.create({
      data: { businessId, name, email, phone, company, source, notes, value: value ? Number(value) : null },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error("[api/leads POST]", err);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, value } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const lead = await prisma.osLead.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(value !== undefined ? { value: Number(value) } : {}),
      },
    });

    return NextResponse.json({ lead });
  } catch (err) {
    console.error("[api/leads PATCH]", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.osLead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/leads DELETE]", err);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
