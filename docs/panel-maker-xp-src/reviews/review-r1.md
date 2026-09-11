# Windows XP Panel Maker — independent review (r1 captures)

Reviewer persona: graphic designer, ~150-viewer Twitch streamer, buys panel packs on Etsy. I looked at every capture in `captures/r1/`, magnified the 1x exports 3x nearest-neighbour, pixel-diffed the 1x/2x pairs, read `contrast.txt`, and skimmed the CSS, PRESETS/THEMES, `renderPanel`, `LAYOUTS`, the README/zip code and the atlas decoder in `windows-xp.html`.

Two facts I verified before grading, because they matter for everything below:

- The 1x export is an exact box-downscale of the 2x (max 4 pixels differ per panel — the rounded corners). Body text at 320px is genuinely 1-bit: the "Retro games / Live Tue" lines in `default_about_1x.png` contain exactly two colours (#ffffff and #3b3b33). The "draw at 1x, blit at 2x" claim in the header comment holds. That is rare in this category and it is the product's strongest engineering asset.
- The chrome is ~52% of the banner: title bar 26px + menu bar 16px, leaving a 48px client area at Twitch size. Everything the streamer actually types lives in that 48px strip.

---

## A. Authenticity — 7.5 / 10

It reads as XP from across the room: the rounded blue caption with the glass band at 9%, the 21px min/max/red-close cluster with the white rim and gloss, `File Edit View Help` in 1-bit black on #ece9d8, the flat #7f9db9 list-view border, the default-button blue ring on "Join" (`default_discord_2x.png`), and above all the chunked green file-copy progress bar in `default_support_2x.png` — that one gag alone sells the era. Olive/Silver as the two shipped alternates is correct, and Noir as the Zune black-and-orange (2006) is a legitimate XP-era pull rather than a modern dark mode.

Where it drifts: (1) the window frame is inverted — real Luna wraps the client in a 4px blue border; here `renderPanel` fills the whole rounded rect with the window colour and insets the blue title bar 8px, so every panel wears a 3px cream mat between the navy outline and the blue bar (clearly visible at the top-left corner of `default_about_2x.png`: navy, 6px beige, then the bar's own rounded corner). On the dark Twitch ground that cream halo is the first thing you notice on `sheet_default.png` and it reads "card", not "window". (2) The caption face is Carlito (Calibri-shaped, i.e. Vista 2007), not Trebuchet — the round-bowled "a" and the narrow "M" in "About Me" give it away at 2x. (3) The body face is DejaVu Condensed at 12, one pixel taller in cap height than Tahoma 8pt and slightly rounder. (4) Small Luna-flavoured inventions that XP never had: glossy square bullets, blue "lit" toggle buttons for days (XP toggles were sunken beige), a dark client area on Noir (Zune kept white clients), a Vista/7-style blue bust as the default user tile, and 2020s brand colours on the social chips (unavoidable, but noted).

## B. Legibility at 320px on dark — 7.5 / 10

Every word on all four sheets is readable at true size, including "@xXRetroStreamer2000Xx" three times in `sheet_longname.png`, the status gags ("3 friends online", "Copy complete"), and the lit day chips. The text engine earns that. Specific breaks:

- **Comma reads as a full stop.** The body-face comma in the atlas (`ATLAS.B[","]` = `[3,1,-2,1,2,["1","1"]]`) is a 1×2 bar with no tail below the baseline, while the period is a 1×1 dot. "Retro games, cozy vibes." renders as "Retro games. cozy vibes." in `default_about_2x.png` and at 1x, and "Bits, tips & subs" in `default_support_2x.png` is barely distinguishable. The bold face (`E`) comma has a tail; the body face does not.
- **The Chat Rules shield vanishes.** `ICONS.rules` fills the shield with `n` = #245edb, the exact Luna title-bar colour, so on Luna Blue only the white tick and a 2px lighter band survive (`sheet_default.png`, panel 3). It survives on Silver/Noir by accident.
- **Noir panels have no edge.** `contrast.txt` line 5: frame/twitch 1.06, win/twitch 1.58. On `sheet_theme4_noir.png` the panels are dark grey slabs with no silhouette; on real Twitch (#0e0e10, darker than the #18181b used here) it gets worse.
- **Silver caption at 2.85:1** (`contrast.txt` line 3). Era-correct, but "About Me" in `sheet_theme2_silver.png` is the faintest line in the whole set.
- Minor: the 8px Discord chip glyph ("controller") is a white blob at 1x in the Socials rows; `I` and `l` in the body face are the same 1px stem (fine in context: "when I am live").

## C. Hierarchy — 8 / 10

Each panel says its one thing: the white bold caption on blue is always loudest, then exactly one accent-coloured element carries the content (the name on About, the lit days + "7:00 PM CT" on Schedule, the `!command` keys, the "Join" button). "See links below" on Socials is a status gag that is also genuinely the instruction — smart. Two costs: the menu bar is 16% of the banner and is pure set-dressing on all ten panels, so the eye has to skip it every time; and the Socials default repeats the identical handle three times (`default_socials_2x.png`), which looks like filler until the buyer types different handles. The Support panel's actual message ("Bits, tips & subs keep the lights on") is the smallest, greyest line on the panel — the joke outranks the ask, which is a deliberate trade I'd accept because the caption does the work.

## D. Craft — 8.5 / 10

This is the strongest area. All 2x placement is snapped to even pixels (`text()`: `Math.round(px / 2) * 2`), left edges are bearing-compensated, the socials handle column is aligned off the widest platform name, and list bullets/text share one left edge across Rules/Subscribe/Commands/Specs/Giveaways. Icons are true 16px (2×2 blocks at 2x), tile icons are 4× pixel art, gradients and corners are clean at both sizes, nothing clips, and the long-name Discord fallback ("Chat invite from / xXRetroStreamer2000Xx") is a thoughtful layout branch. Seams: (1) the Schedule layout is top-heavy — chips start at `b.y + 4` and the time line's cap bottom lands at `b.y + 70` in an 86px box, i.e. 4px above / 16px below at 2x (`default_schedule_2x.png`, `theme4_noir_schedule_2x.png`); (2) the double-corner cream mat described under A; (3) the big preview canvas is `width:100%` in a 700px column, so it is scaled ~1.05× and slightly soft in `ui_desktop.png` while the true-size preview below it is crisp; (4) the Noir frame colour is `shade(c1, 0.42)` ≈ #121314, which is why the outline disappears.

## E. Usefulness to a streamer — 8.5 / 10

The ten presets are the right ten (About, Schedule, Rules, Socials, Discord, Subscribe, Support, Commands, Specs, one spare). Defaults are tasteful and un-embarrassing. The one-link-per-image story is told three times in the right places: the purple "Twitch's text field" line under the true-size preview, the hint under the suggested text, and the README's five upload steps. The zip is store-only with no library, files are numbered in upload order (`01_about_me.png`…), and README.txt carries per-panel guidance plus the exact suggested description text — that is better onboarding than most paid packs. Gaps: only one Custom slot (streamers routinely want two or three extra panels — merch, sponsors, FAQ); lists cap at 3 lines; with 4–6 platforms the socials layout goes two-column and the handle column shrinks to ~90px at 1x (`LAYOUTS.buttons` colW math), so a 21-character handle will ellipsise; the Subscribe suggestion builds `twitch.tv/{display name lowercased}/subscribe`, which is wrong whenever login ≠ display name; and the README does not print an "Image Links To:" line per panel even though the invite and tip fields are already collected.

## F. Maker UX — 7.5 / 10

Two Luna windows on a blue desktop, numbered groups, a sticky preview showing both 2x and true Twitch size with the fake description line, character counters on every field, per-panel reset, localStorage persistence, an honest "numbers go stale — re-export" note on the goal toggle, and the green Start-button "View on Etsy" in a real-looking taskbar: the page is pleasant and clearly in-world (the orange hover ring on buttons is a nice XP tell). The phone layout works — preview pinned at the top (~220px of 844), controls below, suggested text relocated under the controls, and "Preview all" correctly moves the set below the controls rather than into the sticky window. What I'd notice: the step order puts the global stuff (name, picture, colours) second and fourth, so a buyer's first instinct is to start editing "About Me" text before they have typed their name; the ten include-checkboxes crowd the picker and "☑ = in the .zip / preview-all" is the only explanation; "Small line" is an odd label for a tagline; "Make YOUR panels" as the menu-bar status reads like a banner ad; and there is no "duplicate this panel".

---

## OVERALL 8.0

I would buy it. The true-size rendering is best-in-class for Etsy panel packs and the README/description workflow is better than anything I've paid for. But a designer notices the seams within a minute: the comma, the vanishing shield, the cream halo, the Noir panels with no edge. Fix the top three and this is a 8.7–9.

## TOP 5 CHANGES

1. **Fix the body-face comma** (`ATLAS.B[","]`, ~line 781). Replace `[3,1,-2,1,2,["1","1"]]` with a 2-wide glyph that has a tail one row below the letter bottoms and one column left, Tahoma-style: `[3,1,-2,2,3,["1","1","2"]]` (rows decode MSB-first, so `"1"` = right pixel, `"2"` = left pixel). If `make_atlas.py` regenerates the blob, patch it there so the fix survives a rebuild. Check `;` at the same time.
2. **Give the Rules shield a rim that survives on the bar** (`ICONS.rules`, ~line 451). Change the outer ring of `n` cells to `w` (or `k`) so the silhouette exists on any title-bar colour, or redraw it as the XP Security Center shield (four colour quadrants with a white rim). Cheap general safeguard in `renderPanel`: if a title icon's dominant fill equals `P.c1`, stamp it with a 1px white outline first.
3. **Make the frame the title-bar colour and give dark themes a visible edge** (`renderPanel`, ~lines 929–936, and `palette().frame`). Fill `rr(2,2,W-4,H-4)` with `P.c1`, then paint `win` only over the menu+client region (x 8…W-8, y ty+th…H-8). That removes the cream halo on `sheet_default.png`, gives the real Luna 4px blue border, and kills the double corner. For `pal.dark`, set `frame` to something ≥ 2.5:1 against #0e0e10 (e.g. `mix(P.c2,'#000',0.3)` ≈ #3e4047) so Noir panels have an outline on Twitch.
4. **Raise caption legibility on low-contrast bars** (`palette().titleInk` and the shadow pass in `renderPanel`, ~line 943). Keep white (it is authentic for Silver and Olive) but when `contrast('#ffffff', c1) < 3.5` bump the drop shadow to `rgba(0,0,0,.8)` and darken the gradient's bottom half (`shade(c1, 0.8)` from 50%→100%), which is closer to the real Silver bar anyway. Also point the preview ground at Twitch's actual #0e0e10 so buyers see the worst case.
5. **Reorder the maker and add spare slots** (HTML fieldsets ~lines 250–334; `PRESETS` ~line 652). Order: 1 About you → 2 Colors → 3 Pick a panel → 4 This panel, so the global inputs are set before per-panel editing. Rename "Small line" → "Tagline". Add two more Custom presets (`custom2`, `custom3`, default `include=false`) or a "Duplicate this panel" button next to "Reset this panel". Center the Schedule block while you are in there: `y0 = b.y + 10` in `LAYOUTS.days`.

## NITS

- Caption face is Calibri-shaped (Carlito). Trebuchet's splayed "M" and squarer "a" are part of the XP look; if licensing blocks baking Trebuchet into the atlas, note it and move on — it is a designer's nit, not a buyer's.
- DejaVu Condensed is one pixel taller than Tahoma 8pt; the "1-bit dialog" feel is right, the proportions are slightly off.
- Big preview: cap `#cv { max-width: 640px }` so it renders at an integer scale and stays as crisp as the true-size canvas below it.
- README: print `Image Links To: {invite | tip | twitch.tv/…/subscribe | —}` under each file name — you already collect the values.
- Subscribe/tip suggested URLs are derived from the display name; ask for the Twitch login (or say "check this") to avoid wrong links.
- Socials with 4–6 platforms + long handles will ellipsise at ~90px per handle; either drop to a one-column six-row layout with a smaller line height or warn in the label.
- Socials 8px Discord glyph reads as a blob at 1x; a simpler chat-bubble outline would survive better.
- "Make YOUR panels" → something in-world ("Ready", "10 panels", "Unsaved changes").
- The include-checkboxes could move into a small "In the zip" column or become a right-click/long-press; the picker is the densest part of the page.
- Default user tile: a blue bust is Vista/7; an XP-style photo tile (the chess piece / duck / astronaut vibe as pixel art) would be more era-correct.
- Noir's dark client area is a modern dark-mode reading of Zune; consider "Zune" with a white client as the authentic option and keep Noir as the stylised one.
- Page chrome: `.win` has a soft drop shadow (XP windows had none, only menus and the cursor); group boxes are rounded cards rather than XP's etched groupboxes.
- The blue desktop gradient is fine, but a low-cost Bliss-ish pixel hill behind the windows would sell the page on first load.
- Twitch's About area ground is #0e0e10, not #18181b — the previews are a touch optimistic.

## VERDICT

The rendering pipeline — 1-bit body text that lands pixel-perfect after Twitch's 2:1 downscale, numbered files, and a README that writes the description text for you — is better than any XP or "retro OS" panel pack I've seen on Etsy, and the file-copy progress bar is the kind of gag that gets a panel screenshotted. It is held back by a handful of small, specific, entirely fixable misses: a comma that reads as a period, a shield icon painted in the bar's own blue, a cream halo where XP would have a blue frame, and Noir panels that melt into Twitch's background. Fix those and it goes from "I'd buy it" to "I'd recommend it in a Discord."
