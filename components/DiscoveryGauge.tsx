"use client";

import { useEffect, useRef, useState } from "react";

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

const AUTO_INTERVAL = 2600;
const RESUME_AFTER = 6000;

export default function DiscoveryGauge() {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAutoPlay(false);
      setActive(1);
      return;
    }
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % TIERS.length);
    }, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [autoPlay]);

  const handleSelect = (i: number) => {
    setActive(i);
    setAutoPlay(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setAutoPlay(true), RESUME_AFTER);
  };

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
            onClick={() => handleSelect(i)}
            className={`flex-1 rounded-xl border py-3 text-center transition-colors duration-500 ${
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
