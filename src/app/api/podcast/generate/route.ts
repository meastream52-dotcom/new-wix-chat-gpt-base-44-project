import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePodcastScript } from "@/agents/podcastScriptGenerator";

export async function POST(req: NextRequest) {
  let podcastId: string | undefined;
  try {
    ({ podcastId } = await req.json());

    if (!podcastId) {
      return NextResponse.json({ error: "podcastId is required" }, { status: 400 });
    }

    const podcast = await prisma.podcast.findUnique({ where: { id: podcastId } });
    if (!podcast) {
      return NextResponse.json({ error: "podcast not found" }, { status: 404 });
    }

    // Fetch active ads assigned to this podcast
    const ads =
      podcast.adIds.length > 0
        ? await prisma.adCampaign.findMany({
            where: { id: { in: podcast.adIds }, status: "ACTIVE" },
          })
        : [];

    await prisma.podcast.update({
      where: { id: podcastId },
      data: { status: "GENERATING" },
    });

    const script = await generatePodcastScript({
      title: podcast.title,
      topic: podcast.topic,
      tone: podcast.tone,
      targetLength: podcast.targetLength,
      hostName: podcast.hostName,
      ads: podcast.adsEnabled ? (ads as any) : [],
    });

    const updated = await prisma.podcast.update({
      where: { id: podcastId },
      data: { script: script as any, status: "SCRIPTED" },
    });

    return NextResponse.json({ podcast: updated, script });
  } catch (err) {
    console.error("[podcast/generate]", err);
    if (podcastId) {
      await prisma.podcast.update({ where: { id: podcastId }, data: { status: "FAILED" } }).catch(() => {});
    }
    return NextResponse.json({ error: "script generation failed" }, { status: 500 });
  }
}
