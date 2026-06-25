"use client";

import { useState } from "react";

const LABELS: Record<string, string> = {
  "color-void": "Page background",
  "color-panel": "Card surface",
  "color-panel-soft": "Secondary surface",
  "color-hairline": "Borders & dividers",
  "color-ash": "Muted text",
  "color-mist": "Body text",
  "color-signal": "Primary accent (teal)",
  "color-spark": "Highlight (gold)",
  "color-pulse": "Secondary accent (violet)",
  "color-alert": "Risk / danger (red)",
};

export default function ThemeEditorForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setValues(initial);
    setStatus("idle");
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-mist">{LABELS[key] || key}</p>
            <p className="text-xs text-ash font-mono">--{key}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              className="h-9 w-9 rounded cursor-pointer border border-hairline bg-transparent"
              aria-label={`${LABELS[key] || key} color picker`}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              className="w-24 rounded-lg border border-hairline bg-panel px-2 py-1.5 text-xs font-mono text-mist outline-none focus:border-signal"
            />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2 border-t border-hairline">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={reset}
          className="rounded-xl border border-hairline px-5 py-2.5 text-sm text-ash hover:text-mist transition-colors"
        >
          Reset
        </button>
        {status === "saved" && (
          <span className="text-xs text-signal">Saved — refresh the homepage to see it live.</span>
        )}
        {status === "error" && (
          <span className="text-xs text-alert">Something went wrong. Try again.</span>
        )}
      </div>
    </div>
  );
}
