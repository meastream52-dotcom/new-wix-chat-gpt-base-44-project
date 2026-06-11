"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Inline dollars-per-unit editor for material costs and printer rates. */
export function CentsField(props: {
  kind: "material" | "printer";
  id: string;
  field: string;
  cents: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState((props.cents / 100).toFixed(2));
  const [busy, setBusy] = useState(false);

  async function save() {
    const cents = Math.round(parseFloat(value) * 100);
    if (!Number.isFinite(cents) || cents <= 0 || cents === props.cents) return;
    setBusy(true);
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: props.kind, id: props.id, [props.field]: cents }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-1">
      $
      <input
        className="input w-24"
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
    </span>
  );
}

export function StockToggle(props: { id: string; inStock: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "material", id: props.id, in_stock: !props.inStock }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={toggle} disabled={busy} className="btn-outline">
      {props.inStock ? "In stock" : "Out of stock"}
    </button>
  );
}
