"use client";

import { useState } from "react";

type FormSettings = {
  waitlist_redirect_url: string | null;
  contact_redirect_url: string | null;
};

export default function FormRedirectsForm({ initial }: { initial: FormSettings }) {
  const [waitlistUrl, setWaitlistUrl] = useState(initial.waitlist_redirect_url ?? "");
  const [contactUrl, setContactUrl] = useState(initial.contact_redirect_url ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/settings/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlist_redirect_url: waitlistUrl,
          contact_redirect_url: contactUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("saved");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ash">
          Waitlist &quot;thank you&quot; redirect
        </label>
        <input
          value={waitlistUrl}
          onChange={(e) => setWaitlistUrl(e.target.value)}
          placeholder="Leave blank to show the inline “You’re on the list” message"
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ash">
          Contact form &quot;thank you&quot; redirect
        </label>
        <input
          value={contactUrl}
          onChange={(e) => setContactUrl(e.target.value)}
          placeholder="Leave blank to show the inline “Message received” message"
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-hairline">
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
