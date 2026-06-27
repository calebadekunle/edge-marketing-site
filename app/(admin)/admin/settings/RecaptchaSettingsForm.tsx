"use client";

import { useState } from "react";

type RecaptchaSettingsSafe = {
  enabled: boolean;
  site_key: string | null;
  secret_key_set: boolean;
};

export default function RecaptchaSettingsForm({ initial }: { initial: RecaptchaSettingsSafe }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [siteKey, setSiteKey] = useState(initial.site_key ?? "");
  const [secretKey, setSecretKey] = useState(""); // always starts blank
  const [secretKeySet, setSecretKeySet] = useState(initial.secret_key_set);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/settings/recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          site_key: siteKey,
          ...(secretKey ? { secret_key: secretKey } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      if (secretKey) {
        setSecretKeySet(true);
        setSecretKey("");
      }
      setStatus("saved");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  function useTestKeys() {
    setSiteKey("6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI");
    setSecretKey("6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe");
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <label className="flex items-center justify-between">
        <span className="text-sm text-mist">reCAPTCHA enabled on public forms</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 accent-signal"
        />
      </label>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ash">Site key</label>
        <input
          value={siteKey}
          onChange={(e) => setSiteKey(e.target.value)}
          placeholder="6Lc..."
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal font-mono"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ash">Secret key</label>
        <input
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder={secretKeySet ? "•••••••• — leave blank to keep it" : "Enter secret key"}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal font-mono"
        />
      </div>

      <p className="text-[11px] text-ash">
        Get keys for reCAPTCHA v2 (&quot;I&apos;m not a robot&quot; checkbox) at{" "}
        <a
          href="https://www.google.com/recaptcha/admin/create"
          target="_blank"
          rel="noreferrer"
          className="text-signal hover:underline"
        >
          google.com/recaptcha/admin/create
        </a>
        .{" "}
        <button type="button" onClick={useTestKeys} className="text-signal hover:underline">
          Use Google&apos;s public test keys
        </button>{" "}
        to try this out first — they always pass and show a &quot;not valid for
        production&quot; warning on the widget, so swap to your real keys before
        launch.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-hairline">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && <span className="text-xs text-signal">Saved.</span>}
        {status === "error" && <span className="text-xs text-alert">{error}</span>}
      </div>
    </div>
  );
}
