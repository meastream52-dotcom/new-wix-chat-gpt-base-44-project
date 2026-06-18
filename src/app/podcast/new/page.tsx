"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ELEVENLABS_VOICES } from "@/lib/types";
import type { AdCampaign } from "@/lib/types";
import { AdCampaignCard } from "@/components/AdCampaignCard";

const TONES = ["conversational", "informative", "storytelling", "interview", "comedy"];

export default function NewPodcastPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    tone: "conversational",
    targetLength: 10,
    hostName: "Alex",
    voiceId: ELEVENLABS_VOICES.Rachel,
    adsEnabled: true,
  });

  useEffect(() => {
    fetch("/api/ads")
      .then((r) => r.json())
      .then((d) => setAds((d.ads ?? []).filter((a: AdCampaign) => a.status === "ACTIVE")));
  }, []);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleAd = (id: string) =>
    setSelectedAdIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/podcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, adIds: selectedAdIds }),
    });
    const data = await res.json();
    if (data.podcast?.id) {
      router.push(`/podcast/${data.podcast.id}`);
    } else {
      alert("Failed to create podcast");
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#e6edf3]">New Podcast</h1>
        <p className="text-sm text-[#8b949e] mt-0.5">Configure your podcast — we'll generate the script and audio</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1.5">Podcast Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. The Hidden History of Cryptocurrency"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1.5">Topic / Brief</label>
          <textarea
            required
            rows={3}
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
            placeholder="Describe what this podcast episode is about in detail..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] resize-none"
          />
        </div>

        {/* Tone + Length */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">Tone</label>
            <select
              value={form.tone}
              onChange={(e) => set("tone", e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">Target Length (minutes)</label>
            <input
              type="number"
              min={2}
              max={60}
              value={form.targetLength}
              onChange={(e) => set("targetLength", parseInt(e.target.value))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
        </div>

        {/* Host + Voice */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">Host Name</label>
            <input
              value={form.hostName}
              onChange={(e) => set("hostName", e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">ElevenLabs Voice</label>
            <select
              value={form.voiceId}
              onChange={(e) => set("voiceId", e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            >
              {Object.entries(ELEVENLABS_VOICES).map(([name, id]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ads */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[#8b949e]">Advertisements</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.adsEnabled}
                onChange={(e) => set("adsEnabled", e.target.checked)}
                className="rounded"
              />
              <span className="text-xs text-[#8b949e]">Enable ads</span>
            </label>
          </div>

          {form.adsEnabled && (
            <>
              {ads.length === 0 ? (
                <div className="text-xs text-[#8b949e] bg-[#161b22] border border-dashed border-[#30363d] rounded-md p-4 text-center">
                  No active ad campaigns.{" "}
                  <a href="/ads" className="text-[#58a6ff] hover:underline">Create one →</a>
                </div>
              ) : (
                <div className="space-y-2">
                  {ads.map((ad) => (
                    <AdCampaignCard
                      key={ad.id}
                      ad={ad}
                      selected={selectedAdIds.includes(ad.id)}
                      onToggle={toggleAd}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-sm py-2 rounded-md transition-colors"
          >
            {submitting ? "Creating..." : "Create Podcast"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
