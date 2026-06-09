"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Business {
  id: string;
  name: string;
  industry?: string | null;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface Subscription {
  tier: string;
  status: string;
  currentPeriodEnd?: string | null;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [form, setForm] = useState({ name: "", industry: "", description: "", website: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bizRes, dashRes] = await Promise.all([
        fetch(`/api/onboarding?businessId=${businessId}`),
        fetch(`/api/dashboard?businessId=${businessId}`),
      ]);
      const dashData = await dashRes.json();
      setSubscription(dashData.subscription);
    } catch { /* ignore */ }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      setBusiness(data.business);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const PLAN_FEATURES: Record<string, string[]> = {
    STARTER: ["3 AI Agents", "100 leads/mo", "50 appointments/mo", "Basic workflows"],
    PROFESSIONAL: ["All 5 AI Agents", "Unlimited leads", "Unlimited appointments", "Advanced workflows", "Document AI", "Priority support"],
    ENTERPRISE: ["Everything in Pro", "Custom AI training", "White-label option", "API access", "Dedicated account manager"],
  };

  const tier = subscription?.tier ?? "STARTER";

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Settings</h1>
        <p className="text-[#8b949e] text-sm mt-1">Manage your business profile and subscription.</p>
      </div>

      {/* Business Profile */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-[#e6edf3] mb-4">Business Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Business Name", key: "name", type: "text" },
              { label: "Industry", key: "industry", type: "text" },
              { label: "Website", key: "website", type: "url" },
              { label: "Phone", key: "phone", type: "tel" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs text-[#8b949e] mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={business?.[key as keyof Business] as string ?? label}
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder={business?.address ?? "Street, City, State ZIP"}
              className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder={business?.description ?? "Brief description of your business"}
              className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm hover:bg-[#58a6ff]/30 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && <span className="text-xs text-[#3fb950]">✓ Saved</span>}
          </div>
        </form>
      </div>

      {/* Account */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-[#e6edf3] mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#8b949e]">Email</span>
            <span className="text-[#e6edf3]">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8b949e]">Name</span>
            <span className="text-[#e6edf3]">{session?.user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8b949e]">Role</span>
            <span className="text-[#e6edf3]">{(session?.user as { role?: string })?.role ?? "OWNER"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8b949e]">Business ID</span>
            <span className="text-[#8b949e] font-mono text-xs">{businessId}</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#e6edf3]">Subscription</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#58a6ff] bg-[#58a6ff]/10 px-2 py-1 rounded">{tier}</span>
            <span className="text-xs text-[#3fb950]">{subscription?.status ?? "ACTIVE"}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-[#8b949e] mb-2">Included in your plan:</div>
          <ul className="space-y-1">
            {(PLAN_FEATURES[tier] ?? PLAN_FEATURES.STARTER).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#8b949e]">
                <span className="text-[#3fb950]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        {subscription?.currentPeriodEnd && (
          <div className="text-xs text-[#8b949e]">
            Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-[#21262d]">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { name: "Starter", price: "$49/mo" },
              { name: "Professional", price: "$99/mo", highlight: true },
              { name: "Enterprise", price: "$249/mo" },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-lg p-3 border text-sm ${
                  p.name.toUpperCase() === tier
                    ? "border-[#58a6ff]/50 bg-[#58a6ff]/5"
                    : "border-[#21262d]"
                }`}
              >
                <div className="font-medium text-[#e6edf3]">{p.name}</div>
                <div className="text-[#8b949e] text-xs mt-0.5">{p.price}</div>
                {p.name.toUpperCase() === tier && (
                  <div className="text-[10px] text-[#58a6ff] mt-1">Current Plan</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
