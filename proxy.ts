import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;

  // Fail closed: if credentials aren't configured in the environment,
  // block admin access entirely rather than leaving it open.
  if (!user || !pass) return unauthorized();

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
  } catch {
    return unauthorized();
  }

  const sepIndex = decoded.indexOf(":");
  const suppliedUser = decoded.slice(0, sepIndex);
  const suppliedPass = decoded.slice(sepIndex + 1);

  if (suppliedUser !== user || suppliedPass !== pass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
