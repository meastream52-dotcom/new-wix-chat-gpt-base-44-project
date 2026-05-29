"use client";

import { clsx } from "clsx";
import type { AdCampaign } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-[#238636]/20 text-[#3fb950]",
  PAUSED: "bg-[#21262d] text-[#8b949e]",
  ARCHIVED: "bg-[#21262d] text-[#6e7681]",
};

const PLACEMENT_LABELS: Record<string, string> = {
  PRE_ROLL: "Pre-roll",
  MID_ROLL: "Mid-roll",
  POST_ROLL: "Post-roll",
};

interface AdCampaignCardProps {
  ad: AdCampaign;
  selected?: boolean;
  onToggle?: (id: string) => void;
  onStatusChange?: (id: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED") => void;
  onDelete?: (id: string) => void;
}

export function AdCampaignCard({ ad, selected, onToggle, onStatusChange, onDelete }: AdCampaignCardProps) {
  return (
    <div
      className={clsx(
        "bg-[#161b22] border rounded-lg p-4 transition-colors",
        selected ? "border-[#f0883e]" : "border-[#21262d] hover:border-[#30363d]"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="font-medium text-[#e6edf3] text-sm">{ad.name}</div>
          <div className="text-xs text-[#8b949e]">by {ad.sponsor}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded">
            {PLACEMENT_LABELS[ad.placement]}
          </span>
          <span className={clsx("text-[10px] font-mono uppercase px-2 py-0.5 rounded", STATUS_COLORS[ad.status])}>
            {ad.status}
          </span>
        </div>
      </div>

      <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-3 mb-3">{ad.adCopy}</p>

      <div className="flex items-center gap-2">
        {onToggle && (
          <button
            onClick={() => onToggle(ad.id)}
            className={clsx(
              "text-xs px-3 py-1 rounded transition-colors",
              selected
                ? "bg-[#f0883e]/20 text-[#f0883e] hover:bg-[#f0883e]/30"
                : "bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
            )}
          >
            {selected ? "✓ Selected" : "Add to Podcast"}
          </button>
        )}
        {onStatusChange && (
          <button
            onClick={() => onStatusChange(ad.id, ad.status === "ACTIVE" ? "PAUSED" : "ACTIVE")}
            className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            {ad.status === "ACTIVE" ? "Pause" : "Activate"}
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(ad.id)}
            className="text-xs text-[#8b949e] hover:text-[#f85149] transition-colors ml-auto"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
