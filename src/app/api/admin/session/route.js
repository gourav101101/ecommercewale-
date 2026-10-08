import { NextResponse } from 'next/server';
import { adminConfigured, createSession, equalSecret, sameOrigin, SESSION_COOKIE, SESSION_SECONDS, validSession } from '@/lib/admin-session';

export async function GET(request) {
  return NextResponse.json({ authenticated: validSession(request.cookies.get(SESSION_COOKIE)?.value) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: 'Admin access is not configured. Set the server environment variables.' }, { status: 503 });
  try {
    const { email, password } = await request.json();
    if (!equalSecret(email, process.env.ADMIN_EMAIL) || !equalSecret(password, process.env.ADMIN_PASSWORD)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(SESSION_COOKIE, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: SESSION_SECONDS });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
}

export async function DELETE(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
