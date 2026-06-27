"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      }),
    }).catch(() => {
      // Tracking is best-effort — a failed beacon should never be visible
      // to the visitor or logged as a page error.
    });
  }, [pathname]);

  return null;
}
