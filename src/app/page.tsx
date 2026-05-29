"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "Build me a CRM for dental practices with patient management, appointments, and billing",
  "Create an Uber-style delivery app for local restaurants",
  "Build a SaaS platform for fitness coaches to manage clients and workout plans",
  "Create an Amazon-style ecommerce store for handmade crafts",
  "Build a project management tool like Jira for small teams",
  "Create a real estate listing platform with agent dashboards",
];

export default function HomePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent | null, overrideDesc?: string) => {
    e?.preventDefault();
    const finalDesc = overrideDesc ?? description;
    if (!finalDesc.trim() || finalDesc.trim().length < 10) {
      setError("Please describe your project in at least 10 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/asc/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: finalDesc.trim() }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to create project");
      }

      const { data } = await res.json();
      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 border border-indigo-500/30 bg-indigo-500/5 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Powered by Claude Sonnet
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          Your AI Software Company
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Describe any software project. Our AI agents — product managers, architects, engineers, QA —
          build it autonomously and deliver production-ready code.
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError("");
            }}
            placeholder="Build me a CRM for dental practices with patient management and billing…"
            rows={3}
            disabled={loading}
            className="w-full px-5 py-4 pr-32 bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-2xl text-gray-100 placeholder-gray-600 text-sm resize-none outline-none transition-colors focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="absolute right-3 bottom-3 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>Build ⚡</>
            )}
          </button>
        </form>

        {error && (
          <p className="mt-2 text-xs text-red-400 pl-1">{error}</p>
        )}

        {/* Examples */}
        <div className="mt-6">
          <p className="text-xs text-gray-600 mb-3 text-center">Try an example</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLES.slice(0, 4).map((ex) => (
              <button
                key={ex}
                onClick={() => handleSubmit(null, ex)}
                disabled={loading}
                className="text-left px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-800/80 text-xs text-gray-400 hover:text-gray-200 transition-all disabled:opacity-50 line-clamp-2"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Teams */}
      <div className="mt-16 w-full max-w-4xl">
        <p className="text-xs font-mono text-gray-600 uppercase text-center mb-6">Agent Teams</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { name: "Executive", icon: "◎", color: "#f59e0b", desc: "CEO · COO · CTO" },
            { name: "Product", icon: "▣", color: "#8b5cf6", desc: "PM · Business Analyst" },
            { name: "Engineering", icon: "◈", color: "#06b6d4", desc: "Arch · FE · BE · DB" },
            { name: "QA", icon: "◉", color: "#84cc16", desc: "Tests · Security" },
            { name: "DevOps", icon: "⬡", color: "#f97316", desc: "Infra · Deploy · Monitor" },
          ].map((team) => (
            <div
              key={team.name}
              className="p-3 rounded-xl border border-gray-800 bg-gray-900 text-center"
            >
              <div
                className="text-xl mb-2"
                style={{ color: team.color }}
              >
                {team.icon}
              </div>
              <div className="text-xs font-medium text-gray-300">{team.name}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">{team.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
