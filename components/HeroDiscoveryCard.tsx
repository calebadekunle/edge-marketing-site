"use client";

import { useEffect, useRef, useState } from "react";

// Fixed uptrend path so the line shape is consistent every loop —
// only how much of it is "revealed" changes, in sync with the score.
const PATH_D =
  "M0,86 L14,82 L28,84 L42,74 L56,76 L70,62 L84,66 L98,48 L112,52 L126,38 L140,30 L154,34 L168,18 L182,8";
const PATH_LEN = 320; // approximate length, used for dash animation

function tierForScore(score: number) {
  if (score >= 75) return { label: "Hot", color: "var(--color-spark)" };
  if (score >= 40) return { label: "Promising", color: "var(--color-signal)" };
  return { label: "Watch", color: "var(--color-ash)" };
}

export default function HeroDiscoveryCard() {
  const [score, setScore] = useState(0);
  const [price, setPrice] = useState(1.234);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion.current) {
      setScore(82);
      setPrice(1.41);
      return;
    }

    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const cycle = frame % 140; // ~7s loop at 50ms tick
      const pct = Math.min(100, (cycle / 100) * 100);
      setScore(Math.round(pct));
      setPrice(1.234 + (pct / 100) * 0.18 + Math.sin(frame / 6) * 0.004);
    }, 50);

    return () => clearInterval(id);
  }, []);

  const tier = tierForScore(score);
  const dashOffset = PATH_LEN - (Math.min(score, 100) / 100) * PATH_LEN;
  const change = (((price - 1.234) / 1.234) * 100).toFixed(1);

  return (
    <div
      className="glass-card rounded-2xl p-5 w-full max-w-sm"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-bold text-mist">MMAT</div>
          <div className="text-[11px] text-ash">Meta Materials</div>
        </div>
        <div className="text-right">
          <div className="num font-semibold text-mist">${price.toFixed(3)}</div>
          <div className="num text-xs font-semibold text-signal">+{change}%</div>
        </div>
      </div>

      <div className="relative h-24 mb-1">
        <svg viewBox="0 0 182 96" className="w-full h-full overflow-visible">
          <path
            d={PATH_D}
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="2"
          />
          <path
            d={PATH_D}
            fill="none"
            stroke={tier.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={PATH_LEN}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke 0.4s ease" }}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ash">
          Discovery Score
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: tier.color }}
        >
          {tier.label}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-panel-soft overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: tier.color,
            transition: "width 0.1s linear, background 0.4s ease",
          }}
        />
      </div>
      <div className="num text-right text-[11px] text-ash mt-1.5">{score}/100</div>
    </div>
  );
}
