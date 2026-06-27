import { NextRequest, NextResponse } from "next/server";
import { getSeoSettings, setSeoSettings, DEFAULT_SITE_TITLE, DEFAULT_META_DESCRIPTION } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

const GA_ID_RE = /^G-[A-Z0-9]+$/;

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json({
    ...getSeoSettings(),
    defaults: { site_title: DEFAULT_SITE_TITLE, meta_description: DEFAULT_META_DESCRIPTION },
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
  const siteTitle = typeof input.site_title === "string" ? input.site_title.trim() : "";
  const metaDescription =
    typeof input.meta_description === "string" ? input.meta_description.trim() : "";
  const gaId = typeof input.ga_measurement_id === "string" ? input.ga_measurement_id.trim() : "";

  if (!siteTitle) {
    return NextResponse.json({ error: "Site title can't be empty." }, { status: 400 });
  }
  if (siteTitle.length > 70) {
    return NextResponse.json(
      { error: "Keep the title under 70 characters — longer gets truncated in search results." },
      { status: 400 }
    );
  }
  if (metaDescription.length > 300) {
    return NextResponse.json({ error: "Keep the description under 300 characters." }, { status: 400 });
  }
  if (gaId && !GA_ID_RE.test(gaId)) {
    return NextResponse.json(
      { error: "That doesn't look like a GA4 Measurement ID — expected a format like G-XXXXXXXXXX." },
      { status: 400 }
    );
  }

  setSeoSettings({
    site_title: siteTitle,
    meta_description: metaDescription,
    ga_measurement_id: gaId || null,
  });

  return NextResponse.json(getSeoSettings());
}
