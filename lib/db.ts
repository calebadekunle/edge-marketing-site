import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// SQLite is the self-hosted backend for the marketing site's forms — no
// external service required. The file lives outside version control
// (see .gitignore) and outside the Next.js build output, so it persists
// across deploys on the same machine.
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, "edge.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS waitlist_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    ip_address TEXT,
    referrer TEXT,
    consent INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    ip_address TEXT,
    referrer TEXT,
    consent INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export type WaitlistSignup = {
  id: number;
  email: string;
  created_at: string;
  ip_address: string | null;
  referrer: string | null;
  consent: number;
};

export type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  ip_address: string | null;
  referrer: string | null;
  consent: number;
};

// ── Waitlist ────────────────────────────────────────────────────────────

export function isEmailOnWaitlist(email: string): boolean {
  const row = db
    .prepare(`SELECT 1 FROM waitlist_signups WHERE email = ?`)
    .get(email.trim().toLowerCase());
  return !!row;
}

export function addWaitlistSignup(input: {
  email: string;
  ip_address: string | null;
  referrer: string | null;
  consent: boolean;
}) {
  return db
    .prepare(
      `INSERT INTO waitlist_signups (email, ip_address, referrer, consent)
       VALUES (?, ?, ?, ?)`
    )
    .run(
      input.email.trim().toLowerCase(),
      input.ip_address,
      input.referrer,
      input.consent ? 1 : 0
    );
}

export function getWaitlistSignups(limit = 200): WaitlistSignup[] {
  return db
    .prepare(`SELECT * FROM waitlist_signups ORDER BY id DESC LIMIT ?`)
    .all(limit) as WaitlistSignup[];
}

export function countWaitlistSignups(): number {
  const row = db
    .prepare(`SELECT COUNT(*) as c FROM waitlist_signups`)
    .get() as { c: number };
  return row.c;
}

// ── Contact submissions ─────────────────────────────────────────────────

export function addContactSubmission(input: {
  name: string;
  email: string;
  message: string;
  ip_address: string | null;
  referrer: string | null;
  consent: boolean;
}) {
  return db
    .prepare(
      `INSERT INTO contact_submissions (name, email, message, ip_address, referrer, consent)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.name.trim(),
      input.email.trim().toLowerCase(),
      input.message.trim(),
      input.ip_address,
      input.referrer,
      input.consent ? 1 : 0
    );
}

export function getContactSubmissions(limit = 200): ContactSubmission[] {
  return db
    .prepare(`SELECT * FROM contact_submissions ORDER BY id DESC LIMIT ?`)
    .all(limit) as ContactSubmission[];
}

export function countContactSubmissions(): number {
  const row = db
    .prepare(`SELECT COUNT(*) as c FROM contact_submissions`)
    .get() as { c: number };
  return row.c;
}

// ── Site theme settings ──────────────────────────────────────────────────
// These map 1:1 to the CSS custom properties defined in app/globals.css
// (@theme block). Defaults here MUST match the values there — they're the
// fallback shown until an admin overrides them via /admin/settings.

export const DEFAULT_THEME: Record<string, string> = {
  "color-void": "#0a0a14",
  "color-panel": "#111124",
  "color-panel-soft": "#14142a",
  "color-hairline": "#1e1e38",
  "color-ash": "#6b6b8c",
  "color-mist": "#c7c7dc",
  "color-signal": "#00c896",
  "color-spark": "#f0c040",
  "color-pulse": "#8b83e8",
  "color-alert": "#e2554f",
};

export function getThemeSettings(): Record<string, string> {
  const rows = db
    .prepare(`SELECT key, value FROM site_settings WHERE key LIKE 'color-%'`)
    .all() as { key: string; value: string }[];
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_THEME, ...overrides };
}

export function setThemeSetting(key: string, value: string) {
  if (!(key in DEFAULT_THEME)) {
    throw new Error(`Unknown theme key: ${key}`);
  }
  db.prepare(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(key, value);
}

export default db;
