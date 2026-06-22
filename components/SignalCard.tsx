export default function SignalCard({
  label,
  desc,
}: {
  label: string;
  desc: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5 hover:border-pulse/50 transition-colors">
      <div className="font-semibold text-mist mb-1.5">{label}</div>
      <p className="text-sm text-ash leading-relaxed">{desc}</p>
    </div>
  );
}
