import { startOfDay, subDays, subHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import { MIN_QUALIFIED_SECONDS } from "@/lib/engagement/constants";

export const dynamic = "force-dynamic";

export default async function AdminHealthPage() {
  const todayStart = startOfDay(new Date());
  const yesterdayStart = subDays(todayStart, 1);
  const window = { gte: yesterdayStart, lt: todayStart };

  const [
    newUsers,
    newPosts,
    readSeconds,
    totalSessions,
    suspiciousSessions,
    openSignals,
    stuckWebhooks,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: window } }),
    prisma.post.count({ where: { createdAt: window, status: "PUBLISHED" } }),
    prisma.readingSession.aggregate({
      where: {
        startedAt: window,
        isSuspicious: false,
        qualifiedSeconds: { gte: MIN_QUALIFIED_SECONDS },
      },
      _sum: { qualifiedSeconds: true },
    }),
    prisma.readingSession.count({ where: { startedAt: window } }),
    prisma.readingSession.count({ where: { startedAt: window, isSuspicious: true } }),
    prisma.fraudSignal.count({ where: { status: "open" } }),
    // Webhooks received but never processed — silent failures to investigate
    prisma.stripeEvent.findMany({
      where: { processedAt: null, createdAt: { lt: subHours(new Date(), 1) } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const suspiciousPct =
    totalSessions > 0 ? Math.round((suspiciousSessions / totalSessions) * 100) : 0;

  const stats: Array<[string, string]> = [
    ["New users", String(newUsers)],
    ["Posts published", String(newPosts)],
    ["Qualified read minutes", String(Math.round((readSeconds._sum.qualifiedSeconds ?? 0) / 60))],
    ["Sessions flagged suspicious", `${suspiciousPct}%`],
    ["Open fraud signals", String(openSignals)],
    ["Stuck webhooks (>1h)", String(stuckWebhooks.length)],
  ];

  return (
    <div>
      <h2 className="text-xl font-bold">Operational health — yesterday</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <h3 className="text-sm font-semibold text-gray-700">
          Unprocessed Stripe events older than 1h
        </h3>
        {stuckWebhooks.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-700">None — webhook pipeline is healthy.</p>
        ) : (
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr><th className="py-1">Event ID</th><th>Type</th><th>Received</th></tr>
            </thead>
            <tbody>
              {stuckWebhooks.map((event) => (
                <tr key={event.id} className="border-t border-gray-100">
                  <td className="py-1 font-mono text-xs">{event.id}</td>
                  <td>{event.eventType}</td>
                  <td>{event.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
