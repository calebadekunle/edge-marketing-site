import MiniSparkline from "./MiniSparkline";

const COLORS = ["var(--color-signal)", "var(--color-pulse)", "var(--color-spark)"];

export default function SignalCard({
  label,
  desc,
  index = 0,
}: {
  label: string;
  desc: string;
  index?: number;
}) {
  const color = COLORS[index % COLORS.length];
  return (
    <div className="glass-card rounded-xl p-5 hover:border-pulse/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-mist">{label}</div>
        <MiniSparkline color={color} />
      </div>
      <p className="text-sm text-ash leading-relaxed">{desc}</p>
    </div>
  );
}
