import Link from "next/link";
import { Section, Eyebrow } from "@/components/Section";

export default function AboutPage() {
  return (
    <>
      <Section className="pt-16 sm:pt-24 pb-10">
        <Eyebrow>About</Eyebrow>
        <h1 className="text-4xl sm:text-5xl font-bold text-mist max-w-2xl leading-tight">
          The penny stock market deserves better tools.
        </h1>
        <p className="mt-5 text-lg text-ash max-w-2xl leading-relaxed">
          Retail traders in the micro-cap space have been working with the same
          fragmented data and manual discovery process for a decade, on a segment
          of the market that moves faster and punishes hesitation harder than
          almost any other. EDGE exists to close that gap.
        </p>
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-5">Why we&apos;re building this</h2>
        <p className="text-mist/90 leading-relaxed max-w-2xl mb-4">
          Most trading platforms treat penny stocks as an afterthought — a minor,
          poorly-supported corner of a much larger product built for large-cap,
          high-liquidity names. EDGE treats the micro-cap market as the core
          product, not the exception.
        </p>
        <p className="text-mist/90 leading-relaxed max-w-2xl">
          At the center of that is the AI Discovery Engine — a real-time signal
          layer that does the scanning work traders currently do by hand, so the
          question shifts from &quot;what did I miss?&quot; to &quot;what&apos;s
          actually moving right now?&quot;
        </p>
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-6">Who&apos;s behind EDGE</h2>
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <p className="text-mist/90 leading-relaxed">
            EDGE is owned and founded by <strong className="text-mist">Justyn King</strong>.
            The platform is being built in partnership with{" "}
            <strong className="text-mist">Alkebulan Technology Company</strong>, led by
            Founder &amp; CEO Caleb Adekunle, whose background spans blockchain
            development, full-stack engineering, and product design across
            multiple fintech and Web3 ventures.
          </p>
        </div>
      </Section>

      <Section className="py-10 border-t border-hairline text-center">
        <h2 className="text-2xl font-bold text-mist mb-4">
          See how the engine actually works.
        </h2>
        <Link
          href="/ai-discovery"
          className="inline-block rounded-xl bg-signal px-8 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
        >
          The AI Discovery Engine
        </Link>
      </Section>
    </>
  );
}
