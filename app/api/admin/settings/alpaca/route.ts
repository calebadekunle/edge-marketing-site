import { NextRequest, NextResponse } from "next/server";
import { getAlpacaSettingsSafe, setAlpacaSettings } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json(getAlpacaSettingsSafe());
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
  const keyId = typeof input.key_id === "string" ? input.key_id.trim() : "";
  const rawSecretKey = input.secret_key;
  const secretKey =
    typeof rawSecretKey === "string" && rawSecretKey.length > 0 ? rawSecretKey : undefined;

  setAlpacaSettings({ key_id: keyId || null, secret_key: secretKey });
  return NextResponse.json(getAlpacaSettingsSafe());
}
