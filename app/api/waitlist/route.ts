import { NextRequest, NextResponse } from "next/server";
import { addWaitlistSignup, isEmailOnWaitlist, getMailchimpSettings } from "@/lib/db";
import { getClientIp, getReferrer } from "@/lib/clientInfo";
import { sendAdminNotification, waitlistNotification } from "@/lib/email";
import { subscribeToAudience } from "@/lib/mailchimp";
import { triggerWebhooks } from "@/lib/webhooks";
import { checkRecaptcha } from "@/lib/recaptcha";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    email,
    consent,
    referrer: bodyReferrer,
    recaptchaToken,
  } = (body ?? {}) as {
    email?: unknown;
    consent?: unknown;
    referrer?: unknown;
    recaptchaToken?: unknown;
  };

  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const ip = getClientIp(req);

  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (consent !== true) {
    return NextResponse.json(
      { error: "You must agree to the Privacy Policy to join the waitlist." },
      { status: 400 }
    );
  }

  const recaptcha = await checkRecaptcha(
    typeof recaptchaToken === "string" ? recaptchaToken : null,
    ip
  );
  if (recaptcha.required && !recaptcha.passed) {
    return NextResponse.json(
      { error: "reCAPTCHA verification failed — please try again." },
      { status: 400 }
    );
  }

  if (isEmailOnWaitlist(cleanEmail)) {
    return NextResponse.json(
      { error: "That email is already on the waitlist." },
      { status: 409 }
    );
  }

  const referrer = getReferrer(req, typeof bodyReferrer === "string" ? bodyReferrer : null);

  addWaitlistSignup({ email: cleanEmail, ip_address: ip, referrer, consent: true });

  // All three run concurrently (not one-after-another) and all resolve
  // even on failure — so the worst case is bounded by whichever single
  // integration is slowest (~10-15s), not the sum of all three. The lead
  // is already saved above regardless of how any of this goes.
  await Promise.allSettled([
    sendAdminNotification(waitlistNotification({ email: cleanEmail, ip, referrer })),
    getMailchimpSettings().sync_waitlist
      ? subscribeToAudience({ email: cleanEmail, tag: "waitlist" })
      : Promise.resolve(),
    triggerWebhooks("waitlist", { email: cleanEmail, ip_address: ip, referrer, consent: true }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
