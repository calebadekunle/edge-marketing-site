"use client";

import { useState } from "react";

const TIERS = [
  {
    key: "watch",
    label: "Watch",
    range: "0–40",
    color: "text-ash",
    border: "border-hairline",
    bg: "bg-panel-soft",
    desc: "Baseline activity. Nothing unusual yet, but on the radar.",
  },
  {
    key: "promising",
    label: "Promising",
    range: "40–75",
    color: "text-signal",
    border: "border-signal/60",
    bg: "bg-signal-dim",
    desc: "Multiple signals aligning — volume, momentum, or sentiment moving together.",
  },
  {
    key: "hot",
    label: "Hot",
    range: "75–100",
    color: "text-spark",
    border: "border-spark/60",
    bg: "bg-spark-dim",
    desc: "Strong, multi-signal confirmation. Surfaces immediately to Pro subscribers.",
  },
] as const;

export default function DiscoveryGauge() {
  const [active, setActive] = useState<number>(1);
  const tier = TIERS[active];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-ash">
          Discovery Score
        </span>
        <span className="num text-xs text-ash">0–100 scale</span>
      </div>

      <div className="flex gap-2 mb-6">
        {TIERS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setActive(i)}
            className={`flex-1 rounded-xl border py-3 text-center transition-colors ${
              active === i ? `${t.border} ${t.bg}` : "border-hairline bg-transparent hover:bg-panel-soft"
            }`}
          >
            <div className={`text-sm font-bold ${active === i ? t.color : "text-ash"}`}>
              {t.label}
            </div>
            <div className="num text-[10px] text-ash mt-0.5">{t.range}</div>
          </button>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-mist/90">{tier.desc}</p>
    </div>
  );
}
