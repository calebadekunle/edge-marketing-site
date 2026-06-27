import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { fetchAudiences } from "@/lib/mailchimp";
import { getMailchimpSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized())) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const input = (body ?? {}) as Record<string, unknown>;
  // Use the key the admin is currently typing if they sent one (so this
  // works before the first save); otherwise fall back to the saved key —
  // lets "Refresh audiences" work later without re-entering the key.
  const typedKey = typeof input.api_key === "string" && input.api_key.length > 0 ? input.api_key : null;
  const apiKey = typedKey || getMailchimpSettings().api_key;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Enter an API key first." }, { status: 400 });
  }

  const result = await fetchAudiences(apiKey);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, audiences: result.audiences });
}
