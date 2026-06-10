import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runMaterialPricingAgent } from '@/agents/materialPricing'

export async function POST(req: NextRequest) {
  try {
    const { custom_request_id } = await req.json()
    if (!custom_request_id) {
      return NextResponse.json({ error: 'custom_request_id required' }, { status: 400 })
    }

    const db = createAdminClient()

    const { data: request, error } = await db
      .from('custom_requests')
      .select('*')
      .eq('id', custom_request_id)
      .single()

    if (error || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (!request.intake_verdict) {
      return NextResponse.json({ error: 'Intake must pass before pricing' }, { status: 400 })
    }

    await db
      .from('custom_requests')
      .update({ pricing_status: 'processing', pipeline_status: 'pricing' })
      .eq('id', custom_request_id)

    const [{ data: materials }, { data: printers }] = await Promise.all([
      db.from('materials').select('*').eq('is_active', true),
      db.from('printer_profiles').select('*').eq('is_active', true),
    ])

    const marginMultiplier = parseFloat(process.env.DEFAULT_MARGIN_MULTIPLIER ?? '2.5')

    const { output, agentRunId } = await runMaterialPricingAgent(
      {
        raw_prompt: request.raw_prompt,
        intended_use: request.intended_use,
        intake_verdict: request.intake_verdict,
        materials: materials ?? [],
        printer_profiles: printers ?? [],
        margin_multiplier: marginMultiplier,
      },
      custom_request_id
    )

    await db
      .from('custom_requests')
      .update({
        pricing_status: 'complete',
        pricing_data: output,
        pricing_agent_run_id: agentRunId,
      })
      .eq('id', custom_request_id)

    return NextResponse.json({ output, agent_run_id: agentRunId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
