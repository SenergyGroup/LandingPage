# Assembles windows-xp.html from the source page, the icon sheet and the glyph atlas.
#   python3 build.py            (expects windows-xp.src.html, xp-icons.js, xp-atlas.json alongside)
src = open('windows-xp.src.html').read()
icons = open('xp-icons.js').read()
atlas = open('xp-atlas.json').read()
out = src.replace('__ICONS__', icons.rstrip('\n')).replace('__ATLAS__', atlas)
open('windows-xp.html', 'w').write(out)
print(len(out), 'bytes -> windows-xp.html')
