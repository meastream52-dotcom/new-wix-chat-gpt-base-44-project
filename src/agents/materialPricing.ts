import { anthropic, DEFAULT_MODEL, estimateCost } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase/admin'
import type { IntakeVerdict, Material, PrinterProfile, PricingData } from '@/lib/types'

const SYSTEM_PROMPT = `You are the material selection and pricing agent for PrintForge, a 3D printing service.

Your job is to recommend materials and compute prices for three tiers of a given part.

## Material selection rules:
- OUTDOOR use: must use UV-resistant material (ASA, PETG, or PA-CF). Never PLA for outdoor.
- FOOD CONTACT: flag as unavailable unless material is food-safe. Standard PLA/PETG are NOT food-safe.
- HIGH HEAT (>60°C environment): avoid PLA (softens at ~55°C). Use PETG, ABS, ASA.
- FLEXIBLE parts: use TPU.
- Budget tier may be "unavailable" if the cheapest adequate material still doesn't fit the use case.

## Tiers:
- Premium: best material for the use case + finishing (light sanding, priming for paintable parts). Higher infill (40%).
- Standard: solid material match, 0.2mm layers, 20% infill.
- Budget: cheapest material that still safely meets requirements, 0.28mm layers, 15% infill. May be unavailable.

## Print time estimation formula (Phase 1 approximation — no slicer CLI yet):
Given bounding box volume V = x*y*z mm³:
- fill_factor = infill/100 * 0.6 + 0.15  (shells + infill)
- filament_volume_cm3 = (V / 1000) * fill_factor
- filament_mass_g = filament_volume_cm3 * material_density_g_per_cm3
- print_speed_mm3_per_s ≈ 8 for 0.2mm layers, 12 for 0.28mm layers
- print_time_s = filament_volume_cm3 * 1000 / print_speed_mm3_per_s
- print_time_hours = print_time_s / 3600

Material densities (g/cm³): PLA=1.24, PETG=1.27, ABS=1.04, ASA=1.07, TPU=1.21

## Pricing formula:
filament_cost = (filament_mass_g / 1000) * material.cost_per_kg_usd
machine_time_cost = print_time_hours * printer.hourly_rate_usd
labor_cost_per_tier = 3 for budget, 5 for standard, 10 for premium (includes removal, inspection)
finishing_cost = 0 for budget/standard, 8 for premium
subtotal = filament_cost + machine_time_cost + labor_cost + finishing_cost
price = subtotal * margin_multiplier

OUTPUT FORMAT — respond ONLY with valid JSON, no other text:
{
  "tiers": [
    {
      "tier": "premium" | "standard" | "budget",
      "material_name": "exact name from materials list",
      "price_usd": number,
      "print_time_hours": number,
      "filament_grams": number,
      "layer_height_mm": number,
      "infill_percent": number,
      "finishing_notes": "string",
      "is_available": boolean,
      "unavailable_reason": "string or omit"
    }
  ],
  "cost_breakdown": {
    "filament_cost": number,
    "machine_time_cost": number,
    "labor_cost": number,
    "finishing_cost": number
  },
  "selection_reasoning": "brief explanation of material choices"
}`

interface MaterialPricingInput {
  raw_prompt: string
  intended_use: string | null
  intake_verdict: IntakeVerdict
  materials: Material[]
  printer_profiles: PrinterProfile[]
  margin_multiplier: number
}

export async function runMaterialPricingAgent(
  input: MaterialPricingInput,
  customRequestId: string
): Promise<{ output: PricingData & { selection_reasoning: string }; agentRunId: string }> {
  const db = createAdminClient()

  const { data: run } = await db
    .from('agent_runs')
    .insert({
      agent: 'material_pricing',
      custom_request_id: customRequestId,
      input: input as unknown as Record<string, unknown>,
      model: DEFAULT_MODEL,
      status: 'running',
    })
    .select('id')
    .single()

  const agentRunId = run!.id

  const specs = input.intake_verdict.reference_specs
  const dims = specs?.estimated_dimensions_mm ?? { x: 100, y: 100, z: 50 }

  const materialsDescription = input.materials
    .filter(m => m.is_active)
    .map(m => `- ${m.name}: $${m.cost_per_kg_usd}/kg, heat_deflection=${m.properties.heat_deflection_c}°C, uv_resistant=${m.properties.uv_resistant}, flexible=${m.properties.is_flexible}, no_outdoor=${m.restrictions.no_outdoor}`)
    .join('\n')

  const printerDescription = input.printer_profiles
    .filter(p => p.is_active)
    .map(p => `- ${p.name}: $${p.hourly_rate_usd}/hr`)
    .join('\n')

  const userMessage = [
    `Part: "${input.raw_prompt}"`,
    `Intended use: ${input.intended_use ?? 'indoor, decorative'}`,
    `Estimated bounding box: ${dims.x}×${dims.y}×${dims.z}mm`,
    `Margin multiplier: ${input.margin_multiplier}`,
    `\nAvailable materials:\n${materialsDescription}`,
    `\nPrinter (use first active for cost):\n${printerDescription}`,
  ].join('\n')

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const output = JSON.parse(text) as PricingData & { selection_reasoning: string }

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
