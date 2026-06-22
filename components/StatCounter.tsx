export default function StatCounter({
  label,
  value,
  color = "text-mist",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ash mb-1.5">
        {label}
      </div>
      <div className={`num text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
