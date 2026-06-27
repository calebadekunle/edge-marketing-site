import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminSession";

const PUBLIC_PATHS = [
  "/admin/login",
  "/api/admin/login",
  "/admin/forgot-password",
  "/api/admin/forgot-password",
  "/admin/reset-password",
  "/api/admin/reset-password",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authorized = verifySessionToken(token);

  if (authorized) return NextResponse.next();

  // API calls can't be usefully redirected — a fetch() call needs a JSON
  // 401 it can react to, not a 302 to a login page it'll never render.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
