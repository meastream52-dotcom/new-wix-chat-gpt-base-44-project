"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { ActivityFeed } from "@/components/asc/ActivityFeed";
import { CostTracker } from "@/components/asc/CostTracker";
import type { AscProjectDetail, SseEvent } from "@/lib/asc-types";

const STATUS_STYLES: Record<string, string> = {
  INITIALIZING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  RUNNING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  COMPLETED: "text-green-400 bg-green-400/10 border-green-400/20",
  FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
  PAUSED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [project, setProject] = useState<AscProjectDetail | null>(null);
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sseRef = useRef<EventSource | null>(null);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/asc/projects/${id}`);
      if (!res.ok) throw new Error("Not found");
      const { data } = await res.json();
      setProject(data);
      return data as AscProjectDetail;
    } catch {
      setError("Project not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const startPipeline = async () => {
    setIsRunning(true);
    setEvents([]);
    setError("");

    // Signal backend to reset status
    const runRes = await fetch(`/api/asc/projects/${id}/run`, { method: "POST" });
    if (!runRes.ok) {
      const body = await runRes.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "Failed to start pipeline");
      setIsRunning(false);
      return;
    }

    // Open SSE stream
    if (sseRef.current) sseRef.current.close();

    const es = new EventSource(`/api/asc/projects/${id}/stream`);
    sseRef.current = es;

    es.onmessage = (e) => {
      let parsed: SseEvent | { type: "done" };
      try {
        parsed = JSON.parse(e.data) as SseEvent | { type: "done" };
      } catch {
        return;
      }
      if (parsed.type === "done") {
        es.close();
        setIsRunning(false);
        fetchProject();
        return;
      }
      setEvents((prev) => [...prev, parsed as SseEvent]);
    };

    es.onerror = () => {
      es.close();
      setIsRunning(false);
      fetchProject();
    };
  };

  useEffect(() => {
    return () => sseRef.current?.close();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
        Loading project…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-red-400 text-sm">
        {error || "Project not found"}
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.PAUSED;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              ← Projects
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${statusStyle}`}>
            {project.status}
          </span>
          {!isRunning && project.status !== "RUNNING" && (
            <button
              onClick={startPipeline}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {project.status === "COMPLETED" ? "Re-run ⚡" : "Run Pipeline ⚡"}
            </button>
          )}
          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <span className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              Running…
            </div>
          )}
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 mb-6 border-b border-gray-800 pb-0">
        {[
          { label: "Activity", href: `/projects/${id}` },
          { label: `Artifacts (${project.artifacts.length})`, href: `/projects/${id}/artifacts` },
          { label: "Agents", href: `/projects/${id}/agents` },
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-sm text-indigo-400 border-b-2 border-indigo-500 font-medium -mb-px"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Activity Feed</span>
              <span className="text-xs text-gray-600">{events.length} events</span>
            </div>
            <ActivityFeed
              events={events}
              isRunning={isRunning}
              className="h-96 p-4 bg-gray-950"
            />
          </div>

          {/* Messages from DB */}
          {project.messages.length > 0 && events.length === 0 && (
            <div className="mt-4 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-900">
                <span className="text-sm font-medium text-gray-300">Previous Run Log</span>
              </div>
              <div className="p-4 bg-gray-950 max-h-64 overflow-y-auto">
                {project.messages.map((m) => (
                  <div key={m.id} className="text-xs font-mono text-gray-500 py-0.5">
                    <span className="text-gray-700">[{m.fromAgentRole}]</span>{" "}
                    <span className={m.type === "ERROR" ? "text-red-400" : m.type === "SUCCESS" ? "text-green-400" : "text-gray-400"}>
                      {m.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <CostTracker entries={project.costEntries} />

          {/* Stats */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 space-y-3">
            <h3 className="text-sm font-semibold text-gray-200">Pipeline Status</h3>
            {project.tasks.length === 0 ? (
              <p className="text-xs text-gray-600">No tasks yet. Run the pipeline.</p>
            ) : (
              project.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">{task.agentRole}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      task.status === "COMPLETED"
                        ? "text-green-400 bg-green-400/10"
                        : task.status === "RUNNING"
                        ? "text-blue-400 bg-blue-400/10"
                        : task.status === "FAILED"
                        ? "text-red-400 bg-red-400/10"
                        : "text-gray-600 bg-gray-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/projects/${id}/artifacts`}
              className="p-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors text-center"
            >
              <div className="text-xl text-indigo-400 mb-1">▣</div>
              <div className="text-xs text-gray-400">{project.artifacts.length} Artifacts</div>
            </Link>
            <Link
              href={`/projects/${id}/agents`}
              className="p-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors text-center"
            >
              <div className="text-xl text-indigo-400 mb-1">◈</div>
              <div className="text-xs text-gray-400">{project.tasks.length} Tasks</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
