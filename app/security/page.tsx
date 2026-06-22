import { Section, Eyebrow } from "@/components/Section";
import CustodyFlow from "@/components/CustodyFlow";
import RiskDisclosureBox from "@/components/RiskDisclosureBox";

export default function SecurityPage() {
  return (
    <>
      <Section className="pt-16 sm:pt-24 pb-10">
        <Eyebrow>Security & Compliance</Eyebrow>
        <h1 className="text-4xl sm:text-5xl font-bold text-mist max-w-2xl">
          We don&apos;t touch your money. On purpose.
        </h1>
        <p className="mt-5 text-ash max-w-2xl leading-relaxed">
          EDGE is not a broker-dealer and never holds customer funds or securities.
          Every trade is executed and held in custody by a registered broker-dealer.
        </p>
      </Section>

      <Section className="py-10">
        <h2 className="text-2xl font-bold text-mist mb-6">Custody & money flow</h2>
        <CustodyFlow />
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-6">Penny stock disclosures</h2>
        <ul className="space-y-3">
          {[
            "In-app risk disclosure before your first penny stock trade, consistent with Exchange Act Rule 15g-2",
            "Bid/ask spread and liquidity disclosures on order tickets for thinly-traded names",
            "The broker-dealer of record (Alpaca) is disclosed on every account and trade confirmation",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-mist/90">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-signal shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-6">AML / KYC</h2>
        <p className="text-mist/90 leading-relaxed max-w-2xl">
          Every account undergoes identity verification, sanctions and PEP screening,
          and ongoing transaction monitoring before funding is enabled.
        </p>
      </Section>

      <Section id="disclosures" className="py-10 border-t border-hairline space-y-4">
        <h2 className="text-2xl font-bold text-mist mb-2">Risk disclosures</h2>
        <RiskDisclosureBox title="Not an offer; review required" scheme="alert">
          This page is for informational purposes only and does not constitute
          investment, legal, or tax advice. Nothing here should be construed as an
          offer to sell or a solicitation to buy any security. EDGE intends to
          operate through a registered broker-dealer of record and will be subject
          to applicable securities laws and FINRA rules.
        </RiskDisclosureBox>
        <RiskDisclosureBox title="Market risk" scheme="alert">
          Micro-cap securities are inherently volatile and illiquid. Losses can be
          significant and rapid, and may include the total loss of your investment.
        </RiskDisclosureBox>
        <RiskDisclosureBox title="AI model risk" scheme="alert">
          Discovery signals are probabilistic and can produce false positives,
          particularly during manipulated or thinly-traded conditions. The Discovery
          Score is not investment advice.
        </RiskDisclosureBox>
      </Section>
    </>
  );
}
