"use client";

import { useState } from "react";

type SmtpSettingsSafe = {
  enabled: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  username: string | null;
  from_email: string | null;
  notify_email: string | null;
  password_set: boolean;
};

export default function EmailSettingsForm({ initial }: { initial: SmtpSettingsSafe }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [host, setHost] = useState(initial.host ?? "");
  const [port, setPort] = useState(initial.port?.toString() ?? "587");
  const [secure, setSecure] = useState(initial.secure);
  const [username, setUsername] = useState(initial.username ?? "");
  const [password, setPassword] = useState(""); // always starts blank — see note below
  const [fromEmail, setFromEmail] = useState(initial.from_email ?? "");
  const [notifyEmail, setNotifyEmail] = useState(initial.notify_email ?? "");
  const [passwordSet, setPasswordSet] = useState(initial.password_set);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [testError, setTestError] = useState("");

  async function save() {
    setSaveStatus("saving");
    setSaveError("");
    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          host,
          port: Number(port),
          secure,
          username,
          // Only send a password field if the admin actually typed one —
          // an empty string here means "leave the saved password as is."
          ...(password ? { password } : {}),
          from_email: fromEmail,
          notify_email: notifyEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Something went wrong.");
        setSaveStatus("error");
        return;
      }
      if (password) {
        setPasswordSet(true);
        setPassword("");
      }
      setSaveStatus("saved");
    } catch {
      setSaveError("Network error. Please try again.");
      setSaveStatus("error");
    }
  }

  async function sendTest() {
    setTestStatus("sending");
    setTestError("");
    try {
      const res = await fetch("/api/admin/settings/email/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setTestError(data.error || "Test send failed.");
        setTestStatus("error");
        return;
      }
      setTestStatus("sent");
    } catch {
      setTestError("Network error. Please try again.");
      setTestStatus("error");
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <label className="flex items-center justify-between">
        <span className="text-sm text-mist">Email notifications enabled</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 accent-signal"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="SMTP host" hint="e.g. smtp.office365.com">
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="smtp.office365.com"
            className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </Field>
        <Field label="Port" hint="587 = STARTTLS, 465 = TLS">
          <input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            inputMode="numeric"
            placeholder="587"
            className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </Field>
        <Field label="Username" hint="usually the mailbox address">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@yourcompany.com"
            className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </Field>
        <Field label="Password" hint={passwordSet ? "Set — leave blank to keep it" : "Not set yet"}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={passwordSet ? "••••••••" : "Enter password"}
            className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </Field>
        <Field label="From address" hint="must usually match the mailbox above">
          <input
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="you@yourcompany.com"
            className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </Field>
        <Field label="Send notifications to" hint="where you want to receive them">
          <input
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="you@yourcompany.com"
            className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
        </Field>
      </div>

      <label className="flex items-center justify-between">
        <span className="text-sm text-mist">
          Use TLS from the start <span className="text-ash text-xs">(off = STARTTLS, the usual choice for port 587)</span>
        </span>
        <input
          type="checkbox"
          checked={secure}
          onChange={(e) => setSecure(e.target.checked)}
          className="h-5 w-5 accent-signal"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-hairline">
        <button
          onClick={save}
          disabled={saveStatus === "saving"}
          className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
        >
          {saveStatus === "saving" ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={sendTest}
          disabled={testStatus === "sending"}
          className="rounded-xl border border-hairline px-5 py-2.5 text-sm text-ash hover:text-mist transition-colors disabled:opacity-60"
        >
          {testStatus === "sending" ? "Sending…" : "Send test email"}
        </button>

        {saveStatus === "saved" && <span className="text-xs text-signal">Saved.</span>}
        {saveStatus === "error" && <span className="text-xs text-alert">{saveError}</span>}
        {testStatus === "sent" && (
          <span className="text-xs text-signal">Sent — check the inbox above.</span>
        )}
        {testStatus === "error" && <span className="text-xs text-alert">{testError}</span>}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-ash">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-ash">{hint}</p>}
    </div>
  );
}
