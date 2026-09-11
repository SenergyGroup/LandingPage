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

async function startFixture(external = false) {
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
  source = source.replace('const __dirname = path.dirname(__filename);', `const __dirname = ${JSON.stringify(root)};`);
  source = source.replace('const WIDGETS_PATH = path.join(__dirname, "config", "widgets.json");', `const WIDGETS_PATH = ${JSON.stringify(path.join(dir, 'widgets.json'))};`);
  source = source.replace('const ZIPS_ROOT = path.join(__dirname, "assets", "zips");', `const ZIPS_ROOT = ${JSON.stringify(zips)};`);
  for (const name of ['dotenv', 'express', 'better-sqlite3', 'nanoid']) {
    source = source.replace(`from "${name}"`, `from ${JSON.stringify(pathToFileURL(require.resolve(name)).href)}`);
  }
  const start = /app\.listen\(PORT, \(\) => \{[\s\S]*?\}\);\s*$/;
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
    env: { ...process.env, DB_PATH: ':memory:', DOWNLOAD_BASE_URL: external ? 'https://downloads.example.invalid/files/' : '', KIT_API_KEY: '', KIT_FORM_ID: '', ADMIN_KEY: '' },
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
    assert.ok(home.indexOf(`id="${kitId}"`) < home.indexOf('id="sku-31-search-results"'));
    const store = await (await fetch(`${fixture.base}/store?type=bundle`)).text();
    assert.match(store, /<h1>Ready-made Stream Kits<\/h1>/);
    assert.match(store, /\$29\.99/);
    assert.ok(store.includes(kitListing + '?utm_source=senergy-landing'));
    assert.match(store, /Chat supports Streamlabs or StreamElements/);
    assert.match(store, /type=bundle&amp;aesthetic=y2k/);
    assert.equal((store.match(/class="widget-card store-card kit-store-card"/g) || []).length, 3);
    assert.ok(store.includes('https://www.etsy.com/listing/4572959296/win95-retro-stream-kit-overlays-for?utm_source=senergy-landing'));
    const xpCard = store.slice(store.indexOf('id="sku-xp-kit-full"'), store.indexOf('id="sku-w95-kit-full"'));
    assert.match(xpCard, /https:\/\/www\.etsy\.com\/shop\/SenergyGroup\?utm_source=senergy-landing/);
    assert.match(xpCard, /Visit Etsy shop/);
    assert.match(xpCard, /Etsy listing coming soon/);
    assert.doesNotMatch(xpCard, /Buy on Etsy|\$44\.99/);
    const claim = await (await fetch(`${fixture.base}/claim`)).text();
    assert.ok(!claim.includes(`value="${kitId}"`));
    assert.ok(!claim.includes('value="sku-xp-kit-full"'));
    assert.ok(!claim.includes('value="sku-w95-kit-full"'));
    const chat = await (await fetch(`${fixture.base}/store?type=chat`)).text();
    assert.ok(!chat.includes(`id="${kitId}"`));
    assert.ok(!chat.includes('id="sku-xp-kit-full"'));
    assert.ok(!chat.includes('id="sku-w95-kit-full"'));
    const windows = await (await fetch(`${fixture.base}/store?type=bundle&aesthetic=windows`)).text();
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
