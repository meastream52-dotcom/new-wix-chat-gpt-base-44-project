import { anthropic, DEFAULT_MODEL, estimateCost } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase/admin'
import type { IntakeVerdict } from '@/lib/types'

const SYSTEM_PROMPT = `You are the design agent for PrintForge, a 3D printing service.

Your job is to produce a parametric OpenSCAD script for the requested part, plus an analysis of the design.

Guidelines:
- Write clean, parametric OpenSCAD code with variables at the top for all key dimensions
- Add clearance/tolerance where parts need to fit together (typically 0.2–0.4mm)
- Use standard print-friendly geometry: chamfers instead of sharp interior corners, wall thickness ≥ 1.6mm
- For complex organic shapes, describe the design approach and note that Fusion 360 modeling is needed
- Always include a comments block at the top with part name, version, and key dimensions

OUTPUT FORMAT — respond ONLY with valid JSON, no other text:
{
  "openscad_script": "full OpenSCAD code as a string",
  "design_notes": "key fabrication notes, orientation recommendation, support needs",
  "estimated_dimensions_mm": { "x": number, "y": number, "z": number },
  "requires_fusion360": boolean,
  "fusion360_brief": "if requires_fusion360, a brief for human modeling"
}`

interface DesignInput {
  raw_prompt: string
  intake_verdict: IntakeVerdict
  intended_use?: string | null
}

interface DesignOutput {
  openscad_script: string
  design_notes: string
  estimated_dimensions_mm: { x: number; y: number; z: number }
  requires_fusion360: boolean
  fusion360_brief?: string
}

export async function runDesignAgent(
  input: DesignInput,
  customRequestId: string
): Promise<{ output: DesignOutput; agentRunId: string }> {
  const db = createAdminClient()

  const { data: run } = await db
    .from('agent_runs')
    .insert({
      agent: 'design',
      custom_request_id: customRequestId,
      input: input as unknown as Record<string, unknown>,
      model: DEFAULT_MODEL,
      status: 'running',
    })
    .select('id')
    .single()

  const agentRunId = run!.id

  const specs = input.intake_verdict.reference_specs
  const userMessage = [
    `Part request: "${input.raw_prompt}"`,
    input.intended_use ? `Intended use: ${input.intended_use}` : null,
    specs ? `Reference description: ${specs.description}` : null,
    specs ? `Estimated dimensions: ${specs.estimated_dimensions_mm.x}×${specs.estimated_dimensions_mm.y}×${specs.estimated_dimensions_mm.z}mm` : null,
    specs?.notes ? `Notes: ${specs.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const output = JSON.parse(text) as DesignOutput

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
