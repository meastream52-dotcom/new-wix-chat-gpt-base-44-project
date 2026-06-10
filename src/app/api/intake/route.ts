import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runIntakeAgent } from '@/agents/intake'

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

    if (request.intake_status === 'processing') {
      return NextResponse.json({ error: 'Already processing' }, { status: 409 })
    }

    await db
      .from('custom_requests')
      .update({ intake_status: 'processing', pipeline_status: 'intake' })
      .eq('id', custom_request_id)

    const { data: printers } = await db
      .from('printer_profiles')
      .select('*')
      .eq('is_active', true)

    const { verdict, agentRunId } = await runIntakeAgent(
      {
        raw_prompt: request.raw_prompt,
        intended_use: request.intended_use,
        reference_dimensions: request.reference_dimensions,
        printer_profiles: printers ?? [],
      },
      custom_request_id
    )

    const newIntakeStatus =
      verdict.verdict === 'feasible'
        ? 'feasible'
        : verdict.verdict === 'needs_splitting'
        ? 'needs_splitting'
        : 'rejected'

    const newPipelineStatus =
      verdict.verdict === 'rejected' ? 'rejected' : 'intake'

    await db
      .from('custom_requests')
      .update({
        intake_status: newIntakeStatus,
        intake_verdict: verdict,
        intake_agent_run_id: agentRunId,
        pipeline_status: newPipelineStatus,
      })
      .eq('id', custom_request_id)

    return NextResponse.json({ verdict, agent_run_id: agentRunId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
