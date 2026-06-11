import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Orders</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-ink-600">
            <tr>
              {["Product", "Tier", "Channel", "Customer", "Ship to", "Amount", "Status", "Placed"].map((h) => (
                <th key={h} className="px-4 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => {
              const addr = o.shipping_address as Record<string, string> | null;
              return (
                <tr key={o.id} className="border-t border-ink-100 align-top">
                  <td className="px-4 py-2 font-medium">{o.products?.title ?? "—"}</td>
                  <td className="px-4 py-2 capitalize">{o.tier ?? "—"}</td>
                  <td className="px-4 py-2">{o.channel}</td>
                  <td className="px-4 py-2">{o.customer_email}</td>
                  <td className="px-4 py-2 text-xs text-ink-600">
                    {addr
                      ? [addr.line1, addr.city, addr.state, addr.postal_code]
                          .filter(Boolean)
                          .join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">${(o.amount_cents / 100).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </td>
                  <td className="px-4 py-2 text-ink-400">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!orders?.length && <p className="p-4 text-sm text-ink-400">No orders yet.</p>}
      </div>
    </div>
  );
}
