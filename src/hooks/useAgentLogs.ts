"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { AgentLogEntry } from "@/lib/builder-types";

export function useAgentLogs(projectId: string, autoConnect = false) {
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();
    setConnected(true);
    setDone(false);

    const es = new EventSource(`/api/builder/projects/${projectId}/logs`);
    esRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "log") {
        setLogs((prev) => [...prev, data as AgentLogEntry]);
      } else if (data.type === "done") {
        setDone(true);
        setConnected(false);
        es.close();
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };
  }, [projectId]);

  const disconnect = useCallback(() => {
    esRef.current?.close();
    setConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => esRef.current?.close();
  }, [autoConnect, connect]);

  return { logs, connected, done, connect, disconnect };
}
