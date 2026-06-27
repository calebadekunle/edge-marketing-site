"use client";

import { useState } from "react";

export default function DisclaimerEditor({
  initial,
  defaultText,
}: {
  initial: string;
  defaultText: string;
}) {
  const [text, setText] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save(value: string) {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/settings/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ footer_disclaimer: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setText(data.footer_disclaimer);
      setStatus("saved");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ash">
          Footer disclaimer
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          maxLength={2000}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist outline-none focus:border-signal resize-none"
        />
        <p className="mt-1 text-[11px] text-ash">
          {text.length}/2000 characters. The &quot;Full risk disclosures&quot; link
          after this text is fixed and always appears — it's not part of the
          editable text.
        </p>
      </div>

      <div className="rounded-xl border border-hairline bg-panel/40 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ash mb-2">
          Live preview
        </p>
        <p className="text-[11px] leading-relaxed text-ash">
          {text} <span className="underline">Full risk disclosures</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-hairline">
        <button
          onClick={() => save(text)}
          disabled={status === "saving"}
          className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={() => save(defaultText)}
          disabled={status === "saving"}
          className="rounded-xl border border-hairline px-5 py-2.5 text-sm text-ash hover:text-mist transition-colors disabled:opacity-60"
        >
          Reset to default
        </button>
        {status === "saved" && <span className="text-xs text-signal">Saved — live now.</span>}
        {status === "error" && <span className="text-xs text-alert">{error}</span>}
      </div>
    </div>
  );
}
