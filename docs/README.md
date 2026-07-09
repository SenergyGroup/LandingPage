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
- `freebie: false` → store-only paid listing; never shown in the claim form. Entries default to freebie when the field is missing.
- `price` → shown on store cards. Missing price renders without a tag (not an error).
- `productType: "bundle"` → gets a Bundle badge and sorts first in the store.

Thumbnails and download PDFs resolve by folder scan: `public/images/{id}/` (first
PNG/JPG/WEBP/SVG) and `assets/zips/{id}/` (first PDF/ZIP). No explicit
`thumbnail`/`zip` fields needed.

The main repo's `/published` skill upserts entries here after an Etsy listing
goes live.

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
