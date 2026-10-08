import test from 'node:test';
import assert from 'node:assert/strict';
import { orderMessage, whatsappUrl } from '../src/lib/whatsapp.js';
import { adminConfigured, createSession, validSession, sameOrigin } from '../src/lib/admin-session.js';

test('WhatsApp enquiry retains variants, prices, contact details and confirmation caveat', () => {
  const text = orderMessage([{ name: 'Courier bag & sleeve', selectedSize: '8x10', sizeLabel: '8 × 10', quantity: 100, pricePerUnit: 6.5 }], { name: ' Seller ', phone: '9827787080', pincode: '452015', company: 'Example & Co', notes: 'Need GST invoice' }, 650);
  const url = new URL(whatsappUrl(text));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/919827787080');
  assert.equal(url.searchParams.get('text'), text);
  for (const phrase of ['8 × 10', 'Quantity: 100', '₹650.00', 'Name: Seller', '452015', 'Example & Co', 'Need GST invoice', 'not a confirmed purchase', 'before GST and delivery']) assert.ok(text.includes(phrase), phrase);
  assert.ok(!text.includes('undefined'));
});

test('Optional business and notes do not leak undefined values into the enquiry', () => {
  const text = orderMessage([], { name: 'Seller', phone: '9827787080', pincode: '452015' }, 0);
  assert.ok(!text.includes('undefined'));
  assert.ok(!text.includes('Business:'));
});

test('Server admin session rejects missing, forged, expired and rotated sessions', () => {
  const previous = Object.fromEntries(['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'].map((key) => [key, process.env[key]]));
  try {
    delete process.env.ADMIN_SESSION_SECRET;
    assert.equal(adminConfigured(), false);
    assert.equal(validSession('anything'), false);
    process.env.ADMIN_EMAIL = 'owner@example.test';
    process.env.ADMIN_PASSWORD = 'test-only-long-password';
    process.env.ADMIN_SESSION_SECRET = 'test-only-session-secret-with-enough-entropy-length';
    const token = createSession();
    assert.equal(validSession(token), true);
    assert.equal(validSession(`${token}tampered`), false);
    assert.equal(validSession('not-a-session'), false);
    assert.equal(validSession(`${token}.extra`), false);
    const originalNow = Date.now;
    Date.now = () => originalNow() + 9 * 60 * 60 * 1000;
    try { assert.equal(validSession(token), false); } finally { Date.now = originalNow; }
    process.env.ADMIN_SESSION_SECRET = 'a-different-test-only-session-secret-with-enough-length';
    assert.equal(validSession(token), false);
  } finally {
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test('Admin mutations require the site origin', () => {
  assert.equal(sameOrigin(new Request('https://example.test/api/admin/session', { headers: { origin: 'https://example.test' } })), true);
  assert.equal(sameOrigin(new Request('https://example.test/api/admin/session', { headers: { origin: 'https://other.test' } })), false);
  assert.equal(sameOrigin(new Request('https://example.test/api/admin/session')), false);
});
