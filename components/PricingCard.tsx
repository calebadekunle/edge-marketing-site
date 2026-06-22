type Scheme = "ash" | "signal" | "spark";

const SCHEMES: Record<Scheme, { text: string; border: string; bg: string; dot: string }> = {
  ash: { text: "text-ash", border: "border-hairline", bg: "bg-panel", dot: "bg-ash" },
  signal: { text: "text-signal", border: "border-signal/60", bg: "bg-signal-dim", dot: "bg-signal" },
  spark: { text: "text-spark", border: "border-spark/60", bg: "bg-spark-dim", dot: "bg-spark" },
};

export default function PricingCard({
  name,
  scheme,
  features,
  popular = false,
}: {
  name: string;
  scheme: Scheme;
  features: string[];
  popular?: boolean;
}) {
  const s = SCHEMES[scheme];
  return (
    <div className={`relative rounded-2xl border ${s.border} ${s.bg} p-6 flex flex-col`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-spark px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-void">
          Most popular
        </span>
      )}
      <div className={`text-lg font-bold mb-1 ${s.text}`}>{name}</div>
      <div className="text-xs text-ash italic mb-5">Illustrative pricing</div>
      <ul className="space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-mist/90">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
