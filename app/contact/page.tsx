import { Section, Eyebrow } from "@/components/Section";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <Section className="pt-16 sm:pt-24 pb-20">
      <Eyebrow>Contact</Eyebrow>
      <h1 className="text-4xl sm:text-5xl font-bold text-mist mb-5">Get in touch</h1>
      <p className="text-ash max-w-xl mb-10 leading-relaxed">
        Questions about EDGE, partnership inquiries, or press — send us a
        message and we&apos;ll get back to you.
      </p>
      <div className="max-w-md">
        <ContactForm />
      </div>
    </Section>
  );
}
