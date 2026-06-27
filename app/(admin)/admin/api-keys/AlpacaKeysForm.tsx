"use client";

import { useState } from "react";

type AlpacaSettingsSafe = {
  key_id: string | null;
  secret_key_set: boolean;
  source: "database" | "env" | "none";
};

export default function AlpacaKeysForm({ initial }: { initial: AlpacaSettingsSafe }) {
  const [keyId, setKeyId] = useState(initial.key_id ?? "");
  const [secretKey, setSecretKey] = useState("");
  const [secretKeySet, setSecretKeySet] = useState(initial.secret_key_set);
  const [source, setSource] = useState(initial.source);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/settings/alpaca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key_id: keyId,
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
      setSource(data.source);
      setStatus("saved");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      {source === "env" && (
        <p className="text-[11px] text-spark bg-spark/10 rounded-lg px-3 py-2">
          Currently reading from your .env.local file — saving here will switch
          to the database version, and the env vars become an unused fallback.
        </p>
      )}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ash">Key ID</label>
        <input
          value={keyId}
          onChange={(e) => setKeyId(e.target.value)}
          placeholder="PK..."
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
        From your{" "}
        <a
          href="https://app.alpaca.markets"
          target="_blank"
          rel="noreferrer"
          className="text-signal hover:underline"
        >
          Alpaca dashboard
        </a>{" "}
        — a free paper-trading account works fine for this.
      </p>
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
