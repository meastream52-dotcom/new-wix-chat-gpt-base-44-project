import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BuyButton } from "@/components/BuyButton";

export const revalidate = 60;

const TIER_ORDER = { premium: 0, standard: 1, budget: 2 } as const;

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, product_tiers(*, materials(name))")
    .eq("id", params.id)
    .eq("status", "published")
    .single();
  if (!product) notFound();

  const tiers = [...(product.product_tiers ?? [])].sort(
    (a, b) =>
      TIER_ORDER[a.tier as keyof typeof TIER_ORDER] -
      TIER_ORDER[b.tier as keyof typeof TIER_ORDER]
  );
  const spec = product.spec_sheet as Record<string, unknown>;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <p className="mt-4 whitespace-pre-line text-ink-600">{product.description}</p>

        {Object.keys(spec).length > 0 && (
          <div className="card mt-6">
            <h2 className="mb-2 font-semibold">Spec sheet</h2>
            <dl className="space-y-1 text-sm">
              {Object.entries(spec).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-40 shrink-0 font-medium text-ink-600">
                    {k.replaceAll("_", " ")}
                  </dt>
                  <dd>{typeof v === "string" ? v : JSON.stringify(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {tiers.map((t) => (
          <div key={t.id} className={`card ${!t.available ? "opacity-50" : ""}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold capitalize">{t.tier}</h3>
              {t.available && (
                <span className="text-lg font-bold text-forge-700">
                  ${(t.price_cents / 100).toFixed(2)}
                </span>
              )}
            </div>
            {t.available ? (
              <>
                <p className="mt-1 text-sm text-ink-600">
                  {t.materials?.name}
                  {t.finishing !== "none" && ` · ${t.finishing} finishing`} · ~
                  {Math.round(t.print_time_min / 60)}h print
                </p>
                <div className="mt-3">
                  <BuyButton productId={product.id} tier={t.tier} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-ink-400">
                Not available for this part&apos;s use requirements.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
