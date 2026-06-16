import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Add it to your .env file.");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export const TOKEN_COSTS = {
  "claude-sonnet-4-6": { input: 0.000003, output: 0.000015 },
  "claude-opus-4-8": { input: 0.000015, output: 0.000075 },
  "claude-haiku-4-5-20251001": { input: 0.00000025, output: 0.00000125 },
} as const;

export function estimateCost(inputTokens: number, outputTokens: number, model = DEFAULT_MODEL): number {
  const rates = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS] ?? TOKEN_COSTS["claude-sonnet-4-6"];
  return inputTokens * rates.input + outputTokens * rates.output;
}
