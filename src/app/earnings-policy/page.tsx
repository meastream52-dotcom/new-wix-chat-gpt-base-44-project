export const metadata = { title: "Earnings policy — EchoBlog" };

export default function EarningsPolicyPage() {
  return (
    <div className="prose-blog mx-auto max-w-2xl">
      <h1>How earnings work</h1>
      <p>
        Every month, EchoBlog splits its subscription revenue three ways: 50%
        keeps the platform running, 40% goes to writers, and 10% goes to active
        readers and commenters. The split is published here and applied in
        code from a single configuration value — it never changes silently.
      </p>

      <h2>How your share is calculated</h2>
      <p>
        Writers earn from the writer pool in proportion to a per-post score:
        qualified read minutes (×1.0), unique readers (×0.5), read minutes from
        premium subscribers (×1.5), and comments received (×0.2). Readers earn
        from the community pool for qualified reading, commenting (first 10 a
        day), publishing (first 2 a day), and receiving likes.
      </p>

      <h2>What counts as a qualified read</h2>
      <p>
        At least 20 seconds of active reading, from someone other than the
        author, capped at 10 minutes per post per reader per day. Reading your
        own posts never counts; neither does liking them.
      </p>

      <h2>What's excluded</h2>
      <p>
        Self-engagement, sessions our systems mark suspicious, deleted or
        moderated content, and anything past the daily caps. These exclusions
        apply identically to the live estimate and the final calculation.
      </p>

      <h2>Why payouts can be held</h2>
      <p>
        Before any money moves, a human reviews the month's earnings. If our
        fraud systems flag unusual patterns — many accounts reading from one
        device, reciprocal engagement rings, scripted reading — the affected
        earnings are held for review rather than paid. Holds are not
        accusations: most are released after review. If a hold is confirmed as
        abuse, the earnings are removed and the account may lose payout
        eligibility.
      </p>

      <h2>The review process</h2>
      <ol>
        <li>Month ends → earnings are calculated and enter a pending ledger.</li>
        <li>Admins review totals, top earners, and fraud signals.</li>
        <li>Approved entries become payable; flagged ones are held with a reason.</li>
        <li>Payouts run for approved balances above $10, via Stripe.</li>
        <li>Every transfer is logged, idempotent, and reversible.</li>
      </ol>

      <p>
        Questions about a specific hold? Contact support — every decision has
        an audit trail we can walk through with you.
      </p>
    </div>
  );
}
