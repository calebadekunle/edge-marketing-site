import { NextRequest, NextResponse } from "next/server";
import { getHomepageContent, setHomepageContent, DEFAULT_HOMEPAGE_CONTENT, HomepageContent } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

const MAX_FIELD_LENGTH = 2000;

// Recursively confirms every leaf value in the submitted content is a
// non-empty string within a sane length, and that the shape matches what
// we expect (same keys, same array lengths as the default). Rejecting
// malformed content here is much better than saving something broken
// and finding out when the homepage itself fails to render.
function validate(content: unknown): string | null {
  if (typeof content !== "object" || content === null) return "Invalid content shape.";
  const c = content as Partial<HomepageContent>;

  const checkString = (value: unknown, fieldName: string): string | null => {
    if (typeof value !== "string" || !value.trim()) return `${fieldName} can't be empty.`;
    if (value.length > MAX_FIELD_LENGTH) return `${fieldName} is too long.`;
    return null;
  };

  for (const key of ["eyebrow", "headline_line1", "headline_line2", "subhead", "cta_primary_label", "cta_secondary_label"] as const) {
    const err = checkString(c.hero?.[key], `Hero ${key}`);
    if (err) return err;
  }

  if (!Array.isArray(c.stats) || c.stats.length !== DEFAULT_HOMEPAGE_CONTENT.stats.length) {
    return `Stats must have exactly ${DEFAULT_HOMEPAGE_CONTENT.stats.length} items.`;
  }
  for (const stat of c.stats) {
    const err = checkString(stat?.label, "Stat label") || checkString(stat?.value, "Stat value");
    if (err) return err;
  }

  for (const key of ["eyebrow", "heading", "intro"] as const) {
    const err = checkString(c.signals?.[key], `Signals ${key}`);
    if (err) return err;
  }
  if (
    !Array.isArray(c.signals?.items) ||
    c.signals.items.length !== DEFAULT_HOMEPAGE_CONTENT.signals.items.length
  ) {
    return `Signals must have exactly ${DEFAULT_HOMEPAGE_CONTENT.signals.items.length} items.`;
  }
  for (const item of c.signals.items) {
    const err = checkString(item?.label, "Signal label") || checkString(item?.desc, "Signal description");
    if (err) return err;
  }

  for (const key of ["title", "body"] as const) {
    const err = checkString(c.disclaimer?.[key], `Disclaimer ${key}`);
    if (err) return err;
  }

  for (const key of ["eyebrow", "heading"] as const) {
    const err = checkString(c.features?.[key], `Features ${key}`);
    if (err) return err;
  }
  if (
    !Array.isArray(c.features?.items) ||
    c.features.items.length !== DEFAULT_HOMEPAGE_CONTENT.features.items.length
  ) {
    return `Features must have exactly ${DEFAULT_HOMEPAGE_CONTENT.features.items.length} items.`;
  }
  for (const item of c.features.items) {
    const err = checkString(item?.label, "Feature label") || checkString(item?.desc, "Feature description");
    if (err) return err;
  }

  for (const key of ["heading", "subhead", "button_label"] as const) {
    const err = checkString(c.cta?.[key], `CTA ${key}`);
    if (err) return err;
  }

  for (const key of ["eyebrow", "heading", "subhead"] as const) {
    const err = checkString(c.news?.[key], `News ${key}`);
    if (err) return err;
  }

  return null;
}

export async function GET() {
  if (!(await isAdminAuthorized())) return unauthorized();
  return NextResponse.json({ content: getHomepageContent(), defaults: DEFAULT_HOMEPAGE_CONTENT });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized())) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  setHomepageContent(body as HomepageContent);
  return NextResponse.json({ content: getHomepageContent() });
}
