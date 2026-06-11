import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, description, render_paths, product_tiers(price_cents, available)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div>
      <section className="mb-10 rounded-xl bg-ink-900 px-8 py-12 text-white">
        <h1 className="text-3xl font-bold">
          The part that doesn&apos;t exist anymore? We make it.
        </h1>
        <p className="mt-3 max-w-xl text-ink-100">
          Discontinued trim, obsolete brackets, parts too niche for anyone to
          stock — designed by AI, reviewed by a human, printed in-house.
        </p>
        <Link href="/request" className="btn-primary mt-6">
          Request a custom part
        </Link>
      </section>

      <h2 className="mb-4 text-xl font-semibold">Catalog</h2>
      {!products?.length ? (
        <p className="text-ink-400">
          No products published yet — check back soon, or request a custom part.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const prices = (p.product_tiers ?? [])
              .filter((t) => t.available)
              .map((t) => t.price_cents);
            const from = prices.length ? Math.min(...prices) : null;
            return (
              <Link key={p.id} href={`/products/${p.id}`} className="card hover:border-forge-500">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-ink-600">{p.description}</p>
                {from !== null && (
                  <p className="mt-3 text-sm font-medium text-forge-700">
                    from ${(from / 100).toFixed(2)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
