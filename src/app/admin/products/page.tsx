import { createAdminClient } from "@/lib/supabase/admin";
import { PublishButton } from "@/components/PublishButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_tiers(*, materials(name))")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Products</h1>
      {!products?.length && <p className="text-ink-400">No products yet.</p>}
      {products?.map((p) => (
        <div key={p.id} className="card">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`badge ${
                    p.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {p.status}
                </span>
                <h2 className="font-semibold">{p.title}</h2>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-600">{p.description}</p>
              <ul className="mt-2 space-y-0.5 text-sm">
                {(p.product_tiers ?? []).map((t: Record<string, any>) => (
                  <li key={t.id}>
                    <span className="font-medium capitalize">{t.tier}</span>
                    {": "}
                    {t.available
                      ? `${t.materials?.name ?? "?"} · ${t.filament_g}g · ${t.print_time_min}min · $${(t.price_cents / 100).toFixed(2)}`
                      : "unavailable"}
                  </li>
                ))}
              </ul>
              {p.stl_paths.length > 0 && (
                <p className="mt-2 text-xs text-ink-400">STL: {p.stl_paths.join(", ")}</p>
              )}
            </div>
            {p.status === "draft" && (p.product_tiers ?? []).length > 0 && p.description && (
              <PublishButton productId={p.id} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
