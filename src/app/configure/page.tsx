"use client";

import { useState, useEffect, useCallback } from "react";

interface ConfigKeyRow {
  id: string;
  name: string;
  category: string;
  note: string | null;
  masked: string;
  createdAt: string;
}

const KNOWN_KEYS: Record<string, string> = {
  OPENAI_API_KEY: "AI/LLM",
  OPENAI_MODEL: "AI/LLM",
  ANTHROPIC_API_KEY: "AI/LLM",
  GROQ_API_KEY: "AI/LLM",
  GOOGLE_AI_API_KEY: "AI/LLM",
  DATABASE_URL: "Database",
  NEO4J_URI: "Database",
  NEO4J_USER: "Database",
  NEO4J_PASSWORD: "Database",
  MONGODB_URI: "Database",
  REDIS_URL: "Cache",
  UPSTASH_REDIS_REST_URL: "Cache",
  UPSTASH_REDIS_REST_TOKEN: "Cache",
  AWS_ACCESS_KEY_ID: "Cloud",
  AWS_SECRET_ACCESS_KEY: "Cloud",
  AWS_REGION: "Cloud",
  S3_BUCKET: "Cloud",
  CLOUDINARY_URL: "Cloud",
  NEXTAUTH_SECRET: "Auth",
  NEXTAUTH_URL: "Auth",
  JWT_SECRET: "Auth",
  STRIPE_SECRET_KEY: "Other",
  STRIPE_WEBHOOK_SECRET: "Other",
  STRIPE_PUBLISHABLE_KEY: "Other",
  GITHUB_CLIENT_ID: "Auth",
  GITHUB_CLIENT_SECRET: "Auth",
};

const CATEGORIES = ["All", "AI/LLM", "Database", "Cache", "Cloud", "Auth", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  "AI/LLM": "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  Database: "bg-green-500/15 text-green-400 border border-green-500/30",
  Cache: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  Cloud: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  Auth: "bg-red-500/15 text-red-400 border border-red-500/30",
  Other: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
};

export default function ConfigurePage() {
  const [keys, setKeys] = useState<ConfigKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Add form state
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formCategory, setFormCategory] = useState("Other");
  const [formNote, setFormNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Per-row state
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({});
  const [loadingReveal, setLoadingReveal] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Auto-fill category when known key name is selected
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (KNOWN_KEYS[val]) {
      setFormCategory(KNOWN_KEYS[val]);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formValue.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName.trim(),
        value: formValue.trim(),
        category: formCategory,
        note: formNote.trim() || undefined,
      }),
    });
    if (res.ok) {
      setFormName("");
      setFormValue("");
      setFormCategory("Other");
      setFormNote("");
      showToast("Key saved");
      fetchKeys();
    } else {
      const data = await res.json();
      showToast(data.error ?? "Failed to save key");
    }
    setSubmitting(false);
  };

  const handleReveal = async (id: string) => {
    if (revealedValues[id] !== undefined) {
      setRevealedValues(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setLoadingReveal(prev => ({ ...prev, [id]: true }));
    const res = await fetch(`/api/config/${id}`);
    if (res.ok) {
      const data = await res.json();
      setRevealedValues(prev => ({ ...prev, [id]: data.value }));
    }
    setLoadingReveal(prev => ({ ...prev, [id]: false }));
  };

  const handleCopy = async (id: string) => {
    let value = revealedValues[id];
    if (!value) {
      const res = await fetch(`/api/config/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      value = data.value;
    }
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/config/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Key deleted");
      setKeys(prev => prev.filter(k => k.id !== id));
      setRevealedValues(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      showToast("Failed to delete key");
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const startEdit = (k: ConfigKeyRow) => {
    setEditingId(k.id);
    setEditValue("");
    setEditCategory(k.category);
    setEditNote(k.note ?? "");
  };

  const handleEditSave = async (id: string) => {
    setEditSubmitting(true);
    const body: Record<string, string> = {
      category: editCategory,
      note: editNote,
    };
    if (editValue.trim()) body.value = editValue.trim();
    const res = await fetch(`/api/config/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showToast("Key updated");
      setEditingId(null);
      fetchKeys();
      // Clear any revealed value for this key since it may have changed
      setRevealedValues(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      const data = await res.json();
      showToast(data.error ?? "Failed to update");
    }
    setEditSubmitting(false);
  };

  const filteredKeys =
    activeTab === "All" ? keys : keys.filter(k => k.category === activeTab);

  const countForTab = (tab: string) =>
    tab === "All" ? keys.length : keys.filter(k => k.category === tab).length;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-mono font-bold text-[#e6edf3]">Key Management</h1>
        <span className="text-xs text-[#8b949e]">{keys.length} stored key{keys.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Add Key Form */}
      <form
        onSubmit={handleAdd}
        className="mb-8 p-5 rounded-lg border border-[#21262d] bg-[#161b22] space-y-3"
      >
        <div className="text-xs font-mono text-[#8b949e] uppercase mb-1">Add / Update Key</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#8b949e]">Key Name</label>
            <input
              list="known-keys"
              value={formName}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. OPENAI_API_KEY"
              required
              className="cfg-input font-mono"
            />
            <datalist id="known-keys">
              {Object.keys(KNOWN_KEYS).map(k => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#8b949e]">Category</label>
            <select
              value={formCategory}
              onChange={e => setFormCategory(e.target.value)}
              className="cfg-input"
            >
              {CATEGORIES.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[11px] text-[#8b949e]">Value</label>
            <input
              type="password"
              value={formValue}
              onChange={e => setFormValue(e.target.value)}
              placeholder="Paste secret value here"
              required
              className="cfg-input font-mono"
            />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[11px] text-[#8b949e]">Note (optional)</label>
            <input
              value={formNote}
              onChange={e => setFormNote(e.target.value)}
              placeholder="e.g. Production key — rotates quarterly"
              className="cfg-input"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-[#58a6ff]/10 text-[#58a6ff] text-sm hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-40"
        >
          {submitting ? "Saving…" : "Save Key"}
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {CATEGORIES.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === tab
                ? "bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/30"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22] border border-transparent"
            }`}
          >
            {tab}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? "bg-[#58a6ff]/20 text-[#58a6ff]" : "bg-[#21262d] text-[#8b949e]"
              }`}
            >
              {countForTab(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Keys List */}
      {loading ? (
        <div className="text-sm text-[#8b949e]">Loading keys…</div>
      ) : filteredKeys.length === 0 ? (
        <div className="text-sm text-[#8b949e]">
          {activeTab === "All" ? "No keys stored yet. Add one above." : `No ${activeTab} keys stored.`}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredKeys.map(k => (
            <div
              key={k.id}
              className="rounded-lg border border-[#21262d] bg-[#161b22] p-4"
            >
              {editingId === k.id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-[#e6edf3]">{k.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        CATEGORY_COLORS[k.category] ?? CATEGORY_COLORS.Other
                      }`}
                    >
                      {k.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#8b949e]">New Value (leave blank to keep)</label>
                      <input
                        type="password"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        placeholder="Enter new value to replace"
                        className="cfg-input font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#8b949e]">Category</label>
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value)}
                        className="cfg-input"
                      >
                        {CATEGORIES.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[11px] text-[#8b949e]">Note</label>
                      <input
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        placeholder="Optional note"
                        className="cfg-input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(k.id)}
                      disabled={editSubmitting}
                      className="px-3 py-1.5 rounded bg-[#58a6ff]/10 text-[#58a6ff] text-xs hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-40"
                    >
                      {editSubmitting ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded text-[#8b949e] text-xs hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm text-[#e6edf3] break-all">{k.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                            CATEGORY_COLORS[k.category] ?? CATEGORY_COLORS.Other
                          }`}
                        >
                          {k.category}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[#8b949e] break-all">
                        {revealedValues[k.id] !== undefined ? (
                          <span className="text-yellow-300/80">{revealedValues[k.id]}</span>
                        ) : (
                          k.masked
                        )}
                      </div>
                      {k.note && (
                        <div className="text-[11px] text-[#8b949e]/70 mt-1 italic">{k.note}</div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(k.id)}
                        title="Copy value"
                        className="px-2 py-1.5 rounded text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                      >
                        {copiedId === k.id ? (
                          <span className="text-green-400">Copied!</span>
                        ) : (
                          "Copy"
                        )}
                      </button>

                      {/* Reveal */}
                      <button
                        onClick={() => handleReveal(k.id)}
                        title={revealedValues[k.id] !== undefined ? "Hide value" : "Reveal value"}
                        disabled={loadingReveal[k.id]}
                        className="px-2 py-1.5 rounded text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors disabled:opacity-40"
                      >
                        {loadingReveal[k.id]
                          ? "…"
                          : revealedValues[k.id] !== undefined
                          ? "Hide"
                          : "Reveal"}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => startEdit(k)}
                        title="Edit key"
                        className="px-2 py-1.5 rounded text-[11px] text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#21262d] transition-colors"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      {confirmDelete === k.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(k.id)}
                            disabled={deletingId === k.id}
                            className="px-2 py-1.5 rounded text-[11px] text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                          >
                            {deletingId === k.id ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1.5 rounded text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(k.id)}
                          title="Delete key"
                          className="px-2 py-1.5 rounded text-[11px] text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status notice */}
      <div className="mt-8 p-4 rounded-lg border border-[#21262d] bg-[#161b22]/50">
        <div className="text-[11px] text-[#8b949e] font-mono">
          <span className="text-[#58a6ff]">i</span> Keys are loaded at server startup via{" "}
          <code className="text-[#e6edf3]/70">instrumentation.ts</code>. Restart the dev server after
          adding new keys to make them available in{" "}
          <code className="text-[#e6edf3]/70">process.env</code>.
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#161b22] border border-[#30363d] text-sm text-gray-200 px-4 py-2 rounded-lg shadow-xl z-50">
          {toast}
        </div>
      )}

      <style jsx global>{`
        .cfg-input {
          background: #0f1117;
          border: 1px solid #21262d;
          border-radius: 6px;
          padding: 8px 12px;
          color: #e6edf3;
          font-size: 13px;
          width: 100%;
          outline: none;
        }
        .cfg-input:focus {
          border-color: #58a6ff;
        }
        .cfg-input::placeholder {
          color: #8b949e;
        }
        .cfg-input option {
          background: #161b22;
          color: #e6edf3;
        }
      `}</style>
    </div>
  );
}
