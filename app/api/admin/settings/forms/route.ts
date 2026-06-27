import { NextRequest, NextResponse } from "next/server";
import { getFormSettings, setFormSettings } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function isValidUrlOrEmpty(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json(getFormSettings());
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
  const waitlistUrl = typeof input.waitlist_redirect_url === "string" ? input.waitlist_redirect_url.trim() : "";
  const contactUrl = typeof input.contact_redirect_url === "string" ? input.contact_redirect_url.trim() : "";

  if (!isValidUrlOrEmpty(waitlistUrl)) {
    return NextResponse.json(
      { error: "Waitlist redirect must be a full URL (https://...) or left blank." },
      { status: 400 }
    );
  }
  if (!isValidUrlOrEmpty(contactUrl)) {
    return NextResponse.json(
      { error: "Contact redirect must be a full URL (https://...) or left blank." },
      { status: 400 }
    );
  }

  setFormSettings({
    waitlist_redirect_url: waitlistUrl || null,
    contact_redirect_url: contactUrl || null,
  });

  return NextResponse.json(getFormSettings());
}
