import { getThemeSettings } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import ThemeEditorForm from "./ThemeEditorForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!(await isAdminAuthorized())) notFound();

  const theme = getThemeSettings();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Settings</h1>
        <p className="text-sm text-ash mt-1">
          Change the colors used across the public marketing site. Changes apply
          immediately — no redeploy needed, just refresh the homepage.
        </p>
      </div>
      <ThemeEditorForm initial={theme} />
    </div>
  );
}
