import { NextRequest, NextResponse } from "next/server";
import { addContactSubmission, getMailchimpSettings } from "@/lib/db";
import { getClientIp, getReferrer } from "@/lib/clientInfo";
import { sendAdminNotification, contactNotification } from "@/lib/email";
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
    name,
    email,
    message,
    consent,
    referrer: bodyReferrer,
    recaptchaToken,
  } = (body ?? {}) as {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    consent?: unknown;
    referrer?: unknown;
    recaptchaToken?: unknown;
  };

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";
  const ip = getClientIp(req);

  if (!cleanName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!cleanMessage) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (consent !== true) {
    return NextResponse.json(
      { error: "You must agree to the Privacy Policy to send a message." },
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

  const referrer = getReferrer(req, typeof bodyReferrer === "string" ? bodyReferrer : null);

  addContactSubmission({
    name: cleanName,
    email: cleanEmail,
    message: cleanMessage,
    ip_address: ip,
    referrer,
    consent: true,
  });

  // All three run concurrently — see the matching comment in
  // app/api/waitlist/route.ts for why.
  await Promise.allSettled([
    sendAdminNotification(
      contactNotification({ name: cleanName, email: cleanEmail, message: cleanMessage, ip, referrer })
    ),
    getMailchimpSettings().sync_contact
      ? subscribeToAudience({ email: cleanEmail, name: cleanName, tag: "contact-form" })
      : Promise.resolve(),
    triggerWebhooks("contact", {
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      ip_address: ip,
      referrer,
      consent: true,
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
