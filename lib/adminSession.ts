import crypto from "crypto";

export const SESSION_COOKIE = "edge_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days — this is a low-traffic internal tool, not worth re-logging-in often

// Signing key is derived from the admin password itself — anyone who
// could forge a valid session already has the actual password and full
// access anyway, so this introduces no new secret to manage. Same
// HMAC-signing pattern already used for webhook payloads.
function getSigningKey(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null;
  return `edge-admin-session-v1:${pass}`;
}

function sign(payload: string, key: string): string {
  return crypto.createHmac("sha256", key).update(payload).digest("hex");
}

export function createSessionToken(): string | null {
  const key = getSigningKey();
  if (!key) return null;

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString("base64url");
  const signature = sign(payload, key);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const key = getSigningKey();
  if (!key) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload, key);
  // Constant-time comparison — avoids leaking timing information about
  // how many characters of the signature matched.
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
