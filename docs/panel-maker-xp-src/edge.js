const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve('windows-xp.html')); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.__panelMaker);
  fs.mkdirSync('captures/edge', { recursive: true });
  const save = (n, d) => fs.writeFileSync('captures/edge/' + n, Buffer.from(d.split(',')[1], 'base64'));
  // accented + emoji name
  await p.fill('#sn', 'Zoë_Ünicode ✨'); await p.waitForTimeout(100);
  console.log('warn:', await p.evaluate(() => [$w = document.getElementById('glyphWarn').hidden, document.getElementById('glyphWarn').textContent]));
  save('about_unicode.png', await p.evaluate(() => window.__panelMaker.render('about')));
  await p.fill('#sn', 'José Peña'); await p.waitForTimeout(100);
  console.log('warn after accents only:', await p.evaluate(() => document.getElementById('glyphWarn').hidden));
  save('about_accents.png', await p.evaluate(() => window.__panelMaker.render('about')));
  // socials: tick all 7
  await p.evaluate(() => window.__panelMaker.load('socials'));
  const boxes = await p.$$('#socials input'); for (const bx of boxes) { if (!(await bx.isChecked())) await bx.click(); }
  console.log('ticked socials:', await p.$$eval('#socials input', a => a.filter(x => x.checked).length), 'tagBlock shown:', await p.$eval('#tagBlock', e => e.style.display !== 'none'));
  save('socials_max.png', await p.evaluate(() => window.__panelMaker.render('socials')));
  console.log('socials suggested:\n' + await p.$eval('#suggText', e => e.value));
  // rules with prose dash
  await p.evaluate(() => window.__panelMaker.load('rules')); await p.fill('#li1', 'Be kind - no hate'); await p.waitForTimeout(100);
  save('rules_prose.png', await p.evaluate(() => window.__panelMaker.render('rules')));
  console.log('rules suggested:\n' + await p.$eval('#suggText', e => e.value), '| hint:', await p.$eval('#listHint', e => e.textContent));
  // schedule long time
  await p.evaluate(() => window.__panelMaker.load('schedule')); await p.fill('#time', '7:00 PM EST / 12 AM GMT'); await p.waitForTimeout(100);
  save('schedule_longtime.png', await p.evaluate(() => window.__panelMaker.render('schedule')));
  // support tip url
  await p.evaluate(() => window.__panelMaker.load('support')); await p.fill('#tip', 'https://streamelements.com/xxretrostreamer2000xx/tip'); await p.waitForTimeout(100);
  console.log('tip value len', (await p.$eval('#tip', e => e.value)).length, '| support suggested:\n' + await p.$eval('#suggText', e => e.value));
  await p.evaluate(() => window.__panelMaker.load('subscribe'));
  console.log('subscribe suggested:\n' + await p.$eval('#suggText', e => e.value));
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#dlAll')]); await dl.saveAs('captures/edge/set.zip');
  console.log(errs.length ? errs : 'no page errors'); await b.close();
})();
