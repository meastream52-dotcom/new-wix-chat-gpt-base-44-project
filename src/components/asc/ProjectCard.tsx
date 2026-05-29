import Link from "next/link";
import type { AscProjectSummary } from "@/lib/asc-types";

const STATUS_STYLES: Record<string, string> = {
  INITIALIZING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  RUNNING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  COMPLETED: "text-green-400 bg-green-400/10 border-green-400/20",
  FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
  PAUSED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const STATUS_DOT: Record<string, string> = {
  INITIALIZING: "bg-yellow-400",
  RUNNING: "bg-blue-400 animate-pulse",
  COMPLETED: "bg-green-400",
  FAILED: "bg-red-400",
  PAUSED: "bg-gray-500",
};

export function ProjectCard({ project }: { project: AscProjectSummary }) {
  const createdAt = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block p-5 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/60 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{createdAt}</p>
        </div>
        <span
          className={`shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[project.status] ?? STATUS_STYLES.PAUSED}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[project.status] ?? "bg-gray-500"}`} />
          {project.status}
        </span>
      </div>

      <p className="text-xs text-gray-400 line-clamp-2 mb-4">{project.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span>{project.artifactCount} artifact{project.artifactCount !== 1 ? "s" : ""}</span>
        <span>{project.taskCount} task{project.taskCount !== 1 ? "s" : ""}</span>
        {project.totalCost > 0 && (
          <span className="ml-auto text-indigo-400/70">${project.totalCost.toFixed(4)}</span>
        )}
      </div>
    </Link>
  );
}
