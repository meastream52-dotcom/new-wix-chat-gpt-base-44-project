import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Stripe webhook: records paid orders into the manual fulfillment queue. */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "no signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `invalid signature: ${err instanceof Error ? err.message : err}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const md = session.metadata ?? {};

    const supabase = createAdminClient();
    const { error } = await supabase.from("orders").upsert(
      {
        channel: md.channel === "custom" ? "custom" : "direct",
        product_id: md.product_id || null,
        tier: (md.tier as "premium" | "standard" | "budget") || null,
        request_id: md.request_id || null,
        customer_email: session.customer_details?.email ?? "unknown",
        amount_cents: session.amount_total ?? 0,
        stripe_session_id: session.id,
        status: "paid",
        shipping_address: session.customer_details?.address ?? null,
      },
      { onConflict: "stripe_session_id" }
    );
    if (error) {
      console.error("order insert failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
