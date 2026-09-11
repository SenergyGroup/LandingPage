# SenergyGroup Site — Storefront + Free Widget Picker

## Overview
This app is the SenergyGroup web presence:

| Route | Purpose |
| --- | --- |
| `/` | Homepage — hero, product-type overview, featured widgets, custom-orders teaser, free-widget teaser, about strip |
| `/store` | Full catalog of published widgets (anything in `config/widgets.json` with an `etsyUrl`). Purchases link out to Etsy with UTM tags |
| `/claim` | Free widget picker — choose one freebie, confirm email via Kit (ConvertKit), download unlocks |
| `/custom` | Custom commission page — intro pricing table + request form (saved to SQLite `custom_requests`) |
| `/custom/thanks` | Post-submission confirmation |
| `/about` | About the shop |
| `/admin/requests?key=ADMIN_KEY` | Owner-only list of custom commission requests (404 unless `ADMIN_KEY` is set in `.env` and matches) |
| `/check-email`, `/confirmed`, `/download/:token` | Claim-flow fulfillment (unchanged) |
| `/panel-maker/:family` | Self-serve Twitch panel generators for kit buyers |

The whole site shares one retro Win95-style theme (`public/styles.css`): beveled
windows, navy title bars, taskbar-style navigation with a pressed state marking
the current page.

## Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

### Environment variables

Beyond the existing Kit/claim settings:

- `ADMIN_KEY` — secret for `/admin/requests`. Unset = admin view disabled.
- `ETSY_SHOP_URL` — defaults to `https://www.etsy.com/shop/SenergyGroup`.

## Widget configuration

Widget definitions live in `config/widgets.json`:

```json
{
  "id": "sku-01-crt-terminal",
  "name": "CRT Terminal",
  "description": "Green-on-black monospace terminal...",
  "category": "chat",
  "productType": "chat",
  "aesthetic": "retro",
  "price": 12.99,
  "etsyUrl": "https://www.etsy.com/listing/...",
  "publishedAt": "2026-04-19",
  "freebie": true
}
```

Field semantics:

- `etsyUrl` set → the widget appears in `/store` (and gets a "View on Etsy" link on its claim card).
- `etsyLinkType: "shop"` → use "Visit Etsy shop" for an upcoming product whose direct listing is not available yet. Keep it paid-only and omit an unconfirmed price. Replace the destination and remove this flag when the direct Etsy listing is supplied.
- `freebie: false` → store-only paid listing; never shown in the claim form. Entries default to freebie when the field is missing.
- `price` → shown on store cards. Missing price renders without a tag (not an error).
- `productType: "bundle"` → gets a Bundle badge and sorts first in the store.
- `badgeText` → optional label for a bundle badge (for example, "Full Stream Kit").
- `/store?type=bundle` shows ready-made kits/bundles; `/store?type=chat` shows chat widgets. Aesthetic filters retain the selected product type. Homepage alerts and scenes point to the kit that includes them; custom commissions remain at `/custom`.

Thumbnails and download PDFs resolve by folder scan: `public/images/{id}/` (first
PNG/JPG/WEBP/SVG) and `assets/zips/{id}/` (first PDF/ZIP). No explicit
`thumbnail`/`zip` fields needed.

The main repo's `/published` skill upserts entries here after an Etsy listing
goes live.

The kit category contains three paid-only entries: Windows XP (`sku-xp-kit-full`),
Win95 (`sku-w95-kit-full`), and Retro Messenger (`sku-mk-kit-full`). XP links to
the Etsy shop at the user's request until its listing is published. Win95 links
to listing 4572959296, verified on the live shop on September 11, 2026 at $29.99.
Both new cards use local approved listing previews. No paid kit guides are
exposed through the public image directory or the free-widget picker.

The Retro Messenger Full Stream Kit is a paid-only entry (`sku-mk-kit-full`). Its
$29.99 price, Etsy listing 4533131913, and platform wording were verified against
the live Etsy listing on September 10, 2026. The parent registry still has older
kit metadata; reconcile that record before running a later `/published` sync so
it does not replace the verified price with the old $44.99 planning price.

## Download access and regression checks

Confirmed and delivered claim tokens both remain valid for repeat downloads,
including from a new browser/device. The first completed local-file transfer sets
`delivered_at`; retries keep that timestamp. HEAD requests and cancelled transfers
do not record a completed download. Download errors after headers are sent close
the response instead of trying to send another error page.

When `DOWNLOAD_BASE_URL` is configured, the app redirects to that host and keeps
the claim usable. A redirect does not establish successful delivery from the
external host; external file availability and inbox delivery require their own
live checks.

Run `npm test` for isolated HTTP regression checks. Tests use temporary fixture
files, an in-memory database, and blocked outbound requests. They never load
the production `.env` or create real subscribers.

## Custom commission pricing

The `/custom` pricing table and its request-form checkboxes both render from the
`CUSTOM_PIECES` array at the top of `server.js` — edit prices there, in one place.

Custom requests are stored in the `custom_requests` SQLite table. Review them at
`/admin/requests?key=...` and reply by email; payment happens through a private
Etsy listing you create per order.

## Editing landing copy

All page copy lives in `server.js` — `renderHomePage`, `renderStorePage`,
`renderCustomPage`, `renderAboutPage`, `renderClaimPage`, and the smaller
message pages.

## Render deployment notes

- Set `PORT` and `NODE_ENV` in the Render service environment.
- Persist the SQLite database by mounting a disk or migrate to a managed Postgres.
- Ensure `KIT_API_KEY` and `KIT_FORM_ID` are set to enable confirmation emails.
- Set `ADMIN_KEY` to enable the commission-request admin view.

## Analytics

GA4 (gtag) is included on every page via `formatHtml` in `server.js`. Outbound
Etsy links are UTM-tagged (`utm_source=senergy-landing`, `utm_medium=web`,
`utm_campaign={slug}`, `utm_content={placement}` — placements: `card-cta`,
`store-cta`, `home-featured`, `home-about`, `about-cta`, `confirmed-cta`,
`footer`).
