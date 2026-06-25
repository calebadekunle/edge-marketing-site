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
- **Waitlist form** — captures email into local component state only. No
  backend wired up. Replace with a real provider (e.g. Resend, Mailchimp,
  ConvertKit, or a simple API route + database) before launch.
- **Contact form** — same as above, local state only, no email delivery wired up.
- **Pricing** — illustrative tiers/features, not final numbers.
- **"Get the app" CTA** — currently points to `/download` (the waitlist
  page). Update this once there's a real app URL or store listing to link to.
- **Terms & Conditions / Privacy Policy** — draft templates only. Must be
  reviewed and finalized by qualified legal counsel before public launch.

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
