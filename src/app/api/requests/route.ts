import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const db = createAdminClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = db
    .from('custom_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('pipeline_status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { raw_prompt, customer_email, intended_use, reference_dimensions } = body

    if (!raw_prompt || !customer_email) {
      return NextResponse.json({ error: 'raw_prompt and customer_email required' }, { status: 400 })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('custom_requests')
      .insert({ raw_prompt, customer_email, intended_use, reference_dimensions })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
