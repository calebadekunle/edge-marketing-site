"use client";

import { useState } from "react";

type MailchimpSettingsSafe = {
  enabled: boolean;
  audience_id: string | null;
  audience_name: string | null;
  sync_waitlist: boolean;
  sync_contact: boolean;
  api_key_last4: string | null;
};

type Audience = { id: string; name: string };

export default function MailchimpSettingsForm({ initial }: { initial: MailchimpSettingsSafe }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [apiKey, setApiKey] = useState(""); // always starts blank, same as the SMTP password field
  const [keyLast4, setKeyLast4] = useState(initial.api_key_last4);
  const [audienceId, setAudienceId] = useState(initial.audience_id ?? "");
  const [audienceName, setAudienceName] = useState(initial.audience_name ?? "");
  const [syncWaitlist, setSyncWaitlist] = useState(initial.sync_waitlist);
  const [syncContact, setSyncContact] = useState(initial.sync_contact);

  const [audiences, setAudiences] = useState<Audience[]>(
    initial.audience_id ? [{ id: initial.audience_id, name: initial.audience_name || initial.audience_id }] : []
  );

  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [fetchError, setFetchError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  async function fetchAudiences() {
    setFetchStatus("loading");
    setFetchError("");
    try {
      const res = await fetch("/api/admin/settings/mailchimp/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only send the key if they typed a new one — otherwise the
        // endpoint falls back to whatever's already saved.
        body: JSON.stringify(apiKey ? { api_key: apiKey } : {}),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFetchError(data.error || "Couldn't connect.");
        setFetchStatus("error");
        return;
      }
      setAudiences(data.audiences);
      if (data.audiences.length === 0) {
        setFetchError("Connected, but no audiences found — create one in Mailchimp first.");
      }
      setFetchStatus("done");
    } catch {
      setFetchError("Network error. Please try again.");
      setFetchStatus("error");
    }
  }

  async function save() {
    setSaveStatus("saving");
    setSaveError("");
    try {
      const res = await fetch("/api/admin/settings/mailchimp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          ...(apiKey ? { api_key: apiKey } : {}),
          audience_id: audienceId,
          audience_name: audienceName,
          sync_waitlist: syncWaitlist,
          sync_contact: syncContact,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Something went wrong.");
        setSaveStatus("error");
        return;
      }
      if (apiKey) {
        setKeyLast4(data.api_key_last4);
        setApiKey("");
      }
      setSaveStatus("saved");
    } catch {
      setSaveError("Network error. Please try again.");
      setSaveStatus("error");
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <label className="flex items-center justify-between">
        <span className="text-sm text-mist">Mailchimp sync enabled</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 accent-signal"
        />
      </label>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ash">API key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={keyLast4 ? `••••••••${keyLast4}` : "Paste your Mailchimp API key"}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
        <p className="mt-1 text-[11px] text-ash">
          {keyLast4 ? `Set, ending in ${keyLast4} — leave blank to keep it` : "Found in Mailchimp under Account → Extras → API keys"}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold uppercase tracking-wider text-ash">Audience</label>
          <select
            value={audienceId}
            onChange={(e) => {
              setAudienceId(e.target.value);
              const found = audiences.find((a) => a.id === e.target.value);
              setAudienceName(found?.name || "");
            }}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          >
            <option value="">— Select an audience —</option>
            {audiences.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchAudiences}
          disabled={fetchStatus === "loading"}
          className="rounded-xl border border-hairline px-4 py-2.5 text-sm text-ash hover:text-mist transition-colors disabled:opacity-60"
        >
          {fetchStatus === "loading" ? "Connecting…" : "Fetch audiences"}
        </button>
      </div>
      {fetchStatus === "done" && !fetchError && (
        <p className="text-xs text-signal">
          Connected — {audiences.length} audience{audiences.length === 1 ? "" : "s"} found.
        </p>
      )}
      {fetchError && <p className="text-xs text-alert">{fetchError}</p>}

      <div className="space-y-3 pt-2 border-t border-hairline">
        <label className="flex items-center justify-between">
          <span className="text-sm text-mist">
            Sync waitlist signups <span className="text-ash text-xs">(tagged &quot;waitlist&quot;)</span>
          </span>
          <input
            type="checkbox"
            checked={syncWaitlist}
            onChange={(e) => setSyncWaitlist(e.target.checked)}
            className="h-5 w-5 accent-signal"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-mist">
            Sync contact form submissions <span className="text-ash text-xs">(tagged &quot;contact-form&quot;)</span>
          </span>
          <input
            type="checkbox"
            checked={syncContact}
            onChange={(e) => setSyncContact(e.target.checked)}
            className="h-5 w-5 accent-signal"
          />
        </label>
        <p className="text-[11px] text-ash">
          Off by default for contact submissions — agreeing to the Privacy Policy to send a
          message isn&apos;t the same as opting in to a newsletter. Turn this on only if you&apos;re
          comfortable treating contact-form senders as marketing leads.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-hairline">
        <button
          onClick={save}
          disabled={saveStatus === "saving"}
          className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
        >
          {saveStatus === "saving" ? "Saving…" : "Save changes"}
        </button>
        {saveStatus === "saved" && <span className="text-xs text-signal">Saved.</span>}
        {saveStatus === "error" && <span className="text-xs text-alert">{saveError}</span>}
      </div>
    </div>
  );
}
