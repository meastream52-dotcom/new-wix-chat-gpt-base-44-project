"use client";

import { useState } from "react";

export function BuyButton({ productId, tier }: { productId: string; tier: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, tier }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "checkout failed");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "checkout failed");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={buy} disabled={loading} className="btn-primary w-full">
        {loading ? "Redirecting…" : "Buy"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
