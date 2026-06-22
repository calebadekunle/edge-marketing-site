const PHASES = [
  {
    tag: "Phase 1",
    title: "MVP Launch",
    color: "text-signal",
    border: "border-signal/50",
    items: ["Core buy/sell execution", "Watchlists & alerts live", "Broker + bank integration"],
  },
  {
    tag: "Phase 2",
    title: "AI Discovery Rollout",
    color: "text-pulse",
    border: "border-pulse/50",
    items: ["Full scoring engine live", "Premium subscription tier", "Hot-tier real-time alerts"],
  },
  {
    tag: "Phase 3",
    title: "Scale & Expansion",
    color: "text-spark",
    border: "border-spark/50",
    items: ["Expanded data partnerships", "Deeper personalization", "Adjacent market exploration"],
  },
];

export default function RoadmapTimeline() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {PHASES.map((p, i) => (
        <div key={p.tag} className={`rounded-2xl border ${p.border} bg-panel p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${p.border} text-xs font-bold ${p.color}`}
            >
              {i + 1}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider ${p.color}`}>
              {p.tag}
            </span>
          </div>
          <div className="font-semibold text-mist mb-3">{p.title}</div>
          <ul className="space-y-1.5">
            {p.items.map((it) => (
              <li key={it} className="text-sm text-ash flex items-start gap-2">
                <span className={`mt-1.5 h-1 w-1 rounded-full shrink-0 ${p.color.replace("text-", "bg-")}`} />
                {it}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
