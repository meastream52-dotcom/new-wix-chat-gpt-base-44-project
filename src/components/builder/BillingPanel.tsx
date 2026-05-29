"use client";
import { useState } from "react";
import { PLANS } from "@/lib/builder-types";
import { clsx } from "clsx";

interface BillingPanelProps {
  currentPlan: string;
  className?: string;
}

const PLAN_KEYS = ["FREE", "PRO", "ENTERPRISE"] as const;

export function BillingPanel({ currentPlan, className }: BillingPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const upgrade = async (plan: "PRO" | "ENTERPRISE") => {
    setLoading(plan);
    const res = await fetch("/api/builder/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.data?.url) {
      window.location.href = data.data.url;
    } else {
      alert("Failed to create checkout session. Please add your Stripe keys.");
    }
    setLoading(null);
  };

  return (
    <div className={clsx("space-y-4", className)}>
      <div className="mb-6">
        <h2 className="text-white font-semibold mb-1">Subscription</h2>
        <p className="text-[#8b949e] text-sm">
          Current plan: <span className="text-white font-medium">{currentPlan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const isCurrent = currentPlan === key;
          return (
            <div key={key} className={clsx("rounded-xl border p-5", isCurrent ? "border-[#58a6ff] bg-[#58a6ff]/5" : "border-[#21262d] bg-[#161b22]")}>
              {isCurrent && <div className="text-xs text-[#58a6ff] font-semibold mb-3">Current plan</div>}
              <div className="text-white font-bold mb-1">{plan.name}</div>
              <div className="text-2xl font-bold text-white mb-4">
                {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
              </div>
              <ul className="space-y-1.5 mb-5 text-sm text-[#8b949e]">
                <li>✓ {plan.projects === -1 ? "Unlimited" : plan.projects} projects</li>
                <li>✓ {plan.buildsPerMonth === -1 ? "Unlimited" : plan.buildsPerMonth} builds/month</li>
                <li>✓ {plan.agents === "all" ? "All 12 agents" : `${(plan.agents as readonly string[]).length} agents`}</li>
              </ul>
              {!isCurrent && key !== "FREE" && (
                <button
                  onClick={() => upgrade(key as "PRO" | "ENTERPRISE")}
                  disabled={loading !== null}
                  className="w-full bg-[#58a6ff] hover:bg-[#79b8ff] disabled:opacity-50 text-[#0f1117] font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  {loading === key ? "Redirecting..." : `Upgrade to ${plan.name}`}
                </button>
              )}
              {isCurrent && key !== "FREE" && (
                <button className="w-full bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] py-2 rounded-lg text-sm transition-colors">
                  Manage subscription
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
