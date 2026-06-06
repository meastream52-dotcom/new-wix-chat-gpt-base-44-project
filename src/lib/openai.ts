import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "placeholder" });
  }
  return _client;
}

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

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

// Kept for backward compat — use getClient() internally instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
