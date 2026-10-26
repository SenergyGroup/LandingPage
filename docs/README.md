# SenergyGroup Site — Storefront + Free Widget Picker

## Overview
This app is the SenergyGroup web presence:

| Route | Purpose |
| --- | --- |
| `/` | Homepage — hero, product-type overview, featured widgets, custom-orders teaser, free-widget teaser, about strip |
| `/store` | Full catalog of published widgets (anything in `config/widgets.json` with an `etsyUrl`). Purchases link out to Etsy with UTM tags |
| `/panels` | Shareable Stream Panels catalog with preview cards linking to every available Panel Maker |
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
listing 4573470064, supplied by the user on September 11, 2026. Its price remains
omitted until the live listing price is confirmed. Win95 links to listing
4572959296, verified on the live shop on September 11, 2026 at $29.99.
Both new cards use local approved listing previews. No paid kit guides are
exposed through the public image directory or the free-widget picker.

The Retro Messenger Full Stream Kit is a paid-only entry (`sku-mk-kit-full`). Its
$29.99 price, Etsy listing 4533131913, and platform wording were verified against
the live Etsy listing on September 10, 2026. The parent registry still has older
kit metadata; reconcile that record before running a later `/published` sync so
it does not replace the verified price with the old $44.99 planning price.

## Stream Panels catalog

Share `/panels` to show all available panel styles. The page uses the store's
card grid and site navigation; each card opens its Panel Maker, which links back
to the catalog. Current styles are Retro Messenger, IRC Minimal, and Windows XP.

`config/panels.json` is the single source for catalog cards and the Panel Maker
route allowlist. To add a style, add its `family`, `name`, `description`, and
`aesthetic`; supply `public/panel-makers/{family}.html` and actual About/Schedule
PNG previews at `public/images/panels/{family}/about.png` and `schedule.png`.
Restart the server after changing the catalog. This catalog is independent of
Etsy listings and the email-gated free-widget picker.

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

Homepage and Retro Messenger desktop-app copy live in `desktop-content.mjs`.
`showroom.mjs` owns the shared real-product demo, component metadata and catalog-backed
checkout helper. `desktop-icons.mjs` contains original pixel-style SVG icons.
`server.js` owns their routes and document wrapper, plus `renderStorePage`,
`renderCustomPage`, `renderAboutPage`, `renderClaimPage`, and the smaller
message pages. Showroom styles and browser interactions are scoped in
`public/showroom.css` and `public/showroom.js` (the demo and component browser), and
`public/desktop.css` and `public/desktop.js` (the desktop and window manager).

## Local showroom review (2026-10-25)

From the `LandingPage` directory, run `npm run preview` (PowerShell: `npm.cmd run preview`).
Open `http://127.0.0.1:4173/` and `http://127.0.0.1:4173/looks/retro-messenger`.
Use `PREVIEW_PORT` to choose another port if 4173 is occupied.
Leave the process running while reviewing; Ctrl+C stops a foreground preview.

The preview launcher binds only to 127.0.0.1, skips `.env`, uses an in-memory
database, disables GA4, adds a noindex header, and blocks form submissions,
confirmation, downloads and admin routes. Its top banner identifies preview
mode. **Etsy buttons open the actual existing listings in a new tab.**
The normal `npm start` production behavior is preserved.

Review these paths:

1. Homepage opens Stream Preview first on both desktop and phone. Compare Before → Chat only → Alerts only → Goal only → Full kit.
2. Stream Looks folder → Retro Messenger → What's included → choose any of eight components.
3. Get this look → compare chat-only and full-kit contents and platform support.
4. Both Etsy links use exact listing URLs from `config/widgets.json`, with distinct
   `messenger-chat` / `messenger-kit` UTM placements. The look page sends buyers to
   Etsy for current prices instead of copying unverified prices into new copy.
5. Panel Maker, store filters, free-widget and custom-order navigation still work.
   Forms and private guide downloads are deliberately blocked in preview mode. Panel Maker PNG/ZIP exports are generated locally in the browser.
6. Move windows by their title bars, resize using the corner grip, minimize/restore
   through the taskbar, maximize/restore, close and reopen. Keyboard arrows work on
   title bars and resize grips. Start opens the app menu; Show desktop minimizes apps.
7. Display Properties changes wallpaper and optional dithering. Sound is opt-in;
   the preview chime is synthesized locally. Display preferences and desktop icon positions are saved in
   this browser. Reload restores window layout; no customer or product data is stored.

The October 25 revision follows the user-selected desktop interaction direction:
[Afterlife Pro](https://afterlifepro.neocities.org/),
[React95](https://react95.io/) and [Poolsuite](https://poolsuite.net/).
It uses original icons and window-manager code, with flat teal, gray bevels and blue
title bars. It does not copy those sites' source, artwork, characters or music.
On phones, one window is visible at a time; Start and the horizontally scrollable
taskbar switch apps. Existing store/form/Panel Maker routes are lazy-loaded in
same-origin app windows, and their standalone routes remain available.

The showcase uses actual source-widget recordings, fictional chat/events, and the
user-supplied [Pixabay stock illustration by KoikeYusuke](https://pixabay.com/illustrations/pacman-video-game-7024232/).
The stock image is presentation scenery, not gameplay or a kit asset. Source and
attribution are stored in `public/showroom/credits.json` and linked under the demo.
The extra fake desktop icons and taskbar were removed; the three kit scenes retain
their actual product-rendered desktop. Panels remain in the component browser and
Panel Maker rather than the on-stream showcase.

Play demo runs the relevant chat/events. New follower, New subscriber, Incoming raid,
and Fill the goal replay real widget events. Goal progress is 42/50 to 50/50.
Starting Soon, Be Right Back and Ending are actual scene clips. Playback is silent,
starts by user action, pauses when hidden, and scene-selection autoplay respects
reduced motion. Chat media is cropped to its real border, without the white padding.
No paid widget source, install URL or private guide is publicly served.

To regenerate base assets, run `.venv\Scripts\python.exe LandingPage/scripts/prepare-showroom-assets.py`
from the parent root, **then** `.venv\Scripts\python.exe LandingPage/scripts/prepare-showroom-motion.py`
for the revised crops and animation clips. Both use existing product sources without
changing them. The second script supports `--only` for focused refreshes; inspect its
CLI help before use. Public output is only media. Private harnesses, source hashes,
verification images and logs remain in ignored `.preview/`.

### Local shopping and desktop revision

- `/store` and `/panel-maker/:family` open desktop app windows directly. Their
  `?embedded=1` routes serve the inner tools and keep the existing catalog, filters,
  prices, exact Etsy destinations, panel renderer and whitelist. `shop-app.css`
  gives these tools the same flat gray controls, navy title bars and beveled edges.
- Store filters update the address and retain the desktop. Messenger cards lead
  back to the look page; Panel Maker's kit link now points to the full-kit listing.
- One click or tap opens an icon; Enter also opens it. A 350ms hold picks it up,
  or an intentional movement of 8px starts dragging immediately. Both mouse and
  touch show the same translucent dotted ghost. Releasing drops it without opening
  the app; Escape or a cancelled pointer restores its original position.
  Positions persist separately for phone and desktop layouts. Display → Restore
  default desktop resets both. Alt + arrow keys also moves a focused icon.
  Touch actions are disabled only on icons so mobile browsers do not intercept
  the gesture as scrolling or a link callout; app content retains normal scrolling.
- Mobile panel previews use the 640×200 export canvas at an exact 320×100 CSS size,
  with pixel rendering, rather than squeezing the low-resolution canvas. Narrower
  screens scroll the preview. Bundle thumbnails show the complete source image.
  `image-preview.js` provides Fit / 2× / 100% pixel inspection and panning for catalog
  images and a PNG snapshot of the current panel. Escape closes only the viewer.
- Browser review covered desktop and 390px layouts, catalog filtering, panel text
  updates, full-resolution PNG preview, all comparison modes/scenes, goal completion,
  and icon drag/drop persistence. The IAB download-event check timed out: the unchanged
  file-save flow is **not verified end to end in IAB**. Rendering a full-resolution
  PNG in the image viewer succeeds. No claim of a confirmed file save is made.

Validation: `npm test` exercises existing repeat/aborted downloads, kit filtering,
new routes and local asset links, exact Messenger checkout URLs, and preview
isolation. All 11 tests pass. Desktop and 390px phone layouts were reviewed in a browser,
including playback, comparison states, close-up, keyboard component selection,
window dragging/resizing, maximize/restore, minimize/taskbar restore, Start menu,
wallpaper settings, embedded store filtering and the Panel Maker. Phone taskbar
buttons follow the active app; covered desktop icons are excluded from keyboard
navigation. The final homepage has no browser console errors. This is a
local review build; nothing has been pushed or deployed. Reconfirm listing contents
and current pricing before a separate live-release decision.

## Local desktop/catalog update — October 25, 2026

The homepage now opens Widget Store. Store is first on the desktop and Start menu,
with a permanent taskbar shortcut and a link in each window menu. Free Widget,
Custom Orders, About, and the panel-style directory open in matching desktop
windows; the form, message, and confirmation pages share the gray/navy styling.
The Messenger, XP, and IRC Panel Makers share the same editing chrome while keeping
their original exported panel artwork. Free Widget explicitly supports Streamlabs
and StreamElements. Its existing
eligibility and fulfillment logic is preserved; sending stays disabled in preview.

Desktop icons use shared pointer gestures (click/tap opens; hold/drag moves) and
snap to the closest unoccupied grid cell. Alt + arrow keys skip occupied cells.
Desktop and phone arrangements are saved separately in `senergy-icon-grid-desktop`
and `senergy-icon-grid-mobile`. Resizing reflows colliding or out-of-range slots;
very short viewports can scroll the icon surface. Display's reset restores the grid.

Etsy's authenticated Active listing manager was read without changing any listings.
The recorded USD prices and exact listing IDs are in
[`etsy-catalog-audit-2026-10-25.json`](etsy-catalog-audit-2026-10-25.json).

- 31 active Etsy listings: 12 newly represented, six inactive local listings hidden
  from the paid store with `storeActive: false`. Their records and freebie eligibility
  are retained.
- 28 distinct product cards by default. Four GeoCities listings share one card;
  each purchase includes all four themes. Its disclosure exposes every listing and
  image. “Show all Etsy listings” displays 31 separate cards for comparison.
- Corrected XP kit to $29.99, Pop-Up Stack to $10.99, and Search Results to $11.99.
- New listings use the actual full-size Etsy artwork, copied to
  `public/catalog-etsy/`; source URLs remain in the audit. They are paid-only entries.
- The Windows Chat Mega Bundle is clearly labeled as five chat widgets, separate
  from full stream kits. Checkout stays on the exact Etsy listing, with existing UTMs.

Validation: all 13 automated checks pass, covering listing IDs/prices, both catalog
views, new local images, wrapped/embedded pages, freebie eligibility, grid collisions
across viewport sizes, and the existing download and local-preview safeguards.
Browser review includes desktop and 390px layouts, occupied-cell drops, saved
positions, keyboard grid movement, single-click opening, and the free-widget picker.
Phone-sized testing uses a browser viewport, not a physical handset.

Everything remains local. This price snapshot is not an automatic sync; check Etsy
again before a separately authorized live release.

## Render deployment notes

### Approved desktop-storefront release — October 25, 2026

The user approved publishing the reviewed Windows desktop storefront. Release
preflight reconfirmed all 31 active Etsy listing IDs and USD prices against the
authenticated listing manager with no differences. All 13 regression checks pass.
Render's build surfaced existing dependency advisories; compatible updates to
Express 4.22.3, body-parser 1.20.9, proxy-addr 2.0.8 and qs 6.16.1 resolve them.
The dependency audit reports zero known vulnerabilities and all 13 checks still pass.
The shared Stream Preview now keeps chat and goal stills visible while paused,
after scene changes, and after minimizing/reopening; completed goals retain 50/50.

The existing Render service is `LandingPage` (`srv-d60cpkp4tr6s73e9vhhg`), sourced
from `SenergyGroup/LandingPage` branch `main`. Its build command is `npm install`
and start command is `node server.js`. Publish through that existing service;
do not use `npm run preview` or set `LOCAL_PREVIEW=1` in production. The service
already has a persistent disk mounted at `/data`; preserve its environment and disk.
No database schema changes are part of this release.

The previously live commit is `4dadb366323a1aa4beb305a91ce57c8bd5602aa5`.
If this release fails verification, Render's deployment history can roll the
application back to that commit without restoring or replacing the customer disk.
Verify the deployed desktop, catalog, free-widget picker, Panel Makers and preview
media after Render reports Live. Inbox delivery needs a real opted-in email test;
the automated checks intentionally do not send messages or create subscribers.

- Set `PORT` and `NODE_ENV` in the Render service environment.
- Persist the SQLite database by mounting a disk or migrate to a managed Postgres.
- Ensure `KIT_API_KEY` and `KIT_FORM_ID` are set to enable confirmation emails.
- Set `ADMIN_KEY` to enable the commission-request admin view.

## Analytics

GA4 (gtag) is included on normal pages via `formatHtml` in `server.js`, except
in local preview mode. Outbound
Etsy links are UTM-tagged (`utm_source=senergy-landing`, `utm_medium=web`,
`utm_campaign={slug}`, `utm_content={placement}` — placements: `card-cta`,
`store-cta`, `home-featured`, `home-about`, `about-cta`, `confirmed-cta`,
`footer`, `messenger-chat`, `messenger-kit`).
