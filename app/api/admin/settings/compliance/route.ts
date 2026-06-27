import { NextRequest, NextResponse } from "next/server";
import { getFooterDisclaimer, setFooterDisclaimer, DEFAULT_FOOTER_DISCLAIMER } from "@/lib/db";
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
  return NextResponse.json({
    footer_disclaimer: getFooterDisclaimer(),
    default: DEFAULT_FOOTER_DISCLAIMER,
  });
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
  const text = typeof input.footer_disclaimer === "string" ? input.footer_disclaimer.trim() : "";

  if (!text) {
    return NextResponse.json(
      { error: "Disclaimer text can't be empty — reset to default instead if you want to clear it." },
      { status: 400 }
    );
  }
  if (text.length > 2000) {
    return NextResponse.json(
      { error: "Keep it under 2000 characters — this renders on every page." },
      { status: 400 }
    );
  }

  setFooterDisclaimer(text);
  return NextResponse.json({ footer_disclaimer: getFooterDisclaimer() });
}
