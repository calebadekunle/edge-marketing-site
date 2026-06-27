import { NextRequest, NextResponse } from "next/server";
import { getWebhook, recordWebhookResult } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { sendTestWebhook } from "@/lib/webhooks";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized())) return unauthorized();

  const id = Number((await params).id);
  const hook = getWebhook(id);
  if (!hook) {
    return NextResponse.json({ ok: false, error: "Webhook not found." }, { status: 404 });
  }

  const result = await sendTestWebhook(hook.url, hook.secret);
  recordWebhookResult(id, result.status);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.status }, { status: 502 });
  }
  return NextResponse.json({ ok: true, status: result.status });
}
