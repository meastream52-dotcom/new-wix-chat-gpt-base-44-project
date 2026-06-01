"use client";

import { useState, useEffect, useCallback } from "react";
import { EvidenceRow } from "@/components/EvidenceRow";
import { useRouter } from "next/navigation";

interface DocumentSummary {
  id: string;
  title: string;
  source: string;
  caseTag: string;
  createdAt: string;
  _count: { claims: number };
}

export default function VaultPage() {
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDocs = useCallback(async () => {
    const res = await fetch("/api/upload");
    const data = await res.json();
    setDocs(data.documents ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleExtract = async (id: string) => {
    setActionLoading(id);
    await fetch("/api/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: id }) });
    showToast("Claims extracted");
    fetchDocs();
    setActionLoading(null);
  };

  const handleJudge = async (id: string) => {
    setActionLoading(id);
    const res = await fetch("/api/judge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: id }) });
    const data = await res.json();
    showToast(`Judged: ${data.summary?.accepted ?? 0} accepted, ${data.summary?.weak ?? 0} weak, ${data.summary?.rejected ?? 0} rejected`);
    setActionLoading(null);
  };

  const handleGraph = async (id: string) => {
    setActionLoading(id);
    await fetch("/api/graph", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: id }) });
    showToast("Graph built");
    setActionLoading(null);
    router.push(`/graph?documentId=${id}`);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    await fetch("/api/upload", { method: "POST", body: data });
    form.reset();
    showToast("Document uploaded");
    fetchDocs();
    setUploading(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-mono font-bold text-[#e6edf3]">Document Vault</h1>
        <span className="text-xs text-[#8b949e]">{docs.length} documents</span>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="mb-8 p-5 rounded-lg border border-[#21262d] bg-[#161b22] space-y-3">
        <div className="text-xs font-mono text-[#8b949e] uppercase mb-1">Add Document</div>
        <div className="grid grid-cols-2 gap-3">
          <input name="title" placeholder="Title" required className="input" />
          <input name="source" placeholder="Source (e.g. FBI FOIA 1962)" className="input" />
          <select name="caseTag" className="input">
            <option value="general">general</option>
            <option value="marilyn-monroe">marilyn-monroe</option>
            <option value="jfk">jfk</option>
            <option value="mlk">mlk</option>
          </select>
          <input name="file" type="file" accept=".txt,.pdf" className="input text-[#8b949e]" />
        </div>
        <textarea name="text" placeholder="Or paste document text here…" rows={4} className="input w-full font-mono text-xs" />
        <button type="submit" disabled={uploading} className="px-4 py-2 rounded bg-[#58a6ff]/10 text-[#58a6ff] text-sm hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-40">
          {uploading ? "Uploading…" : "Upload Document"}
        </button>
      </form>

      {loading ? (
        <div className="text-sm text-[#8b949e]">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="text-sm text-[#8b949e]">No documents yet. Upload one above.</div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <EvidenceRow
              key={doc.id}
              id={doc.id}
              title={doc.title}
              source={doc.source}
              caseTag={doc.caseTag}
              claimCount={doc._count.claims}
              createdAt={doc.createdAt}
              onExtract={handleExtract}
              onJudge={handleJudge}
              onGraph={handleGraph}
              loading={actionLoading === doc.id}
            />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#161b22] border border-[#30363d] text-sm text-gray-200 px-4 py-2 rounded-lg shadow-xl">
          {toast}
        </div>
      )}

      <style jsx global>{`
        .input {
          background: #0f1117;
          border: 1px solid #21262d;
          border-radius: 6px;
          padding: 8px 12px;
          color: #e6edf3;
          font-size: 13px;
          width: 100%;
          outline: none;
        }
        .input:focus {
          border-color: #58a6ff;
        }
        .input::placeholder {
          color: #8b949e;
        }
      `}</style>
    </div>
  );
}
