import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { products as catalogue } from '@/data/products';
import { supplierProducts } from '@/lib/supplier-catalogue';
import { storefrontImage } from '@/lib/product-visuals';
import { createHash } from 'node:crypto';
import { excludedFromStorefront } from './storefront-policy.js';
import { canonicalProductCategory } from './product-category.js';
// Keep disposable review databases and different deployment environments from
// sharing filesystem cache entries. Never put a connection secret in cache keys.
const catalogueEnvironment = createHash('sha256').update(process.env.MONGODB_URI || 'local-snapshot').digest('hex').slice(0,16);

function cardProduct({gallery,reviews,specs,features,variants,...product}) {
  return {...product, searchOptions:product.options?.flatMap(option=>option.values).join(' ') || ''};
}
const legacyVisual = product => ({...canonicalProductCategory(product),image:storefrontImage(product),gallery:product.image===storefrontImage(product) ? product.gallery : [storefrontImage(product)]});

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
    const supplier = (await supplierProducts()).map(cardProduct);
    if (!process.env.MONGODB_URI) return supplier;
    await dbConnect();
    const products = await Product.find({}).select(shopProductFields).sort({ createdAt: -1 }).lean();
    const sourceSlugs = new Set(supplier.map(item => item.slug));
    return JSON.parse(JSON.stringify([...supplier, ...products.filter(item => !sourceSlugs.has(item.slug) && !excludedFromStorefront(item)).map(legacyVisual)]));
  },
  ['shop-products-courier-packs-v18',catalogueEnvironment],
  { revalidate: 300, tags: ['products'] }
);

export async function getProductDetails(slug) {
  if(excludedFromStorefront({slug})) return null;
  const getCachedProduct = unstable_cache(
    async () => {
      const supplier = await supplierProducts();
      const supplierProduct = supplier.find(item => item.slug===slug);
      if (supplierProduct) return {product:supplierProduct, relatedProducts:supplier.filter(item => item.category===supplierProduct.category && item.id!==supplierProduct.id).slice(0,4).map(cardProduct)};
      if (!process.env.MONGODB_URI) {
        const product = catalogue.find((item) => item.slug === slug);
        if (!product || excludedFromStorefront(product)) return null;
        return { product:legacyVisual(product), relatedProducts: catalogue.filter((item) => item.category === product.category && item.id !== product.id && !excludedFromStorefront(item)).slice(0, 4).map(legacyVisual) };
      }
      await dbConnect();
      const product = await Product.findOne({ slug }).lean();
      if (!product || excludedFromStorefront(product)) return null;

      const relatedProducts = await Product.find({
        category: ['labels', 'labels-stickers'].includes(product.category) ? { $in: ['labels', 'labels-stickers'] } : ['boxes', 'tapes', 'boxes-tapes'].includes(product.category) ? { $in: [canonicalProductCategory(product).category, 'boxes-tapes'] } : product.category,
        _id: { $ne: product._id },
      })
        .select(shopProductFields)
        .limit(4)
        .lean();

      return JSON.parse(JSON.stringify({ product:legacyVisual(product), relatedProducts:relatedProducts.filter(item=>!excludedFromStorefront(item)).map(legacyVisual).filter(item=>item.category===canonicalProductCategory(product).category) }));
    },
    ['product-details-courier-packs-v18',catalogueEnvironment,slug],
    { revalidate: 300, tags: ['products'] }
  );

  return getCachedProduct();
}
