import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const product = await Product.findOne({ slug });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Also fetch related products based on category
    const relatedProducts = await Product.find({ 
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);
    
    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
