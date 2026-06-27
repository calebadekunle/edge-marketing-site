import { getSeoSettings, DEFAULT_SITE_TITLE, DEFAULT_META_DESCRIPTION } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import SeoSettingsForm from "./SeoSettingsForm";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  if (!(await isAdminAuthorized())) notFound();

  const seo = getSeoSettings();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">SEO</h1>
        <p className="text-sm text-ash mt-1">
          What shows up in browser tabs, search results, and link previews —
          plus Google Analytics. Edits here go live immediately, no redeploy.
        </p>
      </div>
      <SeoSettingsForm
        initial={seo}
        defaults={{ site_title: DEFAULT_SITE_TITLE, meta_description: DEFAULT_META_DESCRIPTION }}
      />
    </div>
  );
}
