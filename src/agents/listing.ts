import { anthropic, DEFAULT_MODEL, estimateCost } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase/admin'
import type { IntakeVerdict, PricingData } from '@/lib/types'

const SYSTEM_PROMPT = `You are the product listing agent for PrintForge, a custom 3D printing service.

Your job is to write compelling, accurate product listings for 3D-printed parts.

Guidelines:
- Title: concise, searchable (max 70 chars). Include the part name and key differentiator.
- Description: 2–3 paragraphs. Lead with the problem this part solves. Second paragraph covers material/quality. Third covers what's included.
- SEO description: 1 sentence, 150–160 characters. Include key search terms.
- Spec sheet: extract key specs as structured data.
- Marketing notes: suggest which channels to post to (eBay Motors, Etsy, Reddit subs, Facebook groups) and why. These are for the operator's eyes only — not shown to customers.
- Do NOT make up dimensions, weights, or material properties. Use only what's provided.
- Do NOT claim "OEM quality" or make false structural claims.

OUTPUT FORMAT — respond ONLY with valid JSON, no other text:
{
  "title": "string",
  "description": "string (markdown ok)",
  "seo_description": "string",
  "spec_sheet": {
    "material_options": ["list of materials from tiers"],
    "dimensions_note": "string",
    "print_quality": "string"
  },
  "marketing_notes": "string — channel suggestions and ad copy ideas for operator"
}`

interface ListingInput {
  raw_prompt: string
  intended_use: string | null
  intake_verdict: IntakeVerdict
  pricing_data: PricingData
}

interface ListingOutput {
  title: string
  description: string
  seo_description: string
  spec_sheet: Record<string, unknown>
  marketing_notes: string
}

export async function runListingAgent(
  input: ListingInput,
  customRequestId: string
): Promise<{ output: ListingOutput; agentRunId: string }> {
  const db = createAdminClient()

  const { data: run } = await db
    .from('agent_runs')
    .insert({
      agent: 'listing',
      custom_request_id: customRequestId,
      input: input as unknown as Record<string, unknown>,
      model: DEFAULT_MODEL,
      status: 'running',
    })
    .select('id')
    .single()

  const agentRunId = run!.id

  const specs = input.intake_verdict.reference_specs
  const tiersDescription = input.pricing_data.tiers
    .filter(t => t.is_available)
    .map(t => `${t.tier}: ${t.material_name}, $${t.price_usd.toFixed(2)}, ${t.print_time_hours.toFixed(1)}h print, ${t.filament_grams.toFixed(0)}g filament`)
    .join('\n')

  const userMessage = [
    `Part: "${input.raw_prompt}"`,
    `Intended use: ${input.intended_use ?? 'indoor display/replacement'}`,
    specs ? `Description: ${specs.description}` : null,
    specs ? `Dimensions: ~${specs.estimated_dimensions_mm.x}×${specs.estimated_dimensions_mm.y}×${specs.estimated_dimensions_mm.z}mm` : null,
    `\nPricing tiers:\n${tiersDescription}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const output = JSON.parse(text) as ListingOutput

    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const costUsd = estimateCost(inputTokens, outputTokens)

    await db.from('agent_runs').update({
      output: output as unknown as Record<string, unknown>,
      model: response.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
      status: 'complete',
      completed_at: new Date().toISOString(),
    }).eq('id', agentRunId)

    return { output, agentRunId }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await db.from('agent_runs').update({
      error,
      status: 'failed',
      completed_at: new Date().toISOString(),
    }).eq('id', agentRunId)
    throw err
  }
}
