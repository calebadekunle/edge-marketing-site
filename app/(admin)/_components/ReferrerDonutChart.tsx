"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Row = { label: string; count: number };

const COLORS = [
  "var(--color-signal)",
  "var(--color-spark)",
  "var(--color-pulse)",
  "var(--color-mist)",
  "var(--color-ash)",
];

export default function ReferrerDonutChart({ data }: { data: Row[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-hairline)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-mist)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--color-ash)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
