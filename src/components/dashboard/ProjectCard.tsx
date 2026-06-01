import { clsx } from "clsx";
import type { Project, ProjectStatus } from "@/lib/platform-types";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; variant: BadgeVariant; dot: string }> = {
  active:   { label: "Active",   variant: "success", dot: "bg-success" },
  building: { label: "Building", variant: "accent",  dot: "bg-accent"  },
  paused:   { label: "Paused",   variant: "warning", dot: "bg-warning" },
};

interface ProjectCardProps {
  project: Project;
  onClick?: (id: string) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { label, variant, dot } = STATUS_CONFIG[project.status];

  return (
    <button
      onClick={() => onClick?.(project.id)}
      className={clsx(
        "group w-full text-left rounded-xl border border-border bg-panel",
        "p-5 transition-all duration-150",
        "hover:border-[#30363d] hover:bg-[#1c2128] hover:shadow-lg hover:shadow-black/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-[#e6edf3] group-hover:text-white transition-colors leading-tight">
          {project.name}
        </h3>
        <Badge variant={variant} className="shrink-0">
          <span className={clsx("w-1.5 h-1.5 rounded-full", dot)} />
          {label}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4">
        {project.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 text-[11px] text-muted/70">
        <span>
          <span className="font-mono text-muted">{project.agentCount}</span>{" "}
          {project.agentCount === 1 ? "agent" : "agents"}
        </span>
        <span className="w-px h-3 bg-border" />
        <span>Updated {project.updatedAt}</span>
      </div>
    </button>
  );
}
