import { AgentStatusCard } from "@/components/asc/AgentStatusCard";
import { AGENT_CATALOG, TEAM_COLORS } from "@/lib/asc-types";

export default function AgentsPage() {
  const teams = [...new Set(AGENT_CATALOG.map((a) => a.team))];
  const implemented = AGENT_CATALOG.filter((a) => a.isImplemented).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Agent Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">
          {AGENT_CATALOG.length} specialized agents across {teams.length} teams —{" "}
          <span className="text-green-400">{implemented} active in MVP</span>
        </p>
      </div>

      {/* Team summary */}
      <div className="flex flex-wrap gap-2 mb-8">
        {teams.map((team) => {
          const count = AGENT_CATALOG.filter((a) => a.team === team).length;
          const color = TEAM_COLORS[team] ?? "#6366f1";
          return (
            <div
              key={team}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-800 text-xs"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300">{team}</span>
              <span className="text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Agents by team */}
      <div className="space-y-10">
        {teams.map((team) => {
          const teamAgents = AGENT_CATALOG.filter((a) => a.team === team);
          const color = TEAM_COLORS[team] ?? "#6366f1";
          return (
            <section key={team}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h2 className="text-sm font-semibold text-gray-300">{team} Team</h2>
                <span className="text-xs text-gray-600">{teamAgents.length} agents</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamAgents.map((agent) => (
                  <AgentStatusCard key={agent.role} agent={agent} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
