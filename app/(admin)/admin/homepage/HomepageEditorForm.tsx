"use client";

import { useState } from "react";

type TextPair = { label: string; desc: string };
type StatItem = { label: string; value: string };

type HomepageContent = {
  hero: {
    eyebrow: string;
    headline_line1: string;
    headline_line2: string;
    subhead: string;
    cta_primary_label: string;
    cta_secondary_label: string;
  };
  stats: StatItem[];
  signals: { eyebrow: string; heading: string; intro: string; items: TextPair[] };
  disclaimer: { title: string; body: string };
  features: { eyebrow: string; heading: string; items: TextPair[] };
  cta: { heading: string; subhead: string; button_label: string };
  news: { eyebrow: string; heading: string; subhead: string };
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-ash">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-signal"
        />
      )}
    </div>
  );
}

function SectionCard({
  title,
  hint,
  children,
  onReset,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  onReset: () => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-mist">{title}</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-ash hover:text-mist transition-colors"
        >
          Reset section
        </button>
      </div>
      {hint && <p className="text-[11px] text-ash">{hint}</p>}
      {children}
    </div>
  );
}

export default function HomepageEditorForm({
  initial,
  defaults,
}: {
  initial: HomepageContent;
  defaults: HomepageContent;
}) {
  const [content, setContent] = useState<HomepageContent>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  function update<K extends keyof HomepageContent>(
    section: K,
    value: HomepageContent[K]
  ) {
    setContent((prev) => ({ ...prev, [section]: value }));
  }

  function updateItem(
    section: "signals" | "features",
    index: number,
    field: "label" | "desc",
    value: string
  ) {
    setContent((prev) => {
      const items = [...prev[section].items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, [section]: { ...prev[section], items } };
    });
  }

  function updateStat(index: number, field: "label" | "value", value: string) {
    setContent((prev) => {
      const stats = [...prev.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
    });
  }

  async function save() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setContent(data.content);
      setStatus("saved");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="1. Hero"
        hint="The first thing visitors see."
        onReset={() => update("hero", defaults.hero)}
      >
        <Field label="Eyebrow" value={content.hero.eyebrow} onChange={(v) => update("hero", { ...content.hero, eyebrow: v })} />
        <Field label="Headline — line 1" value={content.hero.headline_line1} onChange={(v) => update("hero", { ...content.hero, headline_line1: v })} />
        <Field label="Headline — line 2 (highlighted)" value={content.hero.headline_line2} onChange={(v) => update("hero", { ...content.hero, headline_line2: v })} />
        <Field label="Subhead" value={content.hero.subhead} onChange={(v) => update("hero", { ...content.hero, subhead: v })} multiline />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary button" value={content.hero.cta_primary_label} onChange={(v) => update("hero", { ...content.hero, cta_primary_label: v })} />
          <Field label="Secondary button" value={content.hero.cta_secondary_label} onChange={(v) => update("hero", { ...content.hero, cta_secondary_label: v })} />
        </div>
      </SectionCard>

      <SectionCard
        title="2. Stat row"
        hint="Three stats directly under the hero."
        onReset={() => update("stats", defaults.stats)}
      >
        <div className="grid sm:grid-cols-3 gap-4">
          {content.stats.map((s, i) => (
            <div key={i} className="space-y-2">
              <Field label={`Stat ${i + 1} label`} value={s.label} onChange={(v) => updateStat(i, "label", v)} />
              <Field label={`Stat ${i + 1} value`} value={s.value} onChange={(v) => updateStat(i, "value", v)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="3. Five signals"
        hint="The flagship feature section — eyebrow, heading, intro paragraph, then the 5 signal cards."
        onReset={() => update("signals", defaults.signals)}
      >
        <Field label="Eyebrow" value={content.signals.eyebrow} onChange={(v) => update("signals", { ...content.signals, eyebrow: v })} />
        <Field label="Heading" value={content.signals.heading} onChange={(v) => update("signals", { ...content.signals, heading: v })} />
        <Field label="Intro paragraph" value={content.signals.intro} onChange={(v) => update("signals", { ...content.signals, intro: v })} multiline />
        <div className="space-y-3 pt-2 border-t border-hairline">
          {content.signals.items.map((item, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_2fr] gap-2">
              <Field label={`Signal ${i + 1} label`} value={item.label} onChange={(v) => updateItem("signals", i, "label", v)} />
              <Field label={`Signal ${i + 1} description`} value={item.desc} onChange={(v) => updateItem("signals", i, "desc", v)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="4. Disclaimer"
        hint="The risk callout box right after the signals section."
        onReset={() => update("disclaimer", defaults.disclaimer)}
      >
        <Field label="Title" value={content.disclaimer.title} onChange={(v) => update("disclaimer", { ...content.disclaimer, title: v })} />
        <Field label="Body" value={content.disclaimer.body} onChange={(v) => update("disclaimer", { ...content.disclaimer, body: v })} multiline />
      </SectionCard>

      <SectionCard
        title="5. Platform features"
        hint="Eyebrow, heading, then the 4 feature cards."
        onReset={() => update("features", defaults.features)}
      >
        <Field label="Eyebrow" value={content.features.eyebrow} onChange={(v) => update("features", { ...content.features, eyebrow: v })} />
        <Field label="Heading" value={content.features.heading} onChange={(v) => update("features", { ...content.features, heading: v })} />
        <div className="space-y-3 pt-2 border-t border-hairline">
          {content.features.items.map((item, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_2fr] gap-2">
              <Field label={`Feature ${i + 1} label`} value={item.label} onChange={(v) => updateItem("features", i, "label", v)} />
              <Field label={`Feature ${i + 1} description`} value={item.desc} onChange={(v) => updateItem("features", i, "desc", v)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="6. Closing CTA"
        hint="The centered call-to-action before the news section."
        onReset={() => update("cta", defaults.cta)}
      >
        <Field label="Heading" value={content.cta.heading} onChange={(v) => update("cta", { ...content.cta, heading: v })} />
        <Field label="Subhead" value={content.cta.subhead} onChange={(v) => update("cta", { ...content.cta, subhead: v })} />
        <Field label="Button label" value={content.cta.button_label} onChange={(v) => update("cta", { ...content.cta, button_label: v })} />
      </SectionCard>

      <SectionCard
        title="7. News section"
        hint="Heading above the live news feed. The headlines themselves come from a live RSS feed, not editable text."
        onReset={() => update("news", defaults.news)}
      >
        <Field label="Eyebrow" value={content.news.eyebrow} onChange={(v) => update("news", { ...content.news, eyebrow: v })} />
        <Field label="Heading" value={content.news.heading} onChange={(v) => update("news", { ...content.news, heading: v })} />
        <Field label="Subhead" value={content.news.subhead} onChange={(v) => update("news", { ...content.news, subhead: v })} />
      </SectionCard>

      <div className="sticky bottom-4 glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-xl bg-signal px-6 py-2.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save all changes"}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-hairline px-5 py-2.5 text-sm text-ash hover:text-mist transition-colors"
        >
          View homepage →
        </a>
        {status === "saved" && <span className="text-xs text-signal">Saved — live now.</span>}
        {status === "error" && <span className="text-xs text-alert">{error}</span>}
      </div>
    </div>
  );
}
