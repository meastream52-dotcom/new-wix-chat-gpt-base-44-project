import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AgentType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const business = await prisma.osBusiness.findUnique({
      where: { id: businessId },
      include: { agents: true },
    });

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    return NextResponse.json({ business });
  } catch (err) {
    console.error("[api/onboarding GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, name, industry, description, website, phone, address, agents } = body;

    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const business = await prisma.osBusiness.update({
      where: { id: businessId },
      data: {
        ...(name ? { name } : {}),
        ...(industry ? { industry } : {}),
        ...(description ? { description } : {}),
        ...(website ? { website } : {}),
        ...(phone ? { phone } : {}),
        ...(address ? { address } : {}),
      },
    });

    if (agents && Array.isArray(agents)) {
      const allTypes: AgentType[] = ["RECEPTIONIST", "SALES_FOLLOWUP", "SUPPORT", "DOCUMENT", "TRAINING"];
      for (const type of allTypes) {
        const enabled = agents.includes(type);
        await prisma.businessAgent.upsert({
          where: { businessId_agentType: { businessId, agentType: type } },
          update: { enabled },
          create: { businessId, agentType: type, enabled },
        });
      }
    }

    return NextResponse.json({ business, ok: true });
  } catch (err) {
    console.error("[api/onboarding POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
