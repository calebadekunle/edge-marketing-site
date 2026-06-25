"use client";

import { useEffect, useRef, useState } from "react";

// Fixed uptrend path so the line shape is consistent every loop —
// only how much of it is "revealed" changes, in sync with the score.
// This illustrates the Discovery Score animation, not a real price chart.
const PATH_D =
  "M0,86 L14,82 L28,84 L42,74 L56,76 L70,62 L84,66 L98,48 L112,52 L126,38 L140,30 L154,34 L168,18 L182,8";
const PATH_LEN = 320;

function tierForScore(score: number) {
  if (score >= 75) return { label: "Hot", color: "var(--color-spark)" };
  if (score >= 40) return { label: "Promising", color: "var(--color-signal)" };
  return { label: "Watch", color: "var(--color-ash)" };
}

type PickState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; symbol: string; name: string; price: number; changePercent: number };

export default function HeroDiscoveryCard() {
  // Score animation is illustrative only — there's no real AI Discovery
  // Engine running yet (that's the product roadmap). Clearly labeled below.
  const [score, setScore] = useState(0);
  const reducedMotion = useRef(false);

  // Symbol + price are real — a daily-rotating sub-$1 pick fetched from
  // the same Alpaca-backed endpoint as the ticker tape, refreshed every
  // 30s. Never falls back to fake numbers.
  const [pick, setPick] = useState<PickState>({ status: "loading" });

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion.current) {
      setScore(67);
      return;
    }

    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const cycle = frame % 140;
      const pct = Math.min(100, (cycle / 100) * 100);
      setScore(Math.round(pct));
    }, 50);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/quotes", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.heroPick) {
          setPick({ status: "error" });
          return;
        }
        setPick({
          status: "ready",
          symbol: data.heroPick.symbol,
          name: data.heroPick.name,
          price: data.heroPick.price,
          changePercent: data.heroPick.changePercent,
        });
      } catch {
        if (!cancelled) setPick({ status: "error" });
      }
    }

    load();
    const id = setInterval(load, 30 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const tier = tierForScore(score);
  const dashOffset = PATH_LEN - (Math.min(score, 100) / 100) * PATH_LEN;
  const up = pick.status === "ready" && pick.changePercent >= 0;

  return (
    <div className="glass-card rounded-2xl p-5 w-full max-w-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-bold text-mist">
            {pick.status === "ready" ? pick.symbol : "—"}
          </div>
          <div className="text-[11px] text-ash">
            {pick.status === "ready" ? pick.name : "Loading today's pick…"}
          </div>
        </div>
        <div className="text-right">
          {pick.status === "ready" ? (
            <>
              <div className="num font-semibold text-mist">
                ${pick.price.toFixed(3)}
              </div>
              <div
                className={`num text-xs font-semibold ${up ? "text-signal" : "text-alert"}`}
              >
                {up ? "+" : ""}
                {pick.changePercent.toFixed(1)}%
              </div>
            </>
          ) : (
            <div className="num text-xs text-ash">
              {pick.status === "loading" ? "loading…" : "—"}
            </div>
          )}
        </div>
      </div>

      <div className="relative h-24 mb-1">
        <svg viewBox="0 0 182 96" className="w-full h-full overflow-visible">
          <path d={PATH_D} fill="none" stroke="var(--color-hairline)" strokeWidth="2" />
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

      <div className="flex items-center justify-between mb-1.5">
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
      <div className="text-[9.5px] text-ash/60 italic mb-2">
        Illustrative — not a live model output
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
