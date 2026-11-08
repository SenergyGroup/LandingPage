"""Review confirmation in the local-only desktop shell without real claims."""
import json
import os
import subprocess
import time
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.preview' / 'confirmed'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:4175'
proc = subprocess.Popen(['node', 'scripts/preview.mjs'], cwd=ROOT,
    env={**os.environ, 'PREVIEW_PORT': '4175'}, stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
checks = []
errors = []
try:
    for _ in range(60):
        try:
            with urlopen(BASE, timeout=.2): break
        except OSError: time.sleep(.1)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        for label, slug in [('alert', 'sku-cc-internet-cafe-order-ticket'), ('chat', 'sku-47-internet-cafe-receipt')]:
            for width, height, layout in [(1280,900,'desktop'), (390,844,'mobile')]:
                page.set_viewport_size({'width': width, 'height': height})
                route = BASE + '/preview/confirmed?widget=' + slug
                page.goto(route, wait_until='networkidle')
                app = page.locator('[data-window="free"]')
                assert app.is_visible() and app.get_attribute('data-active') == 'true'
                frame = page.frame_locator('[data-window="free"] iframe')
                assert page.locator('iframe iframe').count() == 0
                assert frame.locator('.desktop-shell').count() == 0
                assert frame.get_by_role('heading', name='Your widget is ready').is_visible()
                picture = frame.locator('.confirmed-image img')
                assert picture.evaluate('img => img.complete && img.naturalWidth > 0 && getComputedStyle(img).objectFit === "contain"')
                button = frame.get_by_role('button', name='Download setup guide (PDF)')
                assert button.is_disabled()
                box = button.bounding_box()
                win = app.bounding_box()
                assert box['y']+box['height'] < win['y']+win['height'], (label, layout, 'download action below fold')
                assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth+1')
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                page.screenshot(path=str(OUT / f'{label}-{layout}.png'), full_page=True)
                frame.get_by_role('link', name='Browse the widget store').click()
                page.wait_for_url('**/store')
                assert page.locator('[data-window="store"]').get_attribute('data-active') == 'true'
                page.go_back(wait_until='networkidle')
                frame.locator('.confirmed-page').wait_for()
                assert app.get_attribute('data-active') == 'true'
                frame.get_by_role('link', name='See other free widgets').click()
                frame.locator('.filter-count').wait_for()
                assert 'widget='+slug in page.url and 'view=all' in page.url
                checks.append({'widget': label, 'viewport': layout, 'previewContained': True,
                    'downloadActionVisible': True, 'storeAndFreeNavigation': True,
                    'backRestoresConfirmation': True, 'noHorizontalOverflow': True})
        assert not errors, errors
        browser.close()
finally:
    proc.terminate()
    proc.wait(timeout=10)
(OUT / 'qa.json').write_text(json.dumps({'checks': checks, 'errors': errors,
    'scope': 'Local presentation-only preview; downloads disabled. Actual download routes covered by npm test.'}, indent=2)+'\n')
print('Four confirmation layouts passed, including navigation and browser Back. No claims created or emails sent.')
