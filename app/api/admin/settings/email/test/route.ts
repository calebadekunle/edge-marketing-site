import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { sendAdminNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="EDGE Admin"' },
  });
}

export async function POST() {
  if (!(await isAdminAuthorized())) return unauthorized();

  const result = await sendAdminNotification({
    subject: "EDGE admin — test email",
    text: "If you're reading this, your SMTP settings are working correctly.",
    html: "<p>If you're reading this, your SMTP settings are working correctly.</p>",
  });

  if (!result.attempted) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Notifications aren't fully configured yet — check that Enabled is on and Host/Port/From/Send to are all filled in.",
      },
      { status: 400 }
    );
  }

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
