import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { product_tier_id, quantity = 1, customer_email } = await req.json()

    if (!product_tier_id || !customer_email) {
      return NextResponse.json({ error: 'product_tier_id and customer_email required' }, { status: 400 })
    }

    const db = createAdminClient()

    const { data: tier } = await db
      .from('product_tiers')
      .select('*, product:products(*), material:materials(*)')
      .eq('id', product_tier_id)
      .single()

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    if (!tier.is_available) {
      return NextResponse.json({ error: 'This tier is not available' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const tierLabel = tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.product.title} — ${tierLabel} (${tier.material.display_name})`,
              description: `3D printed, ${tier.print_time_hours.toFixed(1)}h print time, ${tier.filament_grams.toFixed(0)}g filament`,
              images: tier.product.render_paths?.length
                ? [`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/renders/${tier.product.render_paths[0]}`]
                : [],
            },
            unit_amount: Math.round(tier.price_usd * 100),
          },
          quantity,
        },
      ],
      shipping_address_collection: { allowed_countries: ['US'] },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/catalog`,
      metadata: {
        product_tier_id,
        product_id: tier.product_id,
        quantity: String(quantity),
        customer_email,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
