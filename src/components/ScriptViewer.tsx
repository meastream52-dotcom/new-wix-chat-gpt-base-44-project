"use client";

import { clsx } from "clsx";
import type { PodcastSegment } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  intro: "text-[#58a6ff] border-[#1f6feb]",
  content: "text-[#3fb950] border-[#238636]",
  ad: "text-[#f0883e] border-[#bd561d]",
  outro: "text-[#bc8cff] border-[#8957e5]",
};

const TYPE_BADGES: Record<string, string> = {
  intro: "bg-[#1f6feb]/20 text-[#58a6ff]",
  content: "bg-[#238636]/20 text-[#3fb950]",
  ad: "bg-[#bd561d]/20 text-[#f0883e]",
  outro: "bg-[#8957e5]/20 text-[#bc8cff]",
};

interface ScriptViewerProps {
  segments: PodcastSegment[];
}

export function ScriptViewer({ segments }: ScriptViewerProps) {
  const wordCount = segments.reduce((acc, s) => acc + s.text.split(/\s+/).length, 0);
  const estMinutes = Math.round(wordCount / 130);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-[#8b949e]">
        <span>{segments.length} segments</span>
        <span>~{wordCount.toLocaleString()} words</span>
        <span>~{estMinutes} min</span>
      </div>

      {segments.map((seg, i) => (
        <div
          key={i}
          className={clsx(
            "border-l-2 pl-4 py-1",
            TYPE_COLORS[seg.type] ?? "text-[#e6edf3] border-[#30363d]"
          )}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={clsx(
                "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded",
                TYPE_BADGES[seg.type] ?? "bg-[#21262d] text-[#8b949e]"
              )}
            >
              {seg.type}
            </span>
            {seg.label && (
              <span className="text-xs text-[#8b949e]">{seg.label}</span>
            )}
          </div>
          <p className="text-sm text-[#e6edf3] leading-relaxed whitespace-pre-wrap">{seg.text}</p>
        </div>
      ))}
    </div>
  );
}
