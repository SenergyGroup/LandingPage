// Captures for the review loop: desktop + mobile UI, every preset at 2x and at 320px on #0e0e10,
// avatar + 21-char name test, two theme variants, a contrast report, zip + preview-all smoke tests.
// Usage: node capture.js <html> <outdir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const html = path.resolve(process.argv[2] || 'windows-xp.html');
const out = process.argv[3] || 'captures/r1';
fs.mkdirSync(out, { recursive: true });
const save = (name, dataUrl) => fs.writeFileSync(path.join(out, name), Buffer.from(dataUrl.split(',')[1], 'base64'));

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

  // 1. default theme, default name
  await grab('default');
  await page.screenshot({ path: path.join(out, 'ui_desktop.png'), fullPage: true });
  await page.evaluate(() => window.__panelMaker.load('socials'));
  await page.screenshot({ path: path.join(out, 'ui_desktop_socials.png'), fullPage: false });
  await page.evaluate(() => window.__panelMaker.load('support'));
  await page.screenshot({ path: path.join(out, 'ui_desktop_support.png'), fullPage: false });
  await page.evaluate(() => window.__panelMaker.load('about'));

  // 2. uploaded picture + 21-character name
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 96; c.height = 96; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 96, 96); g.addColorStop(0, '#ff9a5c'); g.addColorStop(1, '#7a3cff');
    x.fillStyle = g; x.fillRect(0, 0, 96, 96);
    x.fillStyle = '#2a1030'; x.beginPath(); x.arc(48, 40, 22, 0, Math.PI * 2); x.fill();   // head
    x.fillStyle = '#ffe0c0'; x.fillRect(38, 34, 6, 6); x.fillRect(52, 34, 6, 6);            // eyes
    x.fillStyle = '#2a1030'; x.fillRect(22, 66, 52, 30);                                     // shoulders
    window.__panelMaker.setAvatar(c.toDataURL('image/png'));
  });
  await page.evaluate(() => window.__panelMaker.setNick('xXRetroStreamer2000Xx'));   // exactly 21 chars
  await page.waitForTimeout(400);
  await grab('longname');
  await page.evaluate(() => window.__panelMaker.load('about'));
  await page.screenshot({ path: path.join(out, 'ui_desktop_longname.png'), fullPage: false });

  // 3. theme variants (keep the long name + picture: the harder case)
  const themes = await page.evaluate(() => window.__panelMaker.themes);
  for (const i of [2, 4]) {
    await page.evaluate((i) => window.__panelMaker.setTheme(i), i);
    await grab('theme' + i + '_' + themes[i].toLowerCase().replace(/\W+/g, ''));
  }
  // contrast report for every theme
  const report = [];
  for (let i = 0; i < themes.length; i++) {
    await page.evaluate((i) => window.__panelMaker.setTheme(i), i);
    report.push(await page.evaluate((name) => {
      const p = window.__panelMaker.palette();
      const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const lum = h => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16 & 255) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return ((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
      return name + ': ink=' + p.ink + '@' + cr(p.ink, p.field) + ' sub=' + p.sub + '@' + cr(p.sub, p.field) + ' acc=' + p.acc + '@' + cr(p.acc, p.field) +
        ' title=' + p.titleInk + '@' + cr(p.titleInk, p.bar) + ' menu=' + p.menuInk + '@' + cr(p.menuInk, p.win) +
        ' chip=' + p.chipInk + '@' + cr(p.chipInk, p.chipMid) + ' label=' + p.labInk + '@' + cr(p.labInk, p.win) + ' | field/win ' + cr(p.field, p.win) + ' frame/twitch ' + cr(p.frame, '#0e0e10') + ' win/twitch ' + cr(p.win, '#0e0e10');
    }, themes[i]));
  }
  fs.writeFileSync(path.join(out, 'contrast.txt'), report.join('\n') + '\n');
  await page.evaluate(() => window.__panelMaker.setTheme(0));

  // 4. mobile UI
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.__panelMaker.load('about'));
  await page.waitForTimeout(200);
  const pageW = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('mobile scrollWidth', pageW);
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
