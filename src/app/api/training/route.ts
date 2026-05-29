import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLesson } from "@/agents/trainingAgent";
import { answerFromKnowledgeBase } from "@/agents/trainingAgent";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const modules = await prisma.trainingModule.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("[api/training GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, action, topic, question } = body;
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    if (action === "generate") {
      if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });
      const business = await prisma.osBusiness.findUnique({ where: { id: businessId } });
      const lesson = await generateLesson(topic, business?.name ?? "your business", business?.description ?? undefined);
      const module = await prisma.trainingModule.create({
        data: { businessId, title: lesson.title, content: lesson.content },
      });
      return NextResponse.json({ module }, { status: 201 });
    }

    if (action === "ask") {
      if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });
      const business = await prisma.osBusiness.findUnique({ where: { id: businessId } });
      const modules = await prisma.trainingModule.findMany({ where: { businessId }, take: 5 });
      const answer = await answerFromKnowledgeBase(question, modules, business?.name ?? "your business");
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: "action must be generate or ask" }, { status: 400 });
  } catch (err) {
    console.error("[api/training POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.trainingModule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/training DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
