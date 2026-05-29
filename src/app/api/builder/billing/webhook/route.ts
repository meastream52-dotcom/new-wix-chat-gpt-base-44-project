import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature failed: ${(err as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as { metadata?: { userId?: string }; customer?: string; subscription?: string };
        const userId = session.metadata?.userId;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: "PRO",
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as { customer: string };
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as { customer: string };
        await prisma.user.updateMany({
          where: { stripeCustomerId: inv.customer },
          data: { plan: "FREE" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
