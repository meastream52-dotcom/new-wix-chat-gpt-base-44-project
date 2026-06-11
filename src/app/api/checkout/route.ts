import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, SITE_URL } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  product_id: z.string().uuid(),
  tier: z.enum(["premium", "standard", "budget"]),
});

/** Creates a Stripe Checkout session for a published product tier. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { product_id, tier } = parsed.data;

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, title, status, request_id")
    .eq("id", product_id)
    .single();
  if (!product || product.status !== "published") {
    return NextResponse.json({ error: "product not available" }, { status: 404 });
  }

  const { data: tierRow } = await supabase
    .from("product_tiers")
    .select("*, materials(name)")
    .eq("product_id", product_id)
    .eq("tier", tier)
    .single();
  if (!tierRow?.available) {
    return NextResponse.json({ error: "tier not available" }, { status: 409 });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: tierRow.price_cents,
          product_data: {
            name: `${product.title} — ${tier} (${tierRow.materials?.name ?? ""})`,
          },
        },
      },
    ],
    shipping_address_collection: { allowed_countries: ["US", "CA"] },
    metadata: {
      product_id,
      tier,
      channel: product.request_id ? "custom" : "direct",
      request_id: product.request_id ?? "",
    },
    success_url: `${SITE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/products/${product_id}`,
  });

  return NextResponse.json({ url: session.url });
}
