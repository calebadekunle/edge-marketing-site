"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type DailyCount = { date: string; count: number };

function formatDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TrendAreaChart({
  data,
  color = "var(--color-signal)",
  label = "Count",
}: {
  data: DailyCount[];
  color?: string;
  label?: string;
}) {
  const chartData = data.map((d) => ({ ...d, dayLabel: formatDayLabel(d.date) }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={`trend-fill-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-hairline)" vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="dayLabel"
            tick={{ fill: "var(--color-ash)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "var(--color-hairline)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--color-ash)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-hairline)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-mist)",
            }}
            labelStyle={{ color: "var(--color-ash)" }}
            formatter={(value) => [String(value ?? 0), label] as [string, string]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            fill={`url(#trend-fill-${label})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
