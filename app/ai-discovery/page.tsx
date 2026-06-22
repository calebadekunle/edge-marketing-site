import Link from "next/link";
import { Section, Eyebrow } from "@/components/Section";
import SignalFunnel from "@/components/SignalFunnel";
import DiscoveryGauge from "@/components/DiscoveryGauge";
import RiskDisclosureBox from "@/components/RiskDisclosureBox";

export default function AIDiscoveryPage() {
  return (
    <>
      <Section className="pt-16 sm:pt-24 pb-10">
        <Eyebrow>Flagship feature</Eyebrow>
        <h1 className="text-4xl sm:text-5xl font-bold text-mist max-w-2xl leading-tight">
          The AI Discovery Engine
        </h1>
        <p className="mt-5 text-lg text-ash max-w-2xl leading-relaxed">
          A continuously running analysis layer that scores the active penny stock
          universe and surfaces which tickers are showing genuine signs of strength —
          in real time, before the move is obvious.
        </p>
      </Section>

      <Section className="py-10">
        <h2 className="text-2xl font-bold text-mist mb-6">How it works</h2>
        <SignalFunnel />
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-3">Try the scoring tiers</h2>
        <p className="text-ash mb-6 max-w-2xl leading-relaxed">
          Every score lands in one of three tiers. Tap each one to see what it means.
        </p>
        <DiscoveryGauge />
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-6">What the score is — and isn&apos;t</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <div className="font-semibold text-signal mb-2">It is —</div>
            <p className="text-sm text-mist/90 leading-relaxed">
              A real-time read on volume, float, momentum, sentiment, and historical
              pattern strength, recalculated continuously as conditions change.
            </p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="font-semibold text-alert mb-2">It isn&apos;t —</div>
            <p className="text-sm text-mist/90 leading-relaxed">
              A prediction, a guarantee, or individualized investment advice. It
              favors precision over recall — it would rather miss a mover than
              flood your feed with false positives.
            </p>
          </div>
        </div>
      </Section>

      <Section className="py-10 border-t border-hairline">
        <RiskDisclosureBox title="Not investment advice" scheme="spark">
          The Discovery Score is a real-time analytical signal, not a prediction or a
          guarantee of future performance. No feature of EDGE should be interpreted
          as a recommendation to buy or sell any security.
        </RiskDisclosureBox>
      </Section>

      <Section className="text-center border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-4">
          See it on Watch, Promising, and Hot tiers.
        </h2>
        <Link
          href="/pricing"
          className="inline-block rounded-xl bg-signal px-8 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
        >
          Compare plans
        </Link>
      </Section>
    </>
  );
}
