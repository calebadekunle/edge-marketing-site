import {
  countWaitlistSignups,
  countContactSubmissions,
  getWaitlistSignups,
} from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  if (!(await isAdminAuthorized())) notFound();

  const waitlistCount = countWaitlistSignups();
  const contactCount = countContactSubmissions();
  const recentWaitlist = getWaitlistSignups(1000);
  const consented = recentWaitlist.filter((s) => s.consent).length;
  const consentRate = waitlistCount ? Math.round((consented / waitlistCount) * 100) : 0;
  const lastSignup = recentWaitlist[0];

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
        <StatCard label="Waitlist Signups" value={String(waitlistCount)} />
        <StatCard label="Contact Submissions" value={String(contactCount)} />
        <StatCard label="Consent Rate" value={`${consentRate}%`} />
        <StatCard
          label="Last Signup"
          value={lastSignup ? new Date(lastSignup.created_at).toLocaleDateString() : "—"}
        />
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ash">{label}</p>
      <p className="num text-3xl font-bold text-mist mt-2">{value}</p>
    </div>
  );
}
