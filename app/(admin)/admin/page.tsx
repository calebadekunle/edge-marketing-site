import {
  countWaitlistSignups,
  countContactSubmissions,
  getWaitlistSignups,
  getDailySignups,
} from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import { Users, Mail, ShieldCheck, Clock } from "lucide-react";
import StatCard from "../_components/StatCard";
import TrendAreaChart from "../_components/TrendAreaChart";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  if (!(await isAdminAuthorized())) notFound();

  const waitlistCount = countWaitlistSignups();
  const contactCount = countContactSubmissions();
  const recentWaitlist = getWaitlistSignups(1000);
  const consented = recentWaitlist.filter((s) => s.consent).length;
  const consentRate = waitlistCount ? Math.round((consented / waitlistCount) * 100) : 0;
  const lastSignup = recentWaitlist[0];
  const trend = getDailySignups(14);
  const trendTotal = trend.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">
          Overview
        </p>
        <h1 className="text-3xl font-bold text-mist mt-1">Dashboard</h1>
        <p className="text-sm text-ash mt-1">
          Live snapshot of waitlist and contact activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Waitlist Signups"
          value={String(waitlistCount)}
          icon={Users}
          accent="signal"
          trend={trend}
        />
        <StatCard
          label="Contact Submissions"
          value={String(contactCount)}
          icon={Mail}
          accent="pulse"
        />
        <StatCard
          label="Consent Rate"
          value={`${consentRate}%`}
          icon={ShieldCheck}
          accent="spark"
        />
        <StatCard
          label="Last Signup"
          value={lastSignup ? new Date(lastSignup.created_at).toLocaleDateString() : "—"}
          icon={Clock}
          accent="ash"
        />
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-mist">Waitlist signups — last 14 days</h2>
          <span className="text-xs text-ash num">{trendTotal} total</span>
        </div>
        <TrendAreaChart data={trend} color="var(--color-signal)" label="Signups" />
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-sm text-ash">
          Looking for the full lead list? Head to{" "}
          <a href="/admin/submissions" className="text-signal hover:underline">
            Submissions
          </a>
          . Want to change the public site&apos;s colors? Go to{" "}
          <a href="/admin/settings" className="text-signal hover:underline">
            Settings
          </a>
          .
        </p>
      </div>
    </div>
  );
}
