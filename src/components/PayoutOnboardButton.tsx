"use client";

import { useState } from "react";

export function PayoutOnboardButton({
  label,
  askCountry,
}: {
  label: string;
  askCountry?: boolean;
}) {
  const [country, setCountry] = useState("US");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/payouts/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && data.url) window.location.href = data.url;
    else setError(typeof data.error === "string" ? data.error : "Onboarding unavailable");
  }

  return (
    <div>
      {askCountry && (
        <label className="mb-2 block text-sm">
          <span className="text-gray-600">Your country (can't be changed later)</span>
          <select className="input mt-1 max-w-40" value={country} onChange={(e) => setCountry(e.target.value)}>
            {["US", "GB", "CA", "AU", "DE", "FR", "NL", "ES", "IT", "IE", "SE"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      )}
      <button onClick={start} disabled={busy} className="btn-primary disabled:opacity-50">
        {label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
