"use client";

import { useEffect, useState, useCallback } from "react";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
};

type FeedState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: NewsItem[]; fetchedAt: string };

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes — matches server-side cache window

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diffMin = Math.max(0, Math.round((Date.now() - d) / 60000));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

export default function NewsFeed() {
  const [state, setState] = useState<FeedState>({ status: "loading" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState({ status: "error", message: data.error || "Couldn't load news" });
        return;
      }
      setState({ status: "ready", items: data.items, fetchedAt: data.fetchedAt });
    } catch {
      setState({ status: "error", message: "Couldn't reach the news feed" });
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 rounded-full bg-signal">
            <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-60 live-pulse" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-mist">
            Live Market News
          </span>
        </div>
        {state.status === "ready" && (
          <span className="text-[11px] text-ash">
            Updated {timeAgo(state.fetchedAt)}
          </span>
        )}
      </div>

      {state.status === "loading" && (
        <div className="px-5 py-8 text-center text-sm text-ash">Loading live headlines…</div>
      )}

      {state.status === "error" && (
        <div className="px-5 py-8 text-center text-sm text-ash">
          Live news is temporarily unavailable. Try again shortly.
        </div>
      )}

      {state.status === "ready" &&
        state.items.map((item, i) => (
          <a
            key={item.link + i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-hairline last:border-b-0 hover:bg-panel-soft transition-colors"
          >
            <span className="text-sm text-mist/90 leading-snug">{item.title}</span>
            <span className="flex flex-col items-end shrink-0 gap-0.5">
              <span className="text-[10px] font-semibold text-ash whitespace-nowrap">
                {item.source}
              </span>
              <span className="num text-[10px] text-ash whitespace-nowrap">
                {timeAgo(item.pubDate)}
              </span>
            </span>
          </a>
        ))}
    </div>
  );
}
