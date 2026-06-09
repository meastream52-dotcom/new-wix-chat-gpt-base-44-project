import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateReply } from "@/agents/receptionist";
import { triageAndRespond } from "@/agents/supportAgent";
import { draftFollowUpEmail } from "@/agents/salesFollowUp";
import { answerFromKnowledgeBase } from "@/agents/trainingAgent";
import { AgentType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const { message, businessId, sessionId } = await req.json();
    if (!message || !businessId) {
      return NextResponse.json({ error: "message and businessId required" }, { status: 400 });
    }

    const agentTypeRaw = type.toUpperCase() as AgentType;
    const sid = sessionId ?? uuidv4();

    const business = await prisma.osBusiness.findUnique({ where: { id: businessId } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const history = await prisma.osMessage.findMany({
      where: { businessId, agentType: agentTypeRaw, sessionId: sid },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    const historyMapped = history.map((m) => ({ role: m.role, content: m.content }));

    let reply = "";

    if (agentTypeRaw === "RECEPTIONIST") {
      reply = await generateReply(message, business.name, historyMapped);
    } else if (agentTypeRaw === "SUPPORT") {
      reply = await triageAndRespond(message, business.name, historyMapped);
    } else if (agentTypeRaw === "SALES_FOLLOWUP") {
      const draft = await draftFollowUpEmail(
        { name: "Lead", notes: message },
        business.name,
        "QUALIFICATION"
      );
      reply = draft.body;
    } else if (agentTypeRaw === "TRAINING") {
      const modules = await prisma.trainingModule.findMany({ where: { businessId }, take: 5 });
      reply = await answerFromKnowledgeBase(message, modules, business.name);
    } else {
      reply = `I'm the ${agentTypeRaw} agent for ${business.name}. How can I help you today?`;
    }

    await prisma.osMessage.createMany({
      data: [
        { businessId, agentType: agentTypeRaw, role: "user", content: message, sessionId: sid },
        { businessId, agentType: agentTypeRaw, role: "assistant", content: reply, sessionId: sid },
      ],
    });

    return NextResponse.json({ reply, sessionId: sid });
  } catch (err) {
    console.error("[api/agents]", err);
    return NextResponse.json({ error: "Agent error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const agentTypeRaw = type.toUpperCase() as AgentType;
    const [messages, agentConfig] = await Promise.all([
      prisma.osMessage.findMany({
        where: { businessId, agentType: agentTypeRaw },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.businessAgent.findUnique({
        where: { businessId_agentType: { businessId, agentType: agentTypeRaw } },
      }),
    ]);

    return NextResponse.json({ messages, config: agentConfig });
  } catch (err) {
    console.error("[api/agents GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const { businessId, systemPrompt, enabled } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const agentTypeRaw = type.toUpperCase() as AgentType;
    const config = await prisma.businessAgent.upsert({
      where: { businessId_agentType: { businessId, agentType: agentTypeRaw } },
      update: {
        ...(systemPrompt !== undefined ? { systemPrompt } : {}),
        ...(enabled !== undefined ? { enabled } : {}),
      },
      create: { businessId, agentType: agentTypeRaw, enabled: enabled ?? true, systemPrompt },
    });

    return NextResponse.json({ config, ok: true });
  } catch (err) {
    console.error("[api/agents PATCH]", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
