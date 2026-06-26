import nodemailer from "nodemailer";
import { getSmtpSettings, SmtpSettings } from "@/lib/db";

function isConfigured(s: SmtpSettings): boolean {
  return (
    s.enabled &&
    !!s.host &&
    !!s.port &&
    !!s.from_email &&
    !!s.notify_email
  );
}

function buildTransporter(s: SmtpSettings) {
  return nodemailer.createTransport({
    host: s.host!,
    port: s.port!,
    secure: s.secure, // true = implicit TLS (typically port 465), false = STARTTLS (typically port 587)
    auth: s.username
      ? { user: s.username, pass: s.password || "" }
      : undefined,
  });
}

type NotificationInput = {
  subject: string;
  text: string;
  html: string;
};

// Always resolves, never throws — a broken mail server should never break
// a form submission. Returns whether a send was actually attempted, mainly
// so the test-email endpoint can surface a clear "not configured" message.
export async function sendAdminNotification(
  input: NotificationInput
): Promise<{ attempted: boolean; error?: string }> {
  const settings = getSmtpSettings();

  if (!isConfigured(settings)) {
    return { attempted: false };
  }

  try {
    const transporter = buildTransporter(settings);
    await transporter.sendMail({
      from: settings.from_email!,
      to: settings.notify_email!,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { attempted: true };
  } catch (err) {
    console.error("[email] Failed to send admin notification:", err);
    return {
      attempted: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function waitlistNotification(input: {
  email: string;
  ip: string | null;
  referrer: string | null;
}): NotificationInput {
  const subject = `New EDGE waitlist signup: ${input.email}`;
  const lines = [
    `Email: ${input.email}`,
    `IP address: ${input.ip || "—"}`,
    `Referrer: ${input.referrer || "Direct"}`,
    `Time: ${new Date().toLocaleString()}`,
  ];
  return {
    subject,
    text: lines.join("\n"),
    html: `<p>${lines.join("<br>")}</p>`,
  };
}

export function contactNotification(input: {
  name: string;
  email: string;
  message: string;
  ip: string | null;
  referrer: string | null;
}): NotificationInput {
  const subject = `New EDGE contact message from ${input.name}`;
  const lines = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `IP address: ${input.ip || "—"}`,
    `Referrer: ${input.referrer || "Direct"}`,
    `Time: ${new Date().toLocaleString()}`,
    "",
    "Message:",
    input.message,
  ];
  return {
    subject,
    text: lines.join("\n"),
    html: `<p>${lines.slice(0, 5).join("<br>")}</p><p><strong>Message:</strong><br>${escapeHtml(
      input.message
    ).replace(/\n/g, "<br>")}</p>`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
