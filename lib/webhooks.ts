import crypto from "crypto";
import { getWebhooksForEvent, recordWebhookResult, type WebhookEvent } from "@/lib/db";

function sign(secret: string, body: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function deliver(
  url: string,
  secret: string,
  body: string
): Promise<{ ok: boolean; status: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-EDGE-Signature": sign(secret, body),
      },
      body,
      signal: controller.signal,
    });
    if (res.ok) return { ok: true, status: `${res.status} OK` };
    return { ok: false, status: `HTTP ${res.status}` };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, status: "Timed out after 10s" };
    }
    return { ok: false, status: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timeout);
  }
}

// Always resolves, never throws. A dead or slow webhook endpoint should
// never delay or break a form submission — fires all matching webhooks in
// parallel and records each result for visibility in /admin/webhooks.
export async function triggerWebhooks(
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  const hooks = getWebhooksForEvent(event);
  if (hooks.length === 0) return;

  const body = JSON.stringify({
    event: event === "waitlist" ? "waitlist_signup" : "contact_submission",
    timestamp: new Date().toISOString(),
    ...payload,
  });

  await Promise.all(
    hooks.map(async (hook) => {
      const result = await deliver(hook.url, hook.secret, body);
      try {
        recordWebhookResult(hook.id, result.status);
      } catch (err) {
        console.error("[webhooks] Failed to record result:", err);
      }
      if (!result.ok) {
        console.error(`[webhooks] Delivery to ${hook.url} failed: ${result.status}`);
      }
    })
  );
}

// Used by the "Send test" button in admin — same delivery path, but
// records and returns the result directly instead of firing in the
// background, and doesn't require an event to already be configured.
export async function sendTestWebhook(
  url: string,
  secret: string
): Promise<{ ok: boolean; status: string }> {
  const body = JSON.stringify({
    event: "test",
    timestamp: new Date().toISOString(),
    message: "This is a test webhook from your EDGE admin.",
  });
  return deliver(url, secret, body);
}
