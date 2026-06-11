"use client";

import { useState } from "react";

export function UpgradeButton({ signedIn }: { signedIn: boolean }) {
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setError(null);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(typeof data.error === "string" ? data.error : "Checkout unavailable");
    }
  }

  if (!signedIn) {
    return <p className="text-sm text-gray-500">Sign in to upgrade.</p>;
  }
  return (
    <div>
      <button onClick={upgrade} className="btn-primary w-full justify-center">
        Upgrade
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
