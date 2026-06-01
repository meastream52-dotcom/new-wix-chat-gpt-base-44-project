"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { InspectorPanel } from "@/components/InspectorPanel";
import type { GraphData, GraphNode, Contradiction } from "@/lib/types";

const GraphCanvas = dynamic(
  () => import("@/components/GraphCanvas").then((m) => m.GraphCanvas),
  { ssr: false }
);

function GraphPageInner() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [crossCaseRunning, setCrossCaseRunning] = useState(false);
  const [crossCaseCount, setCrossCaseCount] = useState<number | null>(null);

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    const params = documentId ? `?documentId=${documentId}` : "";
    const res = await fetch(`/api/graph${params}`);
    const data = await res.json();
    setGraphData(data.graph ?? { nodes: [], edges: [] });
    setLoading(false);
  }, [documentId]);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  const runCrossCase = async () => {
    setCrossCaseRunning(true);
    const docsRes = await fetch("/api/upload");
    const docsData = await docsRes.json();
    const ids = (docsData.documents ?? []).map((d: { id: string }) => d.id);
    if (ids.length < 2) { setCrossCaseRunning(false); return; }
    const res = await fetch("/api/cross-case", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentIds: ids }),
    });
    const data = await res.json();
    setCrossCaseCount(data.count ?? 0);
    setCrossCaseRunning(false);
    fetchGraph();
  };

  const stats = {
    nodes: graphData.nodes.length,
    edges: graphData.edges.length,
    contradictions: graphData.edges.filter((e) => e.type === "CONTRADICTS").length,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#21262d] bg-[#0f1117]">
          <h1 className="text-sm font-mono font-bold text-[#e6edf3]">Knowledge Graph</h1>
          <div className="flex items-center gap-4 text-xs text-[#8b949e]">
            <span>{stats.nodes} nodes</span>
            <span>{stats.edges} edges</span>
            {stats.contradictions > 0 && (
              <span className="text-red-400">{stats.contradictions} contradictions</span>
            )}
            <button
              onClick={runCrossCase}
              disabled={crossCaseRunning}
              className="px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40"
            >
              {crossCaseRunning ? "Detecting…" : "Cross-Case Scan"}
            </button>
            {crossCaseCount !== null && (
              <span className="text-red-400">{crossCaseCount} cross-doc conflicts found</span>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-[#8b949e]">
              Loading graph…
            </div>
          ) : graphData.nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8b949e]">
              <div className="text-4xl mb-3 opacity-20">◎</div>
              <div className="text-sm">No graph data yet.</div>
              <div className="text-xs mt-1">Upload a document and run Graph from the Vault.</div>
            </div>
          ) : (
            <GraphCanvas data={graphData} onNodeClick={setSelectedNode} />
          )}
        </div>

        {/* Legend */}
        <div className="px-6 py-2 border-t border-[#21262d] flex gap-5 text-xs text-[#8b949e]">
          <span><span className="inline-block w-2 h-2 rounded-full bg-[#58a6ff] mr-1" />Document</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-[#3fb950] mr-1" />Claim</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-[#d29922] mr-1" />Entity</span>
          <span><span className="inline-block w-3 h-0.5 bg-[#f85149] mr-1 translate-y-0.5" />Contradiction</span>
        </div>
      </div>

      <InspectorPanel
        selectedNode={selectedNode}
        contradictions={contradictions}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#8b949e]">Loading…</div>}>
      <GraphPageInner />
    </Suspense>
  );
}
