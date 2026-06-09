"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CalendarGrid } from "@/components/CalendarGrid";
import { clsx } from "clsx";

interface Appointment {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  notes?: string | null;
  lead?: { name: string } | null;
  customer?: { name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#58a6ff",
  CONFIRMED: "#3fb950",
  CANCELLED: "#f85149",
  COMPLETED: "#8b949e",
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? "demo-business-001";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", startAt: "", endAt: "", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date();
      from.setMonth(from.getMonth() - 1);
      const to = new Date();
      to.setMonth(to.getMonth() + 3);
      const res = await fetch(`/api/appointments?businessId=${businessId}&from=${from.toISOString()}&to=${to.toISOString()}`);
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const handleDelete = async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/appointments?id=${id}`, { method: "DELETE" });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...form }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ title: "", startAt: "", endAt: "", notes: "" });
      load();
    }
    setSaving(false);
  };

  const upcoming = appointments.filter((a) => new Date(a.startAt) >= new Date() && a.status !== "CANCELLED");

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Appointments</h1>
          <p className="text-[#8b949e] text-sm mt-1">View and manage your schedule.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md text-sm hover:bg-[#58a6ff]/30 transition-colors"
        >
          + Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 text-center text-[#8b949e]">Loading…</div>
          ) : (
            <CalendarGrid appointments={appointments} />
          )}
        </div>

        {/* Upcoming list */}
        <div>
          <h2 className="text-sm font-semibold text-[#e6edf3] mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-2">
            {upcoming.length === 0 ? (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 text-center text-[#8b949e] text-sm">
                No upcoming appointments.
              </div>
            ) : (
              upcoming.map((appt) => (
                <div key={appt.id} className="bg-[#161b22] border border-[#21262d] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-[#e6edf3] text-sm flex-1 truncate">{appt.title}</div>
                    <select
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                      className="text-xs bg-transparent border-0 focus:outline-none cursor-pointer"
                      style={{ color: STATUS_COLORS[appt.status] }}
                    >
                      {Object.keys(STATUS_COLORS).map((s) => (
                        <option key={s} value={s} className="bg-[#161b22] text-[#e6edf3]">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-[#8b949e] space-y-0.5">
                    <div>
                      {new Date(appt.startAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}
                      {new Date(appt.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" – "}
                      {new Date(appt.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {(appt.lead || appt.customer) && (
                      <div className={clsx("text-[#8b949e]")}>
                        With: {appt.lead?.name ?? appt.customer?.name}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(appt.id)}
                    className="mt-2 text-[10px] text-[#f85149]/50 hover:text-[#f85149] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#e6edf3]">Book Appointment</h3>
              <button onClick={() => setShowForm(false)} className="text-[#8b949e] hover:text-[#e6edf3]">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Start *</label>
                <input type="datetime-local" required value={form.startAt} onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">End *</label>
                <input type="datetime-local" required value={form.endAt} onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-[#21262d] text-[#8b949e] rounded-md text-sm hover:bg-[#30363d]">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#58a6ff] text-[#0f1117] rounded-md text-sm font-semibold hover:bg-[#79c0ff] disabled:opacity-50">
                  {saving ? "Saving…" : "Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
