import { db } from "@/lib/db";
import Link from "next/link";
import { ProjectCard } from "@/components/asc/ProjectCard";
import type { AscProjectSummary } from "@/lib/asc-types";

export const dynamic = "force-dynamic";

async function getProjects(): Promise<AscProjectSummary[]> {
  const projects = await db.ascProject.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { tasks: true, artifacts: true } },
      costEntries: { select: { cost: true } },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status as AscProjectSummary["status"],
    customerId: p.customerId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    taskCount: p._count.tasks,
    artifactCount: p._count.artifacts,
    totalCost: p.costEntries.reduce((sum: number, e: { cost: number }) => sum + e.cost, 0),
  }));
}

export default async function DashboardPage() {
  let projects: AscProjectSummary[] = [];
  let dbError = false;

  try {
    projects = await getProjects();
  } catch {
    dbError = true;
  }

  const running = projects.filter((p) => p.status === "RUNNING").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const totalCost = projects.reduce((s, p) => s + p.totalCost, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">All software projects built by your AI company</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          ⚡ New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: projects.length, color: "text-gray-300" },
          { label: "Running", value: running, color: "text-blue-400" },
          { label: "Completed", value: completed, color: "text-green-400" },
          { label: "Total Cost", value: `$${totalCost.toFixed(4)}`, color: "text-indigo-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-xs text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {dbError && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-sm text-yellow-400">
          Database not connected. Run <code className="font-mono text-xs">npx prisma db push</code> to initialize.
        </div>
      )}

      {projects.length === 0 && !dbError ? (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-6">Describe a software idea and watch AI agents build it</p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Start Building
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
