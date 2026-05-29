"use client";

import { clsx } from "clsx";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";

export interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  status: LeadStatus;
  source?: string | null;
  value?: number | null;
  createdAt: string;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "text-[#58a6ff] bg-[#58a6ff]/10",
  CONTACTED: "text-[#d29922] bg-[#d29922]/10",
  QUALIFIED: "text-[#3fb950] bg-[#3fb950]/10",
  CONVERTED: "text-[#8957e5] bg-[#8957e5]/10",
  LOST: "text-[#f85149] bg-[#f85149]/10",
};

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange?: (id: string, status: LeadStatus) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function LeadsTable({ leads, onStatusChange, onDelete, loading }: LeadsTableProps) {
  if (loading) {
    return (
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 text-center text-[#8b949e]">
        Loading leads…
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 text-center text-[#8b949e]">
        No leads found.
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#21262d]">
              <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase tracking-wide">Contact</th>
              <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase tracking-wide">Source</th>
              <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase tracking-wide">Value</th>
              <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase tracking-wide">Added</th>
              {(onStatusChange || onDelete) && (
                <th className="text-left px-4 py-3 text-[#8b949e] font-medium text-xs uppercase tracking-wide">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr
                key={lead.id}
                className={clsx(
                  "border-b border-[#21262d] hover:bg-[#0f1117]/50 transition-colors",
                  i === leads.length - 1 && "border-b-0"
                )}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-[#e6edf3]">{lead.name}</div>
                  {lead.company && <div className="text-[#8b949e] text-xs">{lead.company}</div>}
                </td>
                <td className="px-4 py-3">
                  {lead.email && <div className="text-[#e6edf3] text-xs">{lead.email}</div>}
                  {lead.phone && <div className="text-[#8b949e] text-xs">{lead.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  {onStatusChange ? (
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={clsx(
                        "text-xs px-2 py-1 rounded-full border-0 bg-transparent font-medium cursor-pointer focus:outline-none",
                        STATUS_STYLES[lead.status]
                      )}
                    >
                      {Object.keys(STATUS_STYLES).map((s) => (
                        <option key={s} value={s} className="bg-[#161b22] text-[#e6edf3]">
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", STATUS_STYLES[lead.status])}>
                      {lead.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">{lead.source ?? "—"}</td>
                <td className="px-4 py-3 text-[#e6edf3] text-xs">
                  {lead.value ? `$${lead.value.toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                {(onStatusChange || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onDelete && (
                        <button
                          onClick={() => onDelete(lead.id)}
                          className="text-[#f85149]/60 hover:text-[#f85149] text-xs transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
