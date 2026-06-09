import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  model = "claude-sonnet-4-6",
  maxTokens = 8192
): Promise<string> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected content type from Claude");
  return block.text;
}

export async function callClaudeStream(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void,
  model = "claude-sonnet-4-6",
  maxTokens = 8192
): Promise<string> {
  const client = getAnthropicClient();
  let full = "";
  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      full += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }
  return full;
}

export function extractJsonFromResponse(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1] : text;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");
  return JSON.parse(jsonMatch[0]);
}
