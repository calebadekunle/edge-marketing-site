"use client";

import { useState } from "react";

export default function AccountSettingsForm({
  initialRecoveryEmail,
}: {
  initialRecoveryEmail: string | null;
}) {
  const [recoveryEmail, setRecoveryEmail] = useState(initialRecoveryEmail ?? "");
  const [emailStatus, setEmailStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  async function saveRecoveryEmail() {
    setEmailStatus("saving");
    setEmailError("");
    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_recovery_email", recovery_email: recoveryEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Something went wrong.");
        setEmailStatus("error");
        return;
      }
      setEmailStatus("saved");
    } catch {
      setEmailError("Network error. Please try again.");
      setEmailStatus("error");
    }
  }

  async function changePassword() {
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("New passwords don't match.");
      setPwStatus("error");
      return;
    }
    setPwStatus("saving");
    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Something went wrong.");
        setPwStatus("error");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwStatus("saved");
    } catch {
      setPwError("Network error. Please try again.");
      setPwStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-mist">Recovery email</h2>
        <p className="text-xs text-ash">
          Required for &quot;Forgot password?&quot; on the login screen to work at
          all — without this set, there's nowhere to send a reset link.
        </p>
        <input
          type="email"
          value={recoveryEmail}
          onChange={(e) => setRecoveryEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
        <div className="flex items-center gap-3 pt-2 border-t border-hairline">
          <button
            onClick={saveRecoveryEmail}
            disabled={emailStatus === "saving"}
            className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
          >
            {emailStatus === "saving" ? "Saving…" : "Save"}
          </button>
          {emailStatus === "saved" && <span className="text-xs text-signal">Saved.</span>}
          {emailStatus === "error" && <span className="text-xs text-alert">{emailError}</span>}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-mist">Change password</h2>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ash">
            Current password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ash">
            New password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ash">
            Confirm new password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-hairline">
          <button
            onClick={changePassword}
            disabled={pwStatus === "saving"}
            className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
          >
            {pwStatus === "saving" ? "Saving…" : "Change password"}
          </button>
          {pwStatus === "saved" && <span className="text-xs text-signal">Password changed.</span>}
          {pwStatus === "error" && <span className="text-xs text-alert">{pwError}</span>}
        </div>
      </div>
    </div>
  );
}
