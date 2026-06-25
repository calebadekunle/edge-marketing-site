import { Section, Eyebrow } from "@/components/Section";
import RiskDisclosureBox from "@/components/RiskDisclosureBox";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "Account information (name, email, phone); identity verification documents, processed through our third-party KYC/AML provider; financial and trading data needed to operate your brokerage account; and device/usage data such as app interactions and crash logs.",
  },
  {
    title: "2. How We Use Information",
    body: "To open and operate your account, process trades through our broker-dealer of record, comply with KYC/AML and securities regulations, personalize the Discovery Engine experience, and improve the product.",
  },
  {
    title: "3. Third Parties We Share Data With",
    body: "Alpaca Securities LLC (broker-dealer of record, trade execution and custody), Plaid (bank linking and ACH transfers), our identity verification provider (KYC/AML), and standard analytics/infrastructure providers. We do not sell your personal information.",
  },
  {
    title: "4. Data Security",
    body: "We use encryption in transit and at rest, role-based access control, and industry-standard security practices. No system is perfectly secure, and we cannot guarantee absolute security.",
  },
  {
    title: "5. Your Rights",
    body: "Depending on your jurisdiction, you may have the right to access, correct, or request deletion of your personal information. Certain financial records must be retained for a minimum period under securities and AML regulations regardless of a deletion request.",
  },
  {
    title: "6. Cookies",
    body: "Our website uses cookies and similar technologies for essential functionality and basic analytics. You can control cookies through your browser settings.",
  },
  {
    title: "7. Children's Privacy",
    body: "EDGE is not directed at, and may not be used by, anyone under the age of 18.",
  },
  {
    title: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be communicated through the app or website before they take effect.",
  },
  {
    title: "9. Contact",
    body: "Questions about this policy can be sent via our Contact page.",
  },
];

export default function PrivacyPage() {
  return (
    <Section className="pt-16 sm:pt-24 pb-20">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="text-4xl sm:text-5xl font-bold text-mist mb-6">Privacy Policy</h1>

      <div className="mb-10 space-y-4">
        <RiskDisclosureBox title="Draft template — not final" scheme="alert">
          This page is a placeholder template, not a finished legal document.
          It must be reviewed and finalized by qualified legal counsel before
          this page is relied upon or launched publicly. Bracketed text marks
          fields that need to be filled in.
        </RiskDisclosureBox>
        <RiskDisclosureBox title="Financial privacy needs specialist review" scheme="pulse" icon="i">
          Because EDGE operates alongside a registered broker-dealer, customer
          financial data is also subject to Regulation S-P and the
          Gramm-Leach-Bliley Act privacy rules — a different, stricter regime
          than general consumer privacy law. This draft does not yet address
          those requirements in detail; counsel familiar with broker-dealer
          compliance should review this section specifically.
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
