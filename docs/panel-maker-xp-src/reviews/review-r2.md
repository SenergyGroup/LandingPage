# Windows XP Panel Maker — independent review (r2 captures)

Reviewer persona: graphic designer, ~150-viewer Twitch streamer, regular buyer of Etsy panel packs. I looked at every capture in `captures/r2/`, zoomed the true-size sheets to 4x–8x to check individual glyphs, and skimmed the CSS, PRESETS/THEMES, `palette()`, `renderPanel()`/`LAYOUTS`, and `readme()` in `windows-xp.html`.

---

## A. Authenticity — 8 / 10

This reads as Luna to anyone who lived in it. The 2x exports nail the details that matter: the 8px-radius title bar with the glass band at 9%, the 4px blue frame wrapping three sides, the 21px caption buttons with the white rim/gloss and the red close, `File Edit View Help` on `#ece9d8` with no separator line, and the flat `#7f9db9` list-view border around the client area. `default_support_2x.png`'s progress bar is the real XP thing — 8px green chunks with 2px gaps in a sunken rounded well. `default_discord_2x.png`'s Join button has the default-button blue ring. The stock user picture is the rubber duck, which was an actual XP account picture. The Security Center shield for Rules and the folder/My Computer/network-places icons are all era-right, and the page's buttons even get the orange focus ring on hover (`#f0a83a`, line 115) — a detail almost nobody bothers with.

The tells: (1) The caption face is Carlito, i.e. Calibri — the round-shouldered `S` in "Schedule"/"Support the Stream"/"Subscribe" reads Vista/Office 2007, not Trebuchet MS. It's the single most XP-specific letterform in the whole OS and it's the one thing that's off. (2) Noir (`sheet_theme4_noir.png`) reads as a Windows 10/11 dark window with XP caption buttons bolted on. The Zune theme it cites went black on the *chrome* only; XP never had a dark client area (`#1e1f23`), and the flat `#2a2b2f` bar with a grey frame has no Luna gloss left. (3) The glossy square list bullets (`z_rules_true`) are a pleasant invention but not an XP idiom. (4) The minimise glyph is centred; XP's sat bottom-left.

## B. Legibility at 320px on dark — 7.5 / 10

The 1x-raster-blit-at-2x approach works: on `sheet_default.png` every line of body text (`Retro games, cozy vibes.`, `Hang out between streams`, `@RetroStreamer`, `3 friends online`) is crisp 1-bit at 9px cap height, and the frame silhouette holds on `#0e0e10` because the `#245edb` body does the work even though the outline itself is only 1.24:1 (contrast.txt).

What breaks, all confirmed at 8x zoom:
- **Lit day chips.** In `xpBtn()` the "on" gloss (`rr(x+4, y+4, w-8, h/2-6)`, line 911) covers the top 12 of 36px, exactly where the label's cap height sits. `Sat` on `sheet_default.png` has a greyed-out top half; the `a` is mush. On Noir it's worse: white bold on `#f28c28` is ~2.5:1 and `contrast.txt` never measures the chip labels at all — it only measures text on the field.
- **The `!` in `!discord` / `!specs` / `!schedule`.** FONT_E's `!` is 1px wide while the bold stems are 2px, so at 320 the bang renders as a faint 1px tick beside a fat word (`z_bang`). On a Commands panel the `!` is the payload.
- **`Idle: 0 min`** — `I` and `l` in the E atlas differ by one row; at 320 "Idle" and "ldle" are the same picture. (Tahoma had this too, so it's arguably authentic, but it's still ambiguous.)
- **`thank_you.wav`** — the underscore averages to a faint grey line under the gap and reads like a stray underline rather than a filename.
- **Silver caption** (`theme2_silver_about_2x.png`): white on `#9598ac` is 2.85:1 with a 0.8-alpha black shadow, so the title looks embossed and muddy rather than sharp.
- Not in the captures but real-world: on Windows at 125%/150% scaling (most laptops) 640→400/480px is not a clean 2:1, so the 1-bit strokes will alternate 1px/2px. The header comment's "identically on every OS" only holds at 1x and 2x.

## C. Hierarchy — 7.5 / 10

Every panel says its one thing: the title bar is the loudest element, then a single accent-bold item (name, `7:00 PM CT`, platform names, `!commands`, `CPU/GPU/RAM`) and the Join button in Discord is correctly the visual target. The status gags (`Reminder: ON`, `Security: OK`, `Ping: 12 ms`) are quiet enough not to compete.

Two panels miss. **Support**: the accent-coloured items are `thank_you.wav` and `Done`, and the bar is at 100% — the gag says "already finished". The actual ask, `Bits, tips & subs keep the lights on`, is the quietest line on the panel in grey `#3b3b33`. **Commands/Specs**: the detail column is ragged (`join the server` / `my PC build` / `when I am live` each start at a different x in `default_commands_2x.png`) because `LAYOUTS.list` places details at `tx0 + lw + 14` per row. And on every panel the decorative menu bar is black, the same size as body text, and takes 16 of 100px between the title and the content — the second-loudest thing on the panel says nothing.

## D. Craft — 8 / 10

The pixel discipline is genuinely good: even-pixel rounding in `text()`, bearing compensation so rows share one ink edge, integer-scaled pixel art, corners clean at both 640 and 320, nothing clipped even with the 21-char name (`longname_discord_2x.png` correctly falls back to the "Chat invite from" branch and `longname_socials_2x.png` fits three `@xXRetroStreamer2000Xx`).

Seams: the day-chip row is left-packed — 7×78 + 6×6 = 582 of a 612px box, so `Mon` sits 8px from the left edge and `Sun` 22px from the right (visible in `default_schedule_2x.png`). Ragged detail column as above. In the maker, `.icons button .ico` is 24px on a 16px canvas — a 1.5x scale, so the shield and PC icons in `ui_desktop.png` have uneven 1px/2px pixels. Merch reuses Subscribe's star and Spare reuses Custom's folder, so switching either on gives you two panels with the same title icon. The Silver caption shadow at 0.8 alpha is heavier than Luna ever was.

## E. Usefulness to a streamer — 8 / 10

These are the right ten panels, and the one-link-per-image story is told properly in three places: the hint under the preview, the per-panel suggested description, and the README which lists `Image Links To:` per file in upload order (`01_about_me.png` … numbered, with `Leave the title blank (the banner IS the title)` — correct Twitch advice). Per-platform handles, avatar upload with a pixelate toggle, the honest "numbers go stale — re-export" note on the goal toggle, localStorage persistence, and two spare slots that default off are all things I'd actually use.

Gaps: the Support suggested text fabricates `streamelements.com/retrostreamer/tip` from the name when the tip field is empty (`ui_desktop_support.png` shows exactly this with a blank field) — that looks real enough to be copied and shipped wrong. Schedule accepts one 14-char time string, so "8pm EST / varies" or two slots don't fit. The 100%/`Done` Support bar undercuts the ask. No "Sponsors"/"Emotes" preset, though Spare covers it.

## F. Maker UX — 7.5 / 10

The 1-2-3-4 flow is obvious, the sticky preview with a true-size render on a fake Twitch ground plus the grey "Your links & details go here" line is the best explanation of Twitch panels I've seen in a maker, and the page's XP styling (Start-button CTA, tray, orange hover ring, `#7f9db9` inputs) is charming rather than cosplay. Counters, `Reset this panel`, `copy`, and labels like `Status (top-right corner)` and `File name (the gag)` are well chosen.

Problems: in step 1 each include-checkbox sits *between* two buttons (`About Me ☑ Schedule ☑ Rules ☑` in `z_ui_presets`) so it visually attaches to the wrong panel. Twelve pairs in that density is cramped. On phones (`ui_mobile.png`) the sticky preview eats ~260 of 844px, and the suggested description text moves to the very bottom of the controls, far from the Download button it belongs with. By the CSS, `#cv1` is a fixed 320px inside 62px of chrome, so at 375px (iPhone SE/mini/13 mini) the close button clips by ~9px — the 390px capture just squeezes through. The "Custom" button edits a panel titled "Giveaways", which is a small mismatch in step 1.

---

## OVERALL 8.0

I'd buy it. The rendering engine and the Twitch-size preview put it above nearly every static PNG pack on Etsy. I'd also notice the seams within a minute — the mushy `Sat`, the thin `!`, the ragged Commands column, and a Noir theme that isn't XP.

## TOP 5 CHANGES

1. **Fix the lit-chip labels** (`xpBtn()`, line 911, and `LAYOUTS.days`, line 998). Shrink the "on" gloss to the top quarter (`h/4 - 4`) so it clears the cap height, and pick the label ink with `readable('#ffffff', pal.btnA, 4.5)`-style logic — on Noir that should flip to dark ink on the orange chip. Add the chip label to `contrast.txt`'s measurements.
2. **Give `!` real weight in the bold face** (ATLAS `E` entry `"!"`, line 788). Change its rows from `"1"` to `"3"` and width from 1 to 2 so it matches the 2px stems; optionally do the same for `|`. Cheap, and it fixes the Commands panel's most important glyph.
3. **Align the list detail column and fill the day row** (`LAYOUTS.list`, lines 1078–1099; `LAYOUTS.days`, line 994). Compute `maxKeyW` across items containing ` - ` and draw every detail at `tx0 + maxKeyW + 14`. Set `chipW = 80` (7×80 + 6×6 = 596 = `b.w - 16`) so the chips fill the box edge to edge.
4. **Make Noir actually XP** (THEMES, line 698). Keep the dark chrome but set `c3` to `#ece9d8` (Zune-theme-correct: dark bars, light window), which also drops the theme out of `palette()`'s dark branch and restores the `#7f9db9` field border and black ink. Keep a true "dark client" path only for user-picked colours.
5. **Fix the include-checkbox association and the phone canvas** (`#presetRow` markup, lines 1198–1204; CSS line 159). Move the checkbox to the *left* of its button inside a single bordered pill (or at least `gap: 4px` inside the pair, `12px` between pairs). Change `#cv1 { width: 320px }` to `width: 100%; max-width: 320px; height: auto` so 375px phones don't clip the close button. While there, make `.icons button .ico` 16px or 32px, not 24.

## NITS

- Caption face is Calibri-shaped; Trebuchet's narrower, squarer `S`/`e`/`M` are the XP signature. If the atlas can't be rebaked from Trebuchet, at least know that a type-literate buyer will see it.
- Support: don't fabricate `streamelements.com/<name>/tip` when the tip field is blank (`suggested()`, line 1133) — use "your tip link" so nothing wrong-but-plausible gets copied. Consider defaulting the bar to ~80% with `Copying…` so it invites help; `Done` at 100% reads "no help needed".
- Menu ink could be `pal.sub` grey so `File Edit View Help` recedes behind the content it sits on top of.
- Minimise glyph to bottom-left (`capBtn()`, line 897: `x+8, y+28`).
- Merch → a tag/cart icon, Spare → a `?`/help icon, so enabling them doesn't duplicate Subscribe/Custom's icons.
- Silver caption shadow: drop `soft` alpha from 0.8 to ~0.45.
- `thank_you.wav`: thicken `_` in the E atlas or default the gag filename to `thank-you.wav`.
- Icon-picker tooltips say `cmd`, `pc`, `donate` (line 1215) — use the panel names.
- README could add one line: "On Windows display scaling other than 100%/200% the text will look slightly uneven — that's Twitch's resize, not the PNG."
- The desktop is a blue gradient rather than a Bliss-alike; fine (licensing), but it reads login-screen rather than desktop.
- Phone: the suggested-description block should stay adjacent to `Download this panel`, not at the foot of the controls.

## VERDICT

This is a real product, not a template: the canvas renderer, the 1:1 pixel mapping at Twitch size, and the README/suggested-text story are ahead of what the category ships. The remaining problems are all small, specific, and inside functions I've named — fix the chip gloss, the `!`, the column alignment, and Noir's client area and this moves from "good, I'd notice" to "best in class".
