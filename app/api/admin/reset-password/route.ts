import { NextRequest, NextResponse } from "next/server";
import { consumePasswordResetToken, setAdminPassword } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { token, newPassword } = (body ?? {}) as { token?: unknown; newPassword?: unknown };

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const valid = consumePasswordResetToken(token);
  if (!valid) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  setAdminPassword(newPassword);

  // Log the admin straight in — they just proved control of the recovery
  // email, no reason to make them type the new password again immediately.
  const sessionToken = createSessionToken();
  const res = NextResponse.json({ ok: true });
  if (sessionToken) {
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions);
  }
  return res;
}
