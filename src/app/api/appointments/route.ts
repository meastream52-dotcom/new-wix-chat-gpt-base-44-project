import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const appointments = await prisma.osAppointment.findMany({
      where: {
        businessId,
        ...(from && to
          ? { startAt: { gte: new Date(from), lte: new Date(to) } }
          : {}),
      },
      include: { lead: true, customer: true },
      orderBy: { startAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ appointments });
  } catch (err) {
    console.error("[api/appointments GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, title, startAt, endAt, leadId, customerId, notes } = body;
    if (!businessId || !title || !startAt || !endAt) {
      return NextResponse.json({ error: "businessId, title, startAt, endAt required" }, { status: 400 });
    }

    const appointment = await prisma.osAppointment.create({
      data: {
        businessId,
        title,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        leadId: leadId ?? null,
        customerId: customerId ?? null,
        notes,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    console.error("[api/appointments POST]", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, title, startAt, endAt } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const appointment = await prisma.osAppointment.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(title ? { title } : {}),
        ...(startAt ? { startAt: new Date(startAt) } : {}),
        ...(endAt ? { endAt: new Date(endAt) } : {}),
      },
    });

    return NextResponse.json({ appointment });
  } catch (err) {
    console.error("[api/appointments PATCH]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.osAppointment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/appointments DELETE]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
