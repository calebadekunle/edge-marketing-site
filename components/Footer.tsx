import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/ai-discovery", label: "AI Discovery Engine" },
      { href: "/pricing", label: "Pricing" },
      { href: "/download", label: "Download" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/security", label: "Security & Compliance" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/security#disclosures", label: "Risk Disclosures" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-5 py-12 grid grid-cols-2 sm:grid-cols-5 gap-8">
        <div className="col-span-2">
          <span className="text-lg font-bold text-signal">EDGE</span>
          <p className="mt-3 text-sm text-ash max-w-xs">
            A real-time discovery layer for the penny stock market — built on a
            broker-dealer of record, not a guess.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="text-xs font-semibold uppercase tracking-wider text-ash mb-3">
              {col.title}
            </div>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-mist/80 hover:text-signal">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Persistent compliance disclosure bar — present on every page, like the app */}
      <div className="border-t border-hairline bg-panel/40">
        <p className="mx-auto max-w-6xl px-5 py-4 text-[11px] leading-relaxed text-ash">
          EDGE is not a broker-dealer and does not hold customer funds or securities.
          Brokerage services are provided by Alpaca Securities LLC, a registered
          broker-dealer and member of FINRA/SIPC. The AI Discovery Engine provides
          analytical signals only — it is not investment advice, and past performance
          does not guarantee future results. Penny stocks are highly volatile and can
          result in the loss of your entire investment.{" "}
          <Link href="/security#disclosures" className="underline hover:text-signal">
            Full risk disclosures
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
