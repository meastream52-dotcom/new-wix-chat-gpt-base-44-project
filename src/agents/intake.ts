import { anthropic, DEFAULT_MODEL, estimateCost } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase/admin'
import type { IntakeVerdict, PrinterProfile } from '@/lib/types'

const SYSTEM_PROMPT = `You are the intake and feasibility agent for PrintForge, a 3D printing service.

Your job is to evaluate a customer's part request and return a JSON verdict.

## HARD REJECT — always reject with a clear reason:
- Structural/load-bearing vehicle parts: frames, chassis, suspension arms, steering components, brake components, brake calipers, rotors, wheels (load-bearing)
- Safety helmets, child car seat components, infant/child restraint hardware
- Firearm parts: receivers, barrels, trigger groups, suppressors, any regulated component
- Medical implants, surgical instruments, anything inserted into the human body
- Any part the customer describes as safety-critical for load-bearing applications

## IP FLAG — check for licensed intellectual property:
- Car brand logos/emblems (Ford, Chevy, Dodge, BMW, etc.)
- Movie/TV/game characters, logos, or copyrighted designs
- Sports team logos or mascots
- For CUSTOM one-off personal use: set ip_warning but still feasible if otherwise ok
- For anything that would be resold/listed: set ip_flags and reject

## SIZE CHECK:
- If the part clearly exceeds 300×300×350mm (our max build volume), flag as needs_splitting
- If splitting is reasonable (e.g., a panel split into 2 pieces with tab/slot joinery), suggest it
- If splitting would compromise the part's function, reject

## OUTPUT FORMAT — respond ONLY with valid JSON, no other text:
{
  "verdict": "feasible" | "needs_splitting" | "rejected",
  "reason": "brief explanation for the customer",
  "safety_flags": ["list of safety concerns found, empty array if none"],
  "ip_flags": ["list of IP concerns found, empty array if none"],
  "ip_warning": "optional warning for personal-use IP items",
  "reference_specs": {
    "estimated_dimensions_mm": { "x": number, "y": number, "z": number },
    "description": "what this part is",
    "notes": "any important fabrication notes"
  },
  "split_suggestion": "optional: how to split if needs_splitting"
}`

interface IntakeInput {
  raw_prompt: string
  intended_use?: string | null
  reference_dimensions?: { x: number; y: number; z: number; unit: string } | null
  printer_profiles: PrinterProfile[]
}

export async function runIntakeAgent(
  input: IntakeInput,
  customRequestId: string
): Promise<{ verdict: IntakeVerdict; agentRunId: string }> {
  const db = createAdminClient()

  const { data: run } = await db
    .from('agent_runs')
    .insert({
      agent: 'intake',
      custom_request_id: customRequestId,
      input: input as unknown as Record<string, unknown>,
      model: DEFAULT_MODEL,
      status: 'running',
    })
    .select('id')
    .single()

  const agentRunId = run!.id

  const maxVolume = input.printer_profiles.length > 0
    ? `Max build volume across your printers: ${input.printer_profiles.map(p => `${p.build_volume_x_mm}×${p.build_volume_y_mm}×${p.build_volume_z_mm}mm (${p.name})`).join(', ')}`
    : 'Max build volume: 300×300×350mm'

  const userMessage = [
    `Customer request: "${input.raw_prompt}"`,
    input.intended_use ? `Intended use: ${input.intended_use}` : null,
    input.reference_dimensions
      ? `Customer-provided dimensions: ${input.reference_dimensions.x}×${input.reference_dimensions.y}×${input.reference_dimensions.z}${input.reference_dimensions.unit}`
      : null,
    maxVolume,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const verdict = JSON.parse(text) as IntakeVerdict

    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const costUsd = estimateCost(inputTokens, outputTokens)

    await db.from('agent_runs').update({
      output: verdict as unknown as Record<string, unknown>,
      model: response.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
      status: 'complete',
      completed_at: new Date().toISOString(),
    }).eq('id', agentRunId)

    return { verdict, agentRunId }
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
