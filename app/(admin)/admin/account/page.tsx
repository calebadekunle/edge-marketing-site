import { getRecoveryEmail } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import AccountSettingsForm from "./AccountSettingsForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!(await isAdminAuthorized())) notFound();

  const recoveryEmail = getRecoveryEmail();

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Account</h1>
        <p className="text-sm text-ash mt-1">
          Your login credentials for this admin panel.
        </p>
      </div>
      <AccountSettingsForm initialRecoveryEmail={recoveryEmail} />
    </div>
  );
}
