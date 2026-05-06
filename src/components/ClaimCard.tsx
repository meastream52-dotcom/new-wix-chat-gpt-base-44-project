"use client";

import { ConfidenceBar } from "./ConfidenceBar";
import type { ClaimStatus } from "@/lib/types";
import { clsx } from "clsx";

interface ClaimCardProps {
  id: string;
  text: string;
  confidence: number;
  status: ClaimStatus;
  entities?: string[];
  timeRef?: string | null;
  documentTitle?: string;
  selected?: boolean;
  onClick?: () => void;
}

const STATUS_STYLES: Record<ClaimStatus, string> = {
  ACCEPTED: "border-green-500/30 bg-green-500/5",
  WEAK: "border-yellow-500/30 bg-yellow-500/5",
  REJECTED: "border-red-500/30 bg-red-500/5",
  PENDING: "border-[#21262d] bg-[#161b22]",
};

const STATUS_BADGE: Record<ClaimStatus, string> = {
  ACCEPTED: "text-green-400 bg-green-500/10",
  WEAK: "text-yellow-400 bg-yellow-500/10",
  REJECTED: "text-red-400 bg-red-500/10",
  PENDING: "text-gray-400 bg-gray-500/10",
};

export function ClaimCard({
  text,
  confidence,
  status,
  entities = [],
  timeRef,
  documentTitle,
  selected,
  onClick,
}: ClaimCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-lg border p-4 cursor-pointer transition-all",
        STATUS_STYLES[status],
        selected && "ring-2 ring-[#58a6ff]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm text-gray-200 leading-relaxed flex-1">{text}</p>
        <span className={clsx("shrink-0 text-xs font-mono px-2 py-0.5 rounded", STATUS_BADGE[status])}>
          {status}
        </span>
      </div>

      <ConfidenceBar value={confidence} size="sm" />

      <div className="mt-2 flex flex-wrap gap-1">
        {timeRef && (
          <span className="text-xs text-[#58a6ff] bg-blue-500/10 px-2 py-0.5 rounded">
            {timeRef}
          </span>
        )}
        {entities.slice(0, 4).map((e) => (
          <span key={e} className="text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded">
            {e}
          </span>
        ))}
        {documentTitle && (
          <span className="text-xs text-[#8b949e] ml-auto">from: {documentTitle}</span>
        )}
      </div>
    </div>
  );
}
