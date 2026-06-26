import { NextRequest, NextResponse } from "next/server";
import { addWaitlistSignup, isEmailOnWaitlist } from "@/lib/db";
import { getClientIp, getReferrer } from "@/lib/clientInfo";
import { sendAdminNotification, waitlistNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, consent, referrer: bodyReferrer } = (body ?? {}) as {
    email?: unknown;
    consent?: unknown;
    referrer?: unknown;
  };

  const cleanEmail = typeof email === "string" ? email.trim() : "";

  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (consent !== true) {
    return NextResponse.json(
      { error: "You must agree to the Privacy Policy to join the waitlist." },
      { status: 400 }
    );
  }

  if (isEmailOnWaitlist(cleanEmail)) {
    return NextResponse.json(
      { error: "That email is already on the waitlist." },
      { status: 409 }
    );
  }

  const ip = getClientIp(req);
  const referrer = getReferrer(req, typeof bodyReferrer === "string" ? bodyReferrer : null);

  addWaitlistSignup({ email: cleanEmail, ip_address: ip, referrer, consent: true });

  // Awaited (not fire-and-forget) so this completes before a serverless
  // function can exit — but sendAdminNotification never throws, so a
  // misconfigured or unreachable mail server can't fail this request.
  await sendAdminNotification(waitlistNotification({ email: cleanEmail, ip, referrer }));

  return NextResponse.json({ ok: true }, { status: 201 });
}
