"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ReadChart({ data }: { data: Array<{ day: string; readMinutes: number }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="readMinutes"
            stroke="#0d7a5f"
            strokeWidth={2}
            dot={false}
            name="Read minutes"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
