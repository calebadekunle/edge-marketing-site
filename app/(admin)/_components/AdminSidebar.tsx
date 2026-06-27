"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", live: true },
  { href: "/admin/submissions", label: "Submissions", live: true },
  { href: "/admin/homepage", label: "Homepage", live: true },
  { href: "/admin/settings", label: "Settings", live: true },
  { href: "/admin/seo", label: "SEO", live: true },
  { href: "/admin/webhooks", label: "Webhooks", live: true },
  { href: "/admin/analytics", label: "Analytics", live: true },
  { href: "/admin/compliance", label: "Compliance", live: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-hairline bg-panel/40 px-4 py-6">
      <Link href="/admin" className="px-2 mb-8 flex items-baseline gap-2">
        <span className="text-lg font-bold text-signal">EDGE</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ash">
          Admin
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          if (!item.live) {
            return (
              <span
                key={item.href}
                title="Not built yet"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ash/50 cursor-not-allowed select-none"
              >
                {item.label}
                <span className="text-[9px] font-semibold uppercase tracking-wide rounded bg-hairline px-1.5 py-0.5 text-ash">
                  Soon
                </span>
              </span>
            );
          }

          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-signal-dim text-signal font-semibold"
                  : "text-mist/80 hover:bg-panel hover:text-signal"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-6">
        <Link href="/" className="text-xs text-ash hover:text-signal transition-colors">
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
