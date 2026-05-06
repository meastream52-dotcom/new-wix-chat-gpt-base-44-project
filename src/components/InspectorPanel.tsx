"use client";

import { ConfidenceBar } from "./ConfidenceBar";
import type { GraphNode, Contradiction } from "@/lib/types";
import { clsx } from "clsx";

interface InspectorPanelProps {
  selectedNode: GraphNode | null;
  contradictions: Contradiction[];
  onClose: () => void;
}

export function InspectorPanel({ selectedNode, contradictions, onClose }: InspectorPanelProps) {
  if (!selectedNode) return null;

  const relatedContradictions = contradictions.filter(
    (c) => c.claimAId === selectedNode.id || c.claimBId === selectedNode.id
  );

  return (
    <div className="w-72 shrink-0 border-l border-[#21262d] bg-[#0f1117] flex flex-col h-screen sticky top-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
        <span className="text-xs font-mono text-[#8b949e] uppercase">Inspector</span>
        <button
          onClick={onClose}
          className="text-[#8b949e] hover:text-gray-200 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="text-[10px] font-mono text-[#8b949e] uppercase mb-1">Type</div>
          <span className="text-xs text-[#58a6ff] bg-blue-500/10 px-2 py-0.5 rounded">
            {selectedNode.type}
          </span>
        </div>

        <div>
          <div className="text-[10px] font-mono text-[#8b949e] uppercase mb-1">Label</div>
          <p className="text-sm text-gray-200 leading-relaxed">{selectedNode.label}</p>
        </div>

        {selectedNode.confidence !== undefined && (
          <div>
            <div className="text-[10px] font-mono text-[#8b949e] uppercase mb-1">Confidence</div>
            <ConfidenceBar value={selectedNode.confidence} />
          </div>
        )}

        {selectedNode.status && (
          <div>
            <div className="text-[10px] font-mono text-[#8b949e] uppercase mb-1">Status</div>
            <span
              className={clsx(
                "text-xs font-mono px-2 py-0.5 rounded",
                selectedNode.status === "ACCEPTED" && "text-green-400 bg-green-500/10",
                selectedNode.status === "WEAK" && "text-yellow-400 bg-yellow-500/10",
                selectedNode.status === "REJECTED" && "text-red-400 bg-red-500/10"
              )}
            >
              {selectedNode.status}
            </span>
          </div>
        )}

        {relatedContradictions.length > 0 && (
          <div>
            <div className="text-[10px] font-mono text-red-400 uppercase mb-2">
              Contradictions ({relatedContradictions.length})
            </div>
            <div className="space-y-2">
              {relatedContradictions.map((c) => (
                <div key={c.id} className="p-2 rounded border border-red-500/20 bg-red-500/5">
                  <p className="text-xs text-red-300 mb-1">{c.reason}</p>
                  <div className="text-[10px] text-[#8b949e]">
                    severity: {Math.round(c.severity * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
