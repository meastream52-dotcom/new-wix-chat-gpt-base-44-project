"use client";

import { clsx } from "clsx";

interface WorkflowCardProps {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  runCount: number;
  lastRunAt?: string | null;
  onToggle: (id: string, enabled: boolean) => void;
}

export function WorkflowCard({
  id,
  name,
  trigger,
  action,
  enabled,
  runCount,
  lastRunAt,
  onToggle,
}: WorkflowCardProps) {
  return (
    <div
      className={clsx(
        "bg-[#161b22] border rounded-lg p-5 transition-all",
        enabled ? "border-[#21262d] hover:border-[#30363d]" : "border-[#21262d] opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-semibold text-[#e6edf3] text-sm">{name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                enabled ? "bg-[#3fb950] animate-pulse" : "bg-[#8b949e]"
              )}
            />
            <span className="text-[10px] text-[#8b949e]">
              {enabled ? "Running" : "Paused"} · {runCount} runs
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggle(id, !enabled)}
          className={clsx(
            "relative w-10 h-5 rounded-full transition-colors shrink-0",
            enabled ? "bg-[#3fb950]/30 border border-[#3fb950]/50" : "bg-[#21262d] border border-[#30363d]"
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 w-4 h-4 rounded-full transition-all",
              enabled ? "left-5 bg-[#3fb950]" : "left-0.5 bg-[#8b949e]"
            )}
          />
        </button>
      </div>

      {/* Flow diagram */}
      <div className="flex items-start gap-2 text-xs">
        <div className="flex-1 bg-[#0f1117] border border-[#21262d] rounded p-2.5">
          <div className="text-[10px] text-[#58a6ff] font-mono uppercase mb-1">Trigger</div>
          <div className="text-[#8b949e] leading-relaxed">{trigger}</div>
        </div>
        <div className="mt-4 text-[#8b949e] shrink-0">→</div>
        <div className="flex-1 bg-[#0f1117] border border-[#21262d] rounded p-2.5">
          <div className="text-[10px] text-[#3fb950] font-mono uppercase mb-1">Action</div>
          <div className="text-[#8b949e] leading-relaxed">{action}</div>
        </div>
      </div>

      {lastRunAt && (
        <div className="mt-3 text-[10px] text-[#8b949e]/60 font-mono">
          Last run: {new Date(lastRunAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
