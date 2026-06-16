import OpenAI from "openai";

let _client: OpenAI | null = null;

function client(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "missing" });
  }
  return _client;
}

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

export async function chat(
  systemPrompt: string,
  userContent: string,
  jsonMode = true
): Promise<string> {
  const response = await client().chat.completions.create({
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
