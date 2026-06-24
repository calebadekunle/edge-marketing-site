"use client";

import { useEffect, useState } from "react";

type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
};

type FeedState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; quotes: Quote[] };

const POLL_INTERVAL = 30 * 1000; // 30 seconds

function tierFor(changePercent: number): "watch" | "promising" | "hot" {
  const abs = Math.abs(changePercent);
  if (abs >= 8) return "hot";
  if (abs >= 3) return "promising";
  return "watch";
}

const TIER_COLOR: Record<string, string> = {
  watch: "text-ash",
  promising: "text-signal",
  hot: "text-spark",
};

function TickItem({ q }: { q: Quote }) {
  const up = q.changePercent >= 0;
  const tier = tierFor(q.changePercent);
  return (
    <div className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
      <span className="num text-xs font-semibold text-mist">{q.symbol}</span>
      <span className="num text-xs text-ash">${q.price.toFixed(2)}</span>
      <span className={`num text-xs font-semibold ${up ? "text-signal" : "text-alert"}`}>
        {up ? "▲" : "▼"} {Math.abs(q.changePercent).toFixed(1)}%
      </span>
      <span className={`text-[9px] font-bold tracking-wider uppercase ${TIER_COLOR[tier]}`}>
        {tier}
      </span>
      <span className="text-hairline mx-1">·</span>
    </div>
  );
}

export default function TickerTape() {
  const [state, setState] = useState<FeedState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/quotes", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setState({ status: "error" });
          return;
        }
        setState({ status: "ready", quotes: data.quotes });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (state.status !== "ready") {
    // Never show fake/placeholder prices — stay quiet instead.
    return (
      <div className="w-full h-9 border-b border-hairline bg-panel/60" role="status" />
    );
  }

  const doubled = [...state.quotes, ...state.quotes];

  return (
    <div
      className="w-full overflow-hidden border-b border-hairline bg-panel/60"
      role="status"
      aria-label="Live market quotes via Alpaca (IEX feed) — not investment advice"
    >
      <div className="ticker-track flex w-max">
        {doubled.map((q, i) => (
          <TickItem q={q} key={q.symbol + i} />
        ))}
      </div>
    </div>
  );
}
