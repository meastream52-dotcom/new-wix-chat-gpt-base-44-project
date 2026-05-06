import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI };

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

export async function chat(
  systemPrompt: string,
  userContent: string,
  jsonMode = true
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    response_format: jsonMode ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.1,
  });
  return response.choices[0].message.content ?? "";
}
