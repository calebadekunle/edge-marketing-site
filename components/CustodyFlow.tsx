const STEPS = [
  { label: "Your Bank Account", color: "text-ash", border: "border-hairline" },
  { label: "EDGE App", sub: "Order routing only", color: "text-signal", border: "border-signal/60" },
  { label: "Alpaca Securities LLC", sub: "Broker-dealer of record", color: "text-spark", border: "border-spark/60" },
  { label: "Your Brokerage Account", color: "text-pulse", border: "border-pulse/60" },
];

export default function CustodyFlow() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-0">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1">
            <div className={`flex-1 rounded-xl border ${s.border} bg-panel p-4 text-center`}>
              <div className={`text-sm font-semibold ${s.color}`}>{s.label}</div>
              {s.sub && <div className="text-[11px] text-ash mt-1">{s.sub}</div>}
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden sm:flex items-center justify-center w-8 text-ash shrink-0">
                →
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm font-semibold text-signal mt-5">
        EDGE never holds customer funds or securities at any point in this flow.
      </p>
    </div>
  );
}
