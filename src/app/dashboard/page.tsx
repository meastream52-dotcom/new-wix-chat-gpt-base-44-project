import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { authorTotals, postStats, type StatRange } from "@/lib/analytics/queries";
import { estimateCurrentPeriod } from "@/lib/revenue/estimate";
import { dollars, shortDate } from "@/lib/format";
import { ReadChart } from "@/components/ReadChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { range: rawRange } = await searchParams;
  const range: StatRange = rawRange === "7d" || rawRange === "all" ? rawRange : "30d";

  const [totals, stats] = await Promise.all([
    authorTotals(user.id, range),
    postStats(user.id, range),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your dashboard</h1>
        <div className="flex gap-2 text-sm">
          {(["7d", "30d", "all"] as const).map((r) => (
            <Link
              key={r}
              href={`/dashboard?range=${r}`}
              className={`badge ${range === r ? "bg-accent text-white" : "bg-gray-100"}`}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Qualified read minutes" value={totals.readMinutes.toLocaleString()} />
        <StatCard label="Unique readers" value={totals.uniqueReaders.toLocaleString()} />
        <StatCard label="Comments received" value={totals.comments.toLocaleString()} />
        <StatCard label="Likes received" value={totals.likes.toLocaleString()} />
      </div>

      {/* Earnings estimate streams in — never blocks the dashboard render */}
      <Suspense fallback={<div className="card mt-6 animate-pulse text-sm text-gray-400">Estimating earnings…</div>}>
        <EarningsCard userId={user.id} />
      </Suspense>

      <div className="card mt-6">
        <h2 className="text-sm font-semibold text-gray-700">Read minutes — last 30 days</h2>
        <ReadChart data={totals.daily} />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-700">Your stories</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-2">Title</th>
              <th>Status</th>
              <th>Published</th>
              <th className="text-right">Read min</th>
              <th className="text-right">Readers</th>
              <th className="text-right">💬</th>
              <th className="text-right">👏</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.postId} className="border-t border-gray-100">
                <td className="max-w-64 truncate py-2 font-medium">
                  <Link href={`/dashboard/posts/${s.postId}`} className="hover:underline">
                    {s.title}
                  </Link>
                </td>
                <td><span className="badge bg-gray-100">{s.status}</span></td>
                <td>{shortDate(s.publishedAt)}</td>
                <td className="text-right">{s.readMinutes}</td>
                <td className="text-right">{s.uniqueReaders}</td>
                <td className="text-right">{s.comments}</td>
                <td className="text-right">{s.likes}</td>
                <td className="text-right">
                  <Link href={`/write?edit=${s.postId}`} className="text-accent hover:underline">edit</Link>
                </td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr><td colSpan={8} className="py-6 text-center text-gray-500">
                No stories yet — <Link href="/write" className="text-accent underline">write one</Link>.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

async function EarningsCard({ userId }: { userId: string }) {
  const estimate = await estimateCurrentPeriod(userId);
  return (
    <div className="card mt-6 border-accent/40">
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p className="text-xs text-gray-500">Estimated earnings (this month)</p>
          <p className="mt-1 text-3xl font-extrabold text-accent">
            {dollars(estimate.totalEstimateCents)}
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Writer pool: <b>{dollars(estimate.writerEstimateCents)}</b> · Community pool:{" "}
          <b>{dollars(estimate.userEstimateCents)}</b>
        </p>
        <Link href="/dashboard/earnings" className="btn-ghost ml-auto">Breakdown →</Link>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Estimate based on engagement this month. Final amounts are calculated after
        month-end review and may change. Payouts are not yet enabled.
      </p>
    </div>
  );
}
