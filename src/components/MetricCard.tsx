"use client";

import { clsx } from "clsx";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  trend?: "UP" | "DOWN" | "FLAT";
  icon?: string;
  color?: string;
}

export function MetricCard({ label, value, unit, change, trend, icon, color = "#58a6ff" }: MetricCardProps) {
  const trendColor =
    trend === "UP" ? "#3fb950" : trend === "DOWN" ? "#f85149" : "#8b949e";
  const trendArrow = trend === "UP" ? "↑" : trend === "DOWN" ? "↓" : "→";

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 hover:border-[#30363d] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-[#8b949e] font-medium uppercase tracking-wide">{label}</div>
        {icon && (
          <span className="text-lg" style={{ color }}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold text-[#e6edf3]">
          {typeof value === "number" ? value.toLocaleString() : value}
          {unit && <span className="text-sm font-normal text-[#8b949e] ml-1">{unit}</span>}
        </div>
        {change !== undefined && (
          <div
            className={clsx("text-xs font-medium mb-0.5 flex items-center gap-0.5")}
            style={{ color: trendColor }}
          >
            <span>{trendArrow}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
