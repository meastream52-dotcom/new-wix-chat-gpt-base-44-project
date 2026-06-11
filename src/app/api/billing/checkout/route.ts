import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await requireUser();
    if (!stripeEnabled || !process.env.STRIPE_PREMIUM_PRICE_ID) {
      return Response.json({ error: "Billing is not configured" }, { status: 503 });
    }
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    let customerId = (
      await prisma.subscription.findUnique({ where: { userId: user.id } })
    )?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/pricing?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
