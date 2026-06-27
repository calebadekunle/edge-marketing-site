"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-alert">Missing or invalid reset link.</p>
        <Link href="/admin/forgot-password" className="text-xs text-signal hover:underline">
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <form
      className="glass-card rounded-2xl p-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
          setError("Passwords don't match.");
          return;
        }
        if (newPassword.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }

        setStatus("loading");
        try {
          const res = await fetch("/api/admin/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Something went wrong.");
            setStatus("error");
            return;
          }
          router.push("/admin");
          router.refresh();
        } catch {
          setError("Network error. Please try again.");
          setStatus("error");
        }
      }}
    >
      <p className="text-sm text-mist mb-1">Choose a new password</p>
      <div>
        <label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-ash">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoFocus
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
      </div>

      {error && <p className="text-xs text-alert">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
