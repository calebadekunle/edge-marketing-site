"use client";

type Point = { date: string; count: number };

export default function AdminSparkline({
  data,
  color = "var(--color-signal)",
  width = 72,
  height = 28,
}: {
  data: Point[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const stepX = width / (data.length - 1);
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - (d.count / max) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M${points.join(" L")}`;
  const last = points[points.length - 1].split(",");

  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
      </svg>
    </div>
  );
}
