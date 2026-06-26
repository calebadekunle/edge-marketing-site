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

  CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER NOT NULL DEFAULT 0,
    host TEXT,
    port INTEGER,
    secure INTEGER NOT NULL DEFAULT 0,
    username TEXT,
    password TEXT,
    from_email TEXT,
    notify_email TEXT,
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

// ── SMTP settings (email notifications) ──────────────────────────────────
// Single-row table (id is always 1). The password is stored here in plain
// text in the local SQLite file — consistent with how this project already
// stores lead PII, gated by the same admin Basic Auth and the same "never
// committed to git" boundary, not a stronger guarantee than that. Use a
// dedicated/app-specific mailbox credential here, not a primary daily
// account password.

export type SmtpSettings = {
  enabled: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  username: string | null;
  password: string | null;
  from_email: string | null;
  notify_email: string | null;
};

export type SmtpSettingsSafe = Omit<SmtpSettings, "password"> & {
  password_set: boolean;
};

type SmtpRow = {
  enabled: number;
  host: string | null;
  port: number | null;
  secure: number;
  username: string | null;
  password: string | null;
  from_email: string | null;
  notify_email: string | null;
};

function rowToSmtpSettings(row: SmtpRow | undefined): SmtpSettings {
  return {
    enabled: !!row?.enabled,
    host: row?.host ?? null,
    port: row?.port ?? null,
    secure: !!row?.secure,
    username: row?.username ?? null,
    password: row?.password ?? null,
    from_email: row?.from_email ?? null,
    notify_email: row?.notify_email ?? null,
  };
}

// Full settings INCLUDING the real password — server-side use only
// (the actual email-sending code). Never expose this over an API response.
export function getSmtpSettings(): SmtpSettings {
  const row = db.prepare(`SELECT * FROM smtp_settings WHERE id = 1`).get() as
    | SmtpRow
    | undefined;
  return rowToSmtpSettings(row);
}

// Safe to send to the browser — password is replaced with a boolean.
export function getSmtpSettingsSafe(): SmtpSettingsSafe {
  const { password, ...rest } = getSmtpSettings();
  return { ...rest, password_set: !!password };
}

export function setSmtpSettings(input: {
  enabled: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  username: string | null;
  password?: string | null; // omit/undefined = keep existing password
  from_email: string | null;
  notify_email: string | null;
}) {
  const existing = getSmtpSettings();
  const password = input.password === undefined ? existing.password : input.password;

  db.prepare(
    `INSERT INTO smtp_settings (id, enabled, host, port, secure, username, password, from_email, notify_email, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       enabled = excluded.enabled,
       host = excluded.host,
       port = excluded.port,
       secure = excluded.secure,
       username = excluded.username,
       password = excluded.password,
       from_email = excluded.from_email,
       notify_email = excluded.notify_email,
       updated_at = datetime('now')`
  ).run(
    input.enabled ? 1 : 0,
    input.host,
    input.port,
    input.secure ? 1 : 0,
    input.username,
    password,
    input.from_email,
    input.notify_email
  );
}

export default db;
