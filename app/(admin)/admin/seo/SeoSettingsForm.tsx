"use client";

import { useState } from "react";

type SeoSettings = {
  site_title: string;
  meta_description: string;
  ga_measurement_id: string | null;
};

export default function SeoSettingsForm({
  initial,
  defaults,
}: {
  initial: SeoSettings;
  defaults: { site_title: string; meta_description: string };
}) {
  const [title, setTitle] = useState(initial.site_title);
  const [description, setDescription] = useState(initial.meta_description);
  const [gaId, setGaId] = useState(initial.ga_measurement_id ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save(values: { title: string; description: string; gaId: string }) {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/settings/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_title: values.title,
          meta_description: values.description,
          ga_measurement_id: values.gaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setTitle(data.site_title);
      setDescription(data.meta_description);
      setGaId(data.ga_measurement_id || "");
      setStatus("saved");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-mist">Site title &amp; description</h2>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ash">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={70}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
          />
          <p className="mt-1 text-[11px] text-ash">{title.length}/70 characters</p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ash">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={300}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal resize-none"
          />
          <p className="mt-1 text-[11px] text-ash">{description.length}/300 characters</p>
        </div>

        <div className="rounded-xl border border-hairline bg-panel/40 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ash mb-2">
            How this looks in a Google search result
          </p>
          <p className="text-base text-signal truncate">{title}</p>
          <p className="text-xs text-ash">edge.example.com</p>
          <p className="text-sm text-mist/80 mt-1 line-clamp-2">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-hairline">
          <button
            onClick={() => save({ title, description, gaId })}
            disabled={status === "saving"}
            className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
          <button
            onClick={() =>
              save({ title: defaults.site_title, description: defaults.meta_description, gaId })
            }
            disabled={status === "saving"}
            className="rounded-xl border border-hairline px-5 py-2.5 text-sm text-ash hover:text-mist transition-colors disabled:opacity-60"
          >
            Reset title/description
          </button>
          {status === "saved" && <span className="text-xs text-signal">Saved — live now.</span>}
          {status === "error" && <span className="text-xs text-alert">{error}</span>}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-mist">Google Analytics</h2>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ash">
            Measurement ID
          </label>
          <input
            value={gaId}
            onChange={(e) => setGaId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal font-mono"
          />
          <p className="mt-1 text-[11px] text-ash">
            Found in Google Analytics under Admin → Data Streams → your web
            stream. Only the Measurement ID is needed — the standard tracking
            script gets added automatically once this is saved.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-hairline">
          <button
            onClick={() => save({ title, description, gaId })}
            disabled={status === "saving"}
            className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
