import { prisma } from "@/lib/prisma";
import { stripeEnabled } from "@/lib/stripe";
import { previewPayouts } from "@/lib/payouts/run";
import { dollars, shortDate } from "@/lib/format";
import { AdminAction } from "@/components/admin/AdminAction";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const [preview, batches] = await Promise.all([
    previewPayouts(),
    prisma.payoutBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { username: true } },
        entries: { select: { amountCents: true, status: true, failureReason: true, user: { select: { username: true } } } },
      },
      take: 20,
    }),
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold">Payouts</h2>

      <div className="card mt-4">
        <h3 className="text-sm font-semibold text-gray-700">Next run (dry-run preview)</h3>
        {!stripeEnabled && (
          <p className="mt-2 text-sm text-amber-700">
            Stripe is not configured — payouts are disabled in this environment.
          </p>
        )}
        <p className="mt-2 text-sm">
          <b>{preview.eligible.length}</b> users eligible · total{" "}
          <b>{dollars(preview.totalCents)}</b> · minimum {dollars(preview.minimumPayoutCents)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {preview.eligible.map((g) => (
            <span key={g.userId} className="badge bg-emerald-100 text-emerald-800">
              @{g.username} {dollars(g.totalCents)}
            </span>
          ))}
        </div>
        {preview.skipped.length > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            Skipped:{" "}
            {preview.skipped.map((s) => `@${s.username} (${s.reason})`).join(", ")} — their
            approved entries roll into the next run.
          </p>
        )}
        {stripeEnabled && preview.eligible.length > 0 && (
          <div className="mt-4">
            <AdminAction
              url="/api/admin/payouts/run"
              label="Run payouts"
              confirmText={`Transfer ${dollars(preview.totalCents)} to ${preview.eligible.length} users via Stripe? This moves real money.`}
              className="btn-danger"
            />
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h3 className="text-sm font-semibold text-gray-700">Batches</h3>
        {batches.map((batch) => {
          const total = batch.entries.reduce((sum, e) => sum + e.amountCents, 0n);
          return (
            <div key={batch.id} className="mt-3 rounded-lg border border-gray-100 p-3 text-sm">
              <p>
                <b>{shortDate(batch.createdAt)}</b> · {batch.status} · {dollars(total)} ·
                by @{batch.createdBy.username}
              </p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                {Object.entries(
                  batch.entries.reduce<Record<string, { cents: bigint; status: string; failure: string | null }>>(
                    (acc, e) => {
                      const k = e.user.username;
                      acc[k] = acc[k] ?? { cents: 0n, status: e.status, failure: e.failureReason };
                      acc[k].cents += e.amountCents;
                      return acc;
                    },
                    {}
                  )
                ).map(([username, info]) => (
                  <span
                    key={username}
                    className={`badge ${info.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                    title={info.failure ?? undefined}
                  >
                    @{username} {dollars(info.cents)} ({info.status})
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {batches.length === 0 && <p className="mt-2 text-sm text-gray-500">No payout batches yet.</p>}
      </div>
    </div>
  );
}
