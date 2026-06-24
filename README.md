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
