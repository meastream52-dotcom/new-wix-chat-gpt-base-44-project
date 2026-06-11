"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NEXT_ACTION: Record<string, { label: string; path: string } | undefined> = {
  intake_review: { label: "Approve → run Design", path: "approve" },
  design: { label: "Approve design → run Pricing", path: "price" },
  pricing: { label: "Approve pricing → run Listing", path: "list" },
};

/** Per-request pipeline buttons: each click is a human approval gate. */
export function PipelineActions({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = NEXT_ACTION[status];

  async function call(path: string, body?: object) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "action failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {next && (
          <button onClick={() => call(next.path)} disabled={busy} className="btn-primary">
            {busy ? "Running agent…" : next.label}
          </button>
        )}
        {!["rejected", "published", "closed"].includes(status) && (
          <button
            onClick={() => call("reject", { reason: "rejected by operator" })}
            disabled={busy}
            className="btn-outline"
          >
            Reject
          </button>
        )}
      </div>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
