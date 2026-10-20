import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { categories } from '@/data/products';
import { getCategorySettings } from '@/lib/categories';
import { getAllShopProducts } from '@/lib/products';
import dbConnect from '@/lib/db';
import CategorySetting from '@/models/CategorySetting';

export async function GET() {
  try {
    const [settings, products] = await Promise.all([getCategorySettings(), getAllShopProducts()]);
    return NextResponse.json({ editingEnabled: Boolean(process.env.MONGODB_URI), categories: settings.map(category => ({
      ...category, productCount: products.filter(product => product.category === category.id).length,
    })) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return NextResponse.json({ error: 'Category settings unavailable. Please retry.' }, { status: 503 }); }
}

export async function PATCH(request) {
  let data;
  try { data = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!categories.some(category => category.id === data?.categoryId) || typeof data?.active !== 'boolean') {
    return NextResponse.json({ error: 'Choose a valid category and active status.' }, { status: 400 });
  }
  try {
    await dbConnect();
    await CategorySetting.findOneAndUpdate({ categoryId: data.categoryId }, { $set: { active: data.active } }, { upsert: true, runValidators: true });
    revalidateTag('products', { expire: 0 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ categoryId: data.categoryId, active: data.active });
  } catch { return NextResponse.json({ error: 'Could not save category status. Please retry.' }, { status: 503 }); }
}
