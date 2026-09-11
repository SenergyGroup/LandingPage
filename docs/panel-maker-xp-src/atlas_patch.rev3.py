# Hand-fixed glyphs on top of the generated atlas (python3 atlas_patch.py xp-atlas.json):
#   DejaVu Sans Condensed Bold 12 renders the i / j dot fused to the stem in 1-bit mode, so
#   "Twitch" reads "Twltch" at 320px. Give both a one-row gap, like the 14px cut has natively.
import json, sys
p = sys.argv[1] if len(sys.argv) > 1 else 'xp-atlas.json'
a = json.load(open(p))
E = a['E']['g']
E['i'] = [4, 1, -11, 2, 10, ['3', '3', '0', '3', '3', '3', '3', '3', '3', '3']]
E['j'] = [4, 0, -11, 3, 13, ['3', '3', '0', '3', '3', '3', '3', '3', '3', '3', '3', '6', '4']]
a['E']['asc'] = max(a['E']['asc'], 11)
json.dump(a, open(p, 'w'), separators=(',', ':'), ensure_ascii=True)
print('patched E i/j ->', p)

# The 12px body face draws the comma as a 1x2 bar (reads as a full stop at 320px): give it and the
# semicolon Tahoma's one-pixel tail at the baseline.
B = a['B']['g']
B[','] = [3, 1, -2, 2, 3, ['1', '1', '2']]
B[';'] = [4, 1, -7, 2, 8, ['1', '0', '0', '0', '0', '1', '1', '2']]
json.dump(a, open(p, 'w'), separators=(',', ':'), ensure_ascii=True)
print('patched B , ; ->', p)

# Bold 12: the bang is a 1px stem beside 2px letters ("!discord" loses its payload at 320px), and the
# underscore is a hairline under "thank_you.wav". Match both to the face's 2px stroke.
E['!'] = [5, 2, -9, 2, 9, ['3', '3', '3', '3', '3', '3', '0', '3', '3']]
E['_'] = [5, 0, 1, 5, 2, ['1f', '1f']]
json.dump(a, open(p, 'w'), separators=(',', ':'), ensure_ascii=True)
print('patched E ! _ ->', p)
