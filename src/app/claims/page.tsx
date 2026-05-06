"use client";

import { useState, useEffect, useCallback } from "react";
import { ClaimCard } from "@/components/ClaimCard";
import type { ClaimStatus } from "@/lib/types";

interface Claim {
  id: string;
  text: string;
  confidence: number;
  status: ClaimStatus;
  entities: string[];
  timeRef: string | null;
  document: { title: string; caseTag: string };
}

const STATUSES: (ClaimStatus | "ALL")[] = ["ALL", "ACCEPTED", "WEAK", "REJECTED", "PENDING"];

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ClaimStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    const res = await fetch(`/api/extract?${params}`);
    const data = await res.json();
    setClaims(data.claims ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const filtered = search
    ? claims.filter((c) => c.text.toLowerCase().includes(search.toLowerCase()))
    : claims;

  const counts = {
    ALL: claims.length,
    ACCEPTED: claims.filter((c) => c.status === "ACCEPTED").length,
    WEAK: claims.filter((c) => c.status === "WEAK").length,
    REJECTED: claims.filter((c) => c.status === "REJECTED").length,
    PENDING: claims.filter((c) => c.status === "PENDING").length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-mono font-bold text-[#e6edf3]">Claims</h1>
        <span className="text-xs text-[#8b949e]">{filtered.length} shown</span>
      </div>

      <div className="flex gap-3 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              filter === s
                ? "bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/30"
                : "bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:border-[#30363d]"
            }`}
          >
            {s} <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search claims…"
        className="w-full mb-5 bg-[#161b22] border border-[#21262d] rounded px-3 py-2 text-sm text-gray-200 placeholder-[#8b949e] outline-none focus:border-[#58a6ff]"
      />

      {loading ? (
        <div className="text-sm text-[#8b949e]">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-[#8b949e]">No claims found. Upload a document and run Extract first.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim) => (
            <ClaimCard
              key={claim.id}
              id={claim.id}
              text={claim.text}
              confidence={claim.confidence}
              status={claim.status}
              entities={claim.entities}
              timeRef={claim.timeRef}
              documentTitle={claim.document.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
