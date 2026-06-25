import { getWaitlistSignups, getContactSubmissions } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  if (!(await isAdminAuthorized())) notFound();

  const waitlist = getWaitlistSignups(200);
  const contacts = getContactSubmissions(200);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Submissions</h1>
        <p className="text-sm text-ash mt-1">
          {waitlist.length} total waitlist signups · showing latest 200 of each below.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-bold text-mist mb-3">Waitlist ({waitlist.length})</h2>
        {waitlist.length === 0 ? (
          <EmptyState label="No signups yet." />
        ) : (
          <Table
            columns={["Email", "Date", "IP Address", "Referrer", "Consent"]}
            rows={waitlist.map((s) => [
              s.email,
              new Date(s.created_at).toLocaleString(),
              s.ip_address || "—",
              formatReferrer(s.referrer),
              s.consent ? "Yes" : "No",
            ])}
          />
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-mist mb-3">
          Contact submissions ({contacts.length})
        </h2>
        {contacts.length === 0 ? (
          <EmptyState label="No submissions yet." />
        ) : (
          <Table
            columns={["Name", "Email", "Message", "Date", "IP Address", "Referrer", "Consent"]}
            rows={contacts.map((c) => [
              c.name,
              c.email,
              c.message,
              new Date(c.created_at).toLocaleString(),
              c.ip_address || "—",
              formatReferrer(c.referrer),
              c.consent ? "Yes" : "No",
            ])}
          />
        )}
      </section>
    </div>
  );
}

function formatReferrer(ref: string | null) {
  if (!ref) return "Direct";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}

function EmptyState({ label }: { label: string }) {
  return <div className="glass-card rounded-2xl p-10 text-center text-sm text-ash">{label}</div>;
}

function Table({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="glass-card rounded-2xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            {columns.map((c) => (
              <th
                key={c}
                className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ash whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-panel-soft/40" : ""}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-mist/90 align-top max-w-xs truncate"
                  title={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
