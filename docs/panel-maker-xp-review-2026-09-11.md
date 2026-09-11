# Windows XP Panel Maker v2 — build + review log

**Date:** 2026-09-11 · **File:** `LandingPage/public/panel-makers/windows-xp.html` (v1 backed up to `LandingPage/panel-makers-backup/windows-xp.v1-2026-09-11.html`; the kit's own copy `widgets/sku-xp-06-panels/panel_maker.html` was updated to the same file) · **Route:** `/panel-maker/windows-xp` (unchanged) · **CTA UTM:** `utm_source=panel-maker&utm_medium=web&utm_campaign=windows-xp` (kept from v1) · **Contact sheet:** `docs/panel-maker-xp-preview-2026-09-11.png` (final build) · **Maker UI:** `docs/panel-maker-xp-ui-2026-09-11.png` (final build) · **Source + tooling:** `docs/panel-maker-xp-src/` (see "Rebuilding" below)

## Status (2026-09-11, second session)

Aaron asked for the same process as the retro maker (fresh independent reviewer per round, target ≥8, cap 3 revisions) and the **retro-messenger two-window layout** (not the IRC one-window layout), re-skinned as Luna. The first session ran three reviews (**8.0 → 8.0 → 8.0**) and handed off rev 3 un-reviewed. In the second session the package hosts were reachable again, so Aaron chose **"fix, then review"**: build a rev 4 with the three blocked authenticity items (Tahoma body text, a Trebuchet-shaped caption, XP-shaded icons) and spend the final review on it — one revision past the cap, by his call.

**Round 4 scored 7.8** (A 8.5 / B 7.5 / C 7.5 / D 8.0 / E 7.0 / F 8.0). Authenticity is the highest any round has given (8.5 — "the pixel-true Tahoma alone puts them above the typical pack"). The overall dropped because this reviewer went much deeper on the workflow: it ran ~20 edge cases in Playwright and found real bugs that were in every earlier build too (non-ASCII → `?`, 7th social silently dropped, a dead Tagline field, caption buttons on a half pixel, run-on descriptions, 40-char tip field). It also marked legibility down for size: the 11px Tahoma strike is smaller than the old 12px DejaVu (r3 gave B 9). Reviewer instances vary ±0.3 on the same build, so 7.8 vs 8.0 is within noise on the unchanged parts; the B drop is a real trade-off of going authentic.

**Shipped = rev 4 + post-review bug fixes (NOT re-reviewed — the review cap is spent):** see "Post-review fixes" below. Scores above are for rev 4 as reviewed.

| Round | Score (A/B/C/D/E/F) | What the reviewer hit hardest | What changed next |
|---|:-:|---|---|
| v2 build | **8.0** (7.5 / 7.5 / 8 / 8.5 / 8.5 / 7.5) | Body-face comma read as a full stop; the Rules shield vanished on the Luna-blue bar (same fill); the cream 3px mat around the title bar ("card, not window"); Noir panels had no edge on Twitch's ground; Silver caption 2.85:1. Praised: 1-bit text verified at 320 (2 colours per text region), README + suggested text, craft 8.5 | Comma/semicolon hand-fixed (`atlas_patch.py`); shield redrawn with a rim; **real Luna frame** — the caption colour wraps the client on three sides, title bar spans the full width; dark-theme outline guarded ≥2.6:1 vs #0e0e10; pastel bars get a darker lower half + stronger shadow; preview ground = Twitch's #0e0e10; 2 spare slots (Merch, Spare) off by default; per-file "Image Links To" in the README; Socials drops the platform-name column before trimming a handle; duck user tile; no window drop shadow (XP had none); #cv capped at 640 |
| rev 1 | **8.0** (8 / 7.5 / 7.5 / 8 / 8 / 7.5) | Lit day-chip labels under the gloss; bold `!` was a 1px stem beside 2px letters; ragged "key - detail" column; Noir's dark client area "is Win10, not XP"; include-checkbox visually attached to the wrong button; #cv1 clipped at 375px phones | Gloss shrunk + chip ink guarded (`chipInk`, in contrast.txt); `!` and `_` widened in the bold face; detail column aligned on the widest key; chips fill the row (7×80+36); **Noir = dark chrome + beige client** (Zune-correct), orange accent; checkbox moved LEFT of its button; `#cv1 max-width:100%`; icon picker at 2x; cart/help icons for the spare slots; Support = the endless "3 sec left" copy estimate at 68%; tip link never fabricated; softer Silver shadow |
| rev 2 | **8.0** (8 / 9 / 7 / 7.5 / 8 / 8) | Status gag as loud as the content (bold accent); Support: file name outranked the ask + two countdowns; icons "a generation older" (16-colour, hard outlines); About name 2px above the well; three right edges; Discord icon unframed; "Download the set (10 .zip)" | **rev 3 (shipped, not re-reviewed):** status gag in the regular face (coloured, not bold) on the content column's right edge; Support ask in the emphasis face, file name quiet, status `Speed: 56 kbps`; solid shield + cart with highlights; About lines on a 26px pitch aligned to the well; Discord icon in a tile; task-pane chevrons instead of square bullets; "Uptime: 0 min"; Silver bar #8b8ea4; per-panel **Image Links To** field (feeds the README); un-ticked single download gets no number; Pixelate hidden until a picture exists; phone: pinned preview drops to the strip while typing; menu text black again |
| rev 3 | not reviewed | — (built + shipped by the first session from review 3's top 5) | rev 4: Tahoma strikes, Fira caption, shaded + 32-bit icons |
| **rev 4** | **7.8** (8.5 / 7.5 / 7.5 / 8 / 7 / 8) | Descriptions paste as run-on lines, Socials text has no links; non-ASCII → `?` silently; Socials drops the 7th platform, dead Tagline field; Silver/Olive caption 3.2–3.5:1, navy button rims on every theme, DejaVu names/times "not XP"; caption buttons on an odd y (soft rims at 1x), thin progress chunks, " - " key colouring fires on prose, 11px body "is the size ceiling". Praised: real 1-bit Tahoma, Luna controls, gags, the maker ("well above anything else on Etsy") | Post-review bug fixes (below), shipped without a 5th review |

Reviewer instances vary ±0.3 on the same build; three 8.0s from different reviewers with different top complaints is the same "good, I'd notice the seams" verdict each time. The round-4 reviewer was the most thorough of the four (edge-case runs, not just the captures), which is part of why it scored lower on E.

## What changed in rev 4 (reviewed)

- **Body + menu text = Tahoma 8pt.** `B`/`E` faces are now Wine's hand-drawn 11px Tahoma / Tahoma Bold bitmap strikes (`fonts/tahoma-11.bdf`, `tahomabd-11.bdf`, LGPL, exported from Wine's `tahoma.sfd` with FontForge). `make_atlas.py` gained a BDF path (`["x.bdf", 11, "bdf:3"]` — pixels copied as-is, the number is the space advance). The strikes already have the fixes rev 1–3 hand-drew into DejaVu (i/j dot gap, comma tail, 2px bold `!`, full `_`), so `atlas_patch.py` lost those and only widens the bold comma/period advance by 1px.
- **Caption = Fira Sans Bold 13 (aa).** Splayed M and tailed l — the two Trebuchet tells — at the same cap height (9px) as Carlito. Chosen over Ubuntu, PT Sans, Signika, Cabin, Source Sans 3, Istok, Encode Sans SC, Asap and 6 others rendered in the real title bar. Names/times (`H`) stay DejaVu Condensed Bold 14 (Wine's bold strikes ≥13px are broken).
- **Icons.** Tiles (lists, Discord invite) and the stock duck picture are new **32-bit-style canvas art** (`VEC` in `xp-icons.js`: gradients lit from the top-left, outlines in a dark tone of the fill, gloss, soft bottom-right shadow; rendered once at 1x, blitted at 2x). The 16px title-bar/button icons keep the kit's pixel designs but are **shaded at load** (`smallIcon()`: a light ramp per colour region, outlines re-toned from navy to the fill's own dark). The icon picker shows the tile art.

## Post-review fixes (shipped, not re-reviewed)

Bugs from review 4 that existed in every build, fixed without changing the look:
- Caption buttons at `ty + 6` (even) — their white rims are now single crisp rows at 1x.
- Latin-1 + curly quotes/•/€ added to all four faces (atlas 28 KB → 60 KB; page 168 KB); a yellow note under "Panel title" names any character the fonts can't draw (emoji etc.), and an emoji is one `?` not two.
- Socials: a 7th platform can't be ticked (the "up to 6" label flashes red) instead of being silently dropped; the Tagline field is hidden for Socials (it was never drawn); **Twitch is off by default** (the panel sits on your Twitch page) → defaults are YouTube, Discord, TikTok.
- " - " key colouring is off for the prose panels (Rules, Subscribe) — "Be kind - no hate" stays one plain line; the hint under the lines follows.
- Descriptions paste as Twitch Markdown: numbered Rules, `- ` bullets for Commands/Specs/Subscribe/custom, **Socials as real links** built from the handles (`[YouTube](https://youtube.com/@handle)`, accents stripped for the URL guess), Discord/tip as links when filled, Subscribe links `twitch.tv/<login>/subscribe` (also auto-filled as its README "Image Links To"), "Hey, I'm …", no duplicate "Mods have the final say". README indents each description line; the suggestion box is 4 rows.
- Field limits: tip link 40 → 80, time 14 → 24 (the schedule note gives way to a long time); Support's README line no longer mentions goal numbers by default.
- Regression check: `edge.js` (accents + emoji name, 7 socials, prose rule, dual-time-zone schedule, long tip URL, zip + README) — no page errors.

## What's in v2

- Same 10 presets and controls layout as the retro maker (1 Pick a panel · 2 About you · 3 This panel · 4 Colors, preview + download window), plus two spare list slots off by default.
- **Luna chrome drawn in canvas from the kit's tokens:** 1px outline, caption-coloured frame on three sides, rounded top, the hero gradient (base → glass band at 9% → base), 21px glossy min/max/red-close, Trebuchet-style anti-aliased caption with a 1px shadow, `File Edit View Help` + a status gag, flat #7f9db9 client border.
- Layouts: user tile (uploaded picture, smooth by default, or the duck), Luna day buttons (lit = accent), one row per social platform (chips + name + handle), file-copy gag or opt-in numeric goal with the green chunked progress bar, chat invite with the default-button ring on Join, 3-line lists with chevrons and the panel's icon in a task-pane tile when the lines leave room.
- **Text engine:** the retro/IRC 1x→2x atlas engine extended with an **anti-aliased face** (`"aa"`: one hex digit per pixel) and, in rev 4, **bitmap strikes** (`"bdf:N"`). Faces: Fira Sans Bold 13 (aa, caption), Wine Tahoma 11px + Tahoma Bold 11px strikes (body, menu, keys), DejaVu Sans Condensed Bold 14 (names, times). Revs 1–3 used Carlito Bold 14 + DejaVu Condensed 12 because no package host was reachable in the first session.
- **Icons:** 16px kit pixel art shaded at load (title bar, maker buttons); 32-bit-style canvas art for tiles, the invite and the stock duck (rev 4).
- Five themes (Luna Blue, Olive Green, Silver, Royale, Noir) + four pickers (title, glass band, window, **accent**). Guards: accent ≥4.5:1 (light) / 5:1 (dark) on the client, status label ≥4.5:1 on the window, chip label ≥4.5:1, dark-bar outline ≥2.6:1 vs Twitch.
- Zip + README (upload steps, per-file Image Links To, suggested text, Markdown note, display-scaling note), localStorage, Preview all, DPR-aware true-size preview on #0e0e10, capture hooks (`window.__panelMaker.render/load/setAvatar/setNick/setTheme/themes/palette`).

## Still open (ranked, after round 4)

1. **Legibility vs authenticity** — the 11px Tahoma strike is XP-exact but smaller than Twitch's own description text (B 9 → 7.5). If Aaron prefers size: set `B`/`E` back to DejaVu Condensed 12 in `xp-faces.json` and restore `atlas_patch.rev3.py` (one rebuild). A middle road is Wine's 12px strike for `B` only (it exists; the 12px bold has spacing collisions).
2. **Theme pass** — Silver 3.23:1 / Olive 3.46:1 caption (the `titleInk` switch is 2.2:1; a paler Metallic bar with dark caption ink would be truer); push-button rim + default ring are hard-coded Luna navy on every theme (`xpBtn`).
3. **Names/times face** — DejaVu Condensed Bold 14 is the last non-XP face (reviewer: "slightly Linux game"). Candidates: Fira Sans Bold 1-bit, or Tahoma Bold via Wine's 12px strike with the c/o spacing hand-fixed.
4. **Socials layout** — ~45% empty on the right with 3 platforms (add the network tile like lists); with 4–6 long handles the names column drops and identical `@handle` rows remain.
5. **Pixel details** — progress chunks 4px tall (read as dashes; `ph` 20 → 26), content left edge x=11 vs x=13 between tile and bullet layouts, long Discord names end ~7px from Join.
6. From earlier rounds: 3 lines / 640×200 (catalogue decision), 12-slot hard cap, phone sticky block, include-checkbox tap targets on phones, settings only in localStorage (no export/import), taskbar CTA points at the chat-widget listing (TODO in the source), README shop URL has no UTM.

## Rebuilding

`docs/panel-maker-xp-src/` holds the pieces: `windows-xp.src.html` (page with `__ICONS__`/`__ATLAS__` placeholders), `xp-icons.js` (16px grids + `smallIcon()` shading + `VEC` 32-bit tile art), `xp-faces.json`, `fonts/` (the Tahoma BDF strikes, Fira Sans Bold + OFL, `NOTICE.md` with sources/licences), `make_atlas.py` (the shared generator, now with aa + BDF modes — also copied over `docs/panel-maker-make_atlas.py`), `atlas_patch.py` (`atlas_patch.rev3.py` = the old DejaVu patches, for a revert), `build.py`, `capture.js`, `edge.js`, `sheet.py`. Sequence in the cloud sandbox (Playwright + PIL + fontTools; run from `panel-maker-xp-src/`):

```
python3 make_atlas.py xp-faces.json xp-atlas.json && python3 atlas_patch.py xp-atlas.json
python3 build.py                        # -> windows-xp.html
node capture.js windows-xp.html captures/rN && python3 sheet.py captures/rN default sheet.png
node edge.js                            # edge cases -> captures/edge/
```

Reviews r1–r4 are in `docs/panel-maker-xp-src/reviews/`. Rev 3 (the build shipped before this session) is backed up as `panel-makers-backup/windows-xp.rev3-2026-09-11.html`.
