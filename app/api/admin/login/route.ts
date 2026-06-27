import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/adminSession";
import { verifyAdminPassword } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = process.env.ADMIN_USERNAME;

  if (!user || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin credentials aren't configured on the server." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as { username?: unknown; password?: unknown };

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username !== user ||
    !verifyAdminPassword(password)
  ) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Could not create a session." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
