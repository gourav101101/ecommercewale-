import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.REVIEW_URL || 'http://127.0.0.1:3000';
const artifacts = path.resolve('test-artifacts');
await mkdir(artifacts, { recursive: true });
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9666',
  `--user-data-dir=${path.join(artifacts, 'edge-profile')}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pending = new Map();
const errors = [];
let id = 0;
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
    pending.set(requestId, { resolve: (result) => { clearTimeout(timer); resolve(result); }, reject: (error) => { clearTimeout(timer); reject(error); } });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + result.exceptionDetails.exception?.description);
  return result.result?.value;
}
async function waitFor(expression) {
  for (let attempt = 0; attempt < 80; attempt++) { if (await evaluate(`Boolean(${expression})`)) return; await pause(200); }
  throw new Error(`Page condition timed out: ${expression}`);
}
async function navigate(route, condition = 'document.querySelector("h1")') {
  console.log(`Checking ${route}`);
  await send('Page.navigate', { url: base + route });
  await waitFor(`location.pathname === ${JSON.stringify(route.split('?')[0])} && document.readyState === 'complete' && Boolean(${condition})`);
  await pause(500);
}
async function screenshot(name, fullPage = true) {
  console.log(`Capturing ${name}`);
  await evaluate('Promise.race([Promise.all([...document.images].map(img => { img.loading = "eager"; return img.decode().catch(() => {}); })), new Promise(resolve => setTimeout(resolve, 4000))])');
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: fullPage });
  await writeFile(path.join(artifacts, name), Buffer.from(shot.data, 'base64'));
}
async function viewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
}
async function noOverflow(label) {
  const dimensions = await evaluate('({ viewport: innerWidth, content: document.documentElement.scrollWidth })');
  assert.ok(dimensions.content <= dimensions.viewport + 1, `${label} overflow: ${JSON.stringify(dimensions)}`);
}
async function fill(selector, value) {
  await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); const setter = Object.getOwnPropertyDescriptor(input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set; setter.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
}

try {
  let targets;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { targets = await fetch('http://127.0.0.1:9666/json/list').then((res) => res.json()); if (targets.some((target) => target.type === 'page')) break; } catch { /* Browser is starting. */ }
    await pause(250);
  }
  const target = targets?.find((target) => target.type === 'page');
  if (!target) throw new Error('Browser did not start');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) { const callbacks = pending.get(data.id); pending.delete(data.id); if (data.error) callbacks.reject(new Error(data.error.message)); else callbacks.resolve(data.result); }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__localVitals = { cls: 0, lcp: 0 }; new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__localVitals.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true }); new PerformanceObserver(list => { const entries = list.getEntries(); window.__localVitals.lcp = entries.at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });` });
  await viewport(1440, 1050);
  await navigate('/');
  await evaluate('localStorage.clear()');
  await navigate('/');
  assert.match(await evaluate('document.querySelector("h1").innerText'), /Good products/);
  await noOverflow('Desktop home');
  const typography = await evaluate('({ family: getComputedStyle(document.body).fontFamily, body: parseFloat(getComputedStyle(document.body).fontSize), hero: parseFloat(getComputedStyle(document.querySelector("h1")).fontSize) })');
  assert.match(typography.family, /manrope/i, 'Local Manrope font must resolve, not fall back to serif');
  assert.ok(typography.body >= 17 && typography.hero >= 60, 'Desktop typography must meet the readable scale');
  await evaluate('document.fonts.ready');
  await pause(1000);
  const localPerformance = await evaluate('({ ...window.__localVitals, domContentLoaded: performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd, javascriptTransferBytes: performance.getEntriesByType("resource").filter(entry => entry.name.includes(".js")).reduce((sum, entry) => sum + entry.transferSize, 0), note: "Warm local desktop, unthrottled. Not a production Core Web Vitals score." })');
  await writeFile(path.join(artifacts, 'local-performance.json'), JSON.stringify(localPerformance, null, 2));
  await screenshot('home-desktop.png');
  await screenshot('home-desktop-viewport.png', false);
  await viewport(390, 844);
  await noOverflow('Mobile home');
  await screenshot('home-mobile.png');
  await screenshot('home-mobile-viewport.png', false);
  await evaluate(`document.querySelector('button[aria-label="Open navigation menu"]').click()`);
  assert.equal(await evaluate('document.querySelector("dialog").open'), true);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor('!document.querySelector("dialog").open');

  await navigate('/shop', 'document.querySelector("article")');
  const count = await evaluate('document.querySelectorAll("article").length');
  assert.ok(count > 0, 'Catalogue must have products');
  await fill('input[type="search"]', 'no-such-product-zzzz');
  await waitFor('document.querySelectorAll("article").length === 0');
  await evaluate('[...document.querySelectorAll("button")].find(button => button.textContent.includes("Show all packaging")).click()');
  await waitFor('document.querySelectorAll("article").length > 0');
  await noOverflow('Mobile shop');
  assert.ok(await evaluate('parseFloat(getComputedStyle(document.querySelector("article h3")).fontSize) >= 20'), 'Mobile product titles must remain at least 20px');
  await screenshot('shop-mobile.png');
  await viewport(1440, 1050);
  await screenshot('shop-desktop.png');
  await screenshot('shop-desktop-viewport.png', false);
  await evaluate(`document.querySelector('nav[aria-label="Product categories"] button:nth-child(3)').click()`);
  await waitFor('location.search.includes("category=boxes-tapes")');
  await waitFor('document.querySelectorAll("article").length < ' + count);
  await evaluate('[...document.querySelectorAll("button")].find(button => button.textContent === "Clear all").click()');
  await waitFor('document.querySelectorAll("article").length === ' + count);
  await evaluate(`document.querySelector('article button[aria-haspopup="dialog"]').click()`);
  await waitFor('document.querySelector("dialog[open] input[type=number]")');
  await noOverflow('Quick-shop desktop');
  await screenshot('quick-shop-desktop.png', false);
  await fill('dialog[open] input[type="number"]', '100');
  await waitFor('document.querySelector("dialog[open]").textContent.includes("650.00")');
  await viewport(390, 844);
  await noOverflow('Quick-shop mobile');
  await screenshot('quick-shop-mobile.png', false);
  assert.ok(await evaluate('document.querySelector("dialog[open] button[type=submit]").getBoundingClientRect().bottom <= innerHeight'), 'Mobile quick-shop action stays visible');
  await fill('dialog[open] input[type="number"]', '1');
  await evaluate('document.querySelector("dialog[open] form").requestSubmit()');
  await waitFor('JSON.parse(localStorage.getItem("ecommercewale_cart") || "[]").length === 1');
  await waitFor('document.querySelector("dialog[open]").textContent.includes("Added to your order list.")');
  await evaluate(`document.querySelector('button[aria-label="Close product options"]').click()`);
  await waitFor('!document.querySelector("dialog[open]")');
  await viewport(1440, 1050);
  await navigate('/cart');
  assert.match(await evaluate('document.querySelector("h1").innerText'), /Your order list/);
  await fill('input[type="number"]', '100');
  await waitFor('JSON.parse(localStorage.getItem("ecommercewale_cart"))[0].quantity === 100');
  await navigate('/checkout');
  await noOverflow('Desktop enquiry');
  await screenshot('checkout-desktop.png');
  await evaluate('window.__whatsappUrl = null; window.open = (url) => { window.__whatsappUrl = url; return null; }');
  await fill('#order-name', 'Preview Seller');
  await fill('#order-phone', '9827787080');
  await fill('#order-pincode', '452015');
  await fill('#order-notes', 'Please include a GST invoice');
  await evaluate('document.querySelector("form").requestSubmit()');
  await waitFor('Boolean(window.__whatsappUrl)');
  const url = new URL(await evaluate('window.__whatsappUrl'));
  assert.equal(url.hostname, 'wa.me');
  const message = url.searchParams.get('text');
  assert.match(message, /Preview Seller/);
  assert.match(message, /Quantity: 100/);
  assert.match(message, /452015/);
  assert.match(message, /not a confirmed purchase/);
  assert.match(message, /₹650.00/);
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ecommercewale_cart")).length'), 1);
  await viewport(390, 844);
  await noOverflow('Mobile enquiry');
  await screenshot('checkout-mobile.png');
  await navigate('/product/transparent-pod-courier-bag');
  await noOverflow('Mobile product');
  await screenshot('product-mobile.png');
  await viewport(1440, 1050);
  await screenshot('product-desktop.png');
  await evaluate('document.querySelectorAll("button[aria-pressed]")[1].click()');
  await evaluate('[...document.querySelectorAll("button")].find(button => button.textContent.includes("Add to order list")).click()');
  await waitFor('document.body.textContent.includes("Added to your order list")');
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ecommercewale_cart")).length'), 2, 'Different sizes remain separate');
  await navigate('/shop', 'document.querySelector("article")');
  await evaluate('document.querySelector("article button[aria-pressed]").click()');
  await waitFor('JSON.parse(localStorage.getItem("ecommercewale_wishlist") || "[]").length === 1');
  await navigate('/cart');
  await evaluate(`document.querySelector('button[aria-label="Remove item"]').click()`);
  await waitFor('JSON.parse(localStorage.getItem("ecommercewale_cart")).length === 1');
  await navigate('/wishlist');
  await evaluate('[...document.querySelectorAll("button")].find(button => button.textContent.includes("Add to Cart")).click()');
  await waitFor('JSON.parse(localStorage.getItem("ecommercewale_cart")).length === 2');
  for (const route of ['/about', '/contact', '/faq', '/track-order', '/wishlist']) {
    await viewport(390, 844);
    await navigate(route);
    await noOverflow(route);
  }
  await navigate('/contact');
  await screenshot('contact-mobile.png');
  await evaluate('window.__contactUrl = null; window.open = (url) => { window.__contactUrl = url; return null; }');
  await fill('#contact-name', 'Contact Preview');
  await fill('#contact-message', 'Please quote 500 bags for delivery to Indore');
  await evaluate('document.querySelector("form").requestSubmit()');
  await waitFor('Boolean(window.__contactUrl)');
  assert.match(new URL(await evaluate('window.__contactUrl')).searchParams.get('text'), /500 bags/);
  await navigate('/');
  await viewport(320, 740);
  await noOverflow('Small mobile home');
  await viewport(1440, 1050);
  await evaluate(`document.querySelector('button[aria-label="Use dark theme"]').click()`);
  await waitFor('document.documentElement.dataset.theme === "dark"');
  await pause(600);
  await screenshot('home-dark.png');
  assert.deepEqual(errors, [], 'No uncaught browser exceptions');
  for (const route of ['/api/orders', '/api/customers', '/api/dashboard', '/api/contact']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 401, `${route} must require authentication`);
  }
  assert.equal((await fetch(base + '/api/seed')).status, 403);
  assert.equal((await fetch(base + '/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
  const admin = await fetch(base + '/admin', { redirect: 'manual' });
  assert.equal(admin.status, 307);
  assert.ok(admin.headers.get('location').endsWith('/admin/login'));
  const response = await fetch(base + '/');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const sitemap = await fetch(base + '/sitemap.xml').then((res) => res.text());
  assert.match(sitemap, /transparent-pod-courier-bag/);
  const report = { passed: true, catalogueProducts: count, checks: ['desktop/mobile layout', 'search and reset', 'keyboard modal dismissal', 'add to cart', 'bulk quantity persistence and pricing', 'WhatsApp enquiry and saved cart', 'product size variants', 'wishlist add to cart', 'secondary pages', 'contact WhatsApp handoff', '320px mobile layout', 'dark theme', 'protected APIs', 'disabled seed', 'sitemap', 'security headers'], errors };
  await writeFile(path.join(artifacts, 'review.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await send('Browser.close'); } catch { /* Browser may already be closing. */ } socket.close(); }
  if (browser.exitCode === null) browser.kill();
}
