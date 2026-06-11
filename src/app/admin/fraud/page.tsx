import { prisma } from "@/lib/prisma";
import { shortDate } from "@/lib/format";
import { AdminAction } from "@/components/admin/AdminAction";

export const dynamic = "force-dynamic";

const SEVERITY_ORDER = ["high", "medium", "low"] as const;
const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-gray-100 text-gray-600",
};

export default async function AdminFraudPage() {
  const signals = await prisma.fraudSignal.findMany({
    where: { status: "open" },
    include: { user: { select: { username: true, isFlagged: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const grouped = SEVERITY_ORDER.map((sev) => ({
    sev,
    items: signals.filter((s) => s.severity === sev),
  }));

  return (
    <div>
      <h2 className="text-xl font-bold">Fraud signals</h2>
      <p className="mt-1 text-sm text-gray-500">
        The nightly scan flags; you decide. Confirm → user flagged, future
        earnings auto-held. Dismiss → affected sessions and held entries are restored.
      </p>

      {grouped.map(({ sev, items }) => (
        <div key={sev} className="mt-6">
          <h3 className="text-sm font-semibold">
            <span className={`badge ${SEVERITY_BADGE[sev]}`}>{sev}</span>{" "}
            <span className="text-gray-500">({items.length})</span>
          </h3>
          {items.map((signal) => {
            const evidence = signal.evidence as Record<string, unknown>;
            return (
              <div key={signal.id} className="card mt-3 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <b>{signal.signalType}</b>
                  <span>@{signal.user.username}{signal.user.isFlagged ? " ⚑" : ""}</span>
                  <span className="text-xs text-gray-400">{shortDate(signal.createdAt)}</span>
                  <span className="ml-auto flex gap-2">
                    <AdminAction
                      url="/api/admin/fraud"
                      body={{ signalId: signal.id, action: "confirm" }}
                      label="Confirm"
                      confirmText="Confirm fraud? The user is flagged and future entries auto-hold."
                      className="btn-danger"
                    />
                    <AdminAction
                      url="/api/admin/fraud"
                      body={{ signalId: signal.id, action: "dismiss" }}
                      label="Dismiss"
                    />
                  </span>
                </div>
                <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs text-gray-600 sm:grid-cols-2">
                  {Object.entries(evidence)
                    .filter(([k]) => k !== "dedupeKey")
                    .map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <dt className="font-medium text-gray-500">{k}:</dt>
                        <dd className="truncate">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            );
          })}
          {items.length === 0 && <p className="mt-2 text-xs text-gray-400">None open.</p>}
        </div>
      ))}
    </div>
  );
}
