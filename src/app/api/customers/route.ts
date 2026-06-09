import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    const search = req.nextUrl.searchParams.get("search") ?? "";
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const customers = await prisma.osCustomer.findMany({
      where: {
        businessId,
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

    return NextResponse.json({ customers });
  } catch (err) {
    console.error("[api/customers GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, name, email, phone, company, notes } = body;
    if (!businessId || !name) {
      return NextResponse.json({ error: "businessId and name required" }, { status: 400 });
    }
    const customer = await prisma.osCustomer.create({
      data: { businessId, name, email, phone, company, notes },
    });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
    console.error("[api/customers POST]", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
