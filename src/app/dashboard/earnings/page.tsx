import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateCurrentPeriod } from "@/lib/revenue/estimate";
import { WRITER_WEIGHTS, USER_WEIGHTS } from "@/lib/revenue/scores";
import { dollars, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [estimate, ledger] = await Promise.all([
    estimateCurrentPeriod(user.id),
    prisma.ledgerEntry.findMany({
      where: { userId: user.id },
      include: { period: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Estimates update hourly. Final amounts are calculated after month-end
        review and may change. Payouts are not yet enabled for estimates —
        only approved ledger entries are ever paid.{" "}
        <Link href="/earnings-policy" className="text-accent underline">Read the policy</Link>.
      </p>

      <div className="card mt-6">
        <h2 className="text-sm font-semibold text-gray-700">This month (estimated)</h2>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs text-gray-500">Writer pool</p><p className="text-xl font-bold">{dollars(estimate.writerEstimateCents)}</p></div>
          <div><p className="text-xs text-gray-500">Community pool</p><p className="text-xl font-bold">{dollars(estimate.userEstimateCents)}</p></div>
          <div><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-accent">{dollars(estimate.totalEstimateCents)}</p></div>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-700">Per-post estimate</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr><th className="py-2">Post</th><th className="text-right">Read min</th><th className="text-right">Readers</th><th className="text-right">Sub min</th><th className="text-right">💬</th><th className="text-right">Score</th><th className="text-right">Estimate</th></tr>
          </thead>
          <tbody>
            {estimate.perPost.map((p) => (
              <tr key={p.postId} className="border-t border-gray-100">
                <td className="max-w-56 truncate py-2">{p.title}</td>
                <td className="text-right">{p.readMinutes}</td>
                <td className="text-right">{p.uniqueReaders}</td>
                <td className="text-right">{p.subscriberReadMinutes}</td>
                <td className="text-right">{p.comments}</td>
                <td className="text-right">{p.score}</td>
                <td className="text-right font-medium">{dollars(p.estimateCents)}</td>
              </tr>
            ))}
            {estimate.perPost.length === 0 && (
              <tr><td colSpan={7} className="py-4 text-center text-gray-500">No qualifying engagement yet this month.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card mt-6 text-sm">
        <h2 className="font-semibold">How scores work — the actual weights</h2>
        <p className="mt-2">Writer score per post = qualified read minutes × {WRITER_WEIGHTS.qualifiedReadMinutes} + unique readers × {WRITER_WEIGHTS.uniqueReaders} + subscriber read minutes × {WRITER_WEIGHTS.subscriberReadMinutes} + comments received × {WRITER_WEIGHTS.visibleComments}</p>
        <p className="mt-2">Community score = your qualified read minutes × {USER_WEIGHTS.qualifiedReadMinutes} + comment points (2 each, first 10/day) + post points (5 each, first 2/day) + unique likers on your posts × {USER_WEIGHTS.uniqueLikersReceived}</p>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-700">Ledger (finalized periods)</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr><th className="py-2">Period</th><th>Source</th><th>Status</th><th className="text-right">Amount</th></tr>
          </thead>
          <tbody>
            {ledger.map((entry) => (
              <tr key={entry.id} className="border-t border-gray-100">
                <td className="py-2">{shortDate(entry.period.periodStart)} – {shortDate(entry.period.periodEnd)}</td>
                <td>{entry.sourceType}</td>
                <td><span className={`badge ${entry.status === "paid" ? "bg-emerald-100 text-emerald-800" : entry.status === "approved" ? "bg-blue-100 text-blue-800" : entry.status === "held_for_review" ? "bg-amber-100 text-amber-800" : "bg-gray-100"}`}>{entry.status}</span></td>
                <td className="text-right font-medium">{dollars(entry.amountCents)}</td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-gray-500">No ledger entries yet — the first month hasn't closed.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card mt-6 text-sm">
        <h2 className="font-semibold">FAQ</h2>
        <dl className="mt-2 space-y-3 text-gray-600">
          <div><dt className="font-medium text-ink">Where does the money come from?</dt><dd>Premium subscriptions. Each month's revenue is split: 50% platform, 40% writer pool, 10% community pool.</dd></div>
          <div><dt className="font-medium text-ink">Why do estimates change?</dt><dd>They share a fixed pool — as other writers earn engagement, your share moves. The final number is set at month-end review.</dd></div>
          <div><dt className="font-medium text-ink">What counts as a qualified read?</dt><dd>At least 20 seconds of active reading from someone other than you, capped at 10 minutes per post per reader per day.</dd></div>
          <div><dt className="font-medium text-ink">What's excluded?</dt><dd>Self-reads, self-likes, suspicious sessions, deleted/flagged posts, and anything past the daily caps.</dd></div>
        </dl>
      </div>
    </div>
  );
}
