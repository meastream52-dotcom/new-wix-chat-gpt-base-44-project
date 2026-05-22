"use client";

import { useState, useEffect } from "react";
import { ClaimCard } from "@/components/ClaimCard";
import { ConfidenceBar } from "@/components/ConfidenceBar";
import { downloadTheoryPDF } from "@/components/TheoryPDF";
import type { ClaimStatus, TheoryNode, TheoryResult } from "@/lib/types";

interface Claim {
  id: string;
  text: string;
  confidence: number;
  status: ClaimStatus;
  entities: string[];
  timeRef: string | null;
}

interface Theory {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreBreakdown: Record<string, number> | null;
  createdAt: string;
}

type TheoryNodeRole = TheoryNode["role"];

export default function TheoryPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [theories, setTheories] = useState<Theory[]>([]);
  const [selectedClaims, setSelectedClaims] = useState<Map<string, TheoryNodeRole>>(new Map());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<TheoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"build" | "history">("build");

  useEffect(() => {
    fetch("/api/extract?status=ACCEPTED")
      .then((r) => r.json())
      .then((d) => setClaims(d.claims ?? []));

    fetch("/api/theory")
      .then((r) => r.json())
      .then((d) => setTheories(d.theories ?? []));
  }, []);

  const toggleClaim = (id: string) => {
    setSelectedClaims((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, "SUPPORT");
      }
      return next;
    });
  };

  const setRole = (id: string, role: TheoryNodeRole) => {
    setSelectedClaims((prev) => new Map(prev).set(id, role));
  };

  const handleSubmit = async () => {
    if (!title || selectedClaims.size === 0) return;
    setLoading(true);

    const nodes: TheoryNode[] = Array.from(selectedClaims.entries()).map(([claimId, role]) => {
      const claim = claims.find((c) => c.id === claimId)!;
      return { claimId, text: claim.text, role };
    });

    const res = await fetch("/api/theory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, nodes }),
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);

    fetch("/api/theory")
      .then((r) => r.json())
      .then((d) => setTheories(d.theories ?? []));
  };

  const VERDICT_COLORS: Record<string, string> = {
    STRONG: "text-green-400 bg-green-500/10 border-green-500/30",
    PLAUSIBLE: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    WEAK: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    CONTRADICTED: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-lg font-mono font-bold text-[#e6edf3]">Theory Builder</h1>
        <div className="flex rounded overflow-hidden border border-[#21262d]">
          {(["build", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs transition-colors ${
                activeTab === tab ? "bg-[#21262d] text-gray-200" : "text-[#8b949e] hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "build" && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left: claim selection */}
          <div>
            <div className="text-xs font-mono text-[#8b949e] uppercase mb-3">
              Select Claims ({selectedClaims.size} selected)
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {claims.length === 0 && (
                <div className="text-sm text-[#8b949e]">No accepted claims yet.</div>
              )}
              {claims.map((claim) => (
                <div key={claim.id}>
                  <ClaimCard
                    id={claim.id}
                    text={claim.text}
                    confidence={claim.confidence}
                    status={claim.status}
                    entities={claim.entities}
                    timeRef={claim.timeRef}
                    selected={selectedClaims.has(claim.id)}
                    onClick={() => toggleClaim(claim.id)}
                  />
                  {selectedClaims.has(claim.id) && (
                    <div className="flex gap-1 mt-1 ml-1">
                      {(["ANCHOR", "SUPPORT", "BRIDGE"] as TheoryNodeRole[]).map((role) => (
                        <button
                          key={role}
                          onClick={() => setRole(claim.id, role)}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                            selectedClaims.get(claim.id) === role
                              ? "bg-[#58a6ff]/20 text-[#58a6ff]"
                              : "bg-[#21262d] text-[#8b949e]"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: theory config + result */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-[#8b949e] uppercase mb-2">Theory</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Theory title"
                className="w-full mb-2 bg-[#161b22] border border-[#21262d] rounded px-3 py-2 text-sm text-gray-200 placeholder-[#8b949e] outline-none focus:border-[#58a6ff]"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the theory hypothesis…"
                rows={3}
                className="w-full bg-[#161b22] border border-[#21262d] rounded px-3 py-2 text-sm text-gray-200 placeholder-[#8b949e] outline-none focus:border-[#58a6ff] resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !title || selectedClaims.size === 0}
              className="w-full py-2 rounded bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20 text-sm hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-40"
            >
              {loading ? "Scoring…" : "Score Theory"}
            </button>

            {result && (
              <div className={`p-4 rounded-lg border ${VERDICT_COLORS[result.verdict]}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono font-bold">{result.verdict}</span>
                  <span className="text-2xl font-mono font-bold">
                    {Math.round(result.score * 100)}
                    <span className="text-sm font-normal opacity-60">/100</span>
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {Object.entries(result.breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-[#8b949e]">{key}</span>
                      </div>
                      <ConfidenceBar value={val} size="sm" />
                    </div>
                  ))}
                </div>

                <p className="text-xs leading-relaxed opacity-80 mb-3">{result.explanation}</p>

                <button
                  onClick={() => downloadTheoryPDF({
                    title,
                    description,
                    result,
                    claims: Array.from(selectedClaims.keys()).map((id) => {
                      const c = claims.find((cl) => cl.id === id)!;
                      return { text: c.text, status: c.status, confidence: c.confidence };
                    }),
                    generatedAt: new Date().toLocaleDateString(),
                  })}
                  className="w-full py-1.5 rounded text-xs bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {theories.length === 0 ? (
            <div className="text-sm text-[#8b949e]">No theories scored yet.</div>
          ) : (
            theories.map((t) => (
              <div key={t.id} className="p-4 rounded-lg border border-[#21262d] bg-[#161b22]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-200">{t.title}</span>
                  {t.score !== null && (
                    <span className="text-sm font-mono text-[#58a6ff]">
                      {Math.round(t.score * 100)}/100
                    </span>
                  )}
                </div>
                {t.score !== null && <ConfidenceBar value={t.score} size="sm" />}
                <div className="text-xs text-[#8b949e] mt-2">
                  {new Date(t.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
