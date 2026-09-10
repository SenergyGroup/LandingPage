// Captures for the review loop: desktop + mobile UI, every preset at 2x and at 320px on #18181b,
// avatar + 21-char nick test, two theme variants. Usage: node capture.js <html> <outdir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const html = path.resolve(process.argv[2] || 'irc-minimal.html');
const out = process.argv[3] || 'captures/r1';
fs.mkdirSync(out, { recursive: true });
const save = (name, dataUrl) => fs.writeFileSync(path.join(out, name), Buffer.from(dataUrl.split(',')[1], 'base64'));

// a 96x96 test avatar: warm gradient + a dark "face" so pixelation is visible
function avatarDataUrl() {
  const { createCanvas } = (() => { try { return require('canvas'); } catch (e) { return {}; } })();
  return null; // built in-page instead (no node-canvas dependency)
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + html);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
  await page.waitForFunction(() => window.__panelMaker && document.getElementById('cv'));

  const keys = await page.evaluate(() => window.__panelMaker.presets);
  const grab = async (tag) => {
    for (const k of keys) {
      const png2x = await page.evaluate((k) => window.__panelMaker.render(k), k);
      save(`${tag}_${k}_2x.png`, png2x);
      const png1x = await page.evaluate(async (k) => {
        const src = new Image(); src.src = window.__panelMaker.render(k); await src.decode();
        const c = document.createElement('canvas'); c.width = 320; c.height = 100;
        const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
        x.drawImage(src, 0, 0, 320, 100);
        return c.toDataURL('image/png');
      }, k);
      save(`${tag}_${k}_1x.png`, png1x);
    }
  };

  // 1. default theme, default nick
  await grab('default');
  // UI shots
  await page.screenshot({ path: path.join(out, 'ui_desktop.png'), fullPage: true });
  await page.evaluate(() => window.__panelMaker.load('socials'));
  await page.screenshot({ path: path.join(out, 'ui_desktop_socials.png'), fullPage: false });
  await page.evaluate(() => window.__panelMaker.load('about'));

  // 2. avatar + 21-character nick
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 96; c.height = 96; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 96, 96); g.addColorStop(0, '#ff9a5c'); g.addColorStop(1, '#7a3cff');
    x.fillStyle = g; x.fillRect(0, 0, 96, 96);
    x.fillStyle = '#2a1030'; x.beginPath(); x.arc(48, 40, 22, 0, Math.PI * 2); x.fill();   // head
    x.fillStyle = '#ffe0c0'; x.fillRect(38, 34, 6, 6); x.fillRect(52, 34, 6, 6);            // eyes
    x.fillStyle = '#2a1030'; x.fillRect(22, 66, 52, 30);                                     // shoulders
    window.__panelMaker.setAvatar(c.toDataURL('image/png'));
    window.__panelMaker.setNick('RetroStreamerOfTheNite');   // 22 → maxlength trims? no: set directly (21+ chars)
  });
  await page.evaluate(() => window.__panelMaker.setNick('xXRetroStreamer2000Xx'));   // exactly 21 chars
  await page.waitForTimeout(300);
  await grab('longname');
  await page.evaluate(() => window.__panelMaker.load('about'));
  await page.screenshot({ path: path.join(out, 'ui_desktop_longname.png'), fullPage: false });

  // 3. theme variants (keep the long nick + avatar: the harder case)
  const themes = await page.evaluate(() => window.__panelMaker.themes);
  for (const i of [1, 3]) {
    await page.evaluate((i) => window.__panelMaker.setTheme(i), i);
    await grab('theme' + i + '_' + themes[i].toLowerCase().replace(/\W+/g, ''));
  }
  // contrast report for every theme (min contrast of every text colour vs the field)
  const report = [];
  for (let i = 0; i < themes.length; i++) {
    await page.evaluate((i) => window.__panelMaker.setTheme(i), i);
    report.push(await page.evaluate((name) => {
      const p = window.__panelMaker.palette();
      const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const lum = h => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16 & 255) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return ((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
      const keys = ['text', 'dim', 'acc', 'title', 'ok', 'r', 'g', 'y', 'b', 'p'];
      return name + ': ' + keys.map(k => k + '=' + p[k] + '@' + cr(p[k], p.bg)).join(' ') + ' dimBar=' + p.dimBar + '@' + cr(p.dimBar, p.bar) + '  | bar/bg ' + cr(p.bar, p.bg) + ' frame/bg ' + cr(p.frame, p.bg) + ' bg-vs-twitch ' + cr(p.bg, '#18181b');
    }, themes[i]));
  }
  fs.writeFileSync(path.join(out, 'contrast.txt'), report.join('\n') + '\n');
  await page.evaluate(() => window.__panelMaker.setTheme(0));

  // 4. mobile UI
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.__panelMaker.load('about'));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, 'ui_mobile.png'), fullPage: true });
  await page.screenshot({ path: path.join(out, 'ui_mobile_top.png'), fullPage: false });

  // 5. zip smoke test: intercept the download
  await page.setViewportSize({ width: 1280, height: 900 });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#dlAll')]);
  const zipPath = path.join(out, 'set.zip'); await dl.saveAs(zipPath);
  console.log('zip', fs.statSync(zipPath).size, 'bytes');
  // preview-all smoke test
  await page.click('#showSet'); await page.waitForTimeout(300);
  const setCount = await page.evaluate(() => document.querySelectorAll('#setCol canvas').length);
  console.log('preview-all canvases', setCount);
  await page.screenshot({ path: path.join(out, 'ui_desktop_previewall.png'), fullPage: true });
  await browser.close();
  if (errors.length) { console.error('PAGE ERRORS:', errors); process.exit(2); }
  console.log('done ->', out);
})().catch(e => { console.error(e); process.exit(1); });
