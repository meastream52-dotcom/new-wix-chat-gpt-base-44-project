import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const podcasts = await prisma.podcast.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ podcasts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, topic, tone, targetLength, hostName, voiceId, adsEnabled, adIds } = body;

    if (!title || !topic) {
      return NextResponse.json({ error: "title and topic are required" }, { status: 400 });
    }

    const podcast = await prisma.podcast.create({
      data: {
        title,
        topic,
        tone: tone ?? "conversational",
        targetLength: targetLength ?? 10,
        hostName: hostName ?? "Alex",
        voiceId: voiceId ?? "21m00Tcm4TlvDq8ikWAM",
        adsEnabled: adsEnabled ?? true,
        adIds: adIds ?? [],
        status: "DRAFT",
      },
    });

    return NextResponse.json({ podcast }, { status: 201 });
  } catch (err) {
    console.error("[podcast POST]", err);
    return NextResponse.json({ error: "failed to create podcast" }, { status: 500 });
  }
}
