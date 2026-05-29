import { openai } from "@/lib/openai";
import type { PodcastSegment, AdCampaign } from "@/lib/types";

interface ScriptInput {
  title: string;
  topic: string;
  tone: string;
  targetLength: number;
  hostName: string;
  ads: AdCampaign[];
}

export async function generatePodcastScript(input: ScriptInput): Promise<PodcastSegment[]> {
  const { title, topic, tone, targetLength, hostName, ads } = input;

  const adContext = ads.length
    ? `\n\nInclude the following advertisements at the specified placements:\n${ads
        .map(
          (a) =>
            `- [${a.placement}] Sponsor: "${a.sponsor}" — Copy: "${a.adCopy}" (id: ${a.id})`
        )
        .join("\n")}`
    : "";

  const systemPrompt = `You are an expert podcast scriptwriter. Generate a complete, engaging podcast script.
Return ONLY a valid JSON array of segment objects. No markdown, no explanation, just the JSON array.

Each segment must have:
- "type": one of "intro" | "content" | "ad" | "outro"
- "text": the spoken text for that segment
- "label": a short title (e.g. "Opening Hook", "Main Topic", "Ad Break", "Sign-off")
- "adId": (only for "ad" type) the sponsor ad id

Rules:
- Intro should be ~30–60 seconds of spoken content (150–200 words)
- Content segments should collectively fill ~${targetLength} minutes total
- Each content segment: 2–4 paragraphs, natural spoken language, no bullet points
- Ad segments: use the exact copy provided, frame it naturally in the host's voice
- Outro: ~30 seconds, thank listeners, call to action
- The host's name is ${hostName}
- Tone: ${tone}`;

  const userPrompt = `Title: "${title}"
Topic: ${topic}
Target length: ~${targetLength} minutes
Tone: ${tone}${adContext}

Generate the full podcast script as a JSON array of segments.`;

  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? "[]";

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();

  const segments: PodcastSegment[] = JSON.parse(cleaned);
  return segments;
}
