import crypto from "crypto";
import { getMailchimpSettings } from "@/lib/db";

function parseDatacenter(apiKey: string): string | null {
  const idx = apiKey.lastIndexOf("-");
  if (idx === -1) return null;
  const dc = apiKey.slice(idx + 1);
  return dc || null;
}

function getBaseUrl(apiKey: string): string | null {
  const dc = parseDatacenter(apiKey);
  if (!dc) return null;
  return `https://${dc}.api.mailchimp.com/3.0`;
}

async function mailchimpFetch(
  apiKey: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const base = getBaseUrl(apiKey);
  if (!base) {
    throw new Error(
      "That doesn't look like a Mailchimp API key — expected one ending in '-usXX' (your data center suffix)."
    );
  }
  // Without this, an unreachable host or a slow Mailchimp response could
  // hang indefinitely — same gap that was fixed for SMTP and webhooks.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`anystring:${apiKey}`).toString("base64"),
        ...(init?.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readMailchimpError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.detail || data.title || `Mailchimp returned ${res.status}`;
  } catch {
    return `Mailchimp returned ${res.status}`;
  }
}

export type MailchimpAudience = { id: string; name: string };

// Used both as the "fetch audiences for the dropdown" call AND as the de
// facto "test connection" button — a successful fetch proves the key works.
export async function fetchAudiences(
  apiKey: string
): Promise<{ ok: true; audiences: MailchimpAudience[] } | { ok: false; error: string }> {
  try {
    const res = await mailchimpFetch(apiKey, "/lists?count=100");
    if (!res.ok) {
      return { ok: false, error: await readMailchimpError(res) };
    }
    const data = await res.json();
    const audiences: MailchimpAudience[] = (data.lists || []).map(
      (l: { id: string; name: string }) => ({ id: l.id, name: l.name })
    );
    return { ok: true, audiences };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Always resolves, never throws — same resilience contract as
// sendAdminNotification in lib/email.ts. A Mailchimp outage or bad API key
// should never break a form submission.
export async function subscribeToAudience(input: {
  email: string;
  name?: string | null;
  tag: string;
}): Promise<{ attempted: boolean; error?: string }> {
  const settings = getMailchimpSettings();

  if (!settings.enabled || !settings.api_key || !settings.audience_id) {
    return { attempted: false };
  }

  try {
    const cleanEmail = input.email.trim().toLowerCase();
    const hash = crypto.createHash("md5").update(cleanEmail).digest("hex");

    const mergeFields: Record<string, string> = {};
    if (input.name) {
      const [first, ...rest] = input.name.trim().split(/\s+/);
      if (first) mergeFields.FNAME = first;
      if (rest.length) mergeFields.LNAME = rest.join(" ");
    }

    const putRes = await mailchimpFetch(
      settings.api_key,
      `/lists/${settings.audience_id}/members/${hash}`,
      {
        method: "PUT",
        body: JSON.stringify({
          email_address: cleanEmail,
          status_if_new: "subscribed",
          merge_fields: mergeFields,
        }),
      }
    );

    if (!putRes.ok) {
      const error = await readMailchimpError(putRes);
      console.error("[mailchimp] Failed to add/update member:", error);
      return { attempted: true, error };
    }

    // Tags are a separate call in Mailchimp's API — best-effort, doesn't
    // fail the whole subscribe if it errors (the member is already added).
    try {
      await mailchimpFetch(
        settings.api_key,
        `/lists/${settings.audience_id}/members/${hash}/tags`,
        {
          method: "POST",
          body: JSON.stringify({ tags: [{ name: input.tag, status: "active" }] }),
        }
      );
    } catch (tagErr) {
      console.error("[mailchimp] Member added but tagging failed:", tagErr);
    }

    return { attempted: true };
  } catch (err) {
    console.error("[mailchimp] Failed to subscribe:", err);
    return { attempted: true, error: err instanceof Error ? err.message : String(err) };
  }
}
