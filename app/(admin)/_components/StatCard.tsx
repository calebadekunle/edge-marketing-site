import type { LucideIcon } from "lucide-react";
import AdminSparkline from "./AdminSparkline";

type DailyCount = { date: string; count: number };

const ACCENTS = {
  signal: { border: "border-l-signal", text: "text-signal", bg: "bg-signal/10" },
  spark: { border: "border-l-spark", text: "text-spark", bg: "bg-spark/10" },
  pulse: { border: "border-l-pulse", text: "text-pulse", bg: "bg-pulse/10" },
  alert: { border: "border-l-alert", text: "text-alert", bg: "bg-alert/10" },
  ash: { border: "border-l-hairline", text: "text-mist", bg: "bg-panel-soft" },
} as const;

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "ash",
  trend,
  trendColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  accent?: keyof typeof ACCENTS;
  trend?: DailyCount[];
  trendColor?: string;
}) {
  const colors = ACCENTS[accent];

  return (
    <div className={`glass-card rounded-2xl p-5 border-l-2 ${colors.border} flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ash">{label}</p>
        {Icon && (
          <span className={`rounded-lg p-1.5 ${colors.bg}`}>
            <Icon size={14} className={colors.text} strokeWidth={2.25} />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className={`num text-3xl font-bold ${colors.text}`}>{value}</p>
        {trend && <AdminSparkline data={trend} color={trendColor || `var(--color-${accent})`} />}
      </div>
      {sub && <p className="text-xs text-ash">{sub}</p>}
    </div>
  );
}
