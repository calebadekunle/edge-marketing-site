import { getThemeSettings, getSmtpSettingsSafe } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import ThemeEditorForm from "./ThemeEditorForm";
import EmailSettingsForm from "./EmailSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!(await isAdminAuthorized())) notFound();

  const theme = getThemeSettings();
  const smtp = getSmtpSettingsSafe();

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
    </div>
  );
}
