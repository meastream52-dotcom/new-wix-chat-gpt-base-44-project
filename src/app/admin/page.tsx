import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const [requests, products, orders, runs] = await Promise.all([
    supabase
      .from("custom_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["intake_review", "design", "pricing", "listing"]),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase
      .from("agent_runs")
      .select("agent, model, input_tokens, output_tokens, cost_usd, duration_ms, error, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const totalCost = (runs.data ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);

  const stats = [
    ["Requests awaiting action", requests.count ?? 0],
    ["Draft products", products.count ?? 0],
    ["Paid orders to fulfill", orders.count ?? 0],
  ] as const;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(([label, n]) => (
          <div key={label} className="card">
            <p className="text-3xl font-bold">{n}</p>
            <p className="text-sm text-ink-600">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 mt-8 text-lg font-semibold">
        Recent agent runs{" "}
        <span className="text-sm font-normal text-ink-400">
          (last 25 · ${totalCost.toFixed(4)})
        </span>
      </h2>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-ink-600">
            <tr>
              {["Agent", "Model", "In / out tokens", "Cost", "Duration", "Status", "When"].map((h) => (
                <th key={h} className="px-4 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(runs.data ?? []).map((r, i) => (
              <tr key={i} className="border-t border-ink-100">
                <td className="px-4 py-2 font-medium">{r.agent}</td>
                <td className="px-4 py-2 text-ink-600">{r.model}</td>
                <td className="px-4 py-2">{r.input_tokens} / {r.output_tokens}</td>
                <td className="px-4 py-2">${Number(r.cost_usd).toFixed(4)}</td>
                <td className="px-4 py-2">{(r.duration_ms / 1000).toFixed(1)}s</td>
                <td className="px-4 py-2">
                  {r.error ? (
                    <span className="badge bg-red-100 text-red-700" title={r.error}>error</span>
                  ) : (
                    <span className="badge bg-green-100 text-green-700">ok</span>
                  )}
                </td>
                <td className="px-4 py-2 text-ink-400">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!runs.data?.length && (
          <p className="p-4 text-sm text-ink-400">No agent runs yet.</p>
        )}
      </div>
    </div>
  );
}
