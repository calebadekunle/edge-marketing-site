import {
  getAlpacaSettingsSafe,
  getSmtpSettingsSafe,
  getMailchimpSettingsSafe,
  getRecaptchaSettingsSafe,
  getWebhooksSafe,
  getSeoSettings,
} from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import AlpacaKeysForm from "./AlpacaKeysForm";
import KeyDirectoryRow from "./KeyDirectoryRow";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  if (!(await isAdminAuthorized())) notFound();

  const alpaca = getAlpacaSettingsSafe();
  const smtp = getSmtpSettingsSafe();
  const mailchimp = getMailchimpSettingsSafe();
  const recaptcha = getRecaptchaSettingsSafe();
  const webhooks = getWebhooksSafe();
  const enabledWebhooks = webhooks.filter((w) => w.enabled).length;
  const { ga_measurement_id } = getSeoSettings();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">API Keys</h1>
        <p className="text-sm text-ash mt-1">
          Every external credential this site uses, in one place — what&apos;s set,
          where it&apos;s stored, and where to change it.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-mist mb-3">
          Editable here
        </h2>
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-sm text-ash mb-2">
            Stock quote data for the public ticker tape and hero card. This used
            to only live in a `.env.local` file with no admin UI at all — now
            it&apos;s here, and the old env vars still work as a fallback if you
            never touch this form.
          </p>
          <AlpacaKeysForm initial={alpaca} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-mist mb-3">
          Editable on their own pages
        </h2>
        <div className="glass-card rounded-2xl divide-y divide-hairline">
          <KeyDirectoryRow
            name="SMTP / Email notifications"
            configured={smtp.enabled && !!smtp.host}
            detail={smtp.host ? `${smtp.host}${smtp.username ? ` · ${smtp.username}` : ""}` : "Not set"}
            href="/admin/settings#email"
          />
          <KeyDirectoryRow
            name="Mailchimp API key"
            configured={!!mailchimp.api_key_last4}
            detail={mailchimp.api_key_last4 ? `Ending in ${mailchimp.api_key_last4}` : "Not set"}
            href="/admin/settings#mailchimp"
          />
          <KeyDirectoryRow
            name="reCAPTCHA secret key"
            configured={recaptcha.secret_key_set}
            detail={recaptcha.site_key ? `Site key ${recaptcha.site_key.slice(0, 12)}…` : "Not set"}
            href="/admin/settings#recaptcha"
          />
          <KeyDirectoryRow
            name="Google Analytics"
            configured={!!ga_measurement_id}
            detail={ga_measurement_id || "Not set"}
            href="/admin/seo"
          />
          <KeyDirectoryRow
            name="Webhook secrets"
            configured={enabledWebhooks > 0}
            detail={`${webhooks.length} configured, ${enabledWebhooks} active`}
            href="/admin/webhooks"
          />
        </div>
        <p className="text-xs text-ash mt-3">
          These already live in the database and were never hardcoded — each
          one just has its own dedicated settings page, since that&apos;s also
          where you&apos;d configure everything else about that integration (which
          events trigger it, what audience it syncs to, and so on). Click
          through to edit any of them.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-mist mb-3">
          Still environment-variable only, on purpose
        </h2>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-mist">Admin login (ADMIN_USERNAME / ADMIN_PASSWORD)</p>
          <p className="text-xs text-ash mt-1">
            Deliberately not moved into this page. Editing your own login
            credentials from inside a page you needed those same credentials
            to reach has a real lockout risk if done without a proper
            &quot;confirm your current password first&quot; flow — worth building
            correctly as its own thing if you want this changeable without
            editing `.env.local` directly, not bolted onto this directory.
          </p>
        </div>
      </div>
    </div>
  );
}
