"use client";
import { clsx } from "clsx";

interface AgentRunRecord {
  id: string;
  type: string;
  status: string;
  completedAt: string | null;
}

const AGENT_META: Record<string, { icon: string; label: string }> = {
  ORCHESTRATOR:    { icon: "🎯", label: "Orchestrator" },
  PRODUCT_MANAGER: { icon: "🧠", label: "Product Manager" },
  UI_UX:           { icon: "🎨", label: "UI/UX Designer" },
  DATABASE:        { icon: "🗄️", label: "Database" },
  BACKEND:         { icon: "⚙️", label: "Backend" },
  FRONTEND:        { icon: "⚛️", label: "Frontend" },
  SECURITY:        { icon: "🔒", label: "Security" },
  TESTING:         { icon: "🧪", label: "Testing" },
  DEVOPS:          { icon: "🚀", label: "DevOps" },
  BILLING_AGENT:   { icon: "💳", label: "Billing" },
  DOCUMENTATION:   { icon: "📖", label: "Docs" },
  DEBUGGING:       { icon: "🐛", label: "Debug" },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:          "border-[#21262d] text-[#4d5566]",
  RUNNING:          "border-[#58a6ff] text-[#58a6ff] bg-[#58a6ff]/5",
  COMPLETED:        "border-[#3fb950] text-[#3fb950] bg-[#3fb950]/5",
  FAILED:           "border-[#f85149] text-[#f85149] bg-[#f85149]/5",
  WAITING_APPROVAL: "border-[#d29922] text-[#d29922] bg-[#d29922]/5",
};

interface PipelineStatusProps {
  agentRuns: AgentRunRecord[];
  projectStatus: string;
  className?: string;
}

export function PipelineStatus({ agentRuns, projectStatus, className }: PipelineStatusProps) {
  return (
    <div className={clsx("space-y-2", className)}>
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Pipeline</span>
        <span className={clsx(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          projectStatus === "BUILDING" || projectStatus === "PLANNING" ? "bg-[#58a6ff]/10 text-[#58a6ff]" :
          projectStatus === "REVIEW" || projectStatus === "DEPLOYED" ? "bg-[#3fb950]/10 text-[#3fb950]" :
          projectStatus === "FAILED" ? "bg-[#f85149]/10 text-[#f85149]" :
          "bg-[#21262d] text-[#8b949e]"
        )}>
          {projectStatus}
        </span>
      </div>

      {agentRuns.length === 0 ? (
        <div className="text-[#4d5566] text-xs text-center py-4">
          Pipeline hasn&apos;t started yet
        </div>
      ) : (
        agentRuns.map((run) => {
          const meta = AGENT_META[run.type] ?? { icon: "🤖", label: run.type };
          const style = STATUS_STYLES[run.status] ?? STATUS_STYLES.PENDING;
          return (
            <div key={run.id} className={clsx("flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs transition-colors", style)}>
              <span className="shrink-0">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{meta.label}</div>
              </div>
              {run.status === "RUNNING" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse shrink-0" />
              )}
              {run.status === "COMPLETED" && <span className="shrink-0">✓</span>}
              {run.status === "FAILED" && <span className="shrink-0">✗</span>}
              {run.status === "WAITING_APPROVAL" && <span className="shrink-0">⏸</span>}
            </div>
          );
        })
      )}
    </div>
  );
}
