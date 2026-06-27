import { NextRequest, NextResponse } from "next/server";
import { getRecoveryEmail, createPasswordResetToken, getSmtpSettings } from "@/lib/db";
import { sendToAddress } from "@/lib/email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deliberately returns the SAME generic message whether or not the
// submitted email actually matches the recovery email on file — this is a
// single-admin system, so account enumeration isn't really the threat
// model, but there's no reason to skip the standard practice anyway: it
// costs nothing here and means this code stays correct if that ever
// changes (e.g. multiple admin accounts later).
const GENERIC_RESPONSE = {
  ok: true,
  message: "If that email matches our records, a reset link has been sent.",
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: unknown };
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const smtp = getSmtpSettings();
  if (!smtp.enabled || !smtp.host || !smtp.from_email) {
    // This is a system configuration state, not account info — safe to
    // say plainly rather than hiding behind the generic message.
    return NextResponse.json(
      {
        error:
          "Email delivery isn't configured yet, so password resets can't be sent. Set up SMTP in Settings first.",
      },
      { status: 503 }
    );
  }

  const recoveryEmail = getRecoveryEmail();
  if (!recoveryEmail || recoveryEmail.toLowerCase() !== cleanEmail) {
    // Doesn't match (or no recovery email set at all) — still return the
    // generic success response, don't send anything.
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const token = createPasswordResetToken();
  const resetUrl = new URL("/admin/reset-password", req.url);
  resetUrl.searchParams.set("token", token);

  await sendToAddress(recoveryEmail, {
    subject: "Reset your EDGE admin password",
    text: `Someone requested a password reset for the EDGE admin panel.\n\nReset it here (expires in 30 minutes): ${resetUrl.toString()}\n\nIf you didn't request this, you can ignore this email — your password won't change.`,
    html: `<p>Someone requested a password reset for the EDGE admin panel.</p><p><a href="${resetUrl.toString()}">Reset your password</a> (expires in 30 minutes)</p><p>If you didn't request this, you can ignore this email — your password won't change.</p>`,
  });

  return NextResponse.json(GENERIC_RESPONSE);
}
