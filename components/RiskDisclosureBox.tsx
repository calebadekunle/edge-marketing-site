type Scheme = "spark" | "alert" | "pulse";

const SCHEMES: Record<Scheme, { text: string; border: string; bg: string }> = {
  spark: { text: "text-spark", border: "border-spark/50", bg: "bg-spark-dim" },
  alert: { text: "text-alert", border: "border-alert/50", bg: "bg-alert-dim" },
  pulse: { text: "text-pulse", border: "border-pulse/50", bg: "bg-pulse-dim" },
};

export default function RiskDisclosureBox({
  title,
  children,
  scheme = "spark",
  icon = "!",
}: {
  title: string;
  children: React.ReactNode;
  scheme?: Scheme;
  icon?: string;
}) {
  const s = SCHEMES[scheme];
  return (
    <div className={`safe-fade rounded-2xl border ${s.border} ${s.bg} p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${s.text} border ${s.border} text-sm font-bold`}
        >
          {icon}
        </span>
        <div>
          <div className={`font-semibold mb-1.5 ${s.text}`}>{title}</div>
          <p className="text-sm leading-relaxed text-mist/90">{children}</p>
        </div>
      </div>
    </div>
  );
}
