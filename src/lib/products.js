import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { products as catalogue } from '@/data/products';

const shopProductFields = [
  'id', 'slug', 'name', 'category', 'type', 'description',
  'marketplaceCompatible', 'sizes', 'pricing', 'basePrice', 'bulkPrice', 'image', 'rating',
  'reviewCount', 'bestSeller', 'inStock'
].join(' ');

// Product cards do not need galleries, reviews, or specifications. Caching this
// smaller result keeps the shop page fast and reduces database work on Vercel.
export const getShopProducts = unstable_cache(
  async () => {
    // Local preview works without production secrets. A configured DB is authoritative.
    if (!process.env.MONGODB_URI) return catalogue.map(product => Object.fromEntries(shopProductFields.split(' ').map(field => [field, product[field]])));
    await dbConnect();
    const products = await Product.find({}).select(shopProductFields).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
  },
  ['shop-products'],
  { revalidate: 300, tags: ['products'] }
);

export async function getProductDetails(slug) {
  const getCachedProduct = unstable_cache(
    async () => {
      if (!process.env.MONGODB_URI) {
        const product = catalogue.find((item) => item.slug === slug);
        if (!product) return null;
        return { product, relatedProducts: catalogue.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4) };
      }
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

      return JSON.parse(JSON.stringify({ product, relatedProducts }));
    },
    ['product-details', slug],
    { revalidate: 300, tags: ['products'] }
  );

  return getCachedProduct();
}
