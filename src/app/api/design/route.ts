import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runDesignAgent } from '@/agents/design'

export async function POST(req: NextRequest) {
  let customRequestId: string | undefined
  try {
    const body = await req.json()
    customRequestId = body.custom_request_id
    if (!customRequestId) {
      return NextResponse.json({ error: 'custom_request_id required' }, { status: 400 })
    }

    const db = createAdminClient()

    const { data: request, error } = await db
      .from('custom_requests')
      .select('*')
      .eq('id', customRequestId)
      .single()

    if (error || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (!request.intake_verdict || request.intake_status === 'rejected') {
      return NextResponse.json({ error: 'Intake must pass before design' }, { status: 400 })
    }

    await db
      .from('custom_requests')
      .update({ design_status: 'processing', pipeline_status: 'design' })
      .eq('id', customRequestId)

    const { output, agentRunId } = await runDesignAgent(
      {
        raw_prompt: request.raw_prompt,
        intake_verdict: request.intake_verdict,
        intended_use: request.intended_use,
      },
      customRequestId
    )

    await db
      .from('custom_requests')
      .update({
        design_status: 'complete',
        openscad_script: output.openscad_script,
        design_agent_run_id: agentRunId,
      })
      .eq('id', customRequestId)

    return NextResponse.json({ output, agent_run_id: agentRunId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    if (customRequestId) {
      createAdminClient()
        .from('custom_requests')
        .update({ design_status: 'failed' })
        .eq('id', customRequestId)
        .then(() => {})
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
