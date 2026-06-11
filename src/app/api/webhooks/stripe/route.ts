import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * Billing webhook. Signature-verified, idempotent via the stripe_events
 * table, and Stripe is the source of truth for subscription state — we only
 * mirror it.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook not configured", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Idempotency: skip already-processed events
  const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (existing?.processedAt) return Response.json({ received: true, duplicate: true });
  await prisma.stripeEvent.upsert({
    where: { id: event.id },
    create: { id: event.id, eventType: event.type },
    update: {},
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );
        await syncSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
      // Revenue is read from Stripe invoices at period close — nothing to store
      break;
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        // Stripe will also send subscription.updated with past_due; this is
        // just a fast-path refresh of the cache
        const record = await prisma.subscription.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        if (record) {
          await prisma.user.update({
            where: { id: record.userId },
            data: { isPremiumCached: false },
          });
        }
      }
      break;
    }
    case "transfer.reversed": {
      const transfer = event.data.object as Stripe.Transfer;
      await handleTransferReversed(transfer);
      break;
    }
  }

  await prisma.stripeEvent.update({
    where: { id: event.id },
    data: { processedAt: new Date() },
  });
  return Response.json({ received: true });
}

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  const userId = await resolveUserId(sub, customerId);
  if (!userId) return;

  // Current API versions expose the billing period on the subscription item
  const item = sub.items?.data?.[0] as
    | { current_period_start?: number; current_period_end?: number }
    | undefined;
  const legacy = sub as unknown as {
    current_period_start?: number;
    current_period_end?: number;
  };
  const periodStart = item?.current_period_start ?? legacy.current_period_start;
  const periodEnd = item?.current_period_end ?? legacy.current_period_end;

  const data = {
    stripeCustomerId: customerId,
    status: sub.status,
    currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, stripeSubscriptionId: sub.id, ...data },
    update: { stripeSubscriptionId: sub.id, ...data },
  });

  // Refresh convenience cache — never read as the source of truth
  await prisma.user.update({
    where: { id: userId },
    data: { isPremiumCached: ["active", "trialing"].includes(sub.status) },
  });
}

async function resolveUserId(
  sub: Stripe.Subscription,
  customerId: string
): Promise<string | null> {
  if (sub.metadata?.userId) return sub.metadata.userId;
  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (existing) return existing.userId;
  const customer = await getStripe().customers.retrieve(customerId);
  if (!customer.deleted && customer.metadata?.userId) return customer.metadata.userId;
  return null;
}

async function handleTransferReversed(transfer: Stripe.Transfer) {
  const entries = await prisma.ledgerEntry.findMany({
    where: { stripeTransferId: transfer.id, status: "paid" },
  });
  if (entries.length === 0) return;

  await prisma.$transaction([
    prisma.ledgerEntry.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { status: "reversed" },
    }),
    // Offsetting negative entry keeps the ledger sum honest
    ...entries.map((entry) =>
      prisma.ledgerEntry.create({
        data: {
          userId: entry.userId,
          postId: entry.postId,
          revenuePeriodId: entry.revenuePeriodId,
          sourceType: "reversal",
          amountCents: -entry.amountCents,
          status: "reversed",
          reviewNote: `Reversal of transfer ${transfer.id}`,
        },
      })
    ),
    prisma.user.update({
      where: { id: entries[0].userId },
      data: { isFlagged: true },
    }),
  ]);
}
