import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_THEME, getThemeSettings, setThemeSetting } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json(getThemeSettings());
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized())) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates = (body ?? {}) as Record<string, unknown>;
  let applied = 0;

  for (const key of Object.keys(DEFAULT_THEME)) {
    const value = updates[key];
    if (typeof value === "string" && HEX_RE.test(value)) {
      setThemeSetting(key, value);
      applied++;
    }
  }

  if (applied === 0) {
    return NextResponse.json(
      { error: "No valid color values were provided. Expected 6-digit hex codes." },
      { status: 400 }
    );
  }

  return NextResponse.json(getThemeSettings());
}
