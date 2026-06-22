"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/ai-discovery", label: "AI Discovery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-void/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="text-xl font-bold tracking-tight text-signal">EDGE</span>
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.18em] text-ash">
            Penny Stock Trading
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-mist/80 hover:text-signal transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/download"
            className="rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
          >
            Get the app
          </Link>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-6 bg-mist transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`}
          />
          <span className={`block h-0.5 w-6 bg-mist transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-6 bg-mist transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-hairline px-5 py-4 flex flex-col gap-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-mist/80 hover:text-signal"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/download"
            className="rounded-lg bg-signal px-4 py-2.5 text-center text-sm font-semibold text-void"
            onClick={() => setOpen(false)}
          >
            Get the app
          </Link>
        </div>
      )}
    </header>
  );
}
