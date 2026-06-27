import {
  countPageviews,
  countPageviewsForPath,
  countWaitlistSignups,
  countContactSubmissions,
  getTopPaths,
  getTopReferrers,
  getDailyPageviews,
  getSmtpSettingsSafe,
  getMailchimpSettingsSafe,
  getWebhooksSafe,
} from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import { Eye, TrendingUp, MessageSquare, Webhook, Mail, BarChart3 } from "lucide-react";
import StatCard from "../../_components/StatCard";
import TrendAreaChart from "../../_components/TrendAreaChart";
import RankBarChart from "../../_components/RankBarChart";
import ReferrerDonutChart from "../../_components/ReferrerDonutChart";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  if (!(await isAdminAuthorized())) notFound();

  const totalPageviews = countPageviews();
  const downloadViews = countPageviewsForPath("/download");
  const contactViews = countPageviewsForPath("/contact");
  const waitlistSignups = countWaitlistSignups();
  const contactSubmissions = countContactSubmissions();
  const topPaths = getTopPaths(8);
  const topReferrers = getTopReferrers(6);
  const pageviewTrend = getDailyPageviews(14);

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
        <StatCard label="Total Pageviews" value={String(totalPageviews)} icon={Eye} accent="signal" />
        <StatCard
          label="Waitlist Conversion"
          value={`${waitlistConversion}%`}
          sub={`${waitlistSignups} of ${downloadViews} visits`}
          icon={TrendingUp}
          accent="spark"
        />
        <StatCard
          label="Contact Conversion"
          value={`${contactConversion}%`}
          sub={`${contactSubmissions} of ${contactViews} visits`}
          icon={MessageSquare}
          accent="pulse"
        />
        <StatCard label="Active Webhooks" value={String(enabledWebhooks)} icon={Webhook} accent="ash" />
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={16} className="text-signal" />
          <h2 className="text-sm font-semibold text-mist">Pageviews — last 14 days</h2>
        </div>
        <TrendAreaChart data={pageviewTrend} color="var(--color-pulse)" label="Pageviews" />
      </div>

      <section>
        <h2 className="text-lg font-bold text-mist mb-3">Integration status</h2>
        <div className="glass-card rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusRow
            label="Email notifications"
            icon={Mail}
            ok={smtp.enabled && !!smtp.host && !!smtp.notify_email}
          />
          <StatusRow
            label="Mailchimp sync"
            icon={TrendingUp}
            ok={mailchimp.enabled && !!mailchimp.audience_id}
          />
          <StatusRow
            label="Webhooks"
            icon={Webhook}
            ok={enabledWebhooks > 0}
            detail={`${enabledWebhooks} active`}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-bold text-mist mb-3">Top pages</h2>
          {topPaths.length === 0 ? (
            <EmptyState label="No pageviews recorded yet." />
          ) : (
            <div className="glass-card rounded-2xl p-5">
              <RankBarChart data={topPaths.map((p) => ({ label: p.path, count: p.count }))} />
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-mist mb-3">Top referrer sources</h2>
          {topReferrers.length === 0 ? (
            <EmptyState label="No traffic sources recorded yet." />
          ) : (
            <div className="glass-card rounded-2xl p-5">
              <ReferrerDonutChart data={topReferrers.map((r) => ({ label: r.referrer, count: r.count }))} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  ok,
  detail,
  icon: Icon,
}: {
  label: string;
  ok: boolean;
  detail?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
          ok ? "bg-signal/10" : "bg-alert/10"
        }`}
      >
        <Icon size={15} className={ok ? "text-signal" : "text-alert"} />
      </span>
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
