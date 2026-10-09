import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { refreshSupplierCatalogue } from '@/lib/supplier-catalogue';

export const maxDuration = 60;
export async function POST() {
  if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'Connect MongoDB before refreshing the catalogue.' }, { status: 503 });
  try {
    const result = await refreshSupplierCatalogue();
    revalidateTag('products', { expire: 0 });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 502 }); }
}
