"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Row = { label: string; count: number };

const COLORS = ["var(--color-signal)", "var(--color-pulse)", "var(--color-spark)", "var(--color-mist)"];

export default function RankBarChart({ data }: { data: Row[] }) {
  const height = Math.max(data.length * 44, 120);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{ fill: "var(--color-mist)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-hairline)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-mist)",
            }}
            cursor={{ fill: "var(--color-panel-soft)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
