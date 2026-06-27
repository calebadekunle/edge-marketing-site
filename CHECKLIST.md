# EDGE — Pending checklist

Things to come back to. Add more anytime — just say "add to checklist."

## Testing (do once you're ready)

- [ ] Test Mailchimp integration end-to-end with a real account: fetch
      audiences, save, submit a real waitlist signup, confirm it shows up
      in the Mailchimp audience tagged `waitlist`.
- [ ] Test webhooks end-to-end with a real external URL (Zapier, Slack
      incoming webhook, etc.) — add it in `/admin/webhooks`, hit Test,
      then submit a real waitlist/contact form and confirm delivery.
- [ ] Get real reCAPTCHA keys from google.com/recaptcha/admin/create and
      swap them in at `/admin/settings` — currently only tested with
      Google's public test keys (always pass, "not for production" badge).
- [ ] Get a real GA4 Measurement ID and confirm traffic shows up in
      Google Analytics within a day — only tested that the script tag
      injects correctly, not an actual GA account.

## Build plan status — every item from the original 5-category wishlist is built

1. [x] Integration & API Settings — Mailchimp ✓, SMTP/Email ✓, Webhook Manager ✓
2. [x] Form & Campaign Management — Form redirects ✓; ticker/campaign
      pages deliberately skipped (doesn't match EDGE's actual product)
3. [x] Lead & Subscriber Log — local DB ✓, IP/timestamp/referrer ✓
4. [x] Traffic & Optimization Analytics — conversion rates, top referrers,
      integration status lights ✓
5. [x] Legal Disclosure & Compliance Control — Privacy Policy checkbox ✓
      (Phase 1), footer disclaimer editor ✓

## Added beyond the original wishlist

- [x] Admin UI redesign (sidebar, Overview, Submissions, Homepage, Settings,
      SEO, Webhooks, Analytics, Compliance — all live)
- [x] Editable site theme colors
- [x] SEO (title/description editor, Google Analytics)
- [x] Google reCAPTCHA v2 on both public forms — built, **not yet tested
      with real keys, only Google's public test credentials**
- [x] Homepage content editor — every text field on the homepage (~40
      fields across 7 sections), structured-field approach not a full CMS

## Decided against (with reasoning, not forgotten)

- Per-ticker campaign landing pages — doesn't match EDGE's actual product
  (one app, not a multi-ticker promo platform)
- Subscriber CRM beyond Submissions — never actually requested, the
  Submissions page already covers the real "Lead & Subscriber Log" ask
- Full block-based CMS for the homepage (drag-and-drop sections, rich text)
  — went with the structured-field version instead; revisit only if a true
  visual page builder becomes a real need later
