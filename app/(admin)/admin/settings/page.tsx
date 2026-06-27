import { getThemeSettings, getSmtpSettingsSafe, getMailchimpSettingsSafe, getFormSettings, getRecaptchaSettingsSafe } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import ThemeEditorForm from "./ThemeEditorForm";
import EmailSettingsForm from "./EmailSettingsForm";
import MailchimpSettingsForm from "./MailchimpSettingsForm";
import FormRedirectsForm from "./FormRedirectsForm";
import RecaptchaSettingsForm from "./RecaptchaSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!(await isAdminAuthorized())) notFound();

  const theme = getThemeSettings();
  const smtp = getSmtpSettingsSafe();
  const mailchimp = getMailchimpSettingsSafe();
  const formSettings = getFormSettings();
  const recaptcha = getRecaptchaSettingsSafe();

  return (
    <div className="space-y-12 max-w-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Settings</h1>
      </div>

      <section>
        <h2 className="text-lg font-bold text-mist mb-2">Site theme</h2>
        <p className="text-sm text-ash mb-4">
          Change the colors used across the public marketing site. Changes apply
          immediately — no redeploy needed, just refresh the homepage.
        </p>
        <ThemeEditorForm initial={theme} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-mist mb-2">Email notifications</h2>
        <p className="text-sm text-ash mb-4">
          Get an email the moment someone joins the waitlist or sends a contact
          message, instead of having to check Submissions manually. Works with
          any SMTP provider — Microsoft 365/Outlook, Gmail, Zoho, or a
          transactional provider like Resend or Postmark.
        </p>
        <EmailSettingsForm initial={smtp} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-mist mb-2">Mailchimp</h2>
        <p className="text-sm text-ash mb-4">
          Automatically add new leads to a Mailchimp audience, so you can run
          email campaigns to everyone who&apos;s shown interest without manually
          exporting anything from Submissions.
        </p>
        <MailchimpSettingsForm initial={mailchimp} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-mist mb-2">Form redirects</h2>
        <p className="text-sm text-ash mb-4">
          Send people to a specific URL after they submit instead of showing
          the default inline confirmation — useful for a dedicated thank-you
          page, a tracking pixel, or sending them straight into a funnel.
        </p>
        <FormRedirectsForm initial={formSettings} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-mist mb-2">reCAPTCHA</h2>
        <p className="text-sm text-ash mb-4">
          Add Google reCAPTCHA to the waitlist and contact forms to keep bots
          from spamming submissions. Off by default — forms work exactly as
          they do now until you enable this.
        </p>
        <RecaptchaSettingsForm initial={recaptcha} />
      </section>
    </div>
  );
}
