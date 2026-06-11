import Link from "next/link";
import { startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { dollars, shortDate } from "@/lib/format";
import { AdminAction } from "@/components/admin/AdminAction";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  calculating: "bg-gray-100",
  pending_review: "bg-amber-100 text-amber-800",
  finalized: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default async function AdminRevenuePage() {
  const periods = await prisma.revenuePeriod.findMany({
    orderBy: { periodStart: "desc" },
    include: { _count: { select: { ledgerEntries: true } } },
  });

  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = startOfMonth(new Date());

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Revenue periods</h2>
        <AdminAction
          url="/api/admin/revenue/calculate"
          body={{
            periodStart: lastMonthStart.toISOString(),
            periodEnd: lastMonthEnd.toISOString(),
          }}
          label={`Calculate ${lastMonthStart.toISOString().slice(0, 7)}`}
          confirmText={`Run the month-end calculation for ${lastMonthStart.toISOString().slice(0, 7)}? This creates pending ledger entries (no money moves).`}
          className="btn-primary"
        />
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-2">Period</th><th>Status</th>
              <th className="text-right">Revenue</th><th className="text-right">Writers</th>
              <th className="text-right">Community</th><th className="text-right">Entries</th><th></th>
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="py-2">{shortDate(p.periodStart)} – {shortDate(p.periodEnd)}</td>
                <td><span className={`badge ${STATUS_BADGE[p.status] ?? "bg-gray-100"}`}>{p.status}</span></td>
                <td className="text-right">{dollars(p.totalRevenueCents)}</td>
                <td className="text-right">{dollars(p.writerPoolCents)}</td>
                <td className="text-right">{dollars(p.userPoolCents)}</td>
                <td className="text-right">{p._count.ledgerEntries}</td>
                <td className="text-right">
                  <Link href={`/admin/revenue/${p.id}`} className="text-accent hover:underline">review →</Link>
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-gray-500">
                No periods calculated yet. Month-end close is a deliberate human action — use the button above.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
