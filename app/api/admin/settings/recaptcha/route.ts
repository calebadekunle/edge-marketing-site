import { NextRequest, NextResponse } from "next/server";
import { getRecaptchaSettings, getRecaptchaSettingsSafe, setRecaptchaSettings } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json(getRecaptchaSettingsSafe());
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized())) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;
  const enabled = input.enabled === true;
  const siteKey = typeof input.site_key === "string" ? input.site_key.trim() : "";
  // Same pattern as the other secrets: only update if a non-empty string
  // was actually sent. The browser never gets the real value back.
  const rawSecretKey = input.secret_key;
  const secretKey =
    typeof rawSecretKey === "string" && rawSecretKey.length > 0 ? rawSecretKey : undefined;

  if (enabled) {
    const existing = getRecaptchaSettings();
    const willHaveSecret = secretKey !== undefined ? secretKey : existing.secret_key;
    if (!siteKey || !willHaveSecret) {
      return NextResponse.json(
        { error: "Both a site key and secret key are required to enable reCAPTCHA." },
        { status: 400 }
      );
    }
  }

  setRecaptchaSettings({ enabled, site_key: siteKey || null, secret_key: secretKey });
  return NextResponse.json(getRecaptchaSettingsSafe());
}
