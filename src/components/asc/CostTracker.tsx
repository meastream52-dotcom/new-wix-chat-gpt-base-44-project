import type { AscCostEntryRecord } from "@/lib/asc-types";

interface CostTrackerProps {
  entries: AscCostEntryRecord[];
}

export function CostTracker({ entries }: CostTrackerProps) {
  const totalCost = entries.reduce((s, e) => s + e.cost, 0);
  const totalTokens = entries.reduce((s, e) => s + e.tokens, 0);

  const byAgent = entries.reduce<Record<string, { tokens: number; cost: number }>>((acc, e) => {
    if (!acc[e.agentRole]) acc[e.agentRole] = { tokens: 0, cost: 0 };
    acc[e.agentRole].tokens += e.tokens;
    acc[e.agentRole].cost += e.cost;
    return acc;
  }, {});

  return (
    <div className="p-4 rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200">Cost Tracker</h3>
        <div className="text-right">
          <div className="text-lg font-mono font-bold text-indigo-400">${totalCost.toFixed(4)}</div>
          <div className="text-[10px] text-gray-600">{totalTokens.toLocaleString()} tokens</div>
        </div>
      </div>

      {Object.entries(byAgent).length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-2">No cost data yet</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(byAgent).map(([role, stats]) => (
            <div key={role} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <div className="text-xs font-mono text-gray-400 truncate">{role}</div>
              </div>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500/60 rounded-full"
                  style={{ width: `${totalCost > 0 ? (stats.cost / totalCost) * 100 : 0}%` }}
                />
              </div>
              <div className="w-16 text-right">
                <div className="text-xs font-mono text-gray-400">${stats.cost.toFixed(4)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
