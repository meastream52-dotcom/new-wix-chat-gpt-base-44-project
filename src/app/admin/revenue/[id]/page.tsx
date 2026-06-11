import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollars, shortDate } from "@/lib/format";
import { AdminAction, HoldAction } from "@/components/admin/AdminAction";

export const dynamic = "force-dynamic";

export default async function PeriodDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; source?: string }>;
}) {
  const { id } = await params;
  const { status: statusFilter, source: sourceFilter } = await searchParams;

  const period = await prisma.revenuePeriod.findUnique({ where: { id } });
  if (!period) notFound();

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      revenuePeriodId: id,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(sourceFilter ? { sourceType: sourceFilter } : {}),
    },
    include: { user: { select: { username: true, isFlagged: true } } },
    orderBy: { amountCents: "desc" },
    take: 500,
  });

  const pendingIds = entries.filter((e) => e.status === "pending").map((e) => e.id);
  const pendingCount = await prisma.ledgerEntry.count({
    where: { revenuePeriodId: id, status: "pending" },
  });
  const topEarners = entries.slice(0, 20);

  return (
    <div>
      <Link href="/admin/revenue" className="text-sm text-gray-500 hover:underline">← Periods</Link>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-bold">
          {shortDate(period.periodStart)} – {shortDate(period.periodEnd)}
        </h2>
        <span className="badge bg-amber-100 text-amber-800">{period.status}</span>
        {period.status === "pending_review" && (
          <span className="ml-auto flex gap-2">
            {pendingIds.length > 0 && (
              <AdminAction
                url="/api/admin/ledger/approve"
                body={{ entryIds: pendingIds }}
                label={`Approve all pending (${pendingCount})`}
                confirmText={`Approve ${pendingCount} pending entries? They become payable in the next payout run.`}
                className="btn-primary"
              />
            )}
            <AdminAction
              url="/api/admin/revenue/finalize"
              body={{ periodId: period.id }}
              label="Finalize period"
              confirmText="Finalize this period? Blocked while any entry is still pending."
            />
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div className="card"><p className="text-xs text-gray-500">Total revenue</p><p className="mt-1 text-xl font-extrabold">{dollars(period.totalRevenueCents)}</p></div>
        <div className="card"><p className="text-xs text-gray-500">Owner pool (incl. rounding)</p><p className="mt-1 text-xl font-extrabold">{dollars(period.ownerPoolCents)}</p></div>
        <div className="card"><p className="text-xs text-gray-500">Writer pool</p><p className="mt-1 text-xl font-extrabold">{dollars(period.writerPoolCents)}</p></div>
        <div className="card"><p className="text-xs text-gray-500">Community pool</p><p className="mt-1 text-xl font-extrabold">{dollars(period.userPoolCents)}</p></div>
      </div>

      <div className="card mt-6">
        <h3 className="text-sm font-semibold text-gray-700">
          Top earners — where fraud shows first
        </h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {topEarners.map((e) => (
            <span key={e.id} className={`badge ${e.user.isFlagged ? "bg-red-100 text-red-800" : "bg-gray-100"}`}>
              @{e.user.username} {dollars(e.amountCents)}{e.user.isFlagged ? " ⚑" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-gray-700">Filter:</span>
          {["", "pending", "approved", "held_for_review", "paid"].map((s) => (
            <Link
              key={s || "all"}
              href={`/admin/revenue/${id}${s ? `?status=${s}` : ""}`}
              className={`badge ${statusFilter === s || (!statusFilter && !s) ? "bg-accent text-white" : "bg-gray-100"}`}
            >
              {s || "all"}
            </Link>
          ))}
        </div>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr><th className="py-2">User</th><th>Source</th><th>Status</th><th>Note</th><th className="text-right">Amount</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-gray-100">
                <td className="py-2 font-medium">@{entry.user.username}</td>
                <td>{entry.sourceType}</td>
                <td><span className="badge bg-gray-100">{entry.status}</span></td>
                <td className="max-w-48 truncate text-xs text-gray-500">{entry.reviewNote ?? ""}</td>
                <td className="text-right font-medium">{dollars(entry.amountCents)}</td>
                <td className="text-right">
                  {(entry.status === "pending" || entry.status === "held_for_review") && (
                    <AdminAction url="/api/admin/ledger/approve" body={{ entryIds: [entry.id] }} label="Approve" />
                  )}
                  {(entry.status === "pending" || entry.status === "approved") && (
                    <HoldAction entryIds={[entry.id]} />
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-gray-500">No entries match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
