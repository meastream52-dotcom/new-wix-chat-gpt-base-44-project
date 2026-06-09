import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI | undefined };

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

function getClient(): OpenAI {
  if (globalForOpenAI.openai) return globalForOpenAI.openai;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "placeholder" });
  if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = client;
  return client;
}

export async function chat(
  systemPrompt: string,
  userContent: string,
  jsonMode = true
): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
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
