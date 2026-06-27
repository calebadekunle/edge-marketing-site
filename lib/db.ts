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

  CREATE TABLE IF NOT EXISTS mailchimp_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER NOT NULL DEFAULT 0,
    api_key TEXT,
    audience_id TEXT,
    audience_name TEXT,
    sync_waitlist INTEGER NOT NULL DEFAULT 1,
    sync_contact INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS form_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    waitlist_redirect_url TEXT,
    contact_redirect_url TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT NOT NULL DEFAULT 'waitlist,contact',
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_triggered_at TEXT,
    last_status TEXT
  );

  CREATE TABLE IF NOT EXISTS pageviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    referrer TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS compliance_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    footer_disclaimer TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_title TEXT,
    meta_description TEXT,
    ga_measurement_id TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recaptcha_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER NOT NULL DEFAULT 0,
    site_key TEXT,
    secret_key TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS homepage_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alpaca_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    key_id TEXT,
    secret_key TEXT,
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

// ── Mailchimp settings ───────────────────────────────────────────────────
// Same plain-text-in-local-SQLite tradeoff as the SMTP password above.

export type MailchimpSettings = {
  enabled: boolean;
  api_key: string | null;
  audience_id: string | null;
  audience_name: string | null;
  sync_waitlist: boolean;
  sync_contact: boolean;
};

export type MailchimpSettingsSafe = Omit<MailchimpSettings, "api_key"> & {
  api_key_last4: string | null;
};

type MailchimpRow = {
  enabled: number;
  api_key: string | null;
  audience_id: string | null;
  audience_name: string | null;
  sync_waitlist: number;
  sync_contact: number;
};

function rowToMailchimpSettings(row: MailchimpRow | undefined): MailchimpSettings {
  return {
    enabled: !!row?.enabled,
    api_key: row?.api_key ?? null,
    audience_id: row?.audience_id ?? null,
    audience_name: row?.audience_name ?? null,
    sync_waitlist: row ? !!row.sync_waitlist : true,
    sync_contact: !!row?.sync_contact,
  };
}

// Full settings INCLUDING the real API key — server-side use only.
export function getMailchimpSettings(): MailchimpSettings {
  const row = db.prepare(`SELECT * FROM mailchimp_settings WHERE id = 1`).get() as
    | MailchimpRow
    | undefined;
  return rowToMailchimpSettings(row);
}

// Safe to send to the browser — API key is replaced with just its last 4 chars.
export function getMailchimpSettingsSafe(): MailchimpSettingsSafe {
  const { api_key, ...rest } = getMailchimpSettings();
  return {
    ...rest,
    api_key_last4: api_key ? api_key.slice(-4) : null,
  };
}

export function setMailchimpSettings(input: {
  enabled: boolean;
  api_key?: string | null; // omit/undefined = keep existing key
  audience_id: string | null;
  audience_name: string | null;
  sync_waitlist: boolean;
  sync_contact: boolean;
}) {
  const existing = getMailchimpSettings();
  const apiKey = input.api_key === undefined ? existing.api_key : input.api_key;

  db.prepare(
    `INSERT INTO mailchimp_settings (id, enabled, api_key, audience_id, audience_name, sync_waitlist, sync_contact, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       enabled = excluded.enabled,
       api_key = excluded.api_key,
       audience_id = excluded.audience_id,
       audience_name = excluded.audience_name,
       sync_waitlist = excluded.sync_waitlist,
       sync_contact = excluded.sync_contact,
       updated_at = datetime('now')`
  ).run(
    input.enabled ? 1 : 0,
    apiKey,
    input.audience_id,
    input.audience_name,
    input.sync_waitlist ? 1 : 0,
    input.sync_contact ? 1 : 0
  );
}

export default db;

// ── Form redirect settings ───────────────────────────────────────────────
// "Thank you" page redirect URLs after a successful submission. Not set =
// the form shows its normal inline success message instead of redirecting.

export type FormSettings = {
  waitlist_redirect_url: string | null;
  contact_redirect_url: string | null;
};

export function getFormSettings(): FormSettings {
  const row = db.prepare(`SELECT * FROM form_settings WHERE id = 1`).get() as
    | { waitlist_redirect_url: string | null; contact_redirect_url: string | null }
    | undefined;
  return {
    waitlist_redirect_url: row?.waitlist_redirect_url ?? null,
    contact_redirect_url: row?.contact_redirect_url ?? null,
  };
}

export function setFormSettings(input: FormSettings) {
  db.prepare(
    `INSERT INTO form_settings (id, waitlist_redirect_url, contact_redirect_url, updated_at)
     VALUES (1, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       waitlist_redirect_url = excluded.waitlist_redirect_url,
       contact_redirect_url = excluded.contact_redirect_url,
       updated_at = datetime('now')`
  ).run(input.waitlist_redirect_url, input.contact_redirect_url);
}

// ── Webhooks ──────────────────────────────────────────────────────────────
// Unlike the other integrations, this is a proper multi-row table — you
// can point lead events at as many external URLs as you want (Zapier, a
// CRM, a Slack incoming webhook, etc).

export type WebhookEvent = "waitlist" | "contact";

export type Webhook = {
  id: number;
  url: string;
  secret: string;
  events: WebhookEvent[];
  enabled: boolean;
  created_at: string;
  last_triggered_at: string | null;
  last_status: string | null;
};

export type WebhookSafe = Omit<Webhook, "secret"> & { secret_last4: string };

type WebhookRow = {
  id: number;
  url: string;
  secret: string;
  events: string;
  enabled: number;
  created_at: string;
  last_triggered_at: string | null;
  last_status: string | null;
};

function rowToWebhook(row: WebhookRow): Webhook {
  return {
    id: row.id,
    url: row.url,
    secret: row.secret,
    events: row.events.split(",").filter(Boolean) as WebhookEvent[],
    enabled: !!row.enabled,
    created_at: row.created_at,
    last_triggered_at: row.last_triggered_at,
    last_status: row.last_status,
  };
}

function toSafe(hook: Webhook): WebhookSafe {
  const { secret, ...rest } = hook;
  return { ...rest, secret_last4: secret.slice(-4) };
}

export function getWebhooks(): Webhook[] {
  const rows = db.prepare(`SELECT * FROM webhooks ORDER BY id DESC`).all() as WebhookRow[];
  return rows.map(rowToWebhook);
}

export function getWebhooksSafe(): WebhookSafe[] {
  return getWebhooks().map(toSafe);
}

export function getWebhooksForEvent(event: WebhookEvent): Webhook[] {
  return getWebhooks().filter((w) => w.enabled && w.events.includes(event));
}

export function getWebhook(id: number): Webhook | null {
  const row = db.prepare(`SELECT * FROM webhooks WHERE id = ?`).get(id) as
    | WebhookRow
    | undefined;
  return row ? rowToWebhook(row) : null;
}

export function addWebhook(input: { url: string; events: WebhookEvent[]; secret: string }) {
  db.prepare(
    `INSERT INTO webhooks (url, secret, events, enabled) VALUES (?, ?, ?, 1)`
  ).run(input.url, input.secret, input.events.join(","));
}

export function deleteWebhook(id: number) {
  db.prepare(`DELETE FROM webhooks WHERE id = ?`).run(id);
}

export function setWebhookEnabled(id: number, enabled: boolean) {
  db.prepare(`UPDATE webhooks SET enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, id);
}

export function recordWebhookResult(id: number, status: string) {
  db.prepare(
    `UPDATE webhooks SET last_triggered_at = datetime('now'), last_status = ? WHERE id = ?`
  ).run(status, id);
}

// ── Pageviews & analytics ────────────────────────────────────────────────

export function addPageview(input: { path: string; referrer: string | null; ip_address: string | null }) {
  db.prepare(`INSERT INTO pageviews (path, referrer, ip_address) VALUES (?, ?, ?)`).run(
    input.path,
    input.referrer,
    input.ip_address
  );
}

export function countPageviews(): number {
  const row = db.prepare(`SELECT COUNT(*) as c FROM pageviews`).get() as { c: number };
  return row.c;
}

export function countPageviewsForPath(path: string): number {
  const row = db.prepare(`SELECT COUNT(*) as c FROM pageviews WHERE path = ?`).get(path) as {
    c: number;
  };
  return row.c;
}

export type PathCount = { path: string; count: number };

export function getTopPaths(limit = 10): PathCount[] {
  return db
    .prepare(
      `SELECT path, COUNT(*) as count FROM pageviews GROUP BY path ORDER BY count DESC LIMIT ?`
    )
    .all(limit) as PathCount[];
}

export type ReferrerCount = { referrer: string; count: number };

// Pulls from BOTH pageviews and the two lead tables, since a path-level
// pageview referrer and a signup's stored referrer are the same kind of
// data — combining them gives a fuller picture of where traffic actually
// comes from than either alone.
export function getTopReferrers(limit = 10): ReferrerCount[] {
  const rows = db
    .prepare(
      `SELECT referrer FROM pageviews
       UNION ALL
       SELECT referrer FROM waitlist_signups
       UNION ALL
       SELECT referrer FROM contact_submissions`
    )
    .all() as { referrer: string | null }[];

  const counts = new Map<string, number>();
  for (const row of rows) {
    let key = "Direct";
    if (row.referrer) {
      try {
        key = new URL(row.referrer).hostname.replace(/^www\./, "");
      } catch {
        key = row.referrer;
      }
    }
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export type DailyCount = { date: string; count: number };

// Builds a complete day-by-day series for the last `days` days, filling in
// zeros for days with no activity — without this, a sparkline/trend chart
// would silently skip gaps and misrepresent the shape of the trend.
function buildDailySeries(timestamps: string[], days: number): DailyCount[] {
  const counts = new Map<string, number>();
  for (const ts of timestamps) {
    const day = ts.slice(0, 10); // "YYYY-MM-DD" prefix of an ISO timestamp
    counts.set(day, (counts.get(day) || 0) + 1);
  }

  const series: DailyCount[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, count: counts.get(key) || 0 });
  }
  return series;
}

export function getDailySignups(days = 14): DailyCount[] {
  const rows = db.prepare(`SELECT created_at FROM waitlist_signups`).all() as {
    created_at: string;
  }[];
  return buildDailySeries(rows.map((r) => r.created_at), days);
}

export function getDailyPageviews(days = 14): DailyCount[] {
  const rows = db.prepare(`SELECT created_at FROM pageviews`).all() as {
    created_at: string;
  }[];
  return buildDailySeries(rows.map((r) => r.created_at), days);
}

// ── Compliance settings ──────────────────────────────────────────────────
// The footer disclaimer bar shown on every public page. Defaults to the
// text the site already shipped with — nothing changes for visitors until
// an admin actually edits it.

export const DEFAULT_FOOTER_DISCLAIMER =
  "EDGE is not a broker-dealer and does not hold customer funds or securities. " +
  "Brokerage services are provided by Alpaca Securities LLC, a registered " +
  "broker-dealer and member of FINRA/SIPC. The AI Discovery Engine provides " +
  "analytical signals only — it is not investment advice, and past performance " +
  "does not guarantee future results. Penny stocks are highly volatile and can " +
  "result in the loss of your entire investment.";

export function getFooterDisclaimer(): string {
  const row = db.prepare(`SELECT footer_disclaimer FROM compliance_settings WHERE id = 1`).get() as
    | { footer_disclaimer: string | null }
    | undefined;
  return row?.footer_disclaimer || DEFAULT_FOOTER_DISCLAIMER;
}

export function setFooterDisclaimer(text: string) {
  db.prepare(
    `INSERT INTO compliance_settings (id, footer_disclaimer, updated_at)
     VALUES (1, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       footer_disclaimer = excluded.footer_disclaimer,
       updated_at = datetime('now')`
  ).run(text);
}

// ── SEO settings ──────────────────────────────────────────────────────────

export const DEFAULT_SITE_TITLE = "EDGE — Penny Stock Trading Platform";
export const DEFAULT_META_DESCRIPTION =
  "EDGE is a mobile-first trading platform for penny stocks and micro-caps, " +
  "powered by the AI Discovery Engine — a real-time signal layer that surfaces " +
  "which tickers are actually worth watching.";

export type SeoSettings = {
  site_title: string;
  meta_description: string;
  ga_measurement_id: string | null;
};

export function getSeoSettings(): SeoSettings {
  const row = db.prepare(`SELECT * FROM seo_settings WHERE id = 1`).get() as
    | { site_title: string | null; meta_description: string | null; ga_measurement_id: string | null }
    | undefined;
  return {
    site_title: row?.site_title || DEFAULT_SITE_TITLE,
    meta_description: row?.meta_description || DEFAULT_META_DESCRIPTION,
    ga_measurement_id: row?.ga_measurement_id || null,
  };
}

export function setSeoSettings(input: SeoSettings) {
  db.prepare(
    `INSERT INTO seo_settings (id, site_title, meta_description, ga_measurement_id, updated_at)
     VALUES (1, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       site_title = excluded.site_title,
       meta_description = excluded.meta_description,
       ga_measurement_id = excluded.ga_measurement_id,
       updated_at = datetime('now')`
  ).run(input.site_title, input.meta_description, input.ga_measurement_id);
}

// ── reCAPTCHA settings ────────────────────────────────────────────────────
// Same plain-text-in-local-SQLite tradeoff as the other integration secrets.

export type RecaptchaSettings = {
  enabled: boolean;
  site_key: string | null;
  secret_key: string | null;
};

export type RecaptchaSettingsSafe = Omit<RecaptchaSettings, "secret_key"> & {
  secret_key_set: boolean;
};

export function getRecaptchaSettings(): RecaptchaSettings {
  const row = db.prepare(`SELECT * FROM recaptcha_settings WHERE id = 1`).get() as
    | { enabled: number; site_key: string | null; secret_key: string | null }
    | undefined;
  return {
    enabled: !!row?.enabled,
    site_key: row?.site_key ?? null,
    secret_key: row?.secret_key ?? null,
  };
}

export function getRecaptchaSettingsSafe(): RecaptchaSettingsSafe {
  const { secret_key, ...rest } = getRecaptchaSettings();
  return { ...rest, secret_key_set: !!secret_key };
}

export function setRecaptchaSettings(input: {
  enabled: boolean;
  site_key: string | null;
  secret_key?: string | null; // omit/undefined = keep existing
}) {
  const existing = getRecaptchaSettings();
  const secretKey = input.secret_key === undefined ? existing.secret_key : input.secret_key;

  db.prepare(
    `INSERT INTO recaptcha_settings (id, enabled, site_key, secret_key, updated_at)
     VALUES (1, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       enabled = excluded.enabled,
       site_key = excluded.site_key,
       secret_key = excluded.secret_key,
       updated_at = datetime('now')`
  ).run(input.enabled ? 1 : 0, input.site_key, secretKey);
}

// ── Homepage content ──────────────────────────────────────────────────────
// Every distinct text field on the homepage, as one structured JSON blob.
// The page's visual design, layout, and animations stay coded — only the
// text itself is data-driven. Defaults below match the exact text the
// homepage shipped with, so nothing changes until it's actually edited.

export type TextPair = { label: string; desc: string };
export type StatItem = { label: string; value: string };

export type HomepageContent = {
  hero: {
    eyebrow: string;
    headline_line1: string;
    headline_line2: string;
    subhead: string;
    cta_primary_label: string;
    cta_secondary_label: string;
  };
  stats: StatItem[];
  signals: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: TextPair[];
  };
  disclaimer: {
    title: string;
    body: string;
  };
  features: {
    eyebrow: string;
    heading: string;
    items: TextPair[];
  };
  cta: {
    heading: string;
    subhead: string;
    button_label: string;
  };
  news: {
    eyebrow: string;
    heading: string;
    subhead: string;
  };
};

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    eyebrow: "AI Discovery Engine, built in",
    headline_line1: "Know which penny stocks",
    headline_line2: "are actually moving.",
    subhead:
      "EDGE continuously scores the micro-cap universe on volume, float, momentum, " +
      "and sentiment — so you see genuine strength, not noise, the moment it shows up.",
    cta_primary_label: "Get the app",
    cta_secondary_label: "See how discovery works",
  },
  stats: [
    { label: "Focus", value: "Micro-Cap Equities" },
    { label: "Differentiator", value: "AI Discovery" },
    { label: "Broker of Record", value: "Alpaca" },
  ],
  signals: {
    eyebrow: "The flagship feature",
    heading: "Five signals. One score.",
    intro:
      "The Discovery Engine doesn't guess — it weighs the same signals experienced " +
      "traders already watch, continuously, across the entire penny stock universe.",
    items: [
      {
        label: "Volume Surge",
        desc: "Relative volume vs. the trailing average, the first sign something is happening.",
      },
      {
        label: "Float & Short Interest",
        desc: "How much of the float is tradable, and how exposed short sellers are to a squeeze.",
      },
      {
        label: "Price Momentum",
        desc: "Multi-timeframe price action and trend strength, not just today's candle.",
      },
      {
        label: "News Sentiment",
        desc: "Real-time classification of headlines and press releases as they break.",
      },
      {
        label: "Pattern Match",
        desc: "Comparison against historical setups that preceded prior breakouts.",
      },
    ],
  },
  disclaimer: {
    title: "Not investment advice",
    body:
      "The Discovery Score is a real-time analytical signal, not a prediction or a " +
      "guarantee of future performance. EDGE does not provide individualized " +
      "investment advice. Past signal accuracy does not guarantee future results.",
  },
  features: {
    eyebrow: "The platform",
    heading: "Built for traders who move fast.",
    items: [
      {
        label: "Real-time screener",
        desc: "Filter the entire micro-cap universe by sector and momentum in seconds.",
      },
      {
        label: "Persistent watchlists",
        desc: "Live sparkline previews on every ticker you're tracking.",
      },
      {
        label: "Smart alerts",
        desc: "Price, volume, and pattern-based alerts that fire the moment it matters.",
      },
      {
        label: "One-tap order flow",
        desc: "Market, limit, and stop orders with cost previewed before you confirm.",
      },
    ],
  },
  cta: {
    heading: "Trade with an edge.",
    subhead: "Join the waitlist and be first to know when EDGE opens up.",
    button_label: "Get early access",
  },
  news: {
    eyebrow: "Stay informed",
    heading: "The market, as it happens.",
    subhead: "Real headlines, refreshed automatically — no need to reload the page.",
  },
};

// Deep-merges stored content over the defaults so that if new fields are
// added to the shape later, old saved content (missing those fields)
// doesn't break — it just falls back to the default for whatever's missing.
function mergeHomepageContent(stored: Partial<HomepageContent> | null): HomepageContent {
  if (!stored) return DEFAULT_HOMEPAGE_CONTENT;
  return {
    hero: { ...DEFAULT_HOMEPAGE_CONTENT.hero, ...stored.hero },
    stats:
      Array.isArray(stored.stats) && stored.stats.length === DEFAULT_HOMEPAGE_CONTENT.stats.length
        ? stored.stats
        : DEFAULT_HOMEPAGE_CONTENT.stats,
    signals: {
      ...DEFAULT_HOMEPAGE_CONTENT.signals,
      ...stored.signals,
      items:
        Array.isArray(stored.signals?.items) &&
        stored.signals.items.length === DEFAULT_HOMEPAGE_CONTENT.signals.items.length
          ? stored.signals.items
          : DEFAULT_HOMEPAGE_CONTENT.signals.items,
    },
    disclaimer: { ...DEFAULT_HOMEPAGE_CONTENT.disclaimer, ...stored.disclaimer },
    features: {
      ...DEFAULT_HOMEPAGE_CONTENT.features,
      ...stored.features,
      items:
        Array.isArray(stored.features?.items) &&
        stored.features.items.length === DEFAULT_HOMEPAGE_CONTENT.features.items.length
          ? stored.features.items
          : DEFAULT_HOMEPAGE_CONTENT.features.items,
    },
    cta: { ...DEFAULT_HOMEPAGE_CONTENT.cta, ...stored.cta },
    news: { ...DEFAULT_HOMEPAGE_CONTENT.news, ...stored.news },
  };
}

export function getHomepageContent(): HomepageContent {
  const row = db.prepare(`SELECT content FROM homepage_content WHERE id = 1`).get() as
    | { content: string }
    | undefined;
  if (!row) return DEFAULT_HOMEPAGE_CONTENT;
  try {
    return mergeHomepageContent(JSON.parse(row.content));
  } catch {
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}

export function setHomepageContent(content: HomepageContent) {
  db.prepare(
    `INSERT INTO homepage_content (id, content, updated_at) VALUES (1, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = datetime('now')`
  ).run(JSON.stringify(content));
}

// ── Alpaca settings ───────────────────────────────────────────────────────
// Previously these only lived in process.env (ALPACA_API_KEY_ID /
// ALPACA_API_SECRET_KEY), with no admin UI at all. Falls back to the env
// vars if nothing's saved in the database yet, so existing .env.local
// setups keep working exactly as before — this is additive, not a
// breaking change for anyone who hasn't touched the new UI.

export type AlpacaSettings = { key_id: string | null; secret_key: string | null };
export type AlpacaSettingsSafe = { key_id: string | null; secret_key_set: boolean; source: "database" | "env" | "none" };

export function getAlpacaSettings(): AlpacaSettings {
  const row = db.prepare(`SELECT key_id, secret_key FROM alpaca_settings WHERE id = 1`).get() as
    | { key_id: string | null; secret_key: string | null }
    | undefined;

  if (row?.key_id && row?.secret_key) {
    return { key_id: row.key_id, secret_key: row.secret_key };
  }
  // Fall back to env vars if the database has nothing saved yet.
  return {
    key_id: process.env.ALPACA_API_KEY_ID || null,
    secret_key: process.env.ALPACA_API_SECRET_KEY || null,
  };
}

export function getAlpacaSettingsSafe(): AlpacaSettingsSafe {
  const row = db.prepare(`SELECT key_id, secret_key FROM alpaca_settings WHERE id = 1`).get() as
    | { key_id: string | null; secret_key: string | null }
    | undefined;

  if (row?.key_id && row?.secret_key) {
    return { key_id: row.key_id, secret_key_set: true, source: "database" };
  }
  if (process.env.ALPACA_API_KEY_ID && process.env.ALPACA_API_SECRET_KEY) {
    return { key_id: process.env.ALPACA_API_KEY_ID, secret_key_set: true, source: "env" };
  }
  return { key_id: null, secret_key_set: false, source: "none" };
}

export function setAlpacaSettings(input: { key_id: string | null; secret_key?: string | null }) {
  const existing = getAlpacaSettings();
  const secretKey = input.secret_key === undefined ? existing.secret_key : input.secret_key;

  db.prepare(
    `INSERT INTO alpaca_settings (id, key_id, secret_key, updated_at) VALUES (1, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       key_id = excluded.key_id,
       secret_key = excluded.secret_key,
       updated_at = datetime('now')`
  ).run(input.key_id, secretKey);
}
