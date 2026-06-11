import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Lazy singleton so builds don't require STRIPE_SECRET_KEY. */
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
