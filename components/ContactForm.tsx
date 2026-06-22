"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  if (submitted) {
    return (
      <div className="rounded-xl border border-signal/50 bg-signal-dim p-5 text-center">
        <p className="text-signal font-semibold">Message received.</p>
        <p className="text-sm text-mist/80 mt-1">
          We&apos;ll get back to {form.email || "you"} as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-2 w-full rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist outline-none focus:border-signal"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-2 w-full rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist outline-none focus:border-signal"
        />
      </div>
      <div>
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-ash">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-2 w-full rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist outline-none focus:border-signal resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-signal px-6 py-3.5 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
      >
        Send message
      </button>
    </form>
  );
}
