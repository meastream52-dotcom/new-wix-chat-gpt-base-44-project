import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('products')
    .select('*, tiers:product_tiers(*, material:materials(*), printer_profile:printer_profiles(*))')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const db = createAdminClient()

    const updates: Record<string, unknown> = {}
    if (body.status !== undefined) updates.status = body.status
    if (body.title !== undefined) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description

    if (body.status === 'published' && !body.approved_at) {
      updates.approved_at = new Date().toISOString()
    }

    const { data, error } = await db
      .from('products')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
