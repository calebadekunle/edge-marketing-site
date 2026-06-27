import { getHomepageContent, DEFAULT_HOMEPAGE_CONTENT } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import HomepageEditorForm from "./HomepageEditorForm";

export const dynamic = "force-dynamic";

export default async function HomepageContentPage() {
  if (!(await isAdminAuthorized())) notFound();

  const content = getHomepageContent();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Homepage</h1>
        <p className="text-sm text-ash mt-1">
          Every piece of text on the homepage, grouped by section in the order
          they appear on the page. The layout, design, and animations stay as
          built — only the words are editable here. Changes go live
          immediately, no redeploy.
        </p>
      </div>
      <HomepageEditorForm initial={content} defaults={DEFAULT_HOMEPAGE_CONTENT} />
    </div>
  );
}
