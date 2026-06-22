const SIGNALS = ["Volume Surge", "Float & Short Int.", "Price Momentum", "News Sentiment", "Pattern Match"];

export default function SignalFunnel() {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
        {SIGNALS.map((s) => (
          <div
            key={s}
            className="rounded-lg border border-pulse/50 bg-pulse-dim px-2 py-3 text-center"
          >
            <span className="text-[11px] font-semibold text-pulse">{s}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center text-ash mb-6">↓</div>

      <div className="rounded-xl border border-signal/60 bg-signal-dim px-6 py-4 text-center mb-6 max-w-sm mx-auto">
        <div className="font-bold text-signal">AI Scoring Engine</div>
        <div className="text-xs text-mist/80 mt-1">weighted multi-factor model · 0–100 score</div>
      </div>

      <div className="flex justify-center text-ash mb-6">↓</div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-lg border border-hairline bg-panel-soft py-2.5 text-center">
          <span className="text-xs font-bold text-ash">WATCH</span>
        </div>
        <div className="rounded-lg border border-signal/60 bg-signal-dim py-2.5 text-center">
          <span className="text-xs font-bold text-signal">PROMISING</span>
        </div>
        <div className="rounded-lg border border-spark/60 bg-spark-dim py-2.5 text-center">
          <span className="text-xs font-bold text-spark">HOT</span>
        </div>
      </div>
    </div>
  );
}
