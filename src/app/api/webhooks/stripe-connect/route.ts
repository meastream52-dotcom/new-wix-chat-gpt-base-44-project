import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * Connect webhook — separate endpoint with its own signing secret
 * (STRIPE_CONNECT_WEBHOOK_SECRET). Handles account.updated for Express
 * accounts: payouts/charges capability sync.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_CONNECT_WEBHOOK_SECRET) {
    return new Response("Webhook not configured", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (existing?.processedAt) return Response.json({ received: true, duplicate: true });
  await prisma.stripeEvent.upsert({
    where: { id: event.id },
    create: { id: event.id, eventType: event.type },
    update: {},
  });

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const complete = !!account.details_submitted && !!account.payouts_enabled;
    await prisma.payoutAccount.updateMany({
      where: { stripeConnectedAccountId: account.id },
      data: {
        payoutsEnabled: !!account.payouts_enabled,
        chargesEnabled: !!account.charges_enabled,
        ...(complete ? { onboardingStatus: "complete" } : {}),
      },
    });
  }

  await prisma.stripeEvent.update({
    where: { id: event.id },
    data: { processedAt: new Date() },
  });
  return Response.json({ received: true });
}
