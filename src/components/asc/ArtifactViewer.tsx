"use client";

import { useState } from "react";
import type { AscArtifactRecord, AscArtifactType } from "@/lib/asc-types";

const ARTIFACT_ICONS: Record<AscArtifactType, string> = {
  PRD: "▣",
  ARCHITECTURE: "⬡",
  FRONTEND_CODE: "◎",
  BACKEND_CODE: "◈",
  DATABASE_SCHEMA: "◉",
  TESTS: "▶",
  DOCUMENTATION: "·",
  DEPLOYMENT_CONFIG: "⚙",
};

const ARTIFACT_COLORS: Record<AscArtifactType, string> = {
  PRD: "#8b5cf6",
  ARCHITECTURE: "#06b6d4",
  FRONTEND_CODE: "#ec4899",
  BACKEND_CODE: "#f97316",
  DATABASE_SCHEMA: "#10b981",
  TESTS: "#84cc16",
  DOCUMENTATION: "#6366f1",
  DEPLOYMENT_CONFIG: "#f59e0b",
};

interface ArtifactViewerProps {
  artifacts: AscArtifactRecord[];
}

export function ArtifactViewer({ artifacts }: ArtifactViewerProps) {
  const [selected, setSelected] = useState<AscArtifactRecord | null>(artifacts[0] ?? null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (artifacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-600 text-sm border border-gray-800 rounded-xl">
        No artifacts generated yet.
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Sidebar */}
      <div className="w-52 shrink-0 space-y-1">
        {artifacts.map((artifact) => {
          const color = ARTIFACT_COLORS[artifact.type] ?? "#6366f1";
          const icon = ARTIFACT_ICONS[artifact.type] ?? "·";
          return (
            <button
              key={artifact.id}
              onClick={() => setSelected(artifact)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                selected?.id === artifact.id
                  ? "bg-gray-800 text-white border border-gray-700"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent"
              }`}
            >
              <span style={{ color }}>{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{artifact.name}</div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color }}>
                  {artifact.type}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        {selected && (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center gap-2">
                <span style={{ color: ARTIFACT_COLORS[selected.type] }}>
                  {ARTIFACT_ICONS[selected.type]}
                </span>
                <span className="text-sm font-medium text-gray-200">{selected.name}</span>
                <span className="text-xs font-mono text-gray-600">v{selected.version}</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-950">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                {selected.content}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
