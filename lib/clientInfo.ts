import { NextRequest } from "next/server";

// Behind a reverse proxy (Vercel, or your own nginx on a VPS) the real
// client IP arrives via x-forwarded-for, not the raw socket address.
// We only ever take the FIRST address in that list — it's the one closest
// to the original client; anything appended after it was added by
// intermediate proxies and isn't trustworthy for this purpose.
export function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();

  return null;
}

export function getReferrer(
  req: NextRequest,
  bodyReferrer?: string | null
): string | null {
  // Prefer the value the client captured from document.referrer (works even
  // when the browser strips the Referer header for cross-origin requests),
  // falling back to the request header if the client didn't send one.
  if (bodyReferrer && typeof bodyReferrer === "string") return bodyReferrer;
  return req.headers.get("referer") || null;
}
