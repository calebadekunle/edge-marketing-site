import { Section, Eyebrow } from "@/components/Section";
import AppDownloadCTA from "@/components/AppDownloadCTA";
import WaitlistForm from "@/components/WaitlistForm";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import { getFormSettings, getRecaptchaSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function DownloadPage() {
  const { waitlist_redirect_url } = getFormSettings();
  const recaptcha = getRecaptchaSettings();
  const recaptchaSiteKey = recaptcha.enabled ? recaptcha.site_key : null;

  return (
    <>
      <Section className="pt-16 sm:pt-24 pb-10 text-center">
        <Eyebrow>Get EDGE</Eyebrow>
        <h1 className="text-4xl sm:text-5xl font-bold text-mist">
          EDGE is launching soon.
        </h1>
        <p className="mt-5 text-ash max-w-xl mx-auto leading-relaxed">
          The app isn&apos;t public yet. Join the waitlist and we&apos;ll email you
          the moment it opens up.
        </p>
        <div className="mt-8 flex justify-center">
          <AppDownloadCTA />
        </div>
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-xl font-bold text-mist mb-5 text-center">Join the waitlist</h2>
        <div className="max-w-md mx-auto">
          <WaitlistForm redirectUrl={waitlist_redirect_url} recaptchaSiteKey={recaptchaSiteKey} />
        </div>
      </Section>

      <Section className="py-10 border-t border-hairline">
        <h2 className="text-2xl font-bold text-mist mb-6 text-center">Roadmap</h2>
        <RoadmapTimeline />
      </Section>
    </>
  );
}
