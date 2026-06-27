"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  return (
    <form
      className="glass-card rounded-2xl p-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("loading");
        setError("");
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error || "Something went wrong.");
            setStatus("error");
            return;
          }
          const next = searchParams.get("next") || "/admin";
          router.push(next);
          router.refresh();
        } catch {
          setError("Network error. Please try again.");
          setStatus("error");
        }
      }}
    >
      <div>
        <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Username
        </label>
        <input
          id="username"
          autoFocus
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
      </div>

      {error && <p className="text-xs text-alert">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>

      <Link
        href="/admin/forgot-password"
        className="block text-center text-xs text-ash hover:text-signal transition-colors"
      >
        Forgot password?
      </Link>
    </form>
  );
}
