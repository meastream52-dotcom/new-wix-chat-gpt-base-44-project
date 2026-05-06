"use client";

import { clsx } from "clsx";

interface EvidenceRowProps {
  id: string;
  title: string;
  source: string;
  caseTag: string;
  claimCount: number;
  createdAt: string;
  onExtract: (id: string) => void;
  onJudge: (id: string) => void;
  onGraph: (id: string) => void;
  loading?: boolean;
}

const CASE_COLORS: Record<string, string> = {
  "marilyn-monroe": "text-pink-400 bg-pink-500/10",
  "jfk": "text-blue-400 bg-blue-500/10",
  "mlk": "text-purple-400 bg-purple-500/10",
  general: "text-gray-400 bg-gray-500/10",
};

export function EvidenceRow({
  id,
  title,
  source,
  caseTag,
  claimCount,
  createdAt,
  onExtract,
  onJudge,
  onGraph,
  loading,
}: EvidenceRowProps) {
  const tagStyle = CASE_COLORS[caseTag] ?? CASE_COLORS.general;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-[#21262d] bg-[#161b22] hover:border-[#30363d] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-gray-100 truncate">{title}</h3>
          <span className={clsx("shrink-0 text-xs px-2 py-0.5 rounded font-mono", tagStyle)}>
            {caseTag}
          </span>
        </div>
        <p className="text-xs text-[#8b949e] truncate">{source}</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#8b949e] shrink-0">
        <span>{claimCount} claims</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <ActionButton label="Extract" onClick={() => onExtract(id)} disabled={loading} />
        <ActionButton label="Judge" onClick={() => onJudge(id)} disabled={loading} />
        <ActionButton label="Graph" onClick={() => onGraph(id)} disabled={loading} variant="accent" />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "accent";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-40",
        variant === "accent"
          ? "bg-[#58a6ff]/10 text-[#58a6ff] hover:bg-[#58a6ff]/20"
          : "bg-[#21262d] text-gray-300 hover:bg-[#30363d]"
      )}
    >
      {label}
    </button>
  );
}
