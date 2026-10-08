import { createHmac, timingSafeEqual, createHash } from 'node:crypto';

export const SESSION_COOKIE = 'ew_admin_session';
export const SESSION_SECONDS = 60 * 60 * 8;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD?.length >= 12 && process.env.ADMIN_SESSION_SECRET?.length >= 32);
}

export function equalSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

export function createSession() {
  if (!adminConfigured()) throw new Error('Admin access is not configured');
  const payload = Buffer.from(JSON.stringify({ email: process.env.ADMIN_EMAIL, expires: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url');
  const signature = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function validSession(token) {
  if (!adminConfigured() || typeof token !== 'string') return false;
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return false;
    const expected = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
    if (!equalSecret(signature, expected)) return false;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return session.email === process.env.ADMIN_EMAIL && Number.isFinite(session.expires) && session.expires > Date.now();
  } catch { return false; }
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}
