"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="text-2xl font-bold text-signal">EDGE</span>
        <span className="ml-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash">
          Admin
        </span>
      </div>

      {status === "done" ? (
        <div className="glass-card rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm text-signal font-semibold">Check your email</p>
          <p className="text-sm text-ash">{message}</p>
          <Link href="/admin/login" className="text-xs text-signal hover:underline inline-block">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form
          className="glass-card rounded-2xl p-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus("loading");
            setMessage("");
            try {
              const res = await fetch("/api/admin/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const data = await res.json();
              if (!res.ok) {
                setMessage(data.error || "Something went wrong.");
                setStatus("error");
                return;
              }
              setMessage(data.message);
              setStatus("done");
            } catch {
              setMessage("Network error. Please try again.");
              setStatus("error");
            }
          }}
        >
          <div>
            <p className="text-sm text-mist mb-1">Forgot your password?</p>
            <p className="text-xs text-ash mb-4">
              Enter the recovery email on file and we&apos;ll send a reset link.
            </p>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-ash">
              Recovery email
            </label>
            <input
              id="email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
            />
          </div>

          {status === "error" && <p className="text-xs text-alert">{message}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send reset link"}
          </button>

          <Link
            href="/admin/login"
            className="block text-center text-xs text-ash hover:text-signal transition-colors"
          >
            ← Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
