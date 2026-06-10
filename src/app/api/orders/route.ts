import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const db = createAdminClient()
  const { searchParams } = new URL(req.url)
  const fulfillmentStatus = searchParams.get('fulfillment_status')

  let query = db
    .from('orders')
    .select('*, product:products(title, render_paths), product_tier:product_tiers(tier, material:materials(display_name))')
    .order('created_at', { ascending: false })

  if (fulfillmentStatus) {
    query = query.eq('fulfillment_status', fulfillmentStatus)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
