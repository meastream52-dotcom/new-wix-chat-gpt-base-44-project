import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { synthesizeSpeech } from "@/lib/elevenlabs";
import type { PodcastSegment } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const podcast = await prisma.podcast.findUnique({ where: { id: params.id } });
    if (!podcast) return NextResponse.json({ error: "podcast not found" }, { status: 404 });
    if (!podcast.script) return NextResponse.json({ error: "no script — generate script first" }, { status: 400 });

    await prisma.podcast.update({ where: { id: params.id }, data: { status: "GENERATING" } });

    const segments = podcast.script as unknown as PodcastSegment[];
    const fullText = segments.map((s) => s.text).join("\n\n");

    // Synthesize the full concatenated script
    const audioBuffer = await synthesizeSpeech(fullText, podcast.voiceId);

    // Store as base64 data URL (works without S3 for demo; swap with S3 upload in production)
    const base64 = audioBuffer.toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    const updated = await prisma.podcast.update({
      where: { id: params.id },
      data: { audioUrl, status: "READY" },
    });

    return NextResponse.json({ podcast: updated, audioUrl });
  } catch (err) {
    console.error("[podcast/audio]", err);
    await prisma.podcast.update({ where: { id: params.id }, data: { status: "FAILED" } }).catch(() => {});
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
