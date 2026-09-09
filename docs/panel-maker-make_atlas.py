# Pre-renders three bitmap UI faces through FreeType's mono (1-bit) rasteriser and packs them
# as a compact glyph atlas the panel maker draws from — no runtime font rendering at all.
import json, sys
from PIL import Image, ImageFont, ImageDraw
FONTS = {
  'T': ('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 16),   # titles (MS Sans Serif Bold look)
  'E': ('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 14),   # emphasis (names, keys)
  'B': ('fonts/w95fa.ttf', 13),                                                 # body / menus (Win95 UI face)
}
CHARS = [chr(c) for c in range(32, 127)] + ['…', 'é', '’', '·', '–', '—']
atlas = {}
for key, (path, size) in FONTS.items():
    font = ImageFont.truetype(path, size, layout_engine=ImageFont.Layout.BASIC)
    glyphs = {}; asc = 0; desc = 0
    for ch in CHARS:
        adv = font.getlength(ch)
        im = Image.new('1', (64, 64), 1); d = ImageDraw.Draw(im)
        d.text((16, 40), ch, font=font, fill=0, anchor='ls')
        bbox = im.convert('L').point(lambda v: 255 if v < 128 else 0).getbbox()   # black pixels
        if bbox is None:
            glyphs[ch] = [round(adv), 0, 0, 0, 0, []]; continue
        x0, y0, x1, y1 = bbox
        rows = []
        for y in range(y0, y1):
            bits = 0
            for x in range(x0, x1):
                bits = (bits << 1) | (0 if im.getpixel((x, y)) else 1)
            rows.append(format(bits, 'x'))
        left = max(0, x0 - 16); top = y0 - 40; w = x1 - x0; h = y1 - y0   # clamp negative bearings: no glyph may bite its neighbour
        asc = max(asc, -top); desc = max(desc, top + h)
        glyphs[ch] = [round(adv), left, top, w, h, rows]
    hb = font.getbbox('H'); cap = hb[3] - hb[1]
    xb = font.getbbox('x'); xh = xb[3] - xb[1]
    atlas[key] = {'size': size, 'cap': cap, 'xh': xh, 'asc': asc, 'desc': desc, 'g': glyphs}
    print(key, path.split('/')[-1], size, 'cap', cap, 'asc', asc, 'desc', desc, 'glyphs', len(glyphs), file=sys.stderr)
js = json.dumps(atlas, separators=(',', ':'), ensure_ascii=True)
open('atlas.json', 'w').write(js)
print(len(js), 'bytes', file=sys.stderr)
