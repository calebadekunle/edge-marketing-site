import { NextRequest, NextResponse } from "next/server";
import { addPageview } from "@/lib/db";
import { getClientIp, getReferrer } from "@/lib/clientInfo";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { path, referrer: bodyReferrer } = (body ?? {}) as {
    path?: unknown;
    referrer?: unknown;
  };

  const cleanPath = typeof path === "string" && path.startsWith("/") ? path.slice(0, 200) : null;
  if (!cleanPath) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = getClientIp(req);
  const referrer = getReferrer(req, typeof bodyReferrer === "string" ? bodyReferrer : null);

  try {
    addPageview({ path: cleanPath, referrer, ip_address: ip });
  } catch (err) {
    // Never let a tracking failure surface as an error to the visitor —
    // this is a beacon, not a critical path.
    console.error("[track] Failed to record pageview:", err);
  }

  return NextResponse.json({ ok: true });
}
