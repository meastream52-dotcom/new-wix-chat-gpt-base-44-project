"use client";
import { useState, useEffect, useCallback } from "react";

interface ProjectData {
  id: string;
  name: string;
  prompt: string;
  status: string;
  repoUrl: string | null;
  deployUrl: string | null;
  agentRuns: { id: string; type: string; status: string; completedAt: string | null }[];
  approvals: { id: string; type: string; description: string; status: string; requestedAt: string }[];
  _count: { files: number; logs: number };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/builder/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.data);
    } else {
      setError("Failed to load project");
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { project, loading, error, refresh };
}
