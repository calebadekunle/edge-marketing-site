import { Section, Eyebrow } from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import { getFormSettings, getRecaptchaSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  const { contact_redirect_url } = getFormSettings();
  const recaptcha = getRecaptchaSettings();
  const recaptchaSiteKey = recaptcha.enabled ? recaptcha.site_key : null;

  return (
    <Section className="pt-16 sm:pt-24 pb-20">
      <Eyebrow>Contact</Eyebrow>
      <h1 className="text-4xl sm:text-5xl font-bold text-mist mb-5">Get in touch</h1>
      <p className="text-ash max-w-xl mb-10 leading-relaxed">
        Questions about EDGE, partnership inquiries, or press — send us a
        message and we&apos;ll get back to you.
      </p>
      <div className="max-w-md">
        <ContactForm redirectUrl={contact_redirect_url} recaptchaSiteKey={recaptchaSiteKey} />
      </div>
    </Section>
  );
}
