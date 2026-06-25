"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (status === "done") {
    return (
      <div className="rounded-xl border border-signal/50 bg-signal-dim p-5 text-center">
        <p className="text-signal font-semibold">Message received.</p>
        <p className="text-sm text-mist/80 mt-1">
          We&apos;ll get back to {form.email || "you"} as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");

        if (!consent) {
          setError("Please agree to the Privacy Policy to continue.");
          return;
        }

        setStatus("loading");
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...form,
              consent,
              referrer: typeof document !== "undefined" ? document.referrer || null : null,
            }),
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            setError(data.error || "Something went wrong. Please try again.");
            setStatus("error");
            return;
          }

          setStatus("done");
        } catch {
          setError("Network error. Please check your connection and try again.");
          setStatus("error");
        }
      }}
    >
      <div>
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-2 w-full rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist outline-none focus:border-signal"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-2 w-full rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist outline-none focus:border-signal"
        />
      </div>
      <div>
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-2 w-full rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist outline-none focus:border-signal resize-none"
        />
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

      {error && <p className="text-xs text-alert">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-signal px-6 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
