"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PodcastCard } from "@/components/PodcastCard";
import type { Podcast } from "@/lib/types";

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/podcast");
    const data = await res.json();
    setPodcasts(data.podcasts ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this podcast?")) return;
    await fetch(`/api/podcast/${id}`, { method: "DELETE" });
    setPodcasts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#e6edf3]">Podcasts</h1>
          <p className="text-sm text-[#8b949e] mt-0.5">Generate AI-scripted podcasts with ElevenLabs voice synthesis</p>
        </div>
        <Link
          href="/podcast/new"
          className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          + New Podcast
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-[#8b949e]">Loading...</div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#30363d] rounded-lg">
          <div className="text-4xl mb-3">🎙️</div>
          <div className="text-[#8b949e] text-sm mb-4">No podcasts yet</div>
          <Link href="/podcast/new" className="text-[#58a6ff] text-sm hover:underline">
            Create your first podcast →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {podcasts.map((p) => (
            <PodcastCard key={p.id} podcast={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
