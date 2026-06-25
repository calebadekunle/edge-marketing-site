import { headers } from "next/headers";

// proxy.ts already gates /admin/* and /api/admin/* with Basic Auth, but
// per Next.js's own guidance, request-interception files shouldn't be the
// ONLY check on sensitive routes (a 2025 middleware bypass — adding an
// x-middleware-subrequest header — let attackers skip auth entirely on
// affected versions). This re-checks the same credentials at the point
// the data is actually read or written, so a future framework-level bug
// in proxy.ts can't expose lead data on its own.
export async function isAdminAuthorized(): Promise<boolean> {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;

  const h = await headers();
  const auth = h.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return false;

  let decoded = "";
  try {
    decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
  } catch {
    return false;
  }

  const sepIndex = decoded.indexOf(":");
  const suppliedUser = decoded.slice(0, sepIndex);
  const suppliedPass = decoded.slice(sepIndex + 1);

  return suppliedUser === user && suppliedPass === pass;
}
