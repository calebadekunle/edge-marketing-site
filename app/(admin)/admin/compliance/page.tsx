import { getFooterDisclaimer, DEFAULT_FOOTER_DISCLAIMER } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import DisclaimerEditor from "./DisclaimerEditor";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  if (!(await isAdminAuthorized())) notFound();

  const disclaimer = getFooterDisclaimer();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Compliance</h1>
        <p className="text-sm text-ash mt-1">
          The mandatory disclaimer shown in the footer on every public page.
          Edits here go live immediately — no redeploy, no code change.
        </p>
      </div>
      <DisclaimerEditor initial={disclaimer} defaultText={DEFAULT_FOOTER_DISCLAIMER} />
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ash mb-2">
          Not editable here (by design)
        </p>
        <p className="text-sm text-ash leading-relaxed">
          The &quot;I agree to the Privacy Policy&quot; checkbox on the waitlist and
          contact forms, and the page-specific risk callouts on the homepage,
          AI Discovery, Pricing, Security, Terms, and Privacy pages, stay
          hardcoded in their pages — they&apos;re written for each page&apos;s
          specific context and aren&apos;t the kind of global, single-source-of-
          truth text this editor is for.
        </p>
      </div>
    </div>
  );
}
