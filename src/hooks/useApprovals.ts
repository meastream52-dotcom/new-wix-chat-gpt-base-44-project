"use client";
import { useState, useEffect, useCallback } from "react";
import type { ApprovalRecord } from "@/lib/builder-types";

export function useApprovals(projectId: string, pollInterval = 5000) {
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [pending, setPending] = useState<ApprovalRecord | null>(null);

  const fetch_ = useCallback(async () => {
    const res = await fetch(`/api/builder/projects/${projectId}/approvals`);
    if (res.ok) {
      const data = await res.json();
      const all = data.data as ApprovalRecord[];
      setApprovals(all);
      setPending(all.find((a) => a.status === "PENDING") ?? null);
    }
  }, [projectId]);

  const resolve = useCallback(async (approvalId: string, decision: "APPROVED" | "REJECTED") => {
    await fetch(`/api/builder/projects/${projectId}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalId, decision }),
    });
    await fetch_();
  }, [projectId, fetch_]);

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, pollInterval);
    return () => clearInterval(interval);
  }, [fetch_, pollInterval]);

  return { approvals, pending, resolve, refresh: fetch_ };
}
