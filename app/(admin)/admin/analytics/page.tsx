import {
  countPageviews,
  countPageviewsForPath,
  countWaitlistSignups,
  countContactSubmissions,
  getTopPaths,
  getTopReferrers,
  getSmtpSettingsSafe,
  getMailchimpSettingsSafe,
  getWebhooksSafe,
} from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  if (!(await isAdminAuthorized())) notFound();

  const totalPageviews = countPageviews();
  const downloadViews = countPageviewsForPath("/download");
  const contactViews = countPageviewsForPath("/contact");
  const waitlistSignups = countWaitlistSignups();
  const contactSubmissions = countContactSubmissions();
  const topPaths = getTopPaths(8);
  const topReferrers = getTopReferrers(8);

  const waitlistConversion = downloadViews ? Math.round((waitlistSignups / downloadViews) * 100) : 0;
  const contactConversion = contactViews ? Math.round((contactSubmissions / contactViews) * 100) : 0;

  const smtp = getSmtpSettingsSafe();
  const mailchimp = getMailchimpSettingsSafe();
  const webhooks = getWebhooksSafe();
  const enabledWebhooks = webhooks.filter((w) => w.enabled).length;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Analytics</h1>
        <p className="text-sm text-ash mt-1">
          Traffic and conversion since pageview tracking went live — this only
          counts visits from here forward, not retroactively.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pageviews" value={String(totalPageviews)} />
        <StatCard
          label="Waitlist Conversion"
          value={`${waitlistConversion}%`}
          sub={`${waitlistSignups} of ${downloadViews} visits`}
        />
        <StatCard
          label="Contact Conversion"
          value={`${contactConversion}%`}
          sub={`${contactSubmissions} of ${contactViews} visits`}
        />
        <StatCard label="Active Webhooks" value={String(enabledWebhooks)} />
      </div>

      <section>
        <h2 className="text-lg font-bold text-mist mb-3">Integration status</h2>
        <div className="glass-card rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusRow
            label="Email notifications"
            ok={smtp.enabled && !!smtp.host && !!smtp.notify_email}
          />
          <StatusRow
            label="Mailchimp sync"
            ok={mailchimp.enabled && !!mailchimp.audience_id}
          />
          <StatusRow label="Webhooks" ok={enabledWebhooks > 0} detail={`${enabledWebhooks} active`} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-bold text-mist mb-3">Top pages</h2>
          {topPaths.length === 0 ? (
            <EmptyState label="No pageviews recorded yet." />
          ) : (
            <RankTable
              rows={topPaths.map((p) => ({ label: p.path, count: p.count }))}
            />
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-mist mb-3">Top referrer sources</h2>
          {topReferrers.length === 0 ? (
            <EmptyState label="No traffic sources recorded yet." />
          ) : (
            <RankTable
              rows={topReferrers.map((r) => ({ label: r.referrer, count: r.count }))}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ash">{label}</p>
      <p className="num text-3xl font-bold text-mist mt-2">{value}</p>
      {sub && <p className="text-xs text-ash mt-1">{sub}</p>}
    </div>
  );
}

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${ok ? "bg-signal" : "bg-alert"}`} />
      <div>
        <p className="text-sm text-mist">{label}</p>
        <p className="text-xs text-ash">{ok ? detail || "Configured & enabled" : "Not configured"}</p>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="glass-card rounded-2xl p-8 text-center text-sm text-ash">{label}</div>;
}

function RankTable({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-mist truncate">{row.label}</span>
            <span className="text-ash font-mono text-xs">{row.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-panel-soft overflow-hidden">
            <div
              className="h-full rounded-full bg-signal"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
