"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { Podcast } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-[#21262d] text-[#8b949e]",
  SCRIPTED: "bg-[#1f6feb]/20 text-[#58a6ff]",
  GENERATING: "bg-[#bd561d]/20 text-[#f0883e]",
  READY: "bg-[#238636]/20 text-[#3fb950]",
  FAILED: "bg-[#da3633]/20 text-[#f85149]",
};

interface PodcastCardProps {
  podcast: Podcast;
  onDelete?: (id: string) => void;
}

export function PodcastCard({ podcast, onDelete }: PodcastCardProps) {
  const wordCount = podcast.script
    ? (podcast.script as any[]).reduce((acc: number, s: any) => acc + (s.text?.split(/\s+/).length ?? 0), 0)
    : null;
  const estMin = wordCount ? Math.round(wordCount / 130) : null;

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 hover:border-[#30363d] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link href={`/podcast/${podcast.id}`} className="font-medium text-[#e6edf3] hover:text-[#58a6ff] transition-colors line-clamp-2">
          {podcast.title}
        </Link>
        <span className={clsx("text-[10px] font-mono uppercase px-2 py-0.5 rounded shrink-0", STATUS_COLORS[podcast.status])}>
          {podcast.status}
        </span>
      </div>

      <p className="text-xs text-[#8b949e] mb-3 line-clamp-2">{podcast.topic}</p>

      <div className="flex flex-wrap gap-2 text-[10px] text-[#8b949e] mb-3">
        <span className="bg-[#21262d] px-2 py-0.5 rounded">{podcast.tone}</span>
        <span className="bg-[#21262d] px-2 py-0.5 rounded">~{podcast.targetLength} min</span>
        <span className="bg-[#21262d] px-2 py-0.5 rounded">host: {podcast.hostName}</span>
        {podcast.adsEnabled && podcast.adIds.length > 0 && (
          <span className="bg-[#bd561d]/20 text-[#f0883e] px-2 py-0.5 rounded">{podcast.adIds.length} ad{podcast.adIds.length > 1 ? "s" : ""}</span>
        )}
        {estMin && <span className="bg-[#238636]/10 text-[#3fb950] px-2 py-0.5 rounded">~{estMin} min scripted</span>}
      </div>

      <div className="flex items-center justify-between">
        <Link href={`/podcast/${podcast.id}`} className="text-xs text-[#58a6ff] hover:underline">
          Open →
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(podcast.id)}
            className="text-xs text-[#8b949e] hover:text-[#f85149] transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
