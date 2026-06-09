"use client";
import Link from "next/link";
import { clsx } from "clsx";
import type { BuilderProject } from "@/lib/builder-types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-[#8b949e]/10 text-[#8b949e]",
  PLANNING: "bg-[#d29922]/10 text-[#d29922]",
  BUILDING: "bg-[#58a6ff]/10 text-[#58a6ff]",
  TESTING: "bg-[#d29922]/10 text-[#d29922]",
  REVIEW: "bg-[#a5d6ff]/10 text-[#a5d6ff]",
  DEPLOYED: "bg-[#3fb950]/10 text-[#3fb950]",
  FAILED: "bg-[#f85149]/10 text-[#f85149]",
  PAUSED: "bg-[#8b949e]/10 text-[#8b949e]",
};

const STATUS_DOT: Record<string, string> = {
  BUILDING: "bg-[#58a6ff] animate-pulse",
  PLANNING: "bg-[#d29922] animate-pulse",
  DEPLOYED: "bg-[#3fb950]",
  FAILED: "bg-[#f85149]",
  REVIEW: "bg-[#a5d6ff]",
};

interface ProjectCardProps {
  project: BuilderProject & { _count?: { files: number; agentRuns: number; approvals: number } };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const dotColor = STATUS_DOT[project.status] ?? "bg-[#8b949e]";
  const badgeStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.PENDING;
  const techStack = Array.isArray(project.techStack) ? project.techStack as string[] : [];

  return (
    <Link href={`/projects/${project.id}`} className="block bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:border-[#30363d] transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={clsx("w-2 h-2 rounded-full shrink-0 mt-0.5", dotColor)} />
          <h3 className="font-semibold text-white text-sm group-hover:text-[#58a6ff] transition-colors truncate">{project.name}</h3>
        </div>
        <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2", badgeStyle)}>
          {project.status}
        </span>
      </div>

      <p className="text-[#8b949e] text-xs mb-4 line-clamp-2">{project.prompt}</p>

      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {techStack.slice(0, 4).map((t) => (
            <span key={t} className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[#4d5566]">
        <div className="flex items-center gap-3">
          {project._count && (
            <>
              <span>{project._count.files} files</span>
              <span>{project._count.agentRuns} runs</span>
              {project._count.approvals > 0 && (
                <span className="text-[#d29922]">{project._count.approvals} pending approvals</span>
              )}
            </>
          )}
        </div>
        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
