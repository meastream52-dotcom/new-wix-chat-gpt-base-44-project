"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ScriptViewer } from "@/components/ScriptViewer";
import type { Podcast, PodcastSegment } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-[#8b949e]",
  SCRIPTED: "text-[#58a6ff]",
  GENERATING: "text-[#f0883e]",
  READY: "text-[#3fb950]",
  FAILED: "text-[#f85149]",
};

export default function PodcastDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [tab, setTab] = useState<"script" | "details">("script");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/podcast/${id}`);
    const data = await res.json();
    setPodcast(data.podcast ?? null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const generateScript = async () => {
    setGenerating(true);
    setError(null);
    const res = await fetch("/api/podcast/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ podcastId: id }),
    });
    const data = await res.json();
    if (data.podcast) {
      setPodcast(data.podcast);
    } else {
      setError(data.error ?? "Script generation failed");
    }
    setGenerating(false);
  };

  const synthesizeAudio = async () => {
    setSynthesizing(true);
    setError(null);
    const res = await fetch(`/api/podcast/${id}/audio`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.podcast) {
      setPodcast(data.podcast);
    } else {
      setError(data.error ?? "Audio synthesis failed");
    }
    setSynthesizing(false);
  };

  if (loading) return <div className="p-8 text-sm text-[#8b949e]">Loading...</div>;
  if (!podcast) return <div className="p-8 text-sm text-[#f85149]">Podcast not found</div>;

  const segments = podcast.script as unknown as PodcastSegment[] | null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button onClick={() => router.push("/podcast")} className="text-xs text-[#8b949e] hover:text-[#58a6ff] mb-2 block">
            ← Podcasts
          </button>
          <h1 className="text-xl font-semibold text-[#e6edf3]">{podcast.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={clsx("text-xs font-mono uppercase", STATUS_COLORS[podcast.status])}>
              {podcast.status}
            </span>
            <span className="text-xs text-[#8b949e]">{podcast.tone} · ~{podcast.targetLength} min · {podcast.hostName}</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {(podcast.status === "DRAFT" || podcast.status === "FAILED") && (
            <button
              onClick={generateScript}
              disabled={generating}
              className="bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {generating ? "Generating..." : "Generate Script"}
            </button>
          )}
          {podcast.status === "SCRIPTED" && (
            <button
              onClick={synthesizeAudio}
              disabled={synthesizing}
              className="bg-[#8957e5] hover:bg-[#a371f7] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {synthesizing ? "Synthesizing..." : "🎙️ Synthesize Audio"}
            </button>
          )}
          {podcast.status === "READY" && (
            <button
              onClick={generateScript}
              disabled={generating}
              className="bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] text-sm px-4 py-2 rounded-md transition-colors"
            >
              {generating ? "Regenerating..." : "Regenerate Script"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149] text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Audio player */}
      {podcast.audioUrl && (
        <div className="mb-6">
          <AudioPlayer src={podcast.audioUrl} title={podcast.title} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[#21262d] pb-0">
        {(["script", "details"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "text-sm px-4 py-2 -mb-px border-b-2 transition-colors capitalize",
              tab === t
                ? "border-[#f78166] text-[#e6edf3]"
                : "border-transparent text-[#8b949e] hover:text-[#e6edf3]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "script" && (
        <>
          {!segments ? (
            <div className="text-center py-16 border border-dashed border-[#30363d] rounded-lg">
              <div className="text-3xl mb-3">📝</div>
              <div className="text-sm text-[#8b949e] mb-4">No script yet</div>
              <button
                onClick={generateScript}
                disabled={generating}
                className="bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
              >
                {generating ? "Generating..." : "Generate Script with AI"}
              </button>
            </div>
          ) : (
            <ScriptViewer segments={segments} />
          )}
        </>
      )}

      {tab === "details" && (
        <div className="space-y-3 text-sm">
          {[
            ["Topic", podcast.topic],
            ["Tone", podcast.tone],
            ["Target Length", `${podcast.targetLength} minutes`],
            ["Host", podcast.hostName],
            ["Ads Enabled", podcast.adsEnabled ? "Yes" : "No"],
            ["Ad IDs", podcast.adIds.length ? podcast.adIds.join(", ") : "None"],
            ["Created", new Date(podcast.createdAt).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4 py-2 border-b border-[#21262d]">
              <div className="w-32 text-[#8b949e] shrink-0">{label}</div>
              <div className="text-[#e6edf3]">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
