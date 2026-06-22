"use client";

type Tick = {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
  tier?: "watch" | "promising" | "hot";
};

const TICKS: Tick[] = [
  { symbol: "BBIG", price: "0.847", change: "+18.4%", up: true, tier: "hot" },
  { symbol: "MMAT", price: "1.234", change: "+12.7%", up: true, tier: "hot" },
  { symbol: "CLOV", price: "1.890", change: "+7.3%", up: true, tier: "promising" },
  { symbol: "SNDL", price: "1.620", change: "+5.8%", up: true, tier: "promising" },
  { symbol: "PHUN", price: "0.362", change: "-3.8%", up: false, tier: "watch" },
  { symbol: "ZOM", price: "0.201", change: "-6.2%", up: false, tier: "watch" },
  { symbol: "MVIS", price: "1.870", change: "+8.9%", up: true, tier: "promising" },
  { symbol: "SPCE", price: "2.140", change: "+2.4%", up: true, tier: "watch" },
  { symbol: "NKLA", price: "0.520", change: "-4.6%", up: false, tier: "watch" },
  { symbol: "HYLN", price: "1.320", change: "+1.8%", up: true, tier: "watch" },
];

const TIER_COLOR: Record<string, string> = {
  watch: "text-ash",
  promising: "text-signal",
  hot: "text-spark",
};

function TickItem({ t }: { t: Tick }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
      <span className="num text-xs font-semibold text-mist">{t.symbol}</span>
      <span className="num text-xs text-ash">${t.price}</span>
      <span className={`num text-xs font-semibold ${t.up ? "text-signal" : "text-alert"}`}>
        {t.up ? "▲" : "▼"} {t.change}
      </span>
      {t.tier && (
        <span className={`text-[9px] font-bold tracking-wider uppercase ${TIER_COLOR[t.tier]}`}>
          {t.tier}
        </span>
      )}
      <span className="text-hairline mx-1">·</span>
    </div>
  );
}

export default function TickerTape() {
  const doubled = [...TICKS, ...TICKS];
  return (
    <div
      className="w-full overflow-hidden border-b border-hairline bg-panel/60"
      role="status"
      aria-label="Simulated AI Discovery feed — illustrative data, not investment advice"
    >
      <div className="ticker-track flex w-max">
        {doubled.map((t, i) => (
          <TickItem t={t} key={i} />
        ))}
      </div>
    </div>
  );
}
