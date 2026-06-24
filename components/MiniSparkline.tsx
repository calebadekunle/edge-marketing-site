const PATH = "M0,20 L8,17 L16,18 L24,12 L32,14 L40,7 L48,9 L56,2";
const LEN = 64;

export default function MiniSparkline({ color = "var(--color-signal)" }: { color?: string }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <svg width="56" height="22" viewBox="0 0 56 22" className="overflow-visible">
        <path
          d={PATH}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray={LEN}
          className="mini-spark-draw"
          style={{ stroke: color }}
        />
      </svg>
      <span
        className="relative flex h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-60 live-pulse"
          style={{ background: color }}
        />
      </span>
    </div>
  );
}
