# Senergy Panel Maker — Build Guide & Best Practices

How we build **self-serve Twitch panel makers** for our stream kits so every one is consistent,
converts, and matches its kit's aesthetic. Read this before building the next one.

Live examples that already follow this spec:

- `public/panel-makers/retro-messenger.html` — Win9x gray chrome
- `public/panel-makers/irc-minimal.html` — dark IRC monospace
- `public/panel-makers/windows-xp.html` — Luna blue chrome

All three are served through the `/panel-maker/:family` route in `server.js`.

---

## 1. Why panels matter (design for conversion, not decoration)

Panels sit directly under the stream and answer, in the first ~10 seconds, the questions every new
viewer has: *Who is this? What do they stream? When are they live? Is this community worth joining?
Where do I go for Discord / socials / support?*

Treat the About section like a **landing page**, not decoration. Every panel should push one of four
outcomes: a **follow**, a **Discord join**, a **sub**, or **support** (bits/tips/sponsors). Our maker's
job is to let a buyer produce that whole set in their kit's look in a couple of minutes.

*Source: StreamScheme, "Best Twitch Panels (2026)" — https://www.streamscheme.com/best-twitch-panels/*

---

## 2. Twitch technical constraints (bake these into every maker)

- **Max width is 320px.** Anything wider gets cropped by Twitch. This is the one hard rule.
- **Height is flexible.** Twitch's own default suggestion is 320×160; header-style banners commonly
  run shorter.
- **Panels are static images** (PNG/JPEG). Real animation needs a third-party extension, so we ship
  static PNGs. Never depend on motion.
- **Text lives in two places:** on the *banner image* (the title/art) and in Twitch's *own text field*
  below it (links, longer copy). Design the banner as a header; let the streamer put links in Twitch's
  description/"Image links to" field. Our download hint reminds them of this.

### Our house render size

We render the maker canvas at **640×200 (2× of 320×100)** and export PNG. That 2× supersample keeps
text and edges crisp when Twitch scales it down to the 320px column. Keep this ratio unless a kit has
a deliberate reason to change it — consistency across the catalog matters more than pixel-perfection
on any one kit.

---

## 3. The canonical panel set (ship presets for these)

StreamScheme's "8 panels every streamer should have" maps onto the presets each maker should offer.
Give buyers quick-preset buttons so they don't start from a blank box:

| Preset (button) | Purpose | Conversion goal |
|---|---|---|
| **About Me** | What they stream + vibe + what to expect. Not a life story. | Retention |
| **Schedule** | A "most likely" schedule beats none — kills "I'll follow later". | Follow |
| **Rules** | Lets mods enforce without being the bad guy; stops trolls early. | Safety |
| **Socials** | 2–3 platforms they actually use, not a link dump. | Retention |
| **Support / Donate** | Clean and respectful — support without looking desperate. | Support |

Discord and PC Specs are also high-performers (Discord is the single best conversion panel; PC/Setup
over-performs with FPS/tech audiences). Add them as presets when a kit's audience fits. Keep each
maker to ~5 presets so the UI stays tight; the presets are just starting points buyers edit.

---

## 4. What a great panel looks like (lessons from a pro example)

The reference below is a professionally built "Midnight Emmy" About section. It's a good model for the
*output* our makers should be capable of producing:

- **One cohesive theme across every panel.** Same palette (purple/pink "Midnight"), same header
  treatment, same fonts. Nothing looks bolted on. → Our makers enforce this by locking chrome to the
  kit aesthetic and exposing only a couple of accent color pickers.
- **Header banner = gradient bar + big white title + drop shadow + a small themed mascot/icon.** The
  title is instantly readable; the character art gives personality without stealing the words. → We
  mirror this with a themed title bar, a bold high-contrast title, and a per-panel pixel/emblem icon.
- **Scannable body copy.** Rules are a short numbered list; Subscribe is a benefits list with `♥`
  bullets; About Me is a tiny Q&A ("Who are you?", "First stream?"). Nobody reads walls of text. → Our
  "small line / tagline" field is deliberately short (~40 chars) to force this discipline.
- **Clear hierarchy: image banner up top, Twitch text underneath.** The art carries the title; the
  text field carries the links and detail. → Our download hint tells buyers to do exactly this.

*(Reference image reviewed for this guide: the "Midnight Emmy" panel layout — Social, Rules, Subscribe,
About Me, Emotes Showcase, PC Build.)*

---

## 5. Anatomy of a Senergy panel maker (the shared contract)

Every maker is **one self-contained `.html` file**, canvas-only, **no libraries, works offline**.
It has three stacked "windows" styled in the kit's chrome:

**Window 1 — Controls**

- Quick-preset buttons (the set from §3), each sets title + tagline + icon + socials.
- `title` text input (short maxlength, ~20–26 chars).
- `subtitle` / small-line input (~40–44 chars).
- Icon picker (kit-appropriate emblems; the XP maker rasterizes the product's own pixel icons).
- Social toggles (YouTube / Instagram / X / TikTok / Discord / Twitch) rendered in the kit's style.
- 2–3 color pickers for accents only (e.g. title base, glass band, window). **Do not** expose enough
  controls to let a buyer break the aesthetic.

**Window 2 — Preview + download**

- `<canvas width="640" height="200">` live preview, redrawn on every input.
- **Download PNG** button; filename derived from the title (`panel_about_me.png`).
- A hint line: *"Upload on Twitch under About → Edit Panels → Add a Text or Image Panel → Add Image.
  Put your links in the panel's 'Image Links To' / description fields."*

**Window 3 — Kit CTA**

- One line: *"Part of the {Kit} Stream Kit — chat, alerts, scenes, goal bars & game frame."*
- A **View on Etsy →** button. Link the kit listing once live; until then link the hero widget's
  listing. Always UTM-tag it: `utm_source=panel-maker&utm_medium=web&utm_campaign={family}`.

### Rendering conventions

- Redraw on every `oninput` / `onchange` — the preview is always live.
- Draw chrome with hand-built canvas gradients/shapes from the kit's design tokens (reuse the hero
  widget's exact colors — pull them from the kit's `panels.json`/widget CSS, don't eyeball).
- For pixel icons, set `imageSmoothingEnabled = false` around `drawImage` so they stay crisp.
- Constrain title text with a max-width in `fillText` so long titles never collide with the buttons.
- Re-run `draw()` on `document.fonts.ready` so custom fonts don't render the first frame unstyled.

---

## 6. Build checklist (a new maker "conforms" when all pass)

- [ ] Single `.html` file in `public/panel-makers/{family}.html`, no external JS/CSS libraries.
- [ ] Chrome matches the kit's hero aesthetic; colors sourced from the kit's real tokens.
- [ ] Canvas is 640×200; PNG export; filename from title.
- [ ] Presets cover About / Schedule / Rules / Socials / Support (+ kit-appropriate extras).
- [ ] Title and small-line inputs have sensible maxlengths (short = better panels).
- [ ] Social toggles + at least an accent color picker, but **not** enough to break the theme.
- [ ] Twitch upload hint present; explains banner-image vs. text-field split.
- [ ] Kit CTA window with a UTM-tagged **View on Etsy →** link.
- [ ] `family` added to `PANEL_MAKER_FAMILIES` in `server.js`.
- [ ] Route verified: `/panel-maker/{family}` → 200 and serves the right page; unknown → 404.
- [ ] Embedded `<script>` passes a syntax check.

---

## 7. Wiring it into the landing page

The route is a small whitelist in `server.js` — this keeps the URL space tight and blocks path
tricks. Add the new family to the set; the handler serves `public/panel-makers/{family}.html`:

```js
const PANEL_MAKER_FAMILIES = new Set(["retro-messenger", "irc-minimal", "windows-xp"]);
app.get("/panel-maker/:family", (req, res) => {
  const family = String(req.params.family || "").toLowerCase();
  if (!PANEL_MAKER_FAMILIES.has(family)) { res.status(404).send(renderErrorPage("Page not found.")); return; }
  res.sendFile(path.join(ASSETS_DIR, "panel-makers", `${family}.html`));
});
```

Naming: use the kit's `stack.family` slug for both the filename and the whitelist entry
(`windows-xp.html` ↔ `"windows-xp"`).

---

## 8. Do / Don't

**Do**

- Design for one conversion per panel; keep copy scannable.
- Lock the aesthetic to the kit and give buyers just enough knobs (text, icon, accents).
- Keep it offline-capable and dependency-free — it ships inside the kit *and* hosts on the landing page.
- Reuse the exact hero design tokens so the maker output matches the pre-made banners.

**Don't**

- Exceed 320px effective width, or rely on animation.
- Dump 40 commands / 10 social links — curate.
- Expose so many controls that a buyer can wreck the theme.
- Hardcode a bare Etsy URL — always UTM-tag the CTA.
- Reintroduce heavy fonts or libraries; canvas + system/embedded fonts only.

---

## Sources & references

- StreamScheme — *Best Twitch Panels (2026): Free Templates, Sizes, and Pro Examples*:
  https://www.streamscheme.com/best-twitch-panels/ (panel sizing, the 8-panel set, conversion framing)
- Reference image: "Midnight Emmy" About-section layout (cohesive theming, header-banner + text split,
  scannable body copy)
- House implementations: `public/panel-makers/{retro-messenger,irc-minimal,windows-xp}.html`
- Product-side panel spec: `workflows/create_panels.md` and each kit's `widgets/{slug}/panels.json`
