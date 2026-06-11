export const metadata = { title: "Terms of Service — EchoBlog" };

// PLACEHOLDER — requires legal review before launch (see docs/launch-checklist.md)
export default function TermsPage() {
  return (
    <div className="prose-blog mx-auto max-w-2xl">
      <h1>Terms of Service</h1>
      <p className="badge bg-amber-100 text-amber-800">Draft — pending legal review</p>
      <p>
        By using EchoBlog you agree to publish only content you have the right
        to publish, to engage authentically (no bots, purchased engagement, or
        coordinated manipulation), and to accept that earnings are calculated
        and reviewed as described in the earnings policy.
      </p>
      <p>
        We may hold or remove earnings derived from manipulated engagement,
        remove content that violates these terms, and suspend accounts engaged
        in abuse. Payouts require identity verification through our payment
        provider, Stripe.
      </p>
      <p>This document is a placeholder and will be replaced after legal review.</p>
    </div>
  );
}
