import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAdCopy } from "@/agents/adCopyGenerator";

export async function GET() {
  const ads = await prisma.adCampaign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ads });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, sponsor, placement, adCopy, keyMessage, podcastTopic, autoGenerate } = body;

    if (!name || !sponsor) {
      return NextResponse.json({ error: "name and sponsor are required" }, { status: 400 });
    }

    let finalCopy = adCopy ?? "";

    if (autoGenerate || !finalCopy) {
      finalCopy = await generateAdCopy({
        sponsor,
        placement: placement ?? "MID_ROLL",
        podcastTopic,
        keyMessage,
      });
    }

    const ad = await prisma.adCampaign.create({
      data: {
        name,
        sponsor,
        adCopy: finalCopy,
        placement: placement ?? "MID_ROLL",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (err) {
    console.error("[ads POST]", err);
    return NextResponse.json({ error: "failed to create ad" }, { status: 500 });
  }
}
