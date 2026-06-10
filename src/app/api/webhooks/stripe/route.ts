import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    await handleCheckoutComplete(session)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const db = createAdminClient()
  const meta = session.metadata!
  const shipping = session.shipping_details

  const orderCount = await db
    .from('orders')
    .select('id', { count: 'exact', head: true })
  const nextNum = ((orderCount.count ?? 0) + 1).toString().padStart(4, '0')
  const orderNumber = `PF-${new Date().getFullYear()}-${nextNum}`

  await db.from('orders').insert({
    order_number: orderNumber,
    channel: 'direct',
    customer_email: meta.customer_email,
    customer_name: shipping?.name ?? null,
    shipping_address: shipping?.address
      ? {
          name: shipping.name,
          line1: shipping.address.line1,
          line2: shipping.address.line2,
          city: shipping.address.city,
          state: shipping.address.state,
          postal_code: shipping.address.postal_code,
          country: shipping.address.country,
        }
      : null,
    product_id: meta.product_id,
    product_tier_id: meta.product_tier_id,
    quantity: parseInt(meta.quantity),
    subtotal_usd: (session.amount_subtotal ?? 0) / 100,
    shipping_usd: (session.shipping_cost?.amount_total ?? 0) / 100,
    total_usd: (session.amount_total ?? 0) / 100,
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === 'string' ? session.payment_intent : null,
    payment_status: 'paid',
    paid_at: new Date().toISOString(),
    fulfillment_status: 'pending',
  })
}
