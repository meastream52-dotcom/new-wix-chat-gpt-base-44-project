"use client";

import Link from "next/link";
import { clsx } from "clsx";

interface AgentCardProps {
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  agentType: string;
  lastActivity?: string;
  onToggle: (agentType: string, enabled: boolean) => void;
  loading?: boolean;
}

export function AgentCard({
  name,
  description,
  icon,
  enabled,
  agentType,
  lastActivity,
  onToggle,
  loading,
}: AgentCardProps) {
  return (
    <div
      className={clsx(
        "bg-[#161b22] border rounded-lg p-5 transition-all",
        enabled ? "border-[#21262d] hover:border-[#30363d]" : "border-[#21262d] opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="font-semibold text-[#e6edf3] text-sm">{name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  enabled ? "bg-[#3fb950] animate-pulse" : "bg-[#8b949e]"
                )}
              />
              <span className="text-[10px] text-[#8b949e]">
                {enabled ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={() => onToggle(agentType, !enabled)}
          disabled={loading}
          className={clsx(
            "relative w-10 h-5 rounded-full transition-colors shrink-0",
            enabled ? "bg-[#3fb950]/30 border border-[#3fb950]/50" : "bg-[#21262d] border border-[#30363d]"
          )}
          aria-label={`Toggle ${name}`}
        >
          <span
            className={clsx(
              "absolute top-0.5 w-4 h-4 rounded-full transition-all",
              enabled ? "left-5 bg-[#3fb950]" : "left-0.5 bg-[#8b949e]"
            )}
          />
        </button>
      </div>

      <p className="text-[#8b949e] text-xs leading-relaxed mb-4">{description}</p>

      {lastActivity && (
        <div className="text-[10px] text-[#8b949e]/70 mb-3 font-mono">
          Last active: {lastActivity}
        </div>
      )}

      <Link
        href={`/agents?type=${agentType.toLowerCase()}`}
        className="inline-flex items-center gap-1.5 text-xs text-[#58a6ff] hover:text-[#79c0ff] transition-colors"
      >
        Open Agent →
      </Link>
    </div>
  );
}
