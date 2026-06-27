import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminSession";

// proxy.ts already gates /admin/* and /api/admin/* by checking this same
// session cookie, but per Next.js's own guidance, request-interception
// files shouldn't be the ONLY check on sensitive routes (a 2025 middleware
// bypass — adding an x-middleware-subrequest header — let attackers skip
// auth entirely on affected versions). This re-checks at the point the
// data is actually read or written, so a future framework-level bug in
// proxy.ts can't expose lead data on its own.
export async function isAdminAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
