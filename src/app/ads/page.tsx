"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { AdCampaignCard } from "@/components/AdCampaignCard";
import type { AdCampaign, AdPlacement } from "@/lib/types";

const PLACEMENTS: AdPlacement[] = ["PRE_ROLL", "MID_ROLL", "POST_ROLL"];
const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  PRE_ROLL: "Pre-roll (~30s)",
  MID_ROLL: "Mid-roll (~60s)",
  POST_ROLL: "Post-roll (~15s)",
};

const DEFAULT_FORM = {
  name: "",
  sponsor: "",
  placement: "MID_ROLL" as AdPlacement,
  keyMessage: "",
  podcastTopic: "",
  adCopy: "",
  autoGenerate: true,
};

export default function AdsPage() {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/ads");
    const data = await res.json();
    setAds(data.ads ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ad) {
      setAds((prev) => [data.ad, ...prev]);
      setForm(DEFAULT_FORM);
      setShowForm(false);
    } else {
      alert(data.error ?? "Failed to create ad");
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (id: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED") => {
    const res = await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.ad) {
      setAds((prev) => prev.map((a) => (a.id === id ? data.ad : a)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad campaign?")) return;
    await fetch(`/api/ads/${id}`, { method: "DELETE" });
    setAds((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#e6edf3]">Ad Campaigns</h1>
          <p className="text-sm text-[#8b949e] mt-0.5">Manage sponsors and ad copy for your podcasts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f0883e] hover:bg-[#e07040] text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          {showForm ? "✕ Cancel" : "+ New Ad"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={submit} className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-[#e6edf3]">New Ad Campaign</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5">Campaign Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Q2 Tech Promo"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#f0883e]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5">Sponsor / Brand</label>
              <input
                required
                value={form.sponsor}
                onChange={(e) => set("sponsor", e.target.value)}
                placeholder="Acme Corp"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#f0883e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5">Placement</label>
              <select
                value={form.placement}
                onChange={(e) => set("placement", e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#f0883e]"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>{PLACEMENT_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5">Podcast Topic (optional)</label>
              <input
                value={form.podcastTopic}
                onChange={(e) => set("podcastTopic", e.target.value)}
                placeholder="for context-aware copy"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#f0883e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">Key Message (optional)</label>
            <input
              value={form.keyMessage}
              onChange={(e) => set("keyMessage", e.target.value)}
              placeholder="e.g. 50% off first month, use code PODCAST"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#f0883e]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-[#8b949e]">Ad Copy</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoGenerate}
                  onChange={(e) => set("autoGenerate", e.target.checked)}
                />
                <span className="text-xs text-[#8b949e]">AI generate</span>
              </label>
            </div>
            <textarea
              rows={4}
              value={form.adCopy}
              onChange={(e) => set("adCopy", e.target.value)}
              disabled={form.autoGenerate}
              placeholder={form.autoGenerate ? "AI will generate this based on sponsor + key message..." : "Write your ad copy here..."}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#f0883e] resize-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#f0883e] hover:bg-[#e07040] disabled:opacity-50 text-white text-sm py-2 rounded-md transition-colors"
          >
            {submitting ? (form.autoGenerate ? "Generating ad copy..." : "Creating...") : "Create Ad Campaign"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-sm text-[#8b949e]">Loading...</div>
      ) : ads.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#30363d] rounded-lg">
          <div className="text-4xl mb-3">📢</div>
          <div className="text-[#8b949e] text-sm">No ad campaigns yet</div>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <AdCampaignCard
              key={ad.id}
              ad={ad}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
