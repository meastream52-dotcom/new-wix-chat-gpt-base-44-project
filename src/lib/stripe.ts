import Stripe from "stripe";

export const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export function getStripe(): Stripe {
  if (!stripeEnabled) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY unset)");
  globalForStripe.stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return globalForStripe.stripe;
}
