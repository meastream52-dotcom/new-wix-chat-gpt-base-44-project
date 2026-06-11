import { getConfig } from "@/lib/config";
import { getStripe, stripeEnabled } from "@/lib/stripe";

export interface RevenueBreakdown {
  subscriptionCents: bigint;
  adCents: bigint; // placeholder source — wired so ads can be added without schema changes
  totalCents: bigint;
}

/**
 * Revenue for a window, in integer cents. Stripe paid invoices are the
 * source of truth; in dev/demo without Stripe keys the
 * demo_monthly_revenue_cents config value is used instead.
 */
export async function getMonthlyRevenueCents(
  periodStart: Date,
  periodEnd: Date
): Promise<RevenueBreakdown> {
  let subscriptionCents = 0n;

  if (stripeEnabled) {
    const stripe = getStripe();
    let startingAfter: string | undefined;
    for (;;) {
      const page = await stripe.invoices.list({
        status: "paid",
        created: {
          gte: Math.floor(periodStart.getTime() / 1000),
          lt: Math.floor(periodEnd.getTime() / 1000),
        },
        limit: 100,
        starting_after: startingAfter,
      });
      for (const invoice of page.data) {
        subscriptionCents += BigInt(invoice.amount_paid ?? 0);
      }
      if (!page.has_more || page.data.length === 0) break;
      startingAfter = page.data[page.data.length - 1].id;
    }
  } else {
    subscriptionCents = BigInt(await getConfig<number>("demo_monthly_revenue_cents"));
  }

  const adCents = 0n;
  return { subscriptionCents, adCents, totalCents: subscriptionCents + adCents };
}
