# Contact sheet: every preset at true Twitch size (320x100) on Twitch's #0e0e10, in upload order.
#   python3 sheet.py captures/r1 default out.png [title]
import sys, os
from PIL import Image, ImageDraw, ImageFont
d, tag, out = sys.argv[1], sys.argv[2], sys.argv[3]
title = sys.argv[4] if len(sys.argv) > 4 else "Twitch-size preview (320px wide, on Twitch's dark ground) — how viewers actually see it"
order = ['about', 'schedule', 'rules', 'socials', 'discord', 'subscribe', 'support', 'commands', 'specs', 'custom']
ims = [Image.open(os.path.join(d, f'{tag}_{k}_1x.png')).convert('RGBA') for k in order]
W, pad, gap = 700, 20, 10
H = pad + 26 + len(ims) * (100 + gap) + pad - gap
sheet = Image.new('RGB', (W, H), '#0e0e10')
dr = ImageDraw.Draw(sheet)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
dr.text((pad, pad), title, font=font, fill='#efeff1')
y = pad + 26
for im in ims:
    sheet.paste(im, (pad, y), im); y += 100 + gap
sheet.save(out)
print('sheet ->', out, sheet.size)
