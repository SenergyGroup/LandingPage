# Pre-renders UI faces through FreeType and packs them as a compact glyph atlas the panel
# makers draw from — no runtime font rendering at all.
#
#   python3 make_atlas.py                 -> retro-messenger faces (the original spec) -> atlas.json
#   python3 make_atlas.py spec.json out.json
#
# spec.json = {"faces": {"T": ["path/to/font.ttf", 16], "B": [...], "X": ["font.ttf", 14, "aa"]},
#              "chars": "optional extra chars"}
# A face is 1-bit (FreeType's mono rasteriser — Win9x/XP dialog text) unless its third entry is
# "aa": then it is 8-bit anti-aliased (XP's Luna caption text) and stored as one hex digit
# (0–15) per pixel instead of one bit.
# A face whose path ends in .bdf is a hand-drawn bitmap strike (e.g. Wine's Tahoma 11px, exported
# from tahoma.sfd with FontForge): its pixels are copied as-is, no rasterising; the second entry is
# the pixel size and an optional third entry "bdf:<space advance>" sets the space width (BDF
# exports drop the empty space glyph).
# Each glyph = [advance, left, top (relative to baseline), w, h, rows]; negative left
# bearings are clamped so no glyph can bite its neighbour when blitted on a pen position.
import json, sys
from PIL import Image, ImageFont, ImageDraw

DEFAULT = {
  'T': ('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 16),   # titles (MS Sans Serif Bold look)
  'E': ('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 14),   # emphasis (names, keys)
  'B': ('fonts/w95fa.ttf', 13),                                                 # body / menus (Win95 UI face)
}
CHARS = [chr(c) for c in range(32, 127)] + ['…', 'é', '’', '·', '–', '—']

if len(sys.argv) >= 2:
    spec = json.load(open(sys.argv[1]))
    FONTS = {k: (v[0], int(v[1]), (v[2] if len(v) > 2 else '')) for k, v in spec['faces'].items()}
    for ch in spec.get('chars', ''):
        if ch not in CHARS: CHARS.append(ch)
    OUT = sys.argv[2] if len(sys.argv) >= 3 else 'atlas.json'
else:
    FONTS, OUT = {k: (p, s, '') for k, (p, s) in DEFAULT.items()}, 'atlas.json'

def read_bdf(path):   # -> {char: [adv, left, top(rel. baseline), w, h, [int rows, msb = leftmost]]}
    g = {}; cur = None; lines = open(path, encoding='latin-1').read().split('\n'); i = 0
    while i < len(lines):
        L = lines[i].split()
        if L:
            k = L[0]
            if k == 'STARTCHAR': cur = {}
            elif k == 'ENCODING': cur['enc'] = int(L[1])
            elif k == 'DWIDTH': cur['adv'] = int(L[1])
            elif k == 'BBX': cur['bbx'] = list(map(int, L[1:5]))
            elif k == 'BITMAP':
                w, h, xo, yo = cur['bbx']; rows = []
                for j in range(h):
                    hx = lines[i + 1 + j].strip(); nb = len(hx) * 4
                    rows.append(int(hx, 16) >> (nb - w))
                i += h
                if cur.get('enc', -1) >= 0: g[chr(cur['enc'])] = [cur['adv'], xo, -(yo + h), w, h, rows]
            elif k == 'ENDCHAR' and cur.get('enc', -1) >= 0 and chr(cur['enc']) not in g:
                g[chr(cur['enc'])] = [cur.get('adv', 0), 0, 0, 0, 0, []]
        i += 1
    return g

atlas = {}
for key, (path, size, mode) in FONTS.items():
    if path.endswith('.bdf'):
        src = read_bdf(path); glyphs = {}; asc = 0; desc = 0
        space = int(mode.split(':')[1]) if mode.startswith('bdf:') else max(2, round(size * 0.3))
        for ch in CHARS:
            if ch == ' ': glyphs[' '] = [src[' '][0] if ' ' in src else space, 0, 0, 0, 0, []]; continue
            if ch not in src: continue
            adv, left, top, w, h, rows = src[ch]
            while rows and rows[0] == 0: rows = rows[1:]; top += 1; h -= 1       # trim empty rows
            while rows and rows[-1] == 0: rows = rows[:-1]; h -= 1
            if not rows: glyphs[ch] = [adv, 0, 0, 0, 0, []]; continue
            left = max(0, left)
            asc = max(asc, -top); desc = max(desc, top + h)
            glyphs[ch] = [adv, left, top, w, h, [format(r, 'x') for r in rows]]
        cap = glyphs['H'][4]; xh = glyphs['x'][4]
        atlas[key] = {'size': size, 'cap': cap, 'xh': xh, 'asc': asc, 'desc': desc, 'g': glyphs}
        advs = sorted(set(g[0] for c, g in glyphs.items() if c != ' ' and 32 < ord(c) < 127))
        print(key, path.split('/')[-1], size, 'bdf', 'cap', cap, 'asc', asc, 'desc', desc, 'glyphs', len(glyphs), 'advances', advs, file=sys.stderr)
        continue
    aa = mode == 'aa'
    font = ImageFont.truetype(path, size, layout_engine=ImageFont.Layout.BASIC)
    try:
        from fontTools.ttLib import TTFont
        cmap = TTFont(path).getBestCmap()
    except Exception:
        cmap = None
    glyphs = {}; asc = 0; desc = 0
    for ch in CHARS:
        if cmap is not None and ord(ch) not in cmap and ch != ' ':
            continue   # missing from the face: skip rather than emit a .notdef box (the maker falls back to '?')
        adv = font.getlength(ch)
        if aa:
            im = Image.new('L', (64, 64), 0); d = ImageDraw.Draw(im)
            d.text((16, 40), ch, font=font, fill=255, anchor='ls')
            bbox = im.point(lambda v: 255 if v >= 8 else 0).getbbox()
        else:
            im = Image.new('1', (64, 64), 1); d = ImageDraw.Draw(im)
            d.text((16, 40), ch, font=font, fill=0, anchor='ls')
            bbox = im.convert('L').point(lambda v: 255 if v < 128 else 0).getbbox()   # black pixels
        if bbox is None:
            glyphs[ch] = [round(adv), 0, 0, 0, 0, []]; continue
        x0, y0, x1, y1 = bbox
        rows = []
        for y in range(y0, y1):
            if aa:
                rows.append(''.join(format(im.getpixel((x, y)) >> 4, 'x') for x in range(x0, x1)))
            else:
                bits = 0
                for x in range(x0, x1):
                    bits = (bits << 1) | (0 if im.getpixel((x, y)) else 1)
                rows.append(format(bits, 'x'))
        left = max(0, x0 - 16); top = y0 - 40; w = x1 - x0; h = y1 - y0   # clamp negative bearings
        asc = max(asc, -top); desc = max(desc, top + h)
        glyphs[ch] = [round(adv), left, top, w, h, rows]
    hb = font.getbbox('H'); cap = hb[3] - hb[1]
    xb = font.getbbox('x'); xh = xb[3] - xb[1]
    atlas[key] = {'size': size, 'cap': cap, 'xh': xh, 'asc': asc, 'desc': desc, 'g': glyphs}
    if aa: atlas[key]['aa'] = 1
    advs = sorted(set(g[0] for c, g in glyphs.items() if c != ' ' and 32 < ord(c) < 127))
    print(key, path.split('/')[-1], size, 'aa' if aa else 'mono', 'cap', cap, 'asc', asc, 'desc', desc, 'glyphs', len(glyphs), 'advances', advs, file=sys.stderr)
js = json.dumps(atlas, separators=(',', ':'), ensure_ascii=True)
open(OUT, 'w').write(js)
print(len(js), 'bytes ->', OUT, file=sys.stderr)
