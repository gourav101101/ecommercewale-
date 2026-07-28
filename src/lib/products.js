import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

const shopProductFields = [
  'id', 'slug', 'name', 'category', 'type', 'description',
  'marketplaceCompatible', 'sizes', 'bulkPrice', 'image', 'rating',
  'reviewCount', 'bestSeller', 'inStock'
].join(' ');

// Product cards do not need galleries, reviews, or specifications. Caching this
// smaller result keeps the shop page fast and reduces database work on Vercel.
export const getShopProducts = unstable_cache(
  async () => {
    await dbConnect();
    return Product.find({}).select(shopProductFields).sort({ createdAt: -1 }).lean();
  },
  ['shop-products'],
  { revalidate: 300, tags: ['products'] }
);

export async function getProductDetails(slug) {
  const getCachedProduct = unstable_cache(
    async () => {
      await dbConnect();
      const product = await Product.findOne({ slug }).lean();
      if (!product) return null;

      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
      })
        .select(shopProductFields)
        .limit(4)
        .lean();

      return { product, relatedProducts };
    },
    ['product-details', slug],
    { revalidate: 300, tags: ['products'] }
  );

  return getCachedProduct();
}
