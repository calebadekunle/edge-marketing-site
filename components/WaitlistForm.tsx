"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-xl border border-signal/50 bg-signal-dim p-5 text-center">
        <p className="text-signal font-semibold">You&apos;re on the list.</p>
        <p className="text-sm text-mist/80 mt-1">
          We&apos;ll email {email} when EDGE opens up.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-xl border border-hairline bg-panel px-4 py-3 text-sm text-mist placeholder:text-ash outline-none focus:border-signal"
      />
      <button
        type="submit"
        className="rounded-xl bg-signal px-6 py-3 text-sm font-semibold text-void hover:bg-signal/90 transition-colors"
      >
        Join waitlist
      </button>
    </form>
  );
}
