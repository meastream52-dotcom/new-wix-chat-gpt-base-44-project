import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runListingAgent } from '@/agents/listing'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

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

    if (!request.intake_verdict || !request.pricing_data) {
      return NextResponse.json({ error: 'Intake and pricing must complete before listing' }, { status: 400 })
    }

    await db
      .from('custom_requests')
      .update({ listing_status: 'processing', pipeline_status: 'listing' })
      .eq('id', custom_request_id)

    const { output, agentRunId } = await runListingAgent(
      {
        raw_prompt: request.raw_prompt,
        intended_use: request.intended_use,
        intake_verdict: request.intake_verdict,
        pricing_data: request.pricing_data,
      },
      custom_request_id
    )

    // Create draft product
    const baseSlug = slugify(output.title)
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const { data: existing } = await db
        .from('products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const { data: product } = await db
      .from('products')
      .insert({
        slug,
        title: output.title,
        description: output.description,
        seo_description: output.seo_description,
        spec_sheet: output.spec_sheet,
        status: 'draft',
        source: 'custom',
        custom_request_id,
        stl_path: request.stl_path,
        render_paths: request.render_paths ?? [],
        marketing_notes: output.marketing_notes,
      })
      .select('id')
      .single()

    if (!product) throw new Error('Failed to create product')

    // Create product tiers
    const { data: materials } = await db.from('materials').select('*').eq('is_active', true)
    const { data: printers } = await db.from('printer_profiles').select('*').eq('is_active', true).limit(1)
    const firstPrinter = printers?.[0]

    if (firstPrinter && materials) {
      const tierInserts = request.pricing_data.tiers
        .filter((t: { is_available: boolean }) => t.is_available)
        .map((t: {
          tier: string
          material_name: string
          price_usd: number
          print_time_hours: number
          filament_grams: number
          layer_height_mm: number
          infill_percent: number
          finishing_notes: string
        }) => {
          const mat = materials.find((m) => m.name === t.material_name)
          if (!mat) return null
          return {
            product_id: product.id,
            tier: t.tier,
            material_id: mat.id,
            printer_profile_id: firstPrinter.id,
            price_usd: t.price_usd,
            print_time_hours: t.print_time_hours,
            filament_grams: t.filament_grams,
            layer_height_mm: t.layer_height_mm,
            infill_percent: t.infill_percent,
            finishing_notes: t.finishing_notes,
          }
        })
        .filter(Boolean)

      if (tierInserts.length > 0) {
        await db.from('product_tiers').insert(tierInserts)
      }
    }

    await db
      .from('custom_requests')
      .update({
        listing_status: 'complete',
        listing_agent_run_id: agentRunId,
        product_id: product.id,
        pipeline_status: 'listing',
      })
      .eq('id', custom_request_id)

    return NextResponse.json({ output, product_id: product.id, agent_run_id: agentRunId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
