import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { addWebhook, getWebhooksSafe, type WebhookEvent } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

const VALID_EVENTS: WebhookEvent[] = ["waitlist", "contact"];

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json(getWebhooksSafe());
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
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const events = Array.isArray(input.events)
    ? input.events.filter((e): e is WebhookEvent => VALID_EVENTS.includes(e as WebhookEvent))
    : [];

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    return NextResponse.json({ error: "Enter a valid webhook URL (https://...)." }, { status: 400 });
  }

  if (events.length === 0) {
    return NextResponse.json(
      { error: "Pick at least one event to trigger this webhook." },
      { status: 400 }
    );
  }

  const secret = crypto.randomBytes(24).toString("hex");
  addWebhook({ url, events, secret });

  return NextResponse.json(getWebhooksSafe(), { status: 201 });
}
