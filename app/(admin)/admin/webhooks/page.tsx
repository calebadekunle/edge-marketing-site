import { getWebhooksSafe } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import WebhooksManager from "./WebhooksManager";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  if (!(await isAdminAuthorized())) notFound();

  const webhooks = getWebhooksSafe();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Admin</p>
        <h1 className="text-3xl font-bold text-mist mt-1">Webhooks</h1>
        <p className="text-sm text-ash mt-1">
          Push lead data to any external URL — Zapier, a CRM, a Slack incoming
          webhook, your own server. Each request is signed so the receiving
          end can verify it really came from here.
        </p>
      </div>
      <WebhooksManager initial={webhooks} />
    </div>
  );
}
