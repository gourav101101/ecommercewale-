import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { productInput } from '@/lib/product-input';
import { excludedFromStorefront } from '@/lib/storefront-policy';
import { canonicalCategory, canonicalProductCategory } from '@/lib/product-category';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const requestedCategory = searchParams.get('category');
    const category = requestedCategory === 'boxes-tapes' ? 'all' : canonicalCategory(requestedCategory);
    const bestSeller = searchParams.get('bestSeller');
    const search = searchParams.get('search');
    
    let query = {};

    if (category && category !== 'all') {
      query.category = category === 'labels' ? { $in: ['labels', 'labels-stickers'] } : ['boxes', 'tapes'].includes(category) ? { $in: [category, 'boxes-tapes'] } : category;
    }
    if (bestSeller === 'true') {
      query.bestSeller = true;
    }
    if (search) {
      const literal = search.slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: literal, $options: 'i' } },
        { description: { $regex: literal, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products.filter(product=>!excludedFromStorefront(product)).map(canonicalProductCategory).filter(product=>!category || category==='all' || product.category===category));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  let data;
  try { data = productInput(await request.json()); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
  try {
    await dbConnect();
    
    const newProduct = await Product.create(data);
    revalidateTag('products', 'max');
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request) {
  let data;
  try { data = productInput(await request.json()); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
  try {
    await dbConnect();
    
    // We update by id (string)
    const updatedProduct = await Product.findOneAndUpdate(
      { id: data.id }, 
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    revalidateTag('products', 'max');
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const deletedProduct = await Product.findOneAndDelete({ id });
    
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    revalidateTag('products', 'max');
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
