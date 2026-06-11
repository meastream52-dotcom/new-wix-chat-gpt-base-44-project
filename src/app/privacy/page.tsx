export const metadata = { title: "Privacy Policy — EchoBlog" };

// PLACEHOLDER — requires legal review before launch (see docs/launch-checklist.md)
export default function PrivacyPage() {
  return (
    <div className="prose-blog mx-auto max-w-2xl">
      <h1>Privacy Policy</h1>
      <p className="badge bg-amber-100 text-amber-800">Draft — pending legal review</p>
      <p>
        We store your account profile, the content you publish, and engagement
        records (reading time, comments, likes) used to calculate revenue
        sharing. IP addresses and browser identifiers attached to engagement
        are stored as salted hashes, used only for fraud prevention.
      </p>
      <p>
        Payments and payout identity verification are handled by Stripe; we
        never store card numbers or tax documents. You can request an export
        or deletion of your data at any time.
      </p>
      <p>This document is a placeholder and will be replaced after legal review.</p>
    </div>
  );
}
