# Windows XP Panel Maker — independent review (r3 captures)

Reviewer persona: graphic designer, ~150-viewer Twitch streamer, regular buyer of Etsy panel packs. I looked at every file in `captures/r3/`, built 3x nearest-neighbour zooms of the 1x exports on `#0e0e10`, measured edges/centring from the 2x PNGs with PIL, and read the CSS, PRESETS/THEMES, `palette()`, `renderPanel()`, `LAYOUTS` and `readme()` in `windows-xp.html`.

---

## A. Authenticity — 8 / 10

The chrome is the strongest part. `default_about_2x.png`: rounded top corners, flat `#245edb` bar with the light band at y=4–10 (measured `#3c87f0` peak at 9%), a darker `#205bc6` lip at the bottom, a white-rimmed 21px glossy min/max/red-close cluster, Trebuchet-shaped bold caption with a 1px shadow, beige `#ece9d8` menu bar, and the `#7f9db9` flat list-view border around a white client. The XP file-copy gag ("Copying: thank_you.wav / 3 sec left") with the green chunked progress bar, the default-button blue ring on **Join**, and the rubber-duck user tile (a real XP account picture) are the details a Luna user smiles at. Where it slips: the twelve title-bar icons are flat 16-colour pixel art with hard `#00138c` outlines (`ICONS`, lines 415–650) — that is Win98/2000 vocabulary, not XP's soft-shaded 32-bit icons; the folder, monitor and star in `icons_1x` have no highlight or shadow at all. Menu text is `#3b3b33` instead of XP black (`mInk`, line 1000), the list bullets (14px blue rounded squares, line 1136) are not an XP idiom, and DejaVu Sans Condensed passes for Tahoma at a glance but a type nerd will spot the straight-tailed `y` in "cozy" on `sheet_default.png`. Nothing reads as Win7 or modern-flat; Noir (`theme4_noir_*`) correctly reads as the Zune/Royale Noir late-XP look rather than a dark-mode anachronism.

## B. Legibility at 320px on dark — 9 / 10

Every line on all four sheets reads. I checked the 1x PNGs are bilevel: the "Be cool" region of `default_rules_1x.png` contains exactly 5 colours (white, black, two bullet blues, one edge grey) — the 2x-blit-then-2:1-downscale promise in the file header is real, so there is no grey mush on Twitch. Contrast (`contrast.txt`) is fine everywhere that matters: body 21:1, sub-text 11.3:1, accent ≥4.5:1 on all five themes. Two soft spots: on Luna Blue the bold-12 `I` and `l` are identical 1px bars, so "Idle: 0 min" on the Commands panel reads "ldle" at true size (`sheet_default.png`, row 8); and the Silver caption is white on `#9598ac` at 2.85:1 (contrast.txt line 3) — still readable thanks to the shadow, but it is the faintest text on `sheet_theme2_silver.png`. Long names survive (`longname_socials_2x.png` fits "@xXRetroStreamer2000Xx" three times; `longname_discord_2x.png` correctly switches to the "Chat invite from / name on its own line" variant).

## C. Hierarchy — 7 / 10

Title is the loudest thing on every panel — good, and the name / time / platform keys come next in bold accent. The problem is that the menu-bar status gag is drawn in the *same* bold accent (`FONT_E`, `readable(P.c4, win, 4.5)`, lines 1004–1008) as the content keys, so on `default_specs_2x.png` "Ping:" is exactly as loud as "CPU", and on `default_rules_2x.png` "Security:" outranks the three rules, which are plain black. The gag should sit a step below the content, not beside it. Worst case is Support (`default_support_2x.png`): the only real message, "Bits, tips & subs keep the lights on", is regular grey at the bottom, while the fake file name "thank_you.wav" is the bold accent hero — and the panel contradicts itself ("Time left: 5 sec" in the menu bar, "3 sec left" in the client). Socials, Discord, Schedule and About all say their one thing instantly.

## D. Craft — 7.5 / 10

Pixel discipline is genuinely good: everything lands on even 2x coordinates, corners and gradients are clean at both sizes, nothing clips or overprints in any of the 60 exports, tiles/chips/bars share one 22..617 content column (measured), and list rows and their tile are centred to the half-pixel (Rules text 104–175 vs tile 100–179 vs client centre 140.5 at 2x). Seams a designer notices: (1) icon weight is inconsistent — the shield (Rules) and cart (Merch) are hollow white outlines that nearly vanish on the blue bar in `icons_1x`, while the other ten are solid; (2) in About the name's cap-top starts at y=98 while the picture well starts at y=102 (2x), so "RetroStreamer" rides 2px above the well at 1x, and the three lines are on a 28/26 pitch (`b.y+16/44/70`, lines 1029–1031); (3) the Support client is crowded — its block spans y=96..183 in a 92..189 box, so "Copying:" sits 2px under the border at 1x while every other panel breathes 5–6px; (4) three different right edges at 1x — caption buttons end at 313.5, the status text at 311.5, content at 308.5 (menu bar inset 8, content inset 12); (5) the Discord chat icon floats unframed (line 1098) while About frames its picture and every list frames its icon in a tile.

## E. Usefulness to a streamer — 8 / 10

This is the panel list I actually use: About, Schedule, Rules, Socials, Discord, Subscribe, Support/Tip, Commands, Specs, plus Giveaways and two spares (Merch, FAQ). Defaults are sensible and copy-ready (Tue/Thu/Sat, `!discord - join the server`, "Ryzen 7 7800X3D"). The one-link-per-image story is better handled than any pack I own: the Socials status literally says "See links below", the maker writes a suggested description per panel with a copy button, and the README (`readme()`, lines 1449–1479) lists each file in upload order with an "Image Links To:" line and the suggested text. The .zip is store-only with no libraries and works offline. Gaps: only Discord and Support have a link field, so the README says "(optional)" for eight of ten panels; list panels cap at 3 lines (Rules usually needs 5–6 — the README does tell you to put the rest in the description); there are only three list-type custom slots and no "add another panel", so a streamer who wants Sponsors + Emotes + Mods + Merch runs out; and the Schedule can't express two different times.

## F. Maker UX — 8 / 10

`ui_desktop.png` is convincing and pleasant: two Luna windows on a Bliss-blue gradient, a beige control window with numbered sections 1–4, a taskbar whose green Start button is the Etsy CTA. The preview window is the best part — the 2x render sits on Twitch's actual `#0e0e10` ground with a true-size 320px copy and a fake "Twitch's text field" line underneath, plus the file name and 640×200 readout. "Preview the set (10)" shows the whole zip in upload order (`ui_desktop_previewall.png`). Phone (`ui_mobile.png`) works: single column, presets in a 2×6 grid, handles stacked, taskbar goes static, whole page only 1489px tall. Friction: the sticky preview block takes ~290px of an 844px phone screen and stays pinned while the keyboard is up, so the field you're typing in has little room; a few labels are insider-y ("Status (top-right corner)", "File name (the gag)", "tick = in your set"); the button reads "Download the set (10 .zip)", which parses as ten zips; the checkbox+button pair in section 1 needs a second look to learn that the button *selects for editing* and the tick *includes*; the "Pixelate" box is visible before any picture exists; and at 1063px tall the fixed 32px taskbar sits over the colour pickers (`ui_desktop.png`, y≈870).

---

## OVERALL — 8.0

Weighted toward what viewers see (A–D) with the maker as the differentiator. I would buy this: the chrome is right, the text is pixel-crisp at Twitch size, and the maker + suggested text + README solve the real-world "where do my links go" problem better than the static PNG packs on Etsy. What keeps it off 8.5 is that the gags shout as loud as the content, the icons are a generation older than the windows they sit in, and a handful of 2px seams show up under a designer's loupe.

## TOP 5 CHANGES (ranked)

1. **Demote the menu-bar status gag one step.** `renderPanel`, lines 1004–1008: draw the label in `FONT_B` (or keep `FONT_E` but use `pal.sub`) instead of bold accent so "Ping:" / "Security:" / "Reminder:" stop competing with "CPU", the rules and the day chips. The value half is already `pal.sub` — the label should be too, or at most accent-regular.
2. **Fix the Support panel's inverted hierarchy and self-contradiction.** `LAYOUTS.transfer`, lines 1072–1093: draw `P.tag` ("Bits, tips & subs keep the lights on") in `FONT_E`/`pal.ink` and the file name in `FONT_B`/`pal.sub`; reconcile the two countdowns by changing the preset status on line 710 to something that isn't a second time ("Transfer: 68%" or "Est. time: forever"); and pull the block in — start `y1` at `b.y+18` and drop the bar to `ph=20` so the top line isn't 2px under the border at 1x.
3. **Even out the icon set and give it XP shading.** `ICONS`, lines 415–650: fill the shield (blue body, white tick, like XP Security Center) and give the cart a solid body so they stop disappearing on the bar (`icons_1x`); then add one highlight and one shadow shade per icon (folder, monitor, star, document) so the set reads as Luna's soft 32-bit icons instead of Win98 16-colour.
4. **A link field on every panel, and room for more panels.** Add an "Image Links To" input in section 3 for all presets (today only `#invite` and `#tip`, lines 317–318) and feed it through `linkFor()` in `readme()` (line 1466) so the README stops saying "(optional)" for eight of ten panels. Add a "+ Add another list panel" that clones a `list` preset (PRESETS lines 718–727 hard-cap at 12 with only three list-type customs).
5. **Phone: unpin the preview while typing, and fix the download label.** In the `≤860px` block (line 208) drop `position: sticky` below 480px, or on `focusin` of any input collapse `.pv-wrap` to the 320×100 strip only (hide `#cv` and `.dl-row`) so the keyboard doesn't leave a 200px editing slot. `refreshCounts()` line 1252: "Download the set (10 .zip)" → "Download all 10 (.zip)".

## NITS

- Menu text is `pal.sub` (#3b3b33), line 1000 — XP menus are #000.
- About: name cap-top overshoots the picture well by 2px at 1x (98 vs 102 at 2x) and the line pitch is 28/26; use `b.y+18/44/70` or centre the three lines against the well.
- Three right edges at 1x (caption buttons 313.5 / status 311.5 / content 308.5): menu bar inset is 8 (`mx = tx + 8`, `right = tx + tw - 8`) while content is 12 in from the client white; pick one column.
- Commands default status "Idle: 0 min" — bold `I`/`l` are identical bars at 1x; "Uptime: 0 min" avoids it (PRESETS line 713).
- Silver caption 2.85:1 — nudge `c1` to ~#8a8da3 in THEMES line 736, or use the 0.65 shadow for it.
- Discord's chat icon is the only unframed picture on the sheet (line 1098) — frame it like About, or remove the tiles from the lists.
- The frame comment on line 817 says "#00138c on Luna Blue" but `shade(#245edb, 0.42)` = #0f275c, and at 1.35:1 against #0e0e10 the outline does nothing on Twitch anyway.
- "Download this panel" on an un-ticked panel numbers it `01_` (`included().indexOf` → −1 → 0, line 1427), colliding with `01_about_me.png`.
- Hide the Pixelate checkbox until a picture is uploaded; show "Use the default picture" in the same row.
- Section 1: put "click to edit · tick to include" as the hint instead of "tick = in your set (.zip / preview)".
- Three identical "@RetroStreamer" rows on Socials make the default look like a template — seed the YouTube/Discord placeholders with a different sample handle.
- Bullets: XP task-pane lists used small ">" chevrons; the blue rounded squares are pleasant but not XP.
- README could mention that Twitch panel descriptions accept Markdown links, which is the whole point of the "links below" gag.

## VERDICT

A genuinely XP-looking panel set with pixel-perfect text at true Twitch size and a maker that solves the links/descriptions problem better than any static pack I've bought. The seams are hierarchy (the gags shout as loud as the content), a generation-older icon style, and a handful of 2px alignment details — all fixable in an afternoon in `LAYOUTS`, `ICONS` and the status draw. Fix the top three and this is an easy recommend at 8.5+.
