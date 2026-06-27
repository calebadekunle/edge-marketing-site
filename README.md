# EDGE — Marketing Site

The business/marketing website for EDGE (penny stock trading platform). This is
**not** the trading app itself — it's the public-facing site that explains the
product, AI Discovery Engine, pricing, and compliance posture, with CTAs that
will eventually link out to the real app once it's live.

Built with Next.js 16 (App Router) + Tailwind CSS v4. Fonts (Space Grotesk,
JetBrains Mono) are self-hosted via `@fontsource` — no external font requests
at build or runtime.

## Pages

- `/` — Home
- `/ai-discovery` — The AI Discovery Engine (flagship feature)
- `/pricing` — Subscription tiers (illustrative)
- `/security` — Custody model & compliance disclosures
- `/download` — Waitlist + roadmap (app isn't public yet)

## Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

**First time:**
```bash
npx vercel
```
Follow the prompts — it'll give you a live URL in under a minute.

**Ongoing (recommended):** push this folder to a GitHub repo, then connect
that repo in the Vercel dashboard once. Every `git push` after that
auto-deploys and gives you a preview URL.

```bash
git init
git add .
git commit -m "Initial EDGE marketing site"
git remote add origin <your-repo-url>
git push -u origin main
```

## Hero card (home page, top of page)

The card next to the headline shows a **real, live price** for a stock
that's genuinely under $1 right now — pulled from a daily-rotating pool,
alongside an **illustrative** Discovery Score animation.

This split is intentional, not a shortcut: the AI Discovery Engine itself
doesn't exist as a running backend yet — it's the flagship feature on the
roadmap (see Section 9 of the whitepaper). The score/tier animation is
clearly labeled "Illustrative — not a live model output" so it's never
confused with real product output.

**How the rotation works** (`app/api/quotes/route.ts`):

- `PENNY_POOL` holds 5 candidates (currently PRSO, CAN, GOCO, GOSS, DEFT),
  each verified actively trading on NASDAQ and under $1 when this was built.
- Each request, the route re-checks **live** prices for the whole pool and
  filters to whichever are *currently* under $1 — then picks one
  deterministically by day-of-year, so it changes once every 24 hours
  (UTC) and is consistent across every visitor that day.
- If today's "natural" rotation pick has crept back above $1, it's
  automatically skipped in favor of one that still qualifies — the
  "always under $1" promise is re-verified live, not just assumed from a
  static list.

**Why this needs periodic maintenance:** NASDAQ requires listed stocks to
stay above $1 or face a delisting clock (deficiency notice after 30
consecutive days under $1, then a compliance period to cure it). A pool
of genuinely sub-$1, still-exchange-listed stocks is inherently a moving
target — there's no permanently-safe pool here. Concretely:

- **Check `/api/quotes` periodically.** Look at the `heroPick` and
  `heroPickError` fields specifically.
- If a pool member gets delisted, that *whole pool's* fetch fails (Alpaca
  fails the entire batch if one symbol is invalid — see the architecture
  note in the route file) and `heroPick` goes null with an honest error.
  **This is isolated from the ticker tape on purpose** — a bad penny
  symbol can't take down `quotes` (the stable ticker tape), since they're
  two separate upstream fetches. Verified this isolation directly: simulated
  one pool failing while confirming the other still worked correctly.
- To refresh the pool: replace the dead entry in `PENNY_POOL` with a
  current candidate from a live screener (e.g. MarketBeat's "Stocks Under
  $1" page) — don't reuse an old list, prices and listings here move fast.
- If every pool member is currently above $1 (unlikely with 5 picks, but
  possible), `heroPick` is null with `heroPickError: "No sub-$1 candidate
  currently available"` rather than silently showing a stock that doesn't
  meet the bar. The card shows an honest "—" that day instead of faking it.

## Live ticker tape (top of every page)

The scrolling ticker under the nav shows real, live-polled quotes (refreshed
every 30 seconds) via Alpaca's free Market Data API (IEX feed).

**Setup required before this works:**

1. Sign up at [alpaca.markets](https://alpaca.markets) — a free paper-trading
   account is enough, no funding needed.
2. Generate an API key pair from your dashboard.
3. Locally: copy `.env.local.example` to `.env.local` and fill in your keys.
4. On Vercel: add `ALPACA_API_KEY_ID` and `ALPACA_API_SECRET_KEY` as
   Environment Variables in your project settings, then redeploy.

**What this does and doesn't cover:**
- Covers NASDAQ/NYSE-listed equities. Does **not** cover true OTC/pink-sheet
  penny stocks — that needs Alpaca's paid OTC feed add-on. The symbols in
  `app/api/quotes/route.ts` are liquid, lower-priced, actively-traded
  small-caps as the closest free equivalent.
- Free tier uses the IEX feed: genuinely real-time, but reflects one
  exchange's tape rather than the full consolidated (SIP) tape.
- **Important Alpaca quirk:** if even one symbol in the list becomes invalid
  (delisted, renamed, typo), the *entire* request fails — Alpaca doesn't
  skip bad symbols, it errors the whole batch. If the ticker ever goes
  quiet, check `/api/quotes` directly first and verify every symbol in the
  list is still actively trading.
- If no API keys are set, or the upstream call fails, the ticker shows an
  empty bar rather than fake data — by design, it should never display
  placeholder prices that look real.

## What's a placeholder right now

- **App Store / Google Play badges** (`/download`) — disabled, "coming soon."
  The real app isn't public yet.
- **Pricing** — illustrative tiers/features, not final numbers.
- **"Get the app" CTA** — currently points to `/download` (the waitlist
  page). Update this once there's a real app URL or store listing to link to.
- **Terms & Conditions / Privacy Policy** — draft templates only. Must be
  reviewed and finalized by qualified legal counsel before public launch.
- **Mailchimp / Outlook SMTP / webhook delivery** — not built yet. Submissions
  currently land in the local SQLite database only (see below) — no outbound
  email or third-party CRM sync happens automatically.
- **Admin sections "Campaigns," "Subscriber CRM," "Analytics," "Compliance"**
  — visible in the admin sidebar as grayed-out "Soon" items, not built yet.

## Live market news (`/` home page, bottom section)

The "The market, as it happens" section pulls real headlines from
MarketWatch's public RSS syndication feed via a server-side route handler
at `app/api/news/route.ts`, polled by the client every 5 minutes.

**Important — this was built and tested with a mocked local feed, since the
sandbox this was built in cannot reach external domains.** The XML parsing
logic and full UI (loading/error/ready states) were verified end-to-end
against realistic sample RSS data, but **the live fetch to the real
MarketWatch URL has not been confirmed working** — verify this once you run
`npm run dev` locally or deploy to Vercel:

```bash
curl http://localhost:3000/api/news
```

If it returns `{"ok": false, ...}`, check the `error` field. Common fixes:
- If you get a 403, the feed may be blocking the request — try swapping
  `FEED_URL` in `app/api/news/route.ts` for a different syndication feed
  (Nasdaq, Investing.com, and CNBC all publish RSS feeds — see comments
  in that file).
- Verify the current licensing/usage terms of whichever feed you use
  before relying on it in production — some financial news feeds restrict
  commercial use.

## Self-hosted backend & admin dashboard

The waitlist and contact forms submit to real API routes
(`app/api/waitlist`, `app/api/contact`), which write to a local SQLite
database via `better-sqlite3` (`lib/db.ts`). No external service required —
just persistent disk on whatever machine runs `npm start`.

**First-time setup** — add two new variables to `.env.local` (see
`.env.local.example`):

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=pick_something_only_you_know
```

These protect `/admin` and `/api/admin/*` with HTTP Basic Auth. If either is
missing, the admin area is blocked entirely (fails closed, not open).

`npm run dev` and `npm run build` automatically run `scripts/check-env.js`
first (via npm's `predev`/`prebuild` hooks) and print a ✓/✗/⚠ summary of
which `.env.local` values are set. It only warns — it never blocks the
command — but it means a forgotten or still-placeholder value shows up
immediately instead of silently breaking `/admin` later. Run it manually
anytime with `npm run check-env`.

**What each form captures**, beyond name/email/message:
- `ip_address` — from the `x-forwarded-for` header (works behind Vercel or
  your own reverse proxy on a VPS)
- `referrer` — `document.referrer` from the browser, falling back to the
  request's `Referer` header
- `consent` — both forms now require checking "I agree to the Privacy
  Policy" before submitting; the API rejects the request otherwise

**Admin dashboard** (`/admin`) now has its own sidebar shell, separate from
the public site's nav/footer:
- **Overview** — stat cards (signups, contact submissions, consent rate,
  last signup)
- **Submissions** — full tables for both forms, including IP/referrer/consent
- **Settings** — live color editor for the public site's theme (see below)
- Campaigns / Subscriber CRM / Analytics / Compliance are listed but grayed
  out — not built yet, see "What's a placeholder right now"

**Two layers of auth checking, on purpose:** `proxy.ts` (Next.js 16's
renamed `middleware.ts`) is the fast first line of defense, blocking
unauthenticated requests before they ever reach a page or API route. But
per Next.js's own guidance — after a real 2025 vulnerability that let
attackers bypass middleware entirely with a crafted header — sensitive
pages and the settings API also re-check the same credentials directly
(`lib/adminAuth.ts`). A future bug in the proxy layer alone can't expose
lead data on its own.

## Editable site theme (the CSS color question)

The design system was already built on Tailwind v4 `@theme` tokens
(`app/globals.css`), which Tailwind compiles into real CSS custom
properties under `:root`. `/admin/settings` lets you override any of them
— page background, card surfaces, the teal/gold/violet/red accents — without
touching code or redeploying.

How it works: the public site's root layout (`app/(marketing)/layout.tsx`)
reads the current values from the `site_settings` table on every request
and injects an inline `<style>` tag with `!important` overrides, which wins
over the compiled defaults regardless of `<head>` tag ordering. Save a
change in Settings, refresh the homepage, see it immediately.

The admin dashboard itself keeps its own fixed dark navy/teal look and
doesn't read from this table — the editable theme only applies to the
public marketing site.

## Email notifications

`/admin/settings` has a second section, below the theme editor, for
configuring an SMTP server. When enabled, every waitlist signup and contact
submission triggers an email to whatever address you configure — no more
needing to remember to check `/admin/submissions`.

Works with any standard SMTP provider — Microsoft 365/Outlook, Gmail, Zoho,
a regular web-hosting mailbox, or a transactional provider like Resend or
Postmark. Configure Host, Port, Username, Password, From address, and where
to send notifications, then hit **Send test email** to confirm it actually
works before relying on it.

**Important if you're using Microsoft 365/Outlook specifically:** Microsoft
is in the middle of retiring username+password ("Basic Auth") SMTP login.
As of mid-2026, it still works normally for existing tenants, but Microsoft
plans to disable it **by default at the end of December 2026** (admins can
manually re-enable it after that), with full removal sometime in the second
half of 2027. Two practical implications:
- If this stops working later in 2026 with an error like `535 5.7.3
  Authentication unsuccessful` or `550 5.7.30 Basic authentication is not
  supported`, that's almost certainly this deprecation, not a bug here.
- If your M365 tenant has never used SMTP AUTH before, it may already be
  disabled by default (Microsoft has been turning it off tenant-by-tenant
  for unused mailboxes since 2021) — an admin may need to re-enable "SMTP
  AUTH Client Submission" for the mailbox in the Exchange admin center first.

If/when this becomes a hassle, the cleanest long-term fix is routing through
a transactional email provider's SMTP relay instead (Resend, Postmark,
SendGrid) — same Host/Port/Username/Password fields here, just pointed at
their servers instead of `smtp.office365.com`, and not affected by
Microsoft's timeline at all.

**Security note:** like the lead data already stored in this database, the
SMTP password is saved in plain text in the local SQLite file — gated by
the same admin Basic Auth and the same "never committed to git" boundary,
not a stronger guarantee than that. Use a dedicated mailbox or app-specific
credential here, not your primary daily-driver password.

A failed or unreachable mail server never blocks a form submission — the
waitlist/contact APIs always save the lead first, then attempt the email
notification separately, and swallow any email error rather than surface
it to the visitor. The SMTP connection itself is capped at ~15 seconds
total (10s to connect, 10s to greet, 15s socket) — a mismatched port/TLS
setting or unreachable host fails with a clear error instead of hanging.

**Worth doing before this goes properly public:** there's currently no rate
limiting or CAPTCHA on the public forms, so someone could script repeated
submissions to flood your inbox or get your SMTP credentials flagged for
abuse by your provider. Not built yet — worth bundling with the form
builder work later.

## Mailchimp sync

A third section on `/admin/settings`, below Email notifications: connect a
Mailchimp account and have new leads added to an audience automatically.

**Setup:** paste your API key (Mailchimp → Account → Extras → API keys),
hit **Fetch audiences** to pull the live list of audiences from your
account into the dropdown (this also doubles as a connection test — if it
fails, the error message comes straight from Mailchimp), pick one, then
Save.

**Two independent toggles**, off by default for contact submissions:
- **Sync waitlist signups** (on by default) — tagged `waitlist` in Mailchimp.
- **Sync contact form submissions** (off by default) — tagged `contact-form`.

The contact-form toggle defaults off deliberately. Checking "I agree to the
Privacy Policy" to send a one-off message is not the same thing as opting
in to a newsletter — bundling those two consents together is the kind of
thing that gets flagged in places with real consent-tracking requirements
(GDPR, CAN-SPAM). Turn it on only if you're comfortable treating everyone
who messages you as a marketing lead. Waitlist signups are different: the
whole point of that form is "we'll email you when EDGE opens up," so
syncing those by default is a reasonable reading of the consent already
given there.

**How it maps fields:** email is always passed through as-is. For the
contact form, the name field is split on the first space into Mailchimp's
default `FNAME`/`LNAME` merge fields — there's no UI yet for mapping to
custom merge fields beyond that, since the waitlist form doesn't collect a
name at all currently. If your audience has custom merge fields you want
populated, this is the piece to extend next.

**Same resilience contract as email notifications:** a wrong API key, a
deleted audience, or a Mailchimp outage can never block a form submission
— the lead is always saved locally first, then the Mailchimp sync is
attempted separately and any failure is logged server-side, never surfaced
to the visitor.

**Security note:** same as the SMTP password — the API key is stored in
plain text in the local SQLite file, masked in the admin UI (only the last
4 characters are ever sent to the browser), gated by the same Basic Auth
boundary as everything else here.

## Form redirects

A fourth section on `/admin/settings`: set a URL for either form to redirect
to after a successful submission, instead of showing the default inline
confirmation message. Leave blank to keep the inline message — that's
still the default for both.

Useful for a dedicated thank-you page, a tracking pixel landing page, or
sending people straight into a funnel. The redirect URL is read server-side
on each page load (`app/(marketing)/download/page.tsx` and
`app/(marketing)/contact/page.tsx`), so changing it in admin takes effect
immediately, same as the theme colors.

## Webhooks

A new live page, `/admin/webhooks` — push lead data to any external URL
(Zapier, a CRM, a Slack incoming webhook, your own server) the moment a
waitlist signup or contact submission comes in. Unlike the other
integrations, this is a real list — add as many webhooks as you want, each
independently scoped to waitlist events, contact events, or both.

**Each request is signed.** Every delivery includes an `X-EDGE-Signature`
header — HMAC-SHA256 of the raw JSON body, using a secret generated
per-webhook (shown once in the admin UI, masked to its last 4 characters
after that, same pattern as the SMTP password and Mailchimp API key). The
receiving end can verify a request actually came from here by recomputing
the same HMAC and comparing. I verified this myself end-to-end against a
local test receiver before shipping this — signature checks out correctly.

**Payload shape:**
```json
{
  "event": "waitlist_signup",
  "timestamp": "2026-06-26T02:02:56.786Z",
  "email": "...",
  "ip_address": "...",
  "referrer": "...",
  "consent": true
}
```
Contact submissions send `"event": "contact_submission"` plus `name` and
`message`. The **Test** button on each webhook sends `"event": "test"` with
a placeholder message, so you can confirm a receiving endpoint is wired up
correctly without waiting for a real lead.

**Same resilience contract as email and Mailchimp** — capped at a 10-second
timeout per webhook, never blocks or fails the form submission, and the
admin page shows the last delivery attempt's status (success or the
specific error) for each webhook so failures aren't silent.

**Important fix made while building this:** the three integrations (email,
Mailchimp, webhooks) used to run one after another for each form
submission — meaning if email was slow AND a webhook was down, the visitor
waited for the *sum* of both timeouts before getting a response. They now
run concurrently (`Promise.allSettled`), so the worst case is bounded by
whichever single integration is slowest, not the total. I caught this by
actually timing a real slow-network scenario in testing, not just reading
the code — worth knowing if you add a fourth integration later: keep it
inside that same `Promise.allSettled` array in `app/api/waitlist/route.ts`
and `app/api/contact/route.ts`, don't bolt it on as another sequential
`await` after.

## Analytics

A new live page, `/admin/analytics` — the last item on the original build
plan. Shows:
- **Total pageviews** and **conversion rate** per form (waitlist signups ÷
  `/download` visits, contact submissions ÷ `/contact` visits)
- **Top pages** and **top referrer sources**, ranked
- **Integration status lights** — green/red dots for Email, Mailchimp, and
  Webhooks, so you can see at a glance what's actually configured without
  digging through each Settings section

**This only counts visits from when pageview tracking went live** — there's
no historical backfill, since nothing was tracking visits before this. A
small client component (`components/PageViewTracker.tsx`) fires a beacon to
`/api/track` on every route change; it's `keepalive: true` and fire-and-
forget, so it can never block or slow down page rendering for a visitor.

**Top performing tickers was deliberately dropped** from the original
wishlist for this section — EDGE doesn't have per-ticker campaign pages
(see the note in an earlier session about why that was skipped), so there's
nothing to rank by ticker. Top referrer sources serves the same underlying
goal — knowing where your traffic is actually coming from — using data this
project already collects.

**A bug I caught and fixed while testing this:** pageview tracking and the
referrer-aggregation query both touch multiple tables, and I initially
verified them against my own sandbox-only SQLite stand-in (the real
database engine on your machine doesn't have this problem — only my local
test substitute did). I traced it down by querying the actual logic
directly rather than trusting the page output, fixed the test substitute,
and reconfirmed every number matched hand-calculated expected values before
shipping this.

## Compliance — footer disclaimer editor

A new live page, `/admin/compliance` — the actual last gap from your
original 5-category wishlist. Edits the mandatory disclaimer text shown in
the footer bar on **every public page**, with a live preview before you
save and a one-click reset back to the original text.

**Scoped specifically to that global footer bar** — not the page-specific
risk callouts elsewhere (the homepage, AI Discovery, Pricing, Security,
Terms, and Privacy pages each have their own `RiskDisclosureBox` content,
written for that page's specific context). Those stay hardcoded on
purpose; the admin page says so explicitly so it's clear what is and isn't
covered. Defaults to the exact text the site already shipped with, so
nothing visibly changes until you actually edit it.

I tested this by editing it through the real API and confirming the new
text appeared on two different pages (homepage and `/contact`) at once,
confirming it's genuinely global rather than scoped to whichever page
happened to load it first.

## SEO

A new live page, `/admin/seo` — controls what shows up in browser tabs,
search results, and link previews, plus Google Analytics.

**Title & description:** edits the actual `<title>` tag and meta
description for every public page (they all share the root layout's
metadata). Includes a live preview of how it'll look in a Google search
result, and a one-click reset back to the defaults. Technically, this
required switching from Next's static `metadata` export to
`generateMetadata()` — the static export can't read from a database at
request time, only the async function can.

**Google Analytics:** just asks for the Measurement ID (the `G-XXXXXXXXXX`
string from GA4 → Admin → Data Streams) — not a generic "paste any script"
box. That's deliberate: a free-text script field on an admin panel is a
stored-XSS risk — anyone who got into `/admin` could inject arbitrary
JavaScript that runs for every visitor, turning a Basic-Auth panel into a
full site compromise. Taking just the ID and generating the standard gtag
snippet myself avoids that while still doing exactly what's needed. If you
later want other tracking pixels (Meta, TikTok, etc.), the same pattern —
a dedicated, validated field per provider — is the way to add them safely.

## reCAPTCHA

A fifth section on `/admin/settings`: add Google reCAPTCHA v2 (the "I'm not
a robot" checkbox) to the waitlist and contact forms. **Off by default —
forms work exactly as they do today until you explicitly enable this.**

**Setup:** register at
[google.com/recaptcha/admin/create](https://www.google.com/recaptcha/admin/create),
paste the site key and secret key in, save. There's also a "use test keys"
button that fills in Google's own published test credentials — they always
pass verification and show a "not valid for production" watermark on the
widget, useful for confirming the wiring works before you have real keys.

**How it works:** when enabled, both forms load the reCAPTCHA widget and
require a completed checkbox before submitting. The token gets verified
server-side against Google's `siteverify` endpoint (the secret key never
reaches the browser) before the lead is saved.

**Different resilience contract on purpose.** Email, Mailchimp, and
webhooks all fail *open* — a broken integration never blocks a real
submission, since those are notification add-ons. reCAPTCHA fails *closed*
— if Google's verification service is unreachable, the submission is
rejected, not silently let through. The entire point of this feature is
blocking bad actors, so silently passing everything through during an
outage would defeat it. I tested this directly: pointed verification at a
dead server and confirmed real submissions get rejected, not waved through.

I also tested the full real flow against a local mock of Google's
documented `siteverify` API contract (can't reach google.com from the
build sandbox) — confirmed missing tokens, invalid tokens, and valid
tokens are all handled correctly, and that the visitor's IP is correctly
forwarded for Google's own risk analysis.

## Homepage content editor

A new live page, `/admin/homepage` — every distinct piece of text on the
homepage is now admin-editable, organized into 7 sections matching the
order they appear on the page (Hero, Stat row, Five signals, Disclaimer,
Platform features, Closing CTA, News section). ~40 fields total, including
the 5 signal cards and 4 feature cards individually.

**What this is, and what it deliberately isn't:** this is a structured
field editor, not a full block-based CMS. Every word on the homepage is
editable, but the page's visual design, layout, and animations all stay
exactly as built — you're editing the text inside a fixed structure, not
rearranging or adding sections. Two options existed here (see the previous
checklist entry); this is the one that's actually buildable in a
reasonable scope without a from-scratch CMS architecture. If you ever want
true drag-and-drop section editing, that's a different, much bigger
project — flag it separately if it comes up.

**Validated server-side, not just client-side** — the API rejects content
where the signal/feature arrays don't have exactly 5/4 items (changing
those counts would silently break the page's layout, since icons/colors
are assigned by array position) or where any field is empty. Each section
has its own "Reset" button back to the original shipped text, plus a
top-level save that submits everything at once.

I tested this by editing one field in every single section simultaneously,
confirming all 7 changes landed on the live homepage at once, then
confirmed both validation rules (wrong array length, empty field) get
rejected with a clear error before anything bad could be saved, then reset
back to the original defaults and confirmed the homepage returned to
exactly its original text.


