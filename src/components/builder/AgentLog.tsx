"use client";
import { clsx } from "clsx";
import type { AgentLogEntry } from "@/lib/builder-types";

const LEVEL_STYLES: Record<string, string> = {
  DEBUG: "text-[#4d5566]",
  INFO: "text-[#8b949e]",
  WARNING: "text-[#d29922]",
  ERROR: "text-[#f85149]",
  SUCCESS: "text-[#3fb950]",
};

const AGENT_ICONS: Record<string, string> = {
  ORCHESTRATOR: "🎯",
  PRODUCT_MANAGER: "🧠",
  UI_UX: "🎨",
  FRONTEND: "⚛️",
  BACKEND: "⚙️",
  DATABASE: "🗄️",
  TESTING: "🧪",
  SECURITY: "🔒",
  DEVOPS: "🚀",
  DOCUMENTATION: "📖",
  BILLING_AGENT: "💳",
  DEBUGGING: "🐛",
  INTEGRATION: "🔗",
};

interface AgentLogProps {
  logs: AgentLogEntry[];
  className?: string;
}

export function AgentLog({ logs, className }: AgentLogProps) {
  if (logs.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center text-[#4d5566] text-sm py-8", className)}>
        Waiting for pipeline to start...
      </div>
    );
  }

  return (
    <div className={clsx("space-y-1 font-mono text-xs", className)}>
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2 py-1 px-3 hover:bg-[#21262d]/30 rounded group">
          <span className="text-[#4d5566] shrink-0 mt-0.5 w-20 truncate">
            {new Date(log.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          {log.agentType && (
            <span className="shrink-0 text-xs" title={log.agentType}>
              {AGENT_ICONS[log.agentType] ?? "•"}
            </span>
          )}
          <span className={clsx("flex-1 break-words leading-relaxed", LEVEL_STYLES[log.level] ?? LEVEL_STYLES.INFO)}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
}
