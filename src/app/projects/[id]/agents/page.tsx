import { db } from "@/lib/db";
import Link from "next/link";
import { AgentStatusCard } from "@/components/asc/AgentStatusCard";
import { AGENT_CATALOG } from "@/lib/asc-types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectAgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let project;
  let tasks: { agentRole: string; status: string }[] = [];

  try {
    project = await db.ascProject.findUnique({
      where: { id },
      include: { tasks: { orderBy: { createdAt: "asc" } } },
    });
    if (project) tasks = project.tasks;
  } catch {
    return (
      <div className="p-8 text-sm text-yellow-400 border border-yellow-500/20 rounded-xl m-8">
        Database not connected.
      </div>
    );
  }

  if (!project) notFound();

  const taskMap = new Map(tasks.map((t) => [t.agentRole, t.status]));

  const teams = [...new Set(AGENT_CATALOG.map((a) => a.team))];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={`/projects/${id}`} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          ← {project.name}
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Agent Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          {tasks.length} tasks assigned across {[...new Set(tasks.map((t) => t.agentRole))].length} agents
        </p>
      </div>

      <div className="space-y-8">
        {teams.map((team) => {
          const teamAgents = AGENT_CATALOG.filter((a) => a.team === team);
          return (
            <div key={team}>
              <h2 className="text-xs font-mono uppercase text-gray-600 mb-3">{team} Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamAgents.map((agent) => (
                  <AgentStatusCard
                    key={agent.role}
                    agent={agent}
                    taskStatus={taskMap.get(agent.role)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
