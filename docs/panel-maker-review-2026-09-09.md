# Retro Messenger Panel Maker v2 — build + review log

**Date:** 2026-09-09 · **File:** `LandingPage/public/panel-makers/retro-messenger.html` (v1 backed up to `LandingPage/panel-makers-backup/retro-messenger.v1-2026-09-09.html`) · **Route:** `/panel-maker/retro-messenger` (unchanged; no `server.js` edits needed)

## Process

Rebuilt from scratch, then graded by an independent reviewer persona (graphic designer + ~150-viewer Twitch streamer who buys panel packs) with fresh eyes each round. Target 8.5/10, max 3 revisions.

| Round | Score | What the reviewer hit hardest | What changed next |
|---|:-:|---|---|
| v1 (rebuild) | 7.0 | Vector fonts differ per OS; body copy too small at 320px; Support text on the bevel; no avatar upload; `\|`-separated rules | Embedded pixel fonts; layout fixes; avatar upload + icon picker; three real list inputs; Twitch-dark true-size preview; "Preview all" |
| rev 1 | 7.2 | Text off the pixel grid (49 colours in a two-colour word); 10px UI font dissolves at 1x; title too timid; Support bar has no job | **Bitmap text engine**: every string rasterised at 1x with the pixel font, alpha-thresholded, blitted at exactly 2x → verified 2–3 colours per text region. Jersey 25 titles / Jersey 20 body; Subscribe + Commands presets; goal bar; zip numbering + README; dark theme gets a dark field; localStorage |
| rev 2 | 7.4 | Body font's 0/D, 8/B, G/Q, Y ambiguity ("7:DD PM", "32 QB RAM"); list leading too tight; off-day chips mush; handle truncated on Socials; sub-goal PNG goes stale | Hand-drawn override glyphs for 0–9, G, Y on the font's metrics; 17px leading; pressed/embossed chips; handle never trimmed; file-transfer gag by default with goal bar opt-in; status gags de-duplicated; menu bar wired; mobile fixes |
| rev 3 | 7.7 | Discord tagline never rendered for names >8 chars (bug); off-day emboss still smears; status red 3.6:1; title face still reads "Game Boy label" in Win98 chrome | Fixed the Discord bug, flat off-day text, maroon status labels |
| rev 4 (one extra run, Aaron's request) | **7.4** | Different reviewer instance: B/D/P/R counters close up at 320px ("Bits" → "▮its"); off-day chips ~2:1 contrast; long-name ellipsis in Discord; body ink #404040 soft. Praised: hierarchy 8, craft 8, maker UX 8 | Goal bar on by default with editable label/progress; About Me second line; "key - detail" coloured lists (Commands, Specs); include-in-zip checkbox per panel; distinct Commands icon; exact Win98 outer bevel tones; hardened font-ready re-render. **W95FA** (a real Windows-95-shaped face, OFL) was embedded and tested for titles — its 11px outlines sit off the pixel grid in Chromium/Skia, so thresholding broke glyphs; reverted to Jersey 25. Post-review (not re-reviewed): hand-drawn B/D/P/R bitmaps, black body ink, etched off-day chips, #a00000 status labels |

| rev 5 (two more tries, Aaron's request — try 1) | **8.2** | Authenticity 8 / Craft 9 for the first time. Remaining: Midnight purple 2.5:1; Socials "three buttons, one link"; sub-goal staleness; suggested text punctuation; phone hides the true-size preview | **The typeface fix that worked:** dropped web fonts entirely. Three classic UI faces (Liberation Sans Bold 16 + 14, W95FA 13) were pre-rendered through FreeType's 1-bit rasteriser (`make_atlas.py`) and packed into a 19 KB glyph atlas inside the file; text is drawn from the atlas at 1x and blitted at 2x — identical on every OS, zero anti-aliasing, and it finally reads as MS Sans Serif in a Win98 caption bar. Also: shared left edge on every layout, long screen names get their own line, suggested Twitch description text + copy button + one-link hint, Custom preset, transfer-gag filename |
| rev 6 (try 2) | **8.1** | Authenticity 8 / Usefulness 8. Remaining: list panels leave the right half empty; body strike thin at 1x; ragged socials handles; off-day chips; export buttons only in the preview window | Midnight/dark-chrome contrast guard (accent auto-lifted to ≥5:1); Socials rebuilt as one row per platform with per-platform handle inputs; file-transfer gag is the Support default with the numeric goal opt-in; punctuation helper + Discord-invite and tip-link inputs feed the suggested text and README; phones get the true-size dark preview and a static taskbar. Post-review (not re-reviewed): tab-stopped handle column, black off-day labels, status copy |

Two independent reviews in a row at or above 8 (8.2, 8.1). Shipped rev 6.

## What's in v2

- 10 presets (About, Schedule, Rules, Socials, Discord, Subscribe, Support, Commands, Specs, Custom), each with a purpose-built body: buddy-info card with two lines, sign-on day chips, one row per social platform with its own handle, chat-room invite with Join, file-transfer gag (or opt-in numeric goal bar), 3-line lists with "key - detail" colouring.
- Win98 chrome drawn from the widget's own tokens: gradient title bar, min/max/close, File/Edit/People with mnemonics, status gag top-right (`Label: value` gets the widget's red label).
- True bitmap text from a 1-bit glyph atlas (Liberation Sans Bold 16/14 + W95FA 13, both SIL OFL, pre-rendered through FreeType by `make_atlas.py`) — no web fonts, identical on Windows/Mac/Linux, crisp after Twitch's 2:1 downscale.
- Screen name (25 chars), avatar upload (pixelated or smooth), per-panel title/icon/lines/status, day picker + time, social toggles, 5 themes + 3 pickers, per-panel reset, browser persistence.
- Live 2x preview and a true 320px-on-Twitch-dark preview; suggested Twitch description text per panel with a copy button; include-in-zip checkbox per panel; "Preview all"; download one PNG or the set numbered in upload order + `README.txt` (upload steps, what to put in each Twitch text field, suggested text). No libraries; works offline.

## Still open (last reviewer's remaining list, ranked)

1. List panels (Rules, Subscribe, Commands, Specs, Custom) leave the right ~45% of the field empty: allow a 4th line in two columns, or drop the panel's icon at 4x in a sunken well on the right when there are ≤3 lines.
2. Body copy is W95FA 13 (cap 10, 1px stroke) — authentic but at the legibility floor next to Twitch's 13px description text. A second body face (Liberation Sans Regular 13 through the same atlas pass) for panel body lines would add a strike size; the atlas generator makes this a two-line change.
3. Enlarge the social platform marks (28px chip, 12x12 glyphs) — the 8x8 marks vanish at 320px.
4. Duplicate the download buttons under section 4 in the controls window so phones don't scroll up to export; remove the decorative min/max/close on the maker's own windows.
5. Purist nit that will never fully go away with a free face: a bitmap-native bold (Pixel Operator Bold, CC0) for titles if Aaron can fetch it locally; the atlas pipeline takes any TTF.

## Reuse for the IRC and XP makers

The atlas text engine (`rasterise`/`text`/`fit`), `make_atlas.py` (any TTF → 1-bit glyph atlas; the generator is in `LandingPage/docs/panel-maker-make_atlas.py`), the zip writer, persistence, preview-all, suggested-text and the controls layout are family-agnostic. Swap: the pixel icons, the chrome drawing (`raised`/`sunken`/title bar), the theme table, the faces (IRC: a terminal face such as DejaVu Sans Mono 13 through the same pass; XP: Luna chrome + Trebuchet-like — Liberation Sans works), and the preset copy/gags.
