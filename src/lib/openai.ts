import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "placeholder" });
  }
  return _openai;
}

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

export async function chat(systemPrompt: string, userContent: string, jsonMode = true): Promise<string> {
  const openai = getOpenAI();
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

export const openai = { chat };
