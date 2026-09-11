# Windows XP Panel Maker — independent review (r4 captures)

*What I looked at:* `windows-xp.html` (code read end to end, apart from the glyph atlas data), every capture in `captures/r4/` (2x, 1x, longname, Silver, Noir, UI desktop/mobile, `contrast.txt`), the unzipped `set.zip` and its README, and the four contact sheets. I also ran the maker myself in Playwright for about 20 edge cases (long titles and names, 7 socials, dark and pastel custom colours, goal mode, non-ASCII text, a phone viewport with the keyboard up) and zoomed the 1x renders with nearest-neighbour. I looked at nothing else on disk.

Reviewer persona: graphic designer, ~150-viewer Twitch streamer, buys panel packs on Etsy.

---

## Scores at a glance

| | Criterion | Score |
|---|---|---|
| A | Authenticity | **8.5** |
| B | Legibility at 320 px on Twitch dark | **7.5** |
| C | Hierarchy | **7.5** |
| D | Craft | **8.0** |
| E | Usefulness to a streamer | **7.0** |
| F | Maker UX (desktop + phone) | **8.0** |
| | **OVERALL** | **7.8** |

---

## A. Authenticity — 8.5 / 10

**What sells it.** Anyone who used XP will recognise these at first glance. The part that does the most work is the body type. It is real 1-bit Tahoma 8pt (Wine's hand-drawn 11 px strikes), drawn at 1x and doubled, so at true size (`default_*_1x.png`) you get the same stair-stepped, unsmoothed dialog text XP showed at 96 dpi. Most "XP" Etsy packs use smooth Verdana and lose this straight away. Other details are right too:

- The caption has a 1 px dark drop shadow (line 1279).
- File/Edit/View/Help sits on `#ECE9D8`, with mnemonic underlines hidden as XP did without Alt (comment, line 1282).
- Client areas have the flat `#7F9DB9` list-view border (`fieldBox`, line 1240).
- Push buttons have the `#003C74` rim, a white→beige face and the pale-blue default-button ring on **Join** (`xpBtn`, lines 1231-1238).
- The progress bar uses XP's green chunks at the correct 8 px chunk and 2 px gap at 1x.
- Minimize, maximize and red close have proper glyphs.

The gags are well chosen and mostly land: `Reminder: ON`, `Security: OK`, `Speed: 56 kbps`, `thank_you.wav` with `3 sec left` (the copy estimate that never finishes), `3 friends online`, `Uptime: 0 min`, `Help: F1`, the rubber-duck account picture (XP really shipped one) and Bliss on the My Computer tile.

**What a connoisseur will notice**

- **Title bar is flatter and duller than Luna.** The base is `#245EDB` with one highlight band at 9% (sampled at 2x x=300: y2–10 `#2662DD→#3C87F0→#2C6CE2`, then flat `#245EDB` down to y=52). Real Luna is a more saturated royal blue (roughly `#0054E3`), with a softer highlight and a visible darker lip at the bottom. It reads as XP, but as XP at 70% saturation.
- **Caption buttons** are lit top-down with a gloss band (line 1219–1221). Luna's are lit from the bottom-right. The result looks slightly Aqua.
- **Type faces.** The caption face is Fira Sans Bold, not Trebuchet MS. At 13 px bold with the shadow that passes. Names and times, however, use **DejaVu Sans Condensed Bold** (`FONT_H`), which XP never used. `RetroStreamer` and `7:00 PM CT` look slightly like a Linux game at 3x zoom.
- **Idioms**
  - Status text in the menu bar is not an XP idiom; XP put it in a status bar at the bottom. It is a clever use of space, though.
  - The blue "lit" day buttons are an invented toggle state. They read clearly, so this is fine.
  - The Chat Rules shield is a generic blue shield with a tick, not the XP SP2 Security Center four-colour shield the `Security: OK` gag points at.
- **Progress chunks are too thin.** They are 4 px tall inside a 10 px trough at 1x (`ph = 20`, chunk `ph − 12`, line 1370–1375), so at true size the bar reads as a dashed line. XP chunks almost fill a 13–15 px trough.
- **Themes.** Silver (`#8B8EA4` bar) is a darker slate than XP's pale Metallic. Noir, Olive and Silver all keep Luna's navy `#003C74` button rim and blue default ring (`theme4_noir_discord_2x.png`: the Join button and the unlit day chips are navy-rimmed on charcoal and orange chrome).

## B. Legibility at 320 px on Twitch dark — 7.5 / 10

- **Figure/ground is excellent.** Every panel is a light window on `#0E0E10` (win/twitch 15.8–17.2:1 in `contrast.txt`). In the Twitch column the set reads as a stack of distinct objects.
- **Text is crisp and high-contrast.** Counting colours in 1x text regions: menu row = 2 colours (`#ECE9D8` + black), Rules lines = 2 colours, Commands keys + details = 3 (white, accent, sub). So there is no fringing at all after Twitch's 2:1 downscale. Ink 21:1, sub 11.3:1, accent 4.6–5.9:1.
- **The ceiling is size.** Body text is an 11 px strike (cap height 8, x-height 6 at 1x). That is smaller than Twitch's own ~13 px description text directly underneath. On a 24" 1080p monitor it is readable; grey sub-lines like `Follow to get notified` or `Hang out between streams` need a lean-in. It is authentic, but it is the limit.
- **Caption contrast on two themes is soft:** white on Silver 3.23:1 and on Olive 3.46:1 (`contrast.txt`). The `titleInk` rule only switches to dark ink below 2.2:1 (line 1102). The title is the one thing every panel must say, and on those two themes it is the weakest-contrast text in the image.
- **Fractional DPI.** At 125% and 150% Windows scaling the 640 → 400/480 resample softens the 1-bit strokes. I simulated this and it stays legible but uneven. The README is honest about it.
- **Long names hold up.** The 21-character name fits every layout at full size (`sheet_longname.png`). The Discord invite switches to the "Chat invite from / name" form. However, the name ends about 7 px (1x) from the Join button, which is cramped.

## C. Hierarchy — 7.5 / 10

- **The first read is right on every panel.** The title in white bold caption type comes first.
- **Each layout has a clear hero:**
  - About: name in accent bold 14.
  - Schedule: lit day chips, then the bold accent time.
  - Discord: accent name line plus the Join button as CTA.
  - Commands and Specs: accent key column with aligned details.
  - Support: the progress bar grabs the eye and the bold ask sits under it.
- **The chrome tax.** At 1x, title bar (29 px) plus menu bar (16 px) is 45% of a 100 px panel. The File/Edit/View/Help row is the second-highest-contrast text in every image, repeated ten times down the column (`sheet_r4.png`), so it becomes a stripe that competes with content. The coloured status label (`Reminder:`, `Sub Alert:`) is the only colour in that row and pulls the eye to the top-right corner of every panel.
- **List panels are flat.** Rules, Subscribe and Giveaways are three equal-weight 8pt black lines. The loudest thing in the client area is the 32 px icon tile, not the content.
- **Socials is weak twice over:**
  - The default has a 143 px (45%) dead white area on the right. Content ends at x=165 at 1x, while the list panels fill to 308.
  - With 4–6 platforms it drops the platform names and shows six identical `@RetroStreamer` rows told apart only by 8×8 glyph chips (my render `socials_all`). Hierarchy collapses to a column of the same word.

## D. Craft — 8.0 / 10

**Genuinely disciplined**

- All text is drawn from a 1x atlas and blitted at exactly 2x at even coordinates (`text()`, lines 1182-1195). Tile icons are rendered at 1x and doubled (`drawIcon`, line 926).
- The right edge is shared across all ten panels: status ink ends at x=307 and tiles, Join and day chips end at x=308 at 1x, measured on every `default_*_1x.png`.
- The key/detail column uses one width per panel (`keyW`, line 1407). Contents are vertically centred in the 94 px client box to the pixel (list y = 115/141/167 around a 141 centre).
- The palette is contrast-aware: `readable()` pushes the accent to ≥4.5:1. My pastel pink and yellow tests auto-switched the caption to dark ink and kept the time legible.
- Handled well: ellipsis truncation on a 22×W title and a 25×W name, 120/100 goals, dark window colours.

**Misses**

- **Caption buttons sit on a half pixel.** `by = ty + 7 = 9` (line 1275) is odd. At 1x the white rim is split over two rows: `default_about_1x.png` x=247–251 shows rows 4–5 = `#7CAAF2`/`#90AEEB` and rows 24–25 are soft too, while the left rim (x=245) is a crisp `#BDCFF4` column. They are the only blurred edges in an otherwise pixel-exact image.
- **Content left edge is inconsistent:** x=11 on tile, chip and button layouts, x=13 on bulleted lists. Stacked in the column, the left edge jitters by 2 px.
- **Button rim and default ring are hard-coded** to `#003C74` / `#8CB1E8` (lines 1232, 1236) regardless of theme.
- **Non-ASCII renders as `?`.** Glyph coverage is ASCII plus `·×é–—’…✓`. `Zoë_Ünicode ✨` rendered as `Zo?_?nicode ?`, and `«cozy» ♥` as `?cozy? ?`, with no warning in the UI (`glyphOf` falls back to `?`, line 1124).
- **The " - " parser fires on prose.** It applies to every list line (lines 1407, 1426), so a rule like `Be kind - no hate…` turns `Be kind` into an accent-bold "key" with the rest pushed into a detail column (`rules_long`).
- **Socials silently drops a platform:** 7 can be ticked but `.slice(0, 6)` (line 1333) drops Bluesky.
- **Dead field:** the Socials **Tagline** field is shown (`tagBlock` visible for the `buttons` layout, line 1506) but `LAYOUTS.buttons` never draws `P.tag`. I confirmed the render is byte-identical with and without it.

## E. Usefulness to a streamer — 7.0 / 10

**What already works**

- The one-image-one-link model is understood throughout. There is a per-panel **Image Links To** field, and the README gives per-file "Image Links To" plus suggested description text.
- The upload steps are correct and current (Edit Panels → "+" → Add a Text or Image Panel), including the "leave the title blank" tip.
- Files are numbered in upload order and the README uses CRLF (it opens properly in Notepad, which is very on-theme).
- Ten sensible presets plus two spares, a picture upload, and edits persist between visits. I would actually use these.

**Where the last mile is unfinished**

- **Descriptions are run-on one-liners.** `suggested()` (lines 1464-1478) joins lines with double spaces. In Twitch's Markdown, Rules (`1. Be cool  2. No spoilers  3. Mods are final  Mods have the final say.`) becomes a one-item ordered list containing everything. Commands becomes one paragraph. Rules also repeats itself ("Mods are final … Mods have the final say").
- **Socials — the panel that most needs links — has no links.** It gives `Twitch: RetroStreamer  -  YouTube: RetroStreamer …`. The README says `[text](https://link)` works, yet no suggestion uses it. Listing Twitch on your own Twitch page is also redundant, and it is on by default (line 1029).
- **Obvious links are left for the user to type.** Subscribe could auto-fill `twitch.tv/<name>/subscribe` from the name, but the README just tells you to type it.
- **Field limits cut off real data:**
  - The tip link field is capped at 40 characters (line 323). `https://streamelements.com/xxretrostreamer2000xx/tip` was truncated on paste to `https://streamelements.com/xxretrostream`.
  - The time field is capped at 14 characters, so `7:00 PM EST / 12 AM GMT` (dual time zones are common) is cut.
- **Settings live only in `localStorage`.** Updating the schedule in three months on another PC or browser means starting over.
- **Non-ASCII names and taglines break** (see D). For Spanish, Portuguese or German streamers that is a shipping bug, not a nit.

## F. Maker UX — 8.0 / 10

**Desktop** (`ui_desktop*.png`) is the best part of the product. It is two XP windows on a blue desktop gradient, with numbered steps: 1 Pick, 2 About you, 3 This panel, 4 Colors.

- The live 2x preview sits over a true-size 320 px preview on Twitch's ground, with a fake description line under it that teaches the one-link model visually.
- **Preview all** renders the zip contents at true size in upload order.
- Character counters, per-panel include checkboxes, reset-one and start-over, copy-to-clipboard suggestions, and a DPR-aware true-size canvas (`fitTrueSize`).
- The fields adapt per layout, so each panel only shows what it uses.

**Phone** (`ui_mobile*.png`, plus my 390×844 @3x run) is thoughtful.

- The preview is pinned at the top (236 px tall) and shrinks to 182 px while the keyboard is up, because the `typing` class hides the download row.
- The big 2x canvas is dropped below 480 px, and Preview-all moves below the controls.
- No horizontal overflow (`scrollWidth` 390).

**Friction**

- Picker labels "Custom" and "Spare" produce panels titled "Giveaways" and "FAQ" (files `10_giveaways.png`).
- The dead Socials Tagline field; the silent 6-platform cap; `?` glyphs with no warning.
- The include checkboxes are 14×14 px on phones, well under a comfortable tap target. The "10 PNGs + README saved" confirmation (`.note`) is hidden on phones.
- On desktop, **Colors** is below the fold at 1280×900 and under the fixed taskbar.
- The large preview shows pixel-doubled text that looks chunkier than what viewers will see. It should be labelled as a 2x zoom so buyers do not think the export is pixelated.

---

## OVERALL: 7.8 / 10

Weighted A 20 / B 20 / C 15 / D 15 / E 15 / F 15.

- **Panels:** the most convincing XP panels I have seen for sale. The pixel-true Tahoma alone puts them above the typical Canva-made XP pack.
- **Maker:** a real differentiator.
- **Why not 8+:** the description and link half of the workflow is the half that makes panels work on Twitch, and it is rough. So are non-ASCII text and a few layout edge cases.

---

## TOP 5 CHANGES (ranked)

1. **Make the Twitch descriptions ready to paste.**
   - In `suggested()` (lines 1464-1478), emit newline-separated Markdown: `1.`/`2.`/`3.` lists for Rules, `- ` bullets for Commands, Specs and Subscribe. Drop the duplicate "Mods have the final say".
   - Build real links for Socials from the handles as `[YouTube](https://youtube.com/@h)`, plus TikTok, Instagram, X, Bluesky and the Discord invite.
   - In `readme()`/`linkFor()` (lines 1758-1769), auto-fill Subscribe as `https://twitch.tv/<name>/subscribe`.
   - Turn Twitch off in the default socials (line 1029).
   - Raise `#tip` maxlength to 80 (line 323) and `#time` to about 24 (line 304).
2. **Non-ASCII text.** Extend the atlas (`make_atlas.py`) for all four faces to Latin-1 Supplement plus curly quotes: ñ á é í ó ú ü ö ä ç ß ã õ à è, “ ” ‘. Then add an inline warning under any field that contains a glyph `glyphOf()` (line 1124) would replace with `?`, naming the character.
3. **Fix the Socials layout** (`LAYOUTS.buttons`, lines 1332-1353).
   - Disable the 7th checkbox instead of `.slice(0, 6)`.
   - In 2-column mode, keep platform names and show the handle once when all handles are equal, rather than six identical `@handle` rows.
   - Either draw `P.tag` or hide `#tagBlock` for this layout (line 1506).
   - Add the network icon tile on the right when rows leave room, as `list` does.
4. **Theme pass for the chrome.**
   - Raise the `titleInk` switch from 2.2:1 (line 1102) to about 4.5:1, or darken the Silver and Olive bars (`THEMES`, lines 1018-1019), so the caption reaches ≥4.5:1 on every theme. For Silver, a paler Metallic bar with dark caption ink would be both truer and clearer.
   - Derive the push-button rim and default ring from the palette instead of `#003C74` / `#8CB1E8` (lines 1232, 1236).
   - Move names and times from DejaVu Condensed to the caption face or a Tahoma Bold size so no non-XP face remains.
5. **Pixel and detail pass.**
   - `by = ty + 7` → `ty + 6` (line 1275), so the caption-button rims land on whole 1x pixels.
   - Deepen the progress bar (lines 1370-1375: `ph` 20 → 26, chunk height `ph − 8`) so it reads as XP chunks, not dashes.
   - Make the " - " key parsing opt-in per preset (Commands, Specs, FAQ only; lines 1407/1426), so rules written as prose are not mis-coloured.
   - Put bullets and tiles on one left edge: x=11 vs x=13 at 1x.

## NITS

- `Hey, I am …` → `Hey, I'm …`. The About suggestion just repeats the banner text. Discord suggestion: `… - Hang out` has a stray capital.
- The Support README line says "Update the goal numbers in the maker as you go", but the default is the file-copy gag, not a goal.
- Goal mode with non-numeric text (`lots`) draws a 100% full bar. It should draw an empty or indeterminate bar.
- An empty title exports a captionless window with no warning.
- `Copying:  thank_you.wav` has a 6 px (1x) gap that reads as a double space. XP's dialog put the filename on its own line and said "3 Seconds Remaining".
- The 16 px Chat Rules shield's tick barely reads at true size.
- Long names on the Discord invite end about 7 px (1x) from the Join button. Give them the full-line fallback a few characters earlier.
- Status text in the menu bar is a new idiom. An optional compact mode (no menu bar, +16 px of content at 1x) would help people who want more text, while keeping the menu bar as the default for charm.
- The taskbar CTA copy says "Windows XP Stream Kit" but links to the chat-widget listing (TODO comment, line 402). The README footer shop URL has no UTM tag.
- No settings export or import (JSON), and no panel reordering (Twitch lets you reorder anyway).
- The phone taskbar's "View on Etsy" is the largest button on the phone page. It is fine as a cross-sell, but it outweighs "Download".

## VERDICT

As a designer who buys panel packs, this is the first "Windows XP" set I have seen that gets the pixels right. It uses real 1-bit Tahoma at true size, correct Luna controls and borders, and gags that land. At 320 px on Twitch's dark column the ten windows read immediately as XP and as distinct panels. The maker is well above anything else on Etsy in this niche: live true-size preview, one-link teaching, zip plus README, and a phone layout that works. I would use it on my channel, but not before fixing the parts that bite on day one:

- Descriptions that paste as run-on lines, a Socials panel whose description has no links and a dead Tagline field.
- Any accented character in a name or tagline turning into `?`.
- Silver and Olive captions just under comfortable contrast.
- Blurred caption-button rims in an otherwise pixel-exact render.

None of these are deep. Fix the top three and this is an easy 8.5 product.
