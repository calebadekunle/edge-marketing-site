import { NextRequest, NextResponse } from "next/server";
import { getMailchimpSettings, getMailchimpSettingsSafe, setMailchimpSettings } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json(getMailchimpSettingsSafe());
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized())) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;
  const enabled = input.enabled === true;
  const audienceId = typeof input.audience_id === "string" ? input.audience_id.trim() : "";
  const audienceName = typeof input.audience_name === "string" ? input.audience_name.trim() : "";
  const syncWaitlist = input.sync_waitlist !== false; // default true
  const syncContact = input.sync_contact === true; // default false
  // Same pattern as SMTP password: only update the key if a non-empty
  // string was actually sent. The browser never gets the real value back.
  const rawApiKey = input.api_key;
  const apiKey = typeof rawApiKey === "string" && rawApiKey.length > 0 ? rawApiKey : undefined;

  if (enabled) {
    const existing = getMailchimpSettings();
    const willHaveKey = apiKey !== undefined ? apiKey : existing.api_key;
    if (!willHaveKey) {
      return NextResponse.json(
        { error: "Enter your Mailchimp API key before enabling sync." },
        { status: 400 }
      );
    }
    if (!audienceId) {
      return NextResponse.json(
        { error: "Pick an audience before enabling Mailchimp sync." },
        { status: 400 }
      );
    }
  }

  setMailchimpSettings({
    enabled,
    api_key: apiKey,
    audience_id: audienceId || null,
    audience_name: audienceName || null,
    sync_waitlist: syncWaitlist,
    sync_contact: syncContact,
  });

  return NextResponse.json(getMailchimpSettingsSafe());
}
