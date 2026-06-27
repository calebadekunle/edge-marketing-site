"use client";

import { useState } from "react";

type WebhookSafe = {
  id: number;
  url: string;
  secret_last4: string;
  events: ("waitlist" | "contact")[];
  enabled: boolean;
  created_at: string;
  last_triggered_at: string | null;
  last_status: string | null;
};

export default function WebhooksManager({ initial }: { initial: WebhookSafe[] }) {
  const [webhooks, setWebhooks] = useState(initial);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<("waitlist" | "contact")[]>(["waitlist", "contact"]);
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "error">("idle");
  const [addError, setAddError] = useState("");
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<Record<number, string>>({});

  function toggleNewEvent(ev: "waitlist" | "contact") {
    setNewEvents((cur) => (cur.includes(ev) ? cur.filter((e) => e !== ev) : [...cur, ev]));
  }

  async function addWebhook() {
    setAddStatus("adding");
    setAddError("");
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, events: newEvents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Something went wrong.");
        setAddStatus("error");
        return;
      }
      setWebhooks(data);
      setNewUrl("");
      setAddStatus("idle");
    } catch {
      setAddError("Network error. Please try again.");
      setAddStatus("error");
    }
  }

  async function toggleEnabled(id: number, enabled: boolean) {
    const res = await fetch(`/api/admin/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (res.ok) setWebhooks(await res.json());
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
    if (res.ok) setWebhooks(await res.json());
  }

  async function sendTest(id: number) {
    setTestingId(id);
    try {
      const res = await fetch(`/api/admin/webhooks/${id}/test`, { method: "POST" });
      const data = await res.json();
      setTestResult((r) => ({ ...r, [id]: data.ok ? `✓ ${data.status}` : `✗ ${data.error}` }));
    } catch {
      setTestResult((r) => ({ ...r, [id]: "✗ Network error" }));
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-mist">Add a webhook</h2>
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://hooks.zapier.com/..."
          className="w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={newEvents.includes("waitlist")}
              onChange={() => toggleNewEvent("waitlist")}
              className="h-4 w-4 accent-signal"
            />
            Waitlist signups
          </label>
          <label className="flex items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={newEvents.includes("contact")}
              onChange={() => toggleNewEvent("contact")}
              className="h-4 w-4 accent-signal"
            />
            Contact submissions
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addWebhook}
            disabled={addStatus === "adding" || !newUrl}
            className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
          >
            {addStatus === "adding" ? "Adding…" : "Add webhook"}
          </button>
          {addStatus === "error" && <span className="text-xs text-alert">{addError}</span>}
        </div>
      </div>

      {webhooks.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-ash">
          No webhooks configured yet.
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((hook) => (
            <div key={hook.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-mist truncate">{hook.url}</p>
                  <p className="text-xs text-ash mt-1">
                    {hook.events.join(", ")} · secret ending {hook.secret_last4}
                  </p>
                  {hook.last_triggered_at && (
                    <p className="text-xs text-ash mt-1">
                      Last triggered {new Date(hook.last_triggered_at).toLocaleString()} —{" "}
                      {hook.last_status}
                    </p>
                  )}
                  {testResult[hook.id] && (
                    <p
                      className={`text-xs mt-1 ${
                        testResult[hook.id].startsWith("✓") ? "text-signal" : "text-alert"
                      }`}
                    >
                      {testResult[hook.id]}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-ash">
                    <input
                      type="checkbox"
                      checked={hook.enabled}
                      onChange={(e) => toggleEnabled(hook.id, e.target.checked)}
                      className="h-4 w-4 accent-signal"
                    />
                    Enabled
                  </label>
                  <button
                    onClick={() => sendTest(hook.id)}
                    disabled={testingId === hook.id}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ash hover:text-mist transition-colors disabled:opacity-60"
                  >
                    {testingId === hook.id ? "Sending…" : "Test"}
                  </button>
                  <button
                    onClick={() => remove(hook.id)}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-alert hover:bg-alert/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
