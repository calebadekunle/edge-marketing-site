import { Section, Eyebrow } from "@/components/Section";
import PricingCard from "@/components/PricingCard";
import RiskDisclosureBox from "@/components/RiskDisclosureBox";

export default function PricingPage() {
  return (
    <>
      <Section className="pt-16 sm:pt-24 pb-10 text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="text-4xl sm:text-5xl font-bold text-mist">
          Free to start. Pay for the edge.
        </h1>
        <p className="mt-5 text-ash max-w-xl mx-auto leading-relaxed">
          EDGE monetizes through subscriptions, not payment-for-order-flow — so the
          incentive is your outcome, not your trade volume.
        </p>
      </Section>

      <Section className="py-6">
        <div className="grid sm:grid-cols-3 gap-5">
          <PricingCard
            name="Free"
            scheme="ash"
            features={[
              "Real-time screener",
              "Watchlists & sparklines",
              "Delayed Watch-tier signals",
              "Standard order types",
            ]}
          />
          <PricingCard
            name="EDGE Plus"
            scheme="signal"
            features={[
              "Everything in Free",
              "Real-time Promising-tier alerts",
              "Price & volume alerts",
              "Priority news feed",
            ]}
          />
          <PricingCard
            name="EDGE Pro"
            scheme="spark"
            popular
            features={[
              "Everything in Plus",
              "Real-time Hot-tier alerts",
              "Historical score tracking",
              "Custom signal weighting",
            ]}
          />
        </div>
        <p className="text-center text-xs text-ash mt-6 italic">
          Pricing shown is illustrative and subject to change ahead of launch.
        </p>
      </Section>

      <Section className="py-10 border-t border-hairline">
        <RiskDisclosureBox title="Discovery Feed pricing" scheme="pulse" icon="i">
          The Discovery Feed is the primary paid upgrade: Free users see delayed,
          Watch-tier-only signals, while paid tiers unlock real-time Hot-tier alerts,
          historical score tracking, and custom signal weighting.
        </RiskDisclosureBox>
      </Section>
    </>
  );
}
