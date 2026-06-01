"use client";

import { useState, useRef } from "react";
import { clsx } from "clsx";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { IconPlus, IconClose, IconProjects } from "@/components/dashboard/icons";
import type { Project } from "@/lib/platform-types";

// ─── Placeholder seed data ───────────────────────────────────────────────────
// Remove these and start with [] to see the empty state.
const SEED_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Support Bot",
    description:
      "AI-powered customer support agent with memory, escalation logic, and CRM handoff.",
    agentCount: 3,
    status: "active",
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Code Review Agent",
    description:
      "Automated PR reviewer that checks for bugs, anti-patterns, and style violations.",
    agentCount: 1,
    status: "building",
    updatedAt: "1 day ago",
  },
  {
    id: "3",
    name: "Data Pipeline Monitor",
    description:
      "Watches ETL jobs, surfaces anomalies, and pages on-call engineers via Slack.",
    agentCount: 2,
    status: "paused",
    updatedAt: "3 days ago",
  },
];

// ─── New Project Modal ────────────────────────────────────────────────────────

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (project: Project) => void;
}

function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string).trim();
    const description = (data.get("description") as string).trim();
    if (!name) return;

    onCreate({
      id: crypto.randomUUID(),
      name,
      description: description || "No description yet.",
      agentCount: 0,
      status: "building",
      updatedAt: "just now",
    });
    onClose();
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-panel shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-[#e6edf3]">New Project</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-[#1c2128] hover:text-[#e6edf3] transition-colors"
            aria-label="Close"
          >
            <span className="w-4 h-4"><IconClose /></span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="proj-name" className="text-xs font-medium text-[#e6edf3]">
              Project name <span className="text-danger">*</span>
            </label>
            <input
              ref={nameRef}
              id="proj-name"
              name="name"
              autoFocus
              required
              placeholder="My AI Agent"
              className={clsx(
                "w-full rounded-lg border border-border bg-surface px-3 py-2",
                "text-sm text-[#e6edf3] placeholder:text-muted",
                "outline-none transition-colors",
                "focus:border-accent focus:ring-1 focus:ring-accent/30",
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="proj-desc" className="text-xs font-medium text-[#e6edf3]">
              Description
            </label>
            <textarea
              id="proj-desc"
              name="description"
              rows={3}
              placeholder="What will this project do?"
              className={clsx(
                "w-full resize-none rounded-lg border border-border bg-surface px-3 py-2",
                "text-sm text-[#e6edf3] placeholder:text-muted",
                "outline-none transition-colors",
                "focus:border-accent focus:ring-1 focus:ring-accent/30",
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-muted hover:bg-[#1c2128] hover:text-[#e6edf3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-accent/15 text-accent border border-accent/25",
                "hover:bg-accent/25 transition-colors",
              )}
            >
              <span className="w-4 h-4"><IconPlus /></span>
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Projects Page ────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  // Start with seed data so cards are visible. Swap to [] to see empty state.
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [modalOpen, setModalOpen] = useState(false);

  function handleCreate(project: Project) {
    setProjects((prev) => [project, ...prev]);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#e6edf3]">Projects</h1>
          <p className="mt-0.5 text-sm text-muted">
            {projects.length === 0
              ? "No projects yet."
              : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            "bg-accent/15 text-accent border border-accent/25",
            "hover:bg-accent/25 transition-colors",
          )}
        >
          <span className="w-4 h-4"><IconPlus /></span>
          <span>New project</span>
        </button>
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<span className="w-6 h-6 text-muted"><IconProjects /></span>}
          title="No projects yet"
          description="Create your first project to start building AI agents, workflows, and memory layers."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                "bg-accent/15 text-accent border border-accent/25",
                "hover:bg-accent/25 transition-colors",
              )}
            >
              <span className="w-4 h-4"><IconPlus /></span>
              Create your first project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={(id) => console.log("Open project", id)}
            />
          ))}
        </div>
      )}

      {/* New project modal */}
      {modalOpen && (
        <NewProjectModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
