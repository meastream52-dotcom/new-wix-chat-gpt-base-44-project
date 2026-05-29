"use client";
import { useState } from "react";
import type { ApprovalRecord } from "@/lib/builder-types";

const TYPE_ICONS: Record<string, string> = {
  DEPLOY: "🚀",
  DELETE_FILES: "🗑️",
  SPEND_MONEY: "💳",
  SEND_EMAIL: "📧",
  CHANGE_API_KEY: "🔑",
  MODIFY_BILLING: "💰",
  ACCESS_PRIVATE_DATA: "🔒",
  CREATE_CLOUD_RESOURCE: "☁️",
};

interface ApprovalModalProps {
  approval: ApprovalRecord;
  projectId: string;
  onResolved: () => void;
}

export function ApprovalModal({ approval, projectId, onResolved }: ApprovalModalProps) {
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  const resolve = async (decision: "APPROVED" | "REJECTED") => {
    setLoading(decision);
    await fetch(`/api/builder/projects/${projectId}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalId: approval.id, decision }),
    });
    setLoading(null);
    onResolved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#d29922]/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{TYPE_ICONS[approval.type] ?? "⚠️"}</span>
          <div>
            <div className="text-xs font-medium text-[#d29922] uppercase tracking-wider mb-0.5">Approval Required</div>
            <h3 className="text-white font-semibold">{approval.type.replace(/_/g, " ")}</h3>
          </div>
        </div>

        <p className="text-[#8b949e] text-sm mb-6 leading-relaxed">{approval.description}</p>

        <div className="flex gap-3">
          <button
            onClick={() => resolve("REJECTED")}
            disabled={loading !== null}
            className="flex-1 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {loading === "REJECTED" ? "Rejecting..." : "Deny"}
          </button>
          <button
            onClick={() => resolve("APPROVED")}
            disabled={loading !== null}
            className="flex-1 bg-[#d29922] hover:bg-[#e3b341] disabled:opacity-50 text-[#0f1117] py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            {loading === "APPROVED" ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
