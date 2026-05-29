"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { WorkflowCard } from "@/components/WorkflowCard";

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  runCount: number;
  lastRunAt?: string | null;
  createdAt: string;
}

export default function WorkflowsPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: "", action: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workflows?businessId=${businessId}`);
      const data = await res.json();
      setWorkflows(data.workflows ?? []);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string, enabled: boolean) => {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, enabled } : w)));
    await fetch("/api/workflows", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...form }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", trigger: "", action: "" });
      load();
    }
    setSaving(false);
  };

  const activeCount = workflows.filter((w) => w.enabled).length;

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Workflows</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {activeCount} active automation{activeCount !== 1 ? "s" : ""} running
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm hover:bg-[#58a6ff]/30 transition-colors"
        >
          + New Workflow
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center">
          <div className="text-4xl mb-3">▧</div>
          <div className="text-[#e6edf3] font-medium mb-2">No workflows yet</div>
          <p className="text-[#8b949e] text-sm mb-4">Create your first automation to save time on repetitive tasks.</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm">
            Create Workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} {...wf} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {/* Suggested workflows */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-[#e6edf3] mb-3">Suggested Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "Lead Nurture Sequence", trigger: "New lead captured", action: "Send welcome email + schedule follow-up in 2 days" },
            { name: "Appointment Reminder", trigger: "24 hours before appointment", action: "Send SMS + email reminder to client" },
            { name: "Support Ticket Auto-Reply", trigger: "New support request received", action: "AI drafts and sends acknowledgment email" },
            { name: "Monthly Business Report", trigger: "1st of every month", action: "Generate KPI summary report and email to owner" },
          ].map((s) => (
            <button
              key={s.name}
              onClick={() => { setForm({ name: s.name, trigger: s.trigger, action: s.action }); setShowForm(true); }}
              className="text-left bg-[#0f1117] border border-[#21262d] rounded-lg p-4 hover:border-[#30363d] transition-colors"
            >
              <div className="text-sm font-medium text-[#e6edf3] mb-1">{s.name}</div>
              <div className="text-xs text-[#8b949e]">{s.trigger} → {s.action.slice(0, 60)}…</div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#e6edf3]">New Workflow</h3>
              <button onClick={() => setShowForm(false)} className="text-[#8b949e] hover:text-[#e6edf3]">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Workflow Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Trigger (When…) *</label>
                <textarea required value={form.trigger} onChange={(e) => setForm((p) => ({ ...p, trigger: e.target.value }))} rows={2}
                  placeholder="e.g. New lead captured via website form"
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none" />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Action (Then…) *</label>
                <textarea required value={form.action} onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))} rows={2}
                  placeholder="e.g. Send AI-drafted follow-up email within 5 minutes"
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-[#21262d] text-[#8b949e] rounded-md text-sm hover:bg-[#30363d]">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#58a6ff] text-[#0f1117] rounded-md text-sm font-semibold hover:bg-[#79c0ff] disabled:opacity-50">
                  {saving ? "Creating…" : "Create Workflow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
