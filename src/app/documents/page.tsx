"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DocumentRow } from "@/components/DocumentRow";

interface ExtractedField { fieldName: string; fieldValue: string; confidence: number; }
interface Document {
  id: string;
  name: string;
  fileType?: string | null;
  fileSize?: number | null;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  extracted: ExtractedField[];
  createdAt: string;
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?businessId=${businessId}`);
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !text) return;
    setUploading(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, name, text, fileType: "text/plain", fileSize: text.length }),
    });
    if (res.ok) {
      setName("");
      setText("");
      load();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
  };

  const doneCount = documents.filter((d) => d.status === "DONE").length;

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Documents</h1>
        <p className="text-[#8b949e] text-sm mt-1">
          Upload invoices, contracts, and forms. AI extracts key data automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        {[
          { label: "Total", value: documents.length },
          { label: "Processed", value: doneCount },
          { label: "Pending", value: documents.filter((d) => d.status === "PENDING").length },
        ].map((s) => (
          <div key={s.label} className="bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-3 text-center min-w-[80px]">
            <div className="text-xl font-bold text-[#e6edf3]">{s.value}</div>
            <div className="text-[10px] text-[#8b949e] uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload form */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-[#e6edf3] mb-4">Upload & Extract Document</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Document Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Invoice #2847.pdf"
              className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Document Text *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={5}
              placeholder="Paste the document text here for AI extraction…"
              className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !name || !text}
            className="px-6 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm hover:bg-[#58a6ff]/30 transition-colors disabled:opacity-40"
          >
            {uploading ? "Extracting…" : "Extract Data with AI"}
          </button>
        </form>
      </div>

      {/* Document list */}
      <div>
        <h2 className="text-sm font-semibold text-[#e6edf3] mb-3">Documents ({documents.length})</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 h-16 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 text-center text-[#8b949e] text-sm">
            No documents yet. Upload one above to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} {...doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
