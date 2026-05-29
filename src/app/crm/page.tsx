"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { LeadsTable, Lead, LeadStatus } from "@/components/LeadsTable";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  createdAt: string;
}

type Tab = "leads" | "customers";

export default function CRMPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", company: "", source: "", value: "" });
  const [saving, setSaving] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads?businessId=${businessId}&search=${search}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
    } finally {
      setLoading(false);
    }
  }, [businessId, search]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?businessId=${businessId}&search=${search}`);
      const data = await res.json();
      setCustomers(data.customers ?? []);
    } finally {
      setLoading(false);
    }
  }, [businessId, search]);

  useEffect(() => {
    if (tab === "leads") loadLeads();
    else loadCustomers();
  }, [tab, loadLeads, loadCustomers]);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const handleDelete = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...newLead, value: newLead.value ? Number(newLead.value) : null }),
    });
    if (res.ok) {
      setShowAddLead(false);
      setNewLead({ name: "", email: "", phone: "", company: "", source: "", value: "" });
      loadLeads();
    }
    setSaving(false);
  };

  const LEAD_STATUSES: Record<LeadStatus, number> = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {} as Record<LeadStatus, number>);

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">CRM</h1>
          <p className="text-[#8b949e] text-sm mt-1">Manage your leads and customers.</p>
        </div>
        {tab === "leads" && (
          <button
            onClick={() => setShowAddLead(true)}
            className="px-4 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm hover:bg-[#58a6ff]/30 transition-colors"
          >
            + Add Lead
          </button>
        )}
      </div>

      {/* Status summary */}
      {tab === "leads" && !loading && (
        <div className="flex flex-wrap gap-3 mb-5">
          {(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as LeadStatus[]).map((s) => (
            <div key={s} className="bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-2 text-center min-w-[80px]">
              <div className="text-lg font-bold text-[#e6edf3]">{LEAD_STATUSES[s] ?? 0}</div>
              <div className="text-[10px] text-[#8b949e] uppercase tracking-wide">{s}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-[#161b22] border border-[#21262d] rounded-lg p-1">
          {(["leads", "customers"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-[#21262d] text-[#e6edf3]" : "text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}…`}
          className="flex-1 max-w-xs bg-[#161b22] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
        />
      </div>

      {/* Content */}
      {tab === "leads" ? (
        <LeadsTable
          leads={leads}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#8b949e]">Loading…</div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-[#8b949e]">No customers yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#21262d]">
                  <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase">Company</th>
                  <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase">Notes</th>
                  <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase">Added</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id} className={i < customers.length - 1 ? "border-b border-[#21262d]" : ""}>
                    <td className="px-4 py-3 font-medium text-[#e6edf3]">{c.name}</td>
                    <td className="px-4 py-3">
                      {c.email && <div className="text-xs text-[#e6edf3]">{c.email}</div>}
                      {c.phone && <div className="text-xs text-[#8b949e]">{c.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">{c.company ?? "—"}</td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs truncate max-w-[200px]">{c.notes ?? "—"}</td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#e6edf3]">Add New Lead</h3>
              <button onClick={() => setShowAddLead(false)} className="text-[#8b949e] hover:text-[#e6edf3]">✕</button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-3">
              {[
                { label: "Name *", key: "name", type: "text", required: true },
                { label: "Email", key: "email", type: "email", required: false },
                { label: "Phone", key: "phone", type: "tel", required: false },
                { label: "Company", key: "company", type: "text", required: false },
                { label: "Source", key: "source", type: "text", required: false },
                { label: "Estimated Value ($)", key: "value", type: "number", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-xs text-[#8b949e] mb-1">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={newLead[key as keyof typeof newLead]}
                    onChange={(e) => setNewLead((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddLead(false)} className="flex-1 py-2 bg-[#21262d] text-[#8b949e] rounded-md text-sm hover:bg-[#30363d] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#58a6ff] text-[#0f1117] rounded-md text-sm font-semibold hover:bg-[#79c0ff] transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
