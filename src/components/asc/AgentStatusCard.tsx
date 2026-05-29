import type { AgentDefinition } from "@/lib/asc-types";

interface AgentStatusCardProps {
  agent: AgentDefinition;
  taskStatus?: string;
}

const TASK_STATUS_STYLES: Record<string, string> = {
  PENDING: "text-gray-500 border-gray-700",
  RUNNING: "text-blue-400 border-blue-500/40 bg-blue-500/5",
  COMPLETED: "text-green-400 border-green-500/40 bg-green-500/5",
  FAILED: "text-red-400 border-red-500/40 bg-red-500/5",
  SKIPPED: "text-gray-600 border-gray-800",
};

const TASK_STATUS_DOT: Record<string, string> = {
  PENDING: "bg-gray-600",
  RUNNING: "bg-blue-400 animate-pulse",
  COMPLETED: "bg-green-400",
  FAILED: "bg-red-400",
  SKIPPED: "bg-gray-700",
};

export function AgentStatusCard({ agent, taskStatus }: AgentStatusCardProps) {
  const status = taskStatus ?? (agent.isImplemented ? "PENDING" : "SKIPPED");
  const statusStyle = TASK_STATUS_STYLES[status] ?? TASK_STATUS_STYLES.PENDING;
  const dotStyle = TASK_STATUS_DOT[status] ?? TASK_STATUS_DOT.PENDING;

  return (
    <div className={`p-4 rounded-xl border transition-all ${statusStyle} ${!agent.isImplemented ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-200 truncate">{agent.name}</span>
            {status !== "PENDING" && status !== "SKIPPED" && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotStyle}`} />
            )}
          </div>
          <div
            className="text-[10px] font-mono mt-0.5"
            style={{ color: agent.color }}
          >
            {agent.team} Team
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{agent.description}</p>

          {agent.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.capabilities.slice(0, 3).map((cap) => (
                <span
                  key={cap}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-gray-800 text-gray-600"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          {agent.isImplemented ? (
            <span className="text-[10px] text-green-400/70 border border-green-500/20 bg-green-500/5 px-1.5 py-0.5 rounded">
              MVP
            </span>
          ) : (
            <span className="text-[10px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded">
              v2
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
