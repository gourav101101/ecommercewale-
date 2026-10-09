import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { refreshSupplierCatalogue } from '@/lib/supplier-catalogue';

export const maxDuration = 60;
export async function GET(request) {
  const expected = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization') || '';
  const secret = `Bearer ${expected || ''}`;
  const suppliedBuffer = Buffer.from(supplied);
  const secretBuffer = Buffer.from(secret);
  if (!expected || expected.length < 32 || suppliedBuffer.length !== secretBuffer.length || !timingSafeEqual(suppliedBuffer, secretBuffer)) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'Catalogue database unavailable' }, { status: 503 });
  try {
    const result = await refreshSupplierCatalogue();
    revalidateTag('products', { expire: 0 });
    return NextResponse.json(result);
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 502 }); }
}
