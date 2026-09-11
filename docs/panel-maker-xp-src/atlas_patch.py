# Hand-fixed glyphs on top of the generated atlas (python3 atlas_patch.py xp-atlas.json).
# rev 4: the body (B) and emphasis (E) faces are now Wine's hand-drawn Tahoma 11px strikes, which
# already carry the fixes rev 1-3 had to hand-draw into DejaVu (i/j dot gap, comma/semicolon tail,
# a 2px bold '!', a full-width '_'), so those patches are gone. Anything the strikes lack falls back
# to '?' in the maker; '✓' is borrowed from the headline face so a pasted tick still draws.
import json, sys
p = sys.argv[1] if len(sys.argv) > 1 else 'xp-atlas.json'
a = json.load(open(p))
for k in ('B', 'E'):
    if '✓' not in a[k]['g'] and '✓' in a['H']['g']:
        a[k]['g']['✓'] = a['H']['g']['✓']
json.dump(a, open(p, 'w'), separators=(',', ':'), ensure_ascii=True)
print('patched ->', p)

# Tahoma Bold 11: the strike's comma and full stop fill their whole advance, so "Bits, tips" closes
# up at 320px. One more pixel of advance (ink unchanged) gives them the regular face's breathing room.
E = a['E']['g']
E[','][0] = 4; E['.'][0] = 4
json.dump(a, open(p, 'w'), separators=(',', ':'), ensure_ascii=True)
print('patched E , . advance ->', p)
