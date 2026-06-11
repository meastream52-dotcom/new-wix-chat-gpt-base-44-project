"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublishButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/publish`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "publish failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "publish failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button onClick={publish} disabled={busy} className="btn-primary">
        {busy ? "Publishing…" : "Publish"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
