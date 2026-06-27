import Link from "next/link";
import { Section, Eyebrow } from "@/components/Section";
import SignalCard from "@/components/SignalCard";
import StatCounter from "@/components/StatCounter";
import DiscoveryGauge from "@/components/DiscoveryGauge";
import RiskDisclosureBox from "@/components/RiskDisclosureBox";
import HeroDiscoveryCard from "@/components/HeroDiscoveryCard";
import Reveal from "@/components/Reveal";
import NewsFeed from "@/components/NewsFeed";
import { getHomepageContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const c = getHomepageContent();

  return (
    <>
      {/* Hero */}
      <Section className="pt-16 sm:pt-28 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="max-w-2xl">
            <Eyebrow>{c.hero.eyebrow}</Eyebrow>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-mist leading-[1.05]">
              {c.hero.headline_line1}
              <br />
              <span className="text-gradient-signal">{c.hero.headline_line2}</span>
            </h1>
            <p className="mt-6 text-lg text-ash max-w-xl leading-relaxed">{c.hero.subhead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/download"
                className="cta-pulse rounded-xl bg-signal px-6 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
              >
                {c.hero.cta_primary_label}
              </Link>
              <Link
                href="/ai-discovery"
                className="rounded-xl border border-hairline px-6 py-3.5 text-sm font-semibold text-mist hover:border-signal/60 transition-colors"
              >
                {c.hero.cta_secondary_label}
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <HeroDiscoveryCard />
          </div>
        </div>
      </Section>

      {/* Stat row */}
      <Section className="py-10 border-y border-hairline">
        <div className="grid grid-cols-3 gap-8">
          {c.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 120}>
              <StatCounter
                label={s.label}
                value={s.value}
                color={i === 1 ? "text-signal" : i === 2 ? "text-spark" : undefined}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Signal inputs */}
      <Section>
        <Reveal>
          <Eyebrow>{c.signals.eyebrow}</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-bold text-mist mb-4">{c.signals.heading}</h2>
          <p className="text-ash max-w-2xl mb-10 leading-relaxed">{c.signals.intro}</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {c.signals.items.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <SignalCard label={s.label} desc={s.desc} index={i} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <DiscoveryGauge />
        </Reveal>
      </Section>

      {/* Disclaimer — pure-CSS fade, never JS-gated (see RiskDisclosureBox) */}
      <Section className="py-10">
        <RiskDisclosureBox title={c.disclaimer.title} scheme="spark">
          {c.disclaimer.body}
        </RiskDisclosureBox>
      </Section>

      {/* Platform features */}
      <Section className="border-t border-hairline">
        <Reveal>
          <Eyebrow>{c.features.eyebrow}</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-bold text-mist mb-10">{c.features.heading}</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {c.features.items.map((f, i) => (
            <Reveal key={f.label} delay={i * 90}>
              <SignalCard label={f.label} desc={f.desc} index={i} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center border-t border-hairline">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-bold text-mist mb-4">{c.cta.heading}</h2>
          <p className="text-ash max-w-md mx-auto mb-8">{c.cta.subhead}</p>
          <Link
            href="/download"
            className="cta-pulse inline-block rounded-xl bg-signal px-8 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
          >
            {c.cta.button_label}
          </Link>
        </Reveal>
      </Section>

      {/* Live market news — self-updating, real headlines via RSS */}
      <Section className="border-t border-hairline">
        <Eyebrow>{c.news.eyebrow}</Eyebrow>
        <h2 className="text-3xl sm:text-4xl font-bold text-mist mb-4">{c.news.heading}</h2>
        <p className="text-ash max-w-2xl mb-10 leading-relaxed">{c.news.subhead}</p>
        <NewsFeed />
      </Section>
    </>
  );
}
