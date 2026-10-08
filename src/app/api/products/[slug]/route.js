import { NextResponse } from 'next/server';
import { getProductDetails } from '@/lib/products';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const details = await getProductDetails(slug);
    
    if (!details) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(details);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
