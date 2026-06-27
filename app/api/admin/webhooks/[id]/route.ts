import { NextRequest, NextResponse } from "next/server";
import { deleteWebhook, getWebhook, getWebhooksSafe, setWebhookEnabled } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized())) return unauthorized();

  const id = Number((await params).id);
  if (!getWebhook(id)) {
    return NextResponse.json({ error: "Webhook not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;
  if (typeof input.enabled === "boolean") {
    setWebhookEnabled(id, input.enabled);
  }

  return NextResponse.json(getWebhooksSafe());
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized())) return unauthorized();

  const id = Number((await params).id);
  if (!getWebhook(id)) {
    return NextResponse.json({ error: "Webhook not found." }, { status: 404 });
  }

  deleteWebhook(id);
  return NextResponse.json(getWebhooksSafe());
}
