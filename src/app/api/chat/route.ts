import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are the Ocean Label customer assistant — a helpful, knowledgeable AI for a family-owned flexographic label printer in Livermore, California.

Ocean Label facts:
- Address: 345 Wright Brothers Ave, Livermore, CA 94551
- Phone: (925) 443-2883
- Hours: Monday–Friday, 9:00 AM – 5:00 PM Pacific Time
- Founded: 25+ years ago by Dennis Brennan; Trevor Brennan is VP Operations
- Products: pressure-sensitive labels, flexographic printing (up to 5 colors), die-cut labels, cold foil stamping, UV coating (matte/gloss), laminating, food/nutritional labels, household labels, coupons, barcodes, variable data printing, blank labels, thermal transfer, address labels, two-sided print, sheeting, fanfolding, coreless options
- Materials: white paper, BOPP white, BOPP clear, polyester, chrome/metallic, thermal transfer
- Notable clients: Microsoft, Sony, PlayStation, Capcom, Electronic Arts, Hewlett Packard, General Mills, Safeway, Orchard Valley Harvest, Elaine's Toffee, Juice Organics
- Minimum order: typically 500 labels
- Turnaround: 7–14 business days (depending on complexity and material)
- Quote process: instant estimate at /quote, formal quote within 1 business day
- Reorders: zero setup or plate fees — specs stored indefinitely

Behavior guidelines:
- Be concise, friendly, and professional.
- Always disclose that you are an AI assistant, not a human, when asked.
- For detailed pricing, direct users to /quote for the instant calculator or call (925) 443-2883.
- For complex technical questions you're unsure about, say "I'm not certain — please call us at (925) 443-2883 or use the contact form for an accurate answer from our team."
- Do NOT make up specific prices you don't know.
- Do NOT promise specific turnaround times for rush orders — that requires staff confirmation.
- California SB 1001 compliance: always be clear you are an AI assistant when asked.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Use DeepSeek if configured, otherwise fall back to OpenAI
    const useDeepSeek = !!process.env.DEEPSEEK_API_KEY;

    const client = useDeepSeek
      ? new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: "https://api.deepseek.com",
        })
      : new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

    const model = useDeepSeek ? "deepseek-chat" : (process.env.OPENAI_MODEL || "gpt-4o-mini");

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10), // keep last 10 turns to control cost
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response right now.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { reply: "Our AI assistant is temporarily unavailable. Please call us at (925) 443-2883 or use the contact form." },
      { status: 200 }
    );
  }
}
