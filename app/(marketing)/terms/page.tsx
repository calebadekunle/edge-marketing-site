import { Section, Eyebrow } from "@/components/Section";
import RiskDisclosureBox from "@/components/RiskDisclosureBox";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the EDGE application or website (\u201cEDGE,\u201d \u201cwe,\u201d \u201cus\u201d), you agree to be bound by these Terms and Conditions. If you do not agree, do not use EDGE.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least [18] years old and legally able to enter into a binding contract in your jurisdiction to use EDGE. Brokerage accounts are subject to additional eligibility and verification requirements imposed by our broker-dealer of record.",
  },
  {
    title: "3. Description of Service",
    body: "EDGE is not a broker-dealer, investment adviser, or bank. EDGE provides a software interface and an analytical signal layer (the AI Discovery Engine). All brokerage services \u2014 including order execution, clearing, and custody of funds and securities \u2014 are provided by Alpaca Securities LLC, a broker-dealer registered with the SEC and a member of FINRA/SIPC.",
  },
  {
    title: "4. Account Registration & KYC",
    body: "To fund an account or place trades, you must complete identity verification (KYC) and anti-money-laundering (AML) screening through our third-party identity provider. You agree to provide accurate, current information and to promptly update it if it changes.",
  },
  {
    title: "5. Trading Risks",
    body: "Penny stocks and micro-cap securities are highly volatile and illiquid. Prices can move rapidly and may result in the loss of your entire investment. You are solely responsible for your trading decisions.",
  },
  {
    title: "6. AI Discovery Engine Disclaimer",
    body: "The Discovery Score and any related signals, tiers, or alerts are analytical tools only. They do not constitute investment advice, a recommendation, or a guarantee of any outcome. Past signal accuracy does not predict future performance.",
  },
  {
    title: "7. Fees & Subscriptions",
    body: "Certain features are available only on paid subscription tiers. Pricing is displayed in-app and on our website and may change with notice. Subscriptions renew automatically unless cancelled before the renewal date.",
  },
  {
    title: "8. Intellectual Property",
    body: "EDGE and its logos, design, and underlying software are the property of [Company Legal Name] and/or its licensors. You may not copy, modify, or reverse-engineer any part of the service except as permitted by law.",
  },
  {
    title: "9. Prohibited Conduct",
    body: "You may not use EDGE for any unlawful purpose, to manipulate markets, to scrape or reverse-engineer the Discovery Engine, or to interfere with the service\u2019s normal operation.",
  },
  {
    title: "10. Limitation of Liability",
    body: "To the maximum extent permitted by law, [Company Legal Name] is not liable for any indirect, incidental, or consequential damages arising from your use of EDGE, including trading losses.",
  },
  {
    title: "11. Indemnification",
    body: "You agree to indemnify and hold harmless [Company Legal Name] and its affiliates from any claims arising out of your use of EDGE or violation of these Terms.",
  },
  {
    title: "12. Governing Law",
    body: "These Terms are governed by the laws of [Jurisdiction], without regard to conflict-of-law principles.",
  },
  {
    title: "13. Changes to These Terms",
    body: "We may update these Terms from time to time. Continued use of EDGE after changes take effect constitutes acceptance of the revised Terms.",
  },
  {
    title: "14. Contact",
    body: "Questions about these Terms can be sent via our Contact page.",
  },
];

export default function TermsPage() {
  return (
    <Section className="pt-16 sm:pt-24 pb-20">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="text-4xl sm:text-5xl font-bold text-mist mb-6">Terms & Conditions</h1>

      <div className="mb-10">
        <RiskDisclosureBox title="Draft template — not final" scheme="alert">
          This page is a placeholder template, not a finished legal document.
          It must be reviewed and finalized by qualified legal counsel —
          covering securities, fintech, and consumer-protection law in every
          jurisdiction EDGE operates in — before this page is relied upon or
          launched publicly. Bracketed text marks fields that need to be
          filled in.
        </RiskDisclosureBox>
      </div>

      <p className="text-xs text-ash mb-10">Last updated: [Date] · Version 0.1 (draft)</p>

      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-bold text-mist mb-2">{s.title}</h2>
            <p className="text-sm text-mist/85 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
