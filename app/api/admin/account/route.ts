import { NextRequest, NextResponse } from "next/server";
import {
  getRecoveryEmail,
  setRecoveryEmail,
  verifyAdminPassword,
  setAdminPassword,
} from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json({ recovery_email: getRecoveryEmail() });
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
  const action = input.action;

  if (action === "set_recovery_email") {
    const email = typeof input.recovery_email === "string" ? input.recovery_email.trim() : "";
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    setRecoveryEmail(email || null);
    return NextResponse.json({ recovery_email: getRecoveryEmail() });
  }

  if (action === "change_password") {
    const currentPassword = typeof input.current_password === "string" ? input.current_password : "";
    const newPassword = typeof input.new_password === "string" ? input.new_password : "";

    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }
    setAdminPassword(newPassword);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
