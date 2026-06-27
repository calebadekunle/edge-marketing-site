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

export default function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex gap-2 overflow-x-auto border-b border-hairline px-4 py-3 -mx-6 sm:-mx-8">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
              active ? "bg-signal-dim text-signal" : "text-ash"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
