import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAllShopProducts } from '@/lib/products';
import { getCategorySettings } from '@/lib/categories';
import { getProductVisibility } from '@/lib/product-visibility';
import { productIsActive, validateProductVisibility } from '@/lib/product-visibility-policy';
import dbConnect from '@/lib/db';
import ProductVisibility from '@/models/ProductVisibility';

export async function GET() {
  try {
    const [products, categories, settings] = await Promise.all([getAllShopProducts(), getCategorySettings(), getProductVisibility()]);
    return NextResponse.json({ editingEnabled: Boolean(process.env.MONGODB_URI), categories,
      products: products.map(product => ({ id: product.id, slug: product.slug, name: product.name, category: product.category,
        active: productIsActive(product, settings), categoryActive: categories.some(category => category.id === product.category && category.active),
      })),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return NextResponse.json({ error: 'Product visibility settings unavailable. Please retry.' }, { status: 503 }); }
}

export async function PATCH(request) {
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  let products;
  try { products = await getAllShopProducts(); }
  catch { return NextResponse.json({ error: 'Catalogue unavailable. Please retry.' }, { status: 503 }); }
  let data;
  try { data = validateProductVisibility(input, products); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
  try {
    await dbConnect();
    await ProductVisibility.findOneAndUpdate({ productId: data.productId }, { $set: { active: data.active } }, { upsert: true, runValidators: true });
    revalidateTag('products', { expire: 0 });
    revalidatePath('/', 'layout');
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: 'Could not save product status. Please retry.' }, { status: 503 }); }
}
