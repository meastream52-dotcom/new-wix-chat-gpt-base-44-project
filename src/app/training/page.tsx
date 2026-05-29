"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChatWidget } from "@/components/ChatWidget";

interface TrainingModule {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function TrainingPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TrainingModule | null>(null);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [tab, setTab] = useState<"modules" | "ask">("modules");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/training?businessId=${businessId}`);
      const data = await res.json();
      setModules(data.modules ?? []);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setGenerating(true);
    const res = await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, action: "generate", topic }),
    });
    if (res.ok) {
      const data = await res.json();
      setModules((prev) => [data.module, ...prev]);
      setTopic("");
      setSelected(data.module);
    }
    setGenerating(false);
  };

  const handleDelete = async (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    await fetch(`/api/training?id=${id}`, { method: "DELETE" });
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Employee Training</h1>
        <p className="text-[#8b949e] text-sm mt-1">AI-generated knowledge base. Employees can ask questions directly.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#161b22] border border-[#21262d] rounded-lg p-1 w-fit mb-5">
        {(["modules", "ask"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-[#21262d] text-[#e6edf3]" : "text-[#8b949e] hover:text-[#e6edf3]"
            }`}
          >
            {t === "modules" ? "Knowledge Base" : "Ask AI Trainer"}
          </button>
        ))}
      </div>

      {tab === "modules" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module list */}
          <div className="lg:col-span-1">
            {/* Generate form */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 mb-4">
              <div className="text-xs text-[#8b949e] mb-2 font-medium">Generate New Module</div>
              <form onSubmit={handleGenerate} className="flex gap-2">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Safety protocols"
                  className="flex-1 bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  type="submit"
                  disabled={generating || !topic}
                  className="px-3 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-xs hover:bg-[#58a6ff]/30 disabled:opacity-40 shrink-0"
                >
                  {generating ? "…" : "AI Generate"}
                </button>
              </form>
            </div>

            {/* Module list */}
            <div className="space-y-1">
              {loading ? (
                <div className="text-[#8b949e] text-sm text-center py-4">Loading…</div>
              ) : modules.length === 0 ? (
                <div className="text-[#8b949e] text-sm text-center py-4">No modules yet.</div>
              ) : (
                modules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors ${
                      selected?.id === m.id
                        ? "bg-[#161b22] border-[#58a6ff]/30 text-[#e6edf3]"
                        : "bg-[#0f1117] border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{m.title}</div>
                    <div className="text-[10px] text-[#8b949e] mt-0.5">{new Date(m.createdAt).toLocaleDateString()}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Module content */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="font-semibold text-[#e6edf3] text-lg">{selected.title}</h2>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-xs text-[#f85149]/50 hover:text-[#f85149] transition-colors ml-2 shrink-0"
                  >
                    Delete
                  </button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-wrap">{selected.content}</div>
                </div>
              </div>
            ) : (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="text-4xl mb-3">▣</div>
                <div className="text-[#e6edf3] font-medium mb-2">Select a module to read</div>
                <p className="text-[#8b949e] text-sm">Or generate a new one with AI using the form on the left.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl">
          <p className="text-[#8b949e] text-sm mb-4">
            Employees can ask questions and get answers directly from your company knowledge base.
          </p>
          <div className="h-[500px]">
            <ChatWidget
              agentType="training"
              businessId={businessId}
              agentName="AI Training Agent"
              agentIcon="▣"
              placeholder="Ask anything from your company knowledge base…"
            />
          </div>
        </div>
      )}
    </div>
  );
}
