"use client";

import { useEffect, useRef } from "react";
import type { SseEvent } from "@/lib/asc-types";

const EVENT_STYLES: Record<string, string> = {
  pipeline_start: "text-indigo-400",
  pipeline_complete: "text-green-400",
  pipeline_error: "text-red-400",
  agent_start: "text-blue-400",
  agent_progress: "text-gray-300",
  agent_complete: "text-green-400",
  agent_error: "text-red-400",
  message: "text-yellow-300",
};

const EVENT_PREFIX: Record<string, string> = {
  pipeline_start: "▶",
  pipeline_complete: "✓",
  pipeline_error: "✗",
  agent_start: "→",
  agent_progress: " ",
  agent_complete: "✓",
  agent_error: "✗",
  message: "·",
};

interface ActivityFeedProps {
  events: SseEvent[];
  isRunning?: boolean;
  className?: string;
}

export function ActivityFeed({ events, isRunning = false, className = "" }: ActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // Collapse consecutive progress events from same agent into single block
  const collapsed: (SseEvent & { _progressText?: string })[] = [];
  for (const event of events) {
    if (event.type === "agent_progress") {
      const last = collapsed[collapsed.length - 1];
      if (last?.type === "agent_progress" && last.agentRole === event.agentRole) {
        last._progressText = (last._progressText ?? last.data) + event.data;
        continue;
      }
      collapsed.push({ ...event, _progressText: event.data });
    } else {
      collapsed.push(event);
    }
  }

  if (collapsed.length === 0 && !isRunning) {
    return (
      <div className={`flex items-center justify-center text-gray-600 text-sm ${className}`}>
        No activity yet. Run the pipeline to start.
      </div>
    );
  }

  return (
    <div className={`font-mono text-xs overflow-y-auto ${className}`}>
      {collapsed.map((event, i) => {
        if (event.type === "agent_progress") {
          const text = event._progressText ?? event.data;
          return (
            <div key={i} className="my-1 p-2 bg-gray-900/60 rounded border border-gray-800 text-gray-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              <span className="text-gray-600 mr-1">[{event.agentRole}]</span>
              {text.slice(0, 500)}{text.length > 500 ? "…" : ""}
            </div>
          );
        }

        return (
          <div
            key={i}
            className={`flex gap-2 py-0.5 ${EVENT_STYLES[event.type] ?? "text-gray-400"}`}
          >
            <span className="shrink-0 w-3">{EVENT_PREFIX[event.type] ?? "·"}</span>
            {event.agentRole && (
              <span className="shrink-0 text-gray-500">[{event.agentRole}]</span>
            )}
            <span className="break-words">{event.data}</span>
          </div>
        );
      })}
      {isRunning && (
        <div className="flex gap-2 py-0.5 text-indigo-400">
          <span className="shrink-0 w-3">·</span>
          <span className="animate-pulse">Processing…</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
