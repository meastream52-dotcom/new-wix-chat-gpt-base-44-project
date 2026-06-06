import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const BLOG_SYSTEM_PROMPT = `You are an expert content writer for Ocean Label, a B2B flexographic label printer in Livermore, California.

Write SEO-optimized, genuinely helpful blog articles for Ocean Label's website. The target audience is procurement managers, brand managers, packaging engineers, and small business owners at food, beverage, health & beauty, and consumer goods companies who buy custom printed labels.

Tone: Professional, authoritative, practical. Not salesy. Always provide genuine value.

Format: Markdown with ## and ### headers. Include practical takeaways. Write at 8th-grade reading level. Aim for 500–900 words.

SEO guidelines:
- Include the primary keyword naturally in the first paragraph and at least two headers.
- Write for "helpful content" standards — answer the question completely.
- Do NOT stuff keywords. Write naturally.

Ocean Label capabilities to reference where relevant:
- Flexographic printing up to 5 colors
- Materials: paper, BOPP white/clear, polyester, chrome/metallic, thermal transfer
- Finishes: cold foil stamping, UV coating (matte/gloss), lamination
- Special: die-cut, variable data, barcodes, food-grade inks, FDA nutritional labels
- Minimums: 500 labels; turnaround 7–14 business days
- Location: Livermore, CA — serving Bay Area and nationwide B2B clients`;

export async function POST(req: NextRequest) {
  try {
    // Simple bearer-token gate — set ADMIN_SECRET in your env
    const auth = req.headers.get("authorization");
    if (process.env.ADMIN_SECRET && auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, keywords, category } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const useDeepSeek = !!process.env.DEEPSEEK_API_KEY;
    const client = useDeepSeek
      ? new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" })
      : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const model = useDeepSeek ? "deepseek-chat" : "gpt-4o";

    const userPrompt = [
      `Write a blog article for Ocean Label on the following topic:`,
      `Topic: ${topic}`,
      keywords ? `Primary keyword(s): ${keywords}` : "",
      category ? `Category: ${category}` : "",
      ``,
      `Return ONLY the article content in Markdown format — no title in the body (it will be added separately), no preamble, no closing note.`,
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: BLOG_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.6,
    });

    const content = completion.choices[0]?.message?.content ?? "";

    // Generate a slug from the topic
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);

    return NextResponse.json({
      slug,
      title: topic,
      category: category || "General",
      content,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (err) {
    console.error("Blog generation error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
