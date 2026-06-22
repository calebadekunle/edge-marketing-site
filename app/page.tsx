import Link from "next/link";
import { Section, Eyebrow } from "@/components/Section";
import SignalCard from "@/components/SignalCard";
import StatCounter from "@/components/StatCounter";
import DiscoveryGauge from "@/components/DiscoveryGauge";
import RiskDisclosureBox from "@/components/RiskDisclosureBox";

const SIGNALS = [
  { label: "Volume Surge", desc: "Relative volume vs. the trailing average, the first sign something is happening." },
  { label: "Float & Short Interest", desc: "How much of the float is tradable, and how exposed short sellers are to a squeeze." },
  { label: "Price Momentum", desc: "Multi-timeframe price action and trend strength, not just today's candle." },
  { label: "News Sentiment", desc: "Real-time classification of headlines and press releases as they break." },
  { label: "Pattern Match", desc: "Comparison against historical setups that preceded prior breakouts." },
];

const FEATURES = [
  { label: "Real-time screener", desc: "Filter the entire micro-cap universe by sector and momentum in seconds." },
  { label: "Persistent watchlists", desc: "Live sparkline previews on every ticker you're tracking." },
  { label: "Smart alerts", desc: "Price, volume, and pattern-based alerts that fire the moment it matters." },
  { label: "One-tap order flow", desc: "Market, limit, and stop orders with cost previewed before you confirm." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Section className="pt-16 sm:pt-28 pb-12 sm:pb-20">
        <div className="max-w-3xl">
          <Eyebrow>AI Discovery Engine, built in</Eyebrow>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-mist leading-[1.05]">
            Know which penny stocks
            <br />
            are <span className="text-gradient-signal">actually moving.</span>
          </h1>
          <p className="mt-6 text-lg text-ash max-w-xl leading-relaxed">
            EDGE continuously scores the micro-cap universe on volume, float, momentum,
            and sentiment — so you see genuine strength, not noise, the moment it shows up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/download"
              className="rounded-xl bg-signal px-6 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
            >
              Get the app
            </Link>
            <Link
              href="/ai-discovery"
              className="rounded-xl border border-hairline px-6 py-3.5 text-sm font-semibold text-mist hover:border-signal/60 transition-colors"
            >
              See how discovery works
            </Link>
          </div>
        </div>
      </Section>

      {/* Stat row */}
      <Section className="py-10 border-y border-hairline">
        <div className="grid grid-cols-3 gap-8">
          <StatCounter label="Focus" value="Micro-Cap Equities" />
          <StatCounter label="Differentiator" value="AI Discovery" color="text-signal" />
          <StatCounter label="Broker of Record" value="Alpaca" color="text-spark" />
        </div>
      </Section>

      {/* Signal inputs */}
      <Section>
        <Eyebrow>The flagship feature</Eyebrow>
        <h2 className="text-3xl sm:text-4xl font-bold text-mist mb-4">
          Five signals. One score.
        </h2>
        <p className="text-ash max-w-2xl mb-10 leading-relaxed">
          The Discovery Engine doesn&apos;t guess — it weighs the same signals
          experienced traders already watch, continuously, across the entire
          penny stock universe.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {SIGNALS.map((s) => (
            <SignalCard key={s.label} label={s.label} desc={s.desc} />
          ))}
        </div>
        <DiscoveryGauge />
      </Section>

      {/* Disclaimer */}
      <Section className="py-10">
        <RiskDisclosureBox title="Not investment advice" scheme="spark">
          The Discovery Score is a real-time analytical signal, not a prediction or a
          guarantee of future performance. EDGE does not provide individualized
          investment advice. Past signal accuracy does not guarantee future results.
        </RiskDisclosureBox>
      </Section>

      {/* Platform features */}
      <Section className="border-t border-hairline">
        <Eyebrow>The platform</Eyebrow>
        <h2 className="text-3xl sm:text-4xl font-bold text-mist mb-10">
          Built for traders who move fast.
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <SignalCard key={f.label} label={f.label} desc={f.desc} />
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center border-t border-hairline">
        <h2 className="text-3xl sm:text-4xl font-bold text-mist mb-4">
          Trade with an edge.
        </h2>
        <p className="text-ash max-w-md mx-auto mb-8">
          Join the waitlist and be first to know when EDGE opens up.
        </p>
        <Link
          href="/download"
          className="inline-block rounded-xl bg-signal px-8 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
        >
          Get early access
        </Link>
      </Section>
    </>
  );
}
