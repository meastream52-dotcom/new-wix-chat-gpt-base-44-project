"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { clsx } from "clsx";

interface KPIs {
  totalLeads: number;
  newLeadsThisWeek: number;
  qualifiedLeads: number;
  totalCustomers: number;
  upcomingAppointments: number;
  completedAppointments: number;
  activeWorkflows: number;
  totalDocuments: number;
  pipelineValue: number;
  conversionRate: number;
}

interface RecentLead {
  id: string;
  name: string;
  status: string;
  source: string | null;
  value: number | null;
  createdAt: string;
}

interface NextAppt {
  id: string;
  title: string;
  startAt: string;
  status: string;
  lead?: { name: string } | null;
  customer?: { name: string } | null;
}

const AGENT_CARDS = [
  { type: "RECEPTIONIST", name: "AI Receptionist", icon: "◈", desc: "Handles inquiries, books appointments", href: "/agents?type=receptionist" },
  { type: "SALES_FOLLOWUP", name: "AI Sales Agent", icon: "◇", desc: "Qualifies leads, drafts emails", href: "/agents?type=sales_followup" },
  { type: "SUPPORT", name: "AI Support", icon: "◎", desc: "Resolves customer issues", href: "/agents?type=support" },
  { type: "DOCUMENT", name: "AI Document", icon: "▤", desc: "Extracts data from files", href: "/documents" },
  { type: "TRAINING", name: "AI Trainer", icon: "▣", desc: "Generates onboarding content", href: "/training" },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: "#58a6ff",
  CONTACTED: "#d29922",
  QUALIFIED: "#3fb950",
  CONVERTED: "#8957e5",
  LOST: "#f85149",
  SCHEDULED: "#58a6ff",
  CONFIRMED: "#3fb950",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as { businessId?: string })?.businessId ?? process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID ?? "demo-business-001";

  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [nextAppts, setNextAppts] = useState<NextAppt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?businessId=${businessId}`);
      const data = await res.json();
      setKpis(data.kpis);
      setRecentLeads(data.recentLeads ?? []);
      setNextAppts(data.nextAppointments ?? []);
    } catch {
      // silently fail on demo
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const userName = session?.user?.name ?? "there";

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Good morning, {userName.split(" ")[0]} 👋</h1>
        <p className="text-[#8b949e] mt-1 text-sm">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* KPI grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Leads" value={kpis.totalLeads} icon="◈" change={kpis.newLeadsThisWeek} trend="UP" />
          <MetricCard label="Pipeline Value" value={`$${kpis.pipelineValue.toLocaleString()}`} icon="◇" />
          <MetricCard label="Upcoming Appts" value={kpis.upcomingAppointments} icon="▷" />
          <MetricCard label="Active Workflows" value={kpis.activeWorkflows} icon="▧" />
          <MetricCard label="Customers" value={kpis.totalCustomers} icon="◫" />
          <MetricCard label="Qualified Leads" value={kpis.qualifiedLeads} icon="◎" />
          <MetricCard label="Conversion Rate" value={kpis.conversionRate} unit="%" icon="%" trend={kpis.conversionRate > 20 ? "UP" : "FLAT"} />
          <MetricCard label="Documents" value={kpis.totalDocuments} icon="▤" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Agents */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#e6edf3]">AI Agents</h2>
            <Link href="/agents" className="text-xs text-[#58a6ff] hover:text-[#79c0ff]">Manage →</Link>
          </div>
          <div className="space-y-2">
            {AGENT_CARDS.map((agent) => (
              <Link key={agent.type} href={agent.href}>
                <div className="flex items-center gap-3 bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-3 hover:border-[#30363d] transition-colors">
                  <span className="text-[#58a6ff] text-base">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#e6edf3] truncate">{agent.name}</div>
                    <div className="text-xs text-[#8b949e] truncate">{agent.desc}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Leads + Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Leads */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#e6edf3]">Recent Leads</h2>
              <Link href="/crm" className="text-xs text-[#58a6ff] hover:text-[#79c0ff]">View all →</Link>
            </div>
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
              {recentLeads.length === 0 ? (
                <div className="px-4 py-6 text-center text-[#8b949e] text-sm">
                  No leads yet. <Link href="/crm" className="text-[#58a6ff]">Add your first lead →</Link>
                </div>
              ) : (
                recentLeads.map((lead, i) => (
                  <div
                    key={lead.id}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3",
                      i < recentLeads.length - 1 && "border-b border-[#21262d]"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center text-xs font-bold text-[#8b949e] shrink-0">
                      {lead.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#e6edf3] truncate">{lead.name}</div>
                      <div className="text-xs text-[#8b949e]">{lead.source ?? "Direct"}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ color: STATUS_COLORS[lead.status], backgroundColor: `${STATUS_COLORS[lead.status]}20` }}
                      >
                        {lead.status}
                      </span>
                      {lead.value && (
                        <div className="text-xs text-[#8b949e] mt-0.5">${lead.value.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#e6edf3]">Upcoming Appointments</h2>
              <Link href="/appointments" className="text-xs text-[#58a6ff] hover:text-[#79c0ff]">View all →</Link>
            </div>
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
              {nextAppts.length === 0 ? (
                <div className="px-4 py-6 text-center text-[#8b949e] text-sm">
                  No upcoming appointments. <Link href="/appointments" className="text-[#58a6ff]">Schedule one →</Link>
                </div>
              ) : (
                nextAppts.map((appt, i) => (
                  <div
                    key={appt.id}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3",
                      i < nextAppts.length - 1 && "border-b border-[#21262d]"
                    )}
                  >
                    <div className="text-center w-10 shrink-0">
                      <div className="text-xs text-[#8b949e]">
                        {new Date(appt.startAt).toLocaleDateString(undefined, { month: "short" })}
                      </div>
                      <div className="text-lg font-bold text-[#e6edf3]">
                        {new Date(appt.startAt).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#e6edf3] truncate">{appt.title}</div>
                      <div className="text-xs text-[#8b949e]">
                        {new Date(appt.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ color: STATUS_COLORS[appt.status], backgroundColor: `${STATUS_COLORS[appt.status]}20` }}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
