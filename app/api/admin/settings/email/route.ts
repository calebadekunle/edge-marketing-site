import { NextRequest, NextResponse } from "next/server";
import { getSmtpSettingsSafe, setSmtpSettings } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json(getSmtpSettingsSafe());
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
  const host = typeof input.host === "string" ? input.host.trim() : "";
  const port = Number(input.port);
  const secure = input.secure === true;
  const username = typeof input.username === "string" ? input.username.trim() : "";
  const fromEmail = typeof input.from_email === "string" ? input.from_email.trim() : "";
  const notifyEmail = typeof input.notify_email === "string" ? input.notify_email.trim() : "";
  // Password is only updated if a non-empty string was sent. An empty
  // string or omitted field means "leave the existing password alone" —
  // the browser never receives the real value back, so it can't round-trip
  // a deliberate change vs. an untouched masked field.
  const rawPassword = input.password;
  const password =
    typeof rawPassword === "string" && rawPassword.length > 0 ? rawPassword : undefined;

  if (enabled) {
    if (!host) {
      return NextResponse.json({ error: "Host is required to enable email notifications." }, { status: 400 });
    }
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      return NextResponse.json({ error: "Port must be a valid number (e.g. 587)." }, { status: 400 });
    }
    if (!fromEmail || !EMAIL_RE.test(fromEmail)) {
      return NextResponse.json({ error: "A valid 'from' email address is required." }, { status: 400 });
    }
    if (!notifyEmail || !EMAIL_RE.test(notifyEmail)) {
      return NextResponse.json(
        { error: "A valid notification ('send to') email address is required." },
        { status: 400 }
      );
    }
  }

  setSmtpSettings({
    enabled,
    host: host || null,
    port: Number.isFinite(port) && port > 0 ? port : null,
    secure,
    username: username || null,
    password,
    from_email: fromEmail || null,
    notify_email: notifyEmail || null,
  });

  return NextResponse.json(getSmtpSettingsSafe());
}
