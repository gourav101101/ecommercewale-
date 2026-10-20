import dbConnect from '@/lib/db';
import ProductVisibility from '@/models/ProductVisibility';

export async function getProductVisibility() {
  if (!process.env.MONGODB_URI) return [];
  await dbConnect();
  return ProductVisibility.find({}).select('productId active -_id').lean();
}

export async function storefrontProductVisibility() {
  try { return await getProductVisibility(); }
  catch { return null; }
}
