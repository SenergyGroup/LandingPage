# Fonts used to build the XP panel maker's glyph atlas

Only the rendered glyph pixels end up in `windows-xp.html` (inside the `ATLAS` JSON); these files are
here so the atlas can be rebuilt (`make_atlas.py xp-faces.json xp-atlas.json`).

| File | Face | Used as | Licence / source |
|---|---|---|---|
| `tahoma-11.bdf` | Wine Tahoma, 11px hand-drawn bitmap strike (= Tahoma 8pt at 96 dpi) | body + menu text (`B`) | Wine project, (c) 2004 Larry Snyder, based on Bitstream Vera. LGPL 2.1+. Exported with FontForge from `fonts/tahoma.sfd` in the Wine source (github.com/wine-mirror/wine). |
| `tahomabd-11.bdf` | Wine Tahoma Bold, 11px strike | keys, labels, lit chips (`E`) | same, from `fonts/tahomabd.sfd` |
| `fira-sans-700.ttf` | Fira Sans Bold (latin subset, from npm `@fontsource/fira-sans`) | Luna caption, anti-aliased (`T`) | (c) Mozilla Foundation / Telefonica, SIL Open Font License 1.1 — see `FiraSans-OFL.txt` |
| system `DejaVuSansCondensed-Bold.ttf` | DejaVu Sans Condensed Bold 14 | names and times (`H`) | Bitstream Vera licence (installed in the sandbox) |

To regenerate the BDFs: `fontforge -lang=py -script` with `f = fontforge.open('tahoma.sfd'); f.generate('tahoma.', bitmap_type='bdf')`
(writes one BDF per strike: tahoma-8 … tahoma-16). Wine's bold strikes above 12px are broken (regular weight) — don't use them.
