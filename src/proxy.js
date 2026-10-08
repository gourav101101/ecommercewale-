import { NextResponse } from 'next/server';
import { sameOrigin, SESSION_COOKIE, validSession } from '@/lib/admin-session';

export function proxy(request) {
  const path = request.nextUrl.pathname;
  const isRead = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (path === '/api/seed') return NextResponse.json({ error: 'Remote database seeding is disabled.' }, { status: 403 });
  const productWrite = path.startsWith('/api/products') && !isRead && !path.endsWith('/reviews');
  const privateApi = ['/api/orders', '/api/customers', '/api/dashboard'].some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) || path === '/api/contact' || productWrite;
  const privatePage = path.startsWith('/admin') && path !== '/admin/login';
  if (!privateApi && !privatePage) return NextResponse.next();
  if (!validSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return privateApi ? NextResponse.json({ error: 'Authentication required' }, { status: 401 }) : NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (!isRead && !sameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] };
