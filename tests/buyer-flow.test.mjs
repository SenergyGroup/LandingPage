// Exercise the actual Express routes in a child process. No production .env,
// customer database, Kit requests, or real subscriber records are used.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const widgetId = 'sku-legacy-02-windowsxp';
const kitId = 'sku-mk-kit-full';
const kitListing = 'https://www.etsy.com/listing/4533131913/retro-bundle-streamelements-y2k-early';

async function startFixture(external = false, preview = false) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'senergy-buyer-flow-'));
  const zips = path.join(dir, 'zips');
  fs.mkdirSync(path.join(zips, widgetId), { recursive: true });
  const pdf = Buffer.alloc(16 * 1024 * 1024, 32);
  pdf.write('%PDF-1.4\n');
  fs.writeFileSync(path.join(zips, widgetId, 'guide.pdf'), pdf);
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'config/widgets.json'), 'utf8'));
  catalog.push({ id: 'missing-file', name: 'Missing fixture', zip: 'missing.pdf' });
  fs.writeFileSync(path.join(dir, 'widgets.json'), JSON.stringify(catalog));
  let source = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.ok(source.includes('dotenv.config();'));
  source = source.replace('dotenv.config();', '/* Tests never load production secrets. */');
  source = source.replace('from "./showroom.mjs"', `from ${JSON.stringify(pathToFileURL(path.join(root, 'showroom.mjs')).href)}`);
  source = source.replace('const __dirname = path.dirname(__filename);', `const __dirname = ${JSON.stringify(root)};`);
  source = source.replace('const WIDGETS_PATH = path.join(__dirname, "config", "widgets.json");', `const WIDGETS_PATH = ${JSON.stringify(path.join(dir, 'widgets.json'))};`);
  source = source.replace('const ZIPS_ROOT = path.join(__dirname, "assets", "zips");', `const ZIPS_ROOT = ${JSON.stringify(zips)};`);
  for (const name of ['dotenv', 'express', 'better-sqlite3', 'nanoid']) {
    source = source.replace(`from "${name}"`, `from ${JSON.stringify(pathToFileURL(require.resolve(name)).href)}`);
  }
  const start = /app\.listen\(PORT, LOCAL_PREVIEW \? "127\.0\.0\.1" : undefined, \(\) => \{[\s\S]*?\}\);\s*$/;
  assert.match(source, start);
  source = source.replace(start, `
    globalThis.fetch = () => { throw new Error('External requests blocked in tests'); };
    const rows = [
      ['repeat', '${widgetId}', 'confirmed'], ['abort', '${widgetId}', 'confirmed'],
      ['pending', '${widgetId}', 'pending'], ['head', '${widgetId}', 'confirmed'],
      ['legacy', 'windows-xp', 'delivered'], ['missing', 'missing-file', 'confirmed']
    ];
    for (const [id, widget, status] of rows) {
      db.prepare('INSERT INTO widget_claims (id,email,widget_id,status,claim_token,created_at) VALUES (?,?,?,?,?,?)')
        .run(id, 'fixture@example.invalid', widget, status, 'test-' + id, '2026-09-10T00:00:00Z');
    }
    process.on('message', ({ id }) => process.send({ id, claim: db.prepare('SELECT status, delivered_at FROM widget_claims WHERE id = ?').get(id) }));
    app.listen(0, '127.0.0.1', function () { process.send({ port: this.address().port }); });
  `);
  const file = path.join(dir, 'server.mjs');
  fs.writeFileSync(file, source);
  const child = fork(file, [], {
    env: { ...process.env, LOCAL_PREVIEW: preview ? '1' : '0', DB_PATH: ':memory:', DOWNLOAD_BASE_URL: external ? 'https://downloads.example.invalid/files/' : '', KIT_API_KEY: '', KIT_FORM_ID: '', ADMIN_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  });
  let logs = '';
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  const ready = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Fixture startup timed out: ${logs}`)), 10000);
    child.once('message', message => { clearTimeout(timer); resolve(message); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Fixture exited (${code}): ${logs}`)); });
  });
  return {
    base: `http://127.0.0.1:${ready.port}`, child,
    async state(id) {
      const answer = once(child, 'message');
      child.send({ id });
      return (await answer)[0].claim;
    },
    async close() {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');
        child.kill();
        await exited;
      }
      // Delete only the unique fixture directory this function created.
      assert.equal(path.dirname(dir), fs.realpathSync(os.tmpdir()));
      assert.ok(path.basename(dir).startsWith('senergy-buyer-flow-'));
      fs.rmSync(dir, { recursive: true, force: true });
    },
    logs: () => logs
  };
}

const download = async (fixture, token = 'repeat') => {
  // Each call uses a fresh connection and no cookie/session state.
  const response = await fetch(`${fixture.base}/download/test-${token}`, { headers: { Connection: 'close' } });
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/pdf/);
  assert.equal(bytes.subarray(0, 8).toString(), '%PDF-1.4');
  return response;
};

test('local PDF access survives repeat downloads, confirmation return, and interruption', async t => {
  const fixture = await startFixture();
  t.after(() => fixture.close());

  await t.test('unconfirmed and unknown tokens remain blocked', async () => {
    for (const token of ['pending', 'unknown']) {
      const response = await fetch(`${fixture.base}/download/test-${token}`);
      assert.equal(response.status, 403);
      await response.text();
    }
  });
  await t.test('HEAD does not mark a download delivered', async () => {
    assert.equal((await fetch(`${fixture.base}/download/test-head`, { method: 'HEAD' })).status, 200);
    assert.deepEqual(await fixture.state('head'), { status: 'confirmed', delivered_at: null });
  });
  await t.test('download twice, return via confirmation, and use a fresh client', async () => {
    await download(fixture);
    const first = await fixture.state('repeat');
    assert.equal(first.status, 'delivered');
    assert.ok(first.delivered_at);
    await download(fixture);
    const page = await fetch(`${fixture.base}/confirmed?token=test-repeat`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /\/download\/test-repeat/);
    await download(fixture);
    assert.deepEqual(await fixture.state('repeat'), first);
    await download(fixture, 'legacy');
  });
  await t.test('cancel after the first chunk; server stays up and the link can retry', async () => {
    await new Promise((resolve, reject) => {
      const request = http.get(`${fixture.base}/download/test-abort`, response => {
        assert.equal(response.statusCode, 200);
        response.once('data', chunk => {
          assert.ok(chunk.length < 16 * 1024 * 1024);
          response.destroy();
          request.destroy();
          resolve();
        });
        response.on('error', err => { if (err.code !== 'ECONNRESET') reject(err); });
      });
      request.on('error', err => { if (err.code !== 'ECONNRESET') reject(err); });
    });
    const ping = await fetch(fixture.base);
    assert.equal(ping.status, 200);
    await ping.text();
    assert.deepEqual(await fixture.state('abort'), { status: 'confirmed', delivered_at: null });
    await download(fixture, 'abort');
    assert.doesNotMatch(fixture.logs(), /ERR_HTTP_HEADERS_SENT|uncaught/i);
  });
  await t.test('a file missing before headers gets a readable error without crashing', async () => {
    const response = await fetch(`${fixture.base}/download/test-missing`);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('content-disposition'), null);
    assert.match(await response.text(), /Please try this link again/);
    assert.equal((await fixture.state('missing')).status, 'confirmed');
  });
  await t.test('homepage and kit category lead to the live paid kit, excluded from freebies', async () => {
    const home = await (await fetch(fixture.base)).text();
    assert.match(home, /href="\/store\?type=bundle"[^]*?Full Stream Kits/);
    assert.match(home, /href="\/looks\/retro-messenger"/);
    assert.match(home, /Make your stream your own/);
    const store = await (await fetch(`${fixture.base}/store?type=bundle&embedded=1`)).text();
    assert.match(store, /<h1>Stream Kits & Chat Bundles<\/h1>/);
    assert.match(store, /\$29\.99/);
    assert.ok(store.includes(kitListing + '?utm_source=senergy-landing'));
    assert.match(store, /Chat supports Streamlabs or StreamElements/);
    assert.match(store, /type=bundle&amp;aesthetic=y2k/);
    assert.equal((store.match(/class="widget-card store-card kit-store-card"/g) || []).length, 4);
    assert.ok(store.includes('https://www.etsy.com/listing/4572959296/win95-retro-stream-kit-overlays-for?utm_source=senergy-landing'));
    const xpCard = store.slice(store.indexOf('id="sku-xp-kit-full"'), store.indexOf('id="sku-w95-kit-full"'));
    assert.ok(xpCard.includes('https://www.etsy.com/listing/4573470064/xp-inspired-stream-kit-for-twitch-8?utm_source=senergy-landing'));
    assert.match(xpCard, /Buy on Etsy/);
    assert.doesNotMatch(xpCard, /Visit Etsy shop|Etsy listing coming soon/);
    const claim = await (await fetch(`${fixture.base}/claim?embedded=1`)).text();
    assert.ok(!claim.includes(`value="${kitId}"`));
    assert.ok(!claim.includes('value="sku-xp-kit-full"'));
    assert.ok(!claim.includes('value="sku-w95-kit-full"'));
    const chat = await (await fetch(`${fixture.base}/store?type=chat&embedded=1`)).text();
    assert.ok(!chat.includes(`id="${kitId}"`));
    assert.ok(!chat.includes('id="sku-xp-kit-full"'));
    assert.ok(!chat.includes('id="sku-w95-kit-full"'));
    const windows = await (await fetch(`${fixture.base}/store?type=bundle&aesthetic=windows&embedded=1`)).text();
    assert.ok(windows.includes('id="sku-xp-kit-full"'));
    assert.ok(windows.includes('id="sku-w95-kit-full"'));
    assert.ok(!windows.includes(`id="${kitId}"`));
  });
});

test('external download redirects stay reusable without claiming a completed transfer', async t => {
  const fixture = await startFixture(true);
  t.after(() => fixture.close());
  for (const token of ['repeat', 'repeat', 'legacy']) {
    const response = await fetch(`${fixture.base}/download/test-${token}`, { redirect: 'manual' });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), `https://downloads.example.invalid/files/${widgetId}/guide.pdf`);
    await response.text();
  }
  assert.deepEqual(await fixture.state('repeat'), { status: 'confirmed', delivered_at: null });
  assert.equal((await fetch(`${fixture.base}/confirmed?token=test-repeat`)).status, 200);
  assert.equal((await fetch(`${fixture.base}/download/test-repeat`, { redirect: 'manual' })).status, 302);
  assert.equal((await fetch(`${fixture.base}/download/test-pending`)).status, 403);
});

test('Messenger showroom routes, assets and exact checkout destinations work', async t => {
  const fixture = await startFixture();
  t.after(() => fixture.close());
  const home = await (await fetch(fixture.base)).text();
  const response = await fetch(`${fixture.base}/looks/retro-messenger`);
  assert.equal(response.status, 200);
  const look = await response.text();
  for (const page of [home, look]) {
    assert.match(page, /data-mode-choice="plain"/);
    assert.match(page, /data-mode-choice="chat"/);
    assert.match(page, /data-mode-choice="kit"/);
    assert.match(page, /data-mode-choice="alert"/);
    assert.match(page, /data-mode-choice="goal"/);
    assert.match(page, /data-fire-alert="follow"/);
    assert.match(page, /data-scene-choice="starting"/);
    assert.match(page, /pixabay-pacman-7024232.png/);
    assert.doesNotMatch(page, /quiet-quest.svg|sg-desktop-detail|sg-desktop-taskbar/);
    assert.match(page, /href="\/panel-maker\/retro-messenger"/);
    // Every local link target, image, script and stylesheet resolves.
    const paths = [...new Set([...page.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)].map(m=>m[1].replaceAll('&amp;','&')))];
    for (const url of paths) {
      assert.equal((await fetch(`${fixture.base}${url}`, {method:'HEAD'})).status, 200, url);
    }
  }
  assert.equal((look.match(/data-part="/g)||[]).length,8);
  assert.equal((look.match(/data-messenger-tab="/g)||[]).length,3);
  assert.match(home, /data-initial-app="store"/);
  assert.match(look, /data-initial-app="messenger"/);
  assert.match(home, /aria-label="Desktop taskbar"/);
  const links = [...look.matchAll(/data-product-id="([^"]+)" href="([^"]+)"/g)];
  assert.equal(links.length,2);
  const expected = { 'sku-legacy-17-retro-messenger':'/listing/4469875012/', 'sku-mk-kit-full':'/listing/4533131913/' };
  for (const [,id,href] of links) {
    const url = new URL(href.replaceAll('&amp;','&'));
    assert.equal(url.hostname,'www.etsy.com');
    assert.ok(url.pathname.startsWith(expected[id]));
    assert.equal(url.searchParams.get('utm_campaign'),id);
    assert.equal(url.searchParams.get('utm_source'),'senergy-landing');
  }
  assert.match(look, /Other live kit components use StreamElements with OBS/);
  assert.doesNotMatch(look, /youtube\.com|youtu\.be|assets\/zips/);
  assert.equal((await fetch(`${fixture.base}/looks/not-a-look`)).status,404);
});

test('local preview cannot send forms, mutate claims, expose downloads or load analytics', async t => {
  const fixture = await startFixture(false,true);
  t.after(() => fixture.close());
  for (const url of ['/', '/looks/retro-messenger','/store','/claim','/custom','/panels']) {
    const response = await fetch(`${fixture.base}${url}`);
    assert.equal(response.status,200);
    assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
    const html=await response.text();
    assert.match(html,/LOCAL PREVIEW/);
    assert.doesNotMatch(html,/googletagmanager|gtag\('config'/);
  }
  for (const url of ['/claim','/custom']) {
    const response=await fetch(`${fixture.base}${url}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'email=fixture%40example.invalid'});
    assert.equal(response.status,403);
    assert.match(await response.text(),/No request was sent/);
  }
  for (const url of ['/confirmed?token=test-repeat','/download/test-repeat','/admin/requests','/Confirmed?token=test-repeat','/ADMIN/requests']) {
    assert.equal((await fetch(`${fixture.base}${url}`)).status,403);
  }
  assert.deepEqual(await fixture.state('repeat'),{status:'confirmed',delivered_at:null});
});


test('store and Panel Maker have desktop entry routes and working embedded tools', async t => {
  const fixture=await startFixture(false,true);t.after(()=>fixture.close());
  for(const [route,app] of [['/store?type=bundle','store'],['/panel-maker/retro-messenger','panels']]){
    const html=await(await fetch(fixture.base+route)).text();
    assert.ok(html.includes(`data-initial-app="${app}"`));
    assert.match(html,/desktop-icon-drag.js/);
  }
  const store=await(await fetch(fixture.base+'/store?type=bundle&embedded=1')).text();
  assert.match(store,/class="catalog-app"/);assert.match(store,/shop-app.css/);
  assert.equal((store.match(/class="widget-card store-card kit-store-card"/g)||[]).length,4);
  const maker=await(await fetch(fixture.base+'/panel-maker/retro-messenger?embedded=1')).text();
  assert.match(maker,/class="panel-maker-app"/);assert.match(maker,/shop-app.css/);
  assert.match(maker,/id="dlOne"/);assert.match(maker,/id="cv"/);assert.match(maker,/id="sn"/);
  assert.match(maker,/panel-maker-kit/);assert.match(maker,/listing\/4533131913\//);
  for(const family of ['retro-messenger','windows-xp','irc-minimal']){
    const editor=await(await fetch(fixture.base+'/panel-maker/'+family+'?embedded=1')).text();
    assert.ok(editor.includes('data-panel-family="'+family+'"'));
    assert.match(editor,/class="panel-app-toolbar"/);assert.match(editor,/href="\/store">Widget Store/);
    assert.match(editor,/id="cv"/);assert.match(editor,/id="dlOne"/);
  }
  assert.equal((await fetch(fixture.base+'/panel-maker/not-a-family?embedded=1')).status,404);
});


test('paid catalog matches all 31 active Etsy listings and preserves free-widget eligibility', async t => {
  const fixture=await startFixture(false,true);t.after(()=>fixture.close());
  const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/etsy-catalog-audit-2026-10-25.json'),'utf8'));
  const entries=JSON.parse(fs.readFileSync(path.join(root,'config/widgets.json'),'utf8'));
  const active=entries.filter(w=>w.etsyUrl&&w.storeActive!==false);
  assert.equal(active.length,31);
  assert.deepEqual(active.map(w=>w.etsyListingId).sort(),audit.listings.map(w=>w.id).sort());
  const all=await(await fetch(fixture.base+'/store?view=listings&embedded=1')).text();
  assert.equal((all.match(/class="widget-card store-card/g)||[]).length,31);
  for(const listing of audit.listings){
    const entry=active.find(w=>w.etsyListingId===listing.id);
    assert.equal(entry.price,listing.price,listing.title);
    const card=all.slice(all.indexOf(`id="${entry.id}"`)).split('class="widget-card store-card')[0];
    assert.ok(card.includes('/listing/'+listing.id+'/'),entry.id);
    assert.ok(card.includes('$'+listing.price.toFixed(2)),entry.id);
  }
  const grouped=await(await fetch(fixture.base+'/store?embedded=1')).text();
  assert.equal((grouped.match(/class="widget-card store-card/g)||[]).length,28);
  assert.match(grouped,/Buy once: every listing includes all four themes/);
  for(const listing of audit.listings)assert.ok(grouped.includes('/listing/'+listing.id+'/'),listing.id);
  for(const removed of audit.removedFromPaidStore){assert.ok(!grouped.includes('/listing/'+removed.id+'/'));assert.ok(entries.find(w=>w.id===removed.sku));}
  for(const added of audit.added){
    assert.equal(entries.find(w=>w.id===added.sku).freebie,false);
    const response=await fetch(fixture.base+added.localImage,{method:'HEAD'});assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^image\//);
  }
  const claim=await(await fetch(fixture.base+'/claim?embedded=1')).text();
  assert.match(claim,/Streamlabs &amp; StreamElements/);assert.match(claim,/name="widget_id"/);assert.match(claim,/name="email"/);
  for(const added of audit.added)assert.ok(!claim.includes(`value="${added.sku}"`));
  for(const [route,app] of [['/claim?aesthetic=windows','free'],['/custom','custom'],['/about','about'],['/panels','panels']]){
    const shell=await(await fetch(fixture.base+route)).text();assert.ok(shell.includes(`data-initial-app="${app}"`));
    const inner=await(await fetch(fixture.base+route+(route.includes('?')?'&':'?')+'embedded=1')).text();
    assert.match(inner,/class="classic-page"/);assert.ok(!inner.includes('class="desktop-shell"'));
  }
});

test('icon grid prevents collisions when dropping onto occupied cells and resizing', async () => {
  const {makeIconGrid,cellPoint,cellKey,arrangeIcons,nearestFreeCell}=await import('../public/desktop-grid.js');
  const ids=Array.from({length:11},(_,i)=>'icon-'+i);
  let saved=Object.fromEntries(ids.map(id=>[id,{col:99,row:99}]));
  for(const [width,height] of [[1440,850],[390,740],[320,450],[844,260],[240,160],[1440,850]]){
    const grid=makeIconGrid(width,height,ids.length);
    const positions=arrangeIcons(ids,saved,grid,width<=640?3:2);
    assert.equal(new Set(Object.values(positions).map(cellKey)).size,ids.length,`${width}x${height}`);
    const points=Object.values(positions).map(cell=>cellPoint(cell,grid));
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)assert.ok(Math.abs(points[i].x-points[j].x)>=78||Math.abs(points[i].y-points[j].y)>=86);
    const occupied=new Set(ids.slice(1).map(id=>cellKey(positions[id])));
    const target=nearestFreeCell(cellPoint(positions[ids[1]],grid),occupied,grid);
    assert.ok(target);assert.ok(!occupied.has(cellKey(target)));
    assert.ok(target.col>=0&&target.col<grid.columns&&target.row>=0&&target.row<grid.rows);
    saved=positions;
  }
});
