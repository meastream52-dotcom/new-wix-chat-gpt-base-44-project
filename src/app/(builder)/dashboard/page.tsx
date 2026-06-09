"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/builder/ProjectCard";
import type { BuilderProject } from "@/lib/builder-types";

type ProjectWithCount = BuilderProject & { _count: { files: number; agentRuns: number; approvals: number } };

function DashboardContent() {
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomingPrompt = searchParams.get("prompt") ?? "";

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/builder/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
    if (incomingPrompt) setPrompt(decodeURIComponent(incomingPrompt));
  }, [fetchProjects, incomingPrompt]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setCreating(true);

    const res = await fetch("/api/builder/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/projects/${data.data.id}?autostart=true`);
    } else {
      setCreating(false);
    }
  };

  return (
    <>
      {/* New project bar */}
      <form onSubmit={createProject} className="mb-8">
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-3 focus-within:border-[#58a6ff] transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build... (e.g. 'Build a SaaS todo app with teams and Stripe billing')"
            className="w-full bg-transparent text-white placeholder-[#4d5566] resize-none outline-none px-2 py-1 text-sm min-h-[60px]"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); createProject(e); } }}
          />
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={!prompt.trim() || creating}
              className="bg-[#58a6ff] hover:bg-[#79b8ff] disabled:bg-[#21262d] disabled:text-[#4d5566] text-[#0f1117] font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              {creating ? "Creating..." : "Build project →"}
            </button>
          </div>
        </div>
      </form>

      {/* Projects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-[#8b949e]">
          <div className="text-5xl mb-4">⚡</div>
          <p className="text-lg font-medium text-white mb-2">No projects yet</p>
          <p className="text-sm">Describe what you want to build above and the AI will get to work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-[#8b949e] text-sm">Your AI-built software projects</p>
      </div>
      <Suspense fallback={<div className="h-24 bg-[#161b22] rounded-xl animate-pulse mb-8" />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
