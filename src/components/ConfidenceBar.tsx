"use client";

interface ConfidenceBarProps {
  value: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ConfidenceBar({ value, showLabel = true, size = "md" }: ConfidenceBarProps) {
  const pct = Math.round(value * 100);

  const color =
    value >= 0.7 ? "bg-green-500" : value >= 0.4 ? "bg-yellow-500" : "bg-red-500";

  const height = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-[#21262d] rounded-full ${height} overflow-hidden`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[#8b949e] tabular-nums w-8 text-right">{pct}%</span>
      )}
    </div>
  );
}
