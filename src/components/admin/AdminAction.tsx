"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Generic admin mutation button: POSTs JSON, refreshes, surfaces errors. */
export function AdminAction({
  url,
  body,
  label,
  confirmText,
  className = "btn-ghost",
}: {
  url: string;
  body?: Record<string, unknown>;
  label: string;
  confirmText?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : `Failed (${res.status})`);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={run} disabled={busy} className={`${className} disabled:opacity-50`}>
        {label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}

/** Hold action with a required reason prompt. */
export function HoldAction({ entryIds }: { entryIds: string[] }) {
  const router = useRouter();
  async function run() {
    const reason = window.prompt("Reason for holding (required):");
    if (!reason) return;
    const res = await fetch("/api/admin/ledger/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryIds, reason }),
    });
    if (res.ok) router.refresh();
    else alert("Hold failed");
  }
  return <button onClick={run} className="btn-ghost text-amber-700">Hold</button>;
}
