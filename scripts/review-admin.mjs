import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

// Isolated server, disposable credentials, deliberately no database connection.
// Never tests mutations against a live store.
const base = 'http://localhost:3012';
const artifacts = path.resolve('test-artifacts');
await mkdir(artifacts, { recursive: true });
const password = randomBytes(24).toString('hex');
const email = 'preview@example.invalid';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', 'localhost', '--port', '3012'], {
  env: { ...process.env, MONGODB_URI: '', ADMIN_EMAIL: email, ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: randomBytes(32).toString('hex') },
  windowsHide: true, stdio: 'ignore',
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser, socket;
const pending = new Map();
let nextId = 0;
const errors = [];
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error('Browser command timed out: ' + method)); }, 20000);
  pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
  socket.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || 'Browser evaluation failed');
  return response.result?.value;
}
async function waitFor(expression) {
  for (let index = 0; index < 100; index++) { if (await evaluate('Boolean(' + expression + ')')) return; await pause(150); }
  throw new Error('Page did not reach expected state: ' + expression);
}
async function screenshot(name) {
  await evaluate('Promise.race([Promise.all([...document.images].map(image => image.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))])');
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(path.join(artifacts, name), Buffer.from(shot.data, 'base64'));
}
try {
  let ready = false;
  for (let index = 0; index < 80; index++) {
    if (server.exitCode !== null) throw new Error('Isolated preview failed to start; check port 3012.');
    try { if ((await fetch(base + '/api/admin/session')).ok) { ready = true; break; } } catch {}
    await pause(250);
  }
  if (!ready) throw new Error('Preview unavailable');
  assert.equal((await fetch(base + '/api/admin/supplier-catalogue')).status, 401);
  const login = await fetch(base + '/api/admin/session', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const response = await fetch(base + '/api/admin/supplier-catalogue', { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  const catalogue = await response.json();
  assert.equal(catalogue.products.length, 44);
  assert.equal(catalogue.variantCount, 688);
  assert.equal(catalogue.missingFromFeed.length, 0);
  assert.equal(catalogue.editingEnabled, false);
  const mutationHeaders={Cookie:cookie,Origin:base,'Content-Type':'application/json'};
  assert.equal((await fetch(base+'/api/admin/supplier-catalogue',{method:'PATCH',headers:mutationHeaders,body:JSON.stringify({productId:'invalid',variantId:'invalid',sellingPrice:249,available:true})})).status,400);
  assert.equal((await fetch(base+'/api/admin/supplier-catalogue',{method:'PATCH',headers:mutationHeaders,body:JSON.stringify({productId:catalogue.products[1].id,variantId:catalogue.products[1].variants[0].id,sellingPrice:249,available:true})})).status,503);
  const csv = await fetch(base + '/api/admin/supplier-catalogue?format=csv', { headers: { Cookie: cookie } });
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-disposition'), /attachment/);
  assert.equal((await fetch(base + '/api/products', { method: 'PUT', headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
  assert.equal((await fetch(base + '/api/products', { method: 'PUT', headers: { Cookie: cookie, Origin: 'https://invalid.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9777', '--user-data-dir=' + path.join(artifacts, 'admin-browser'), 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let target;
  for (let index = 0; index < 80; index++) {
    try { target = (await fetch('http://127.0.0.1:9777/json/list').then(response => response.json())).find(target => target.type === 'page'); if (target) break; } catch {}
    await pause(250);
  }
  if (!target) throw new Error('Browser unavailable');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const callback = pending.get(message.id); pending.delete(message.id);
      if (message.error) callback.reject(new Error(message.error.message)); else callback.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || 'Browser exception');
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  const separator = cookie.indexOf('=');
  await send('Network.setCookie', { name: cookie.slice(0, separator), value: cookie.slice(separator + 1), url: base, httpOnly: true, sameSite: 'Strict' });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base + '/admin/suppliers' });
  await waitFor('document.querySelectorAll("article").length === 44');
  await screenshot('admin-suppliers-desktop.png');
  await evaluate('document.querySelector("article button").click()');
  await waitFor('document.querySelector("article table")');
  await screenshot('admin-supplier-variants.png');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'));
  await screenshot('admin-suppliers-mobile.png');
  await evaluate(`(() => { const input = document.querySelector('input[aria-label="Search supplier catalogue"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'no-match-xyz'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await waitFor('document.querySelectorAll("article").length === 0');
  await send('Page.navigate', { url: base + '/admin' });
  await waitFor('document.body.textContent.includes("Dashboard unavailable.")');
  assert.deepEqual(errors, []);
  await writeFile(path.join(artifacts, 'admin-review.json'), JSON.stringify({ passed: true, checks: ['unauthenticated access denied', 'disposable admin login', '44 products and 688 variants', 'CSV export', 'invalid product rejected', 'cross-origin mutation denied', 'desktop supplier review', 'variant expansion', 'mobile layout', 'supplier search', 'database-unavailable dashboard recovery'], databaseWritesTested: false, errors }, null, 2));
  console.log('Admin review passed. 44 products, 688 variants; no database writes attempted.');
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await send('Browser.close'); } catch {} socket.close(); }
  if (browser && browser.exitCode === null) browser.kill();
  if (server.exitCode === null) server.kill();
}
