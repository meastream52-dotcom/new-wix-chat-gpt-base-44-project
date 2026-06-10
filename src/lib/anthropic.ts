import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8'

// Pricing per million tokens (claude-opus-4-8)
const INPUT_COST_PER_M = 15
const OUTPUT_COST_PER_M = 75

export function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * INPUT_COST_PER_M +
         (outputTokens / 1_000_000) * OUTPUT_COST_PER_M
}
