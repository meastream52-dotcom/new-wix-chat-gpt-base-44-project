import { openai } from "@/lib/openai";

interface AdInput {
  sponsor: string;
  placement: "PRE_ROLL" | "MID_ROLL" | "POST_ROLL";
  podcastTopic?: string;
  keyMessage?: string;
}

export async function generateAdCopy(input: AdInput): Promise<string> {
  const { sponsor, placement, podcastTopic, keyMessage } = input;

  const placementGuide: Record<string, string> = {
    PRE_ROLL: "30-second pre-roll (opening sponsor message, ~75 words)",
    MID_ROLL: "60-second mid-roll (main ad break, ~150 words, conversational)",
    POST_ROLL: "15-second post-roll (closing CTA, ~40 words)",
  };

  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You write compelling podcast advertisement copy. Return only the ad script text — no stage directions, no quotation marks, just the spoken words.",
      },
      {
        role: "user",
        content: `Write a ${placementGuide[placement]} for sponsor: "${sponsor}".${
          podcastTopic ? `\nPodcast topic: ${podcastTopic}` : ""
        }${keyMessage ? `\nKey message: ${keyMessage}` : ""}`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() ?? "";
}
