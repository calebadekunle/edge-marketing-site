"use client";

import { useState } from "react";
import Script from "next/script";

export default function WaitlistForm({
  redirectUrl,
  recaptchaSiteKey,
}: {
  redirectUrl?: string | null;
  recaptchaSiteKey?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (status === "done") {
    return (
      <div className="rounded-xl border border-signal/50 bg-signal-dim p-5 text-center">
        <p className="text-signal font-semibold">You&apos;re on the list.</p>
        <p className="text-sm text-mist/80 mt-1">
          We&apos;ll email {email} when EDGE opens up.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");

        if (!consent) {
          setError("Please agree to the Privacy Policy to continue.");
          return;
        }

        let recaptchaToken: string | null = null;
        if (recaptchaSiteKey) {
          // grecaptcha is a global injected by the script below — there's
          // no official npm types for it, hence the cast.
          recaptchaToken = (window as unknown as { grecaptcha?: { getResponse: () => string } })
            .grecaptcha?.getResponse() || null;
          if (!recaptchaToken) {
            setError("Please complete the reCAPTCHA check.");
            return;
          }
        }

        setStatus("loading");
        try {
          const res = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              consent,
              recaptchaToken,
              referrer: typeof document !== "undefined" ? document.referrer || null : null,
            }),
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            setError(data.error || "Something went wrong. Please try again.");
            setStatus("error");
            return;
          }

          if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
          }

          setStatus("done");
        } catch {
          setError("Network error. Please check your connection and try again.");
          setStatus("error");
        }
      }}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist placeholder:text-ash outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-signal px-6 py-3 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </div>

      <label className="flex items-start gap-2 text-xs text-ash">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-signal"
        />
        <span>
          I agree to the{" "}
          <a href="/privacy" className="text-signal hover:underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {recaptchaSiteKey && (
        <>
          <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
          <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
        </>
      )}

      {error && <p className="text-xs text-alert">{error}</p>}
    </form>
  );
}
