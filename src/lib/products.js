import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { products as catalogue } from '@/data/products';
import { supplierProducts } from '@/lib/supplier-catalogue';
import { storefrontImage } from '@/lib/product-visuals';
import { createHash } from 'node:crypto';
import { excludedFromStorefront } from './storefront-policy.js';
import { canonicalProductCategory } from './product-category.js';
import supplierReference from '../../research/ecosoft-full-catalogue.json';
import { buildSupplierProducts } from './supplier-products.js';
import { referenceOnlyProduct, withCatalogueFallback } from './catalogue-resilience.js';
import { storefrontProductVisibility } from '@/lib/product-visibility';
import { visibleProducts } from './product-visibility-policy';
import { getActiveCategories } from '@/lib/categories';
import { activeCategoryProducts } from './category-policy';
import { princeProducts } from '../data/prince-products.js';
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
const cachedShopProducts = unstable_cache(
  async () => {
    // Local preview works without production secrets. A configured DB is authoritative.
    const supplier = (await supplierProducts()).map(cardProduct);
    if (!process.env.MONGODB_URI) return supplier;
    await dbConnect();
    const products = await Product.find({}).select(shopProductFields).sort({ createdAt: -1 }).lean();
    const sourceSlugs = new Set(supplier.map(item => item.slug));
    return JSON.parse(JSON.stringify([...supplier, ...products.filter(item => !sourceSlugs.has(item.slug) && !excludedFromStorefront(item)).map(legacyVisual)]));
  },
  ['shop-products-printer-desktop-v27',catalogueEnvironment],
  { revalidate: 300, tags: ['products'] }
);

const referenceProducts = () => [...buildSupplierProducts(supplierReference), ...princeProducts].map(referenceOnlyProduct);

// Keep fallback responses outside the cache: they must not replace a successful
// database read or remain cached after the database recovers.
export async function getAllShopProducts() {
  return withCatalogueFallback(cachedShopProducts,()=>referenceProducts().map(cardProduct),{operation:'shop'});
}

export async function getShopProducts() {
  const [products, categories, visibility] = await Promise.all([getAllShopProducts(), getActiveCategories(), storefrontProductVisibility()]);
  return visibleProducts(activeCategoryProducts(products, categories), visibility);
}

export async function getProductDetails(slug) {
  const [details, categories, visibility] = await Promise.all([getUnfilteredProductDetails(slug), getActiveCategories(), storefrontProductVisibility()]);
  if (!details || !visibleProducts(activeCategoryProducts([details.product], categories), visibility).length) return null;
  return { ...details, relatedProducts: visibleProducts(activeCategoryProducts(details.relatedProducts, categories), visibility) };
}

async function getUnfilteredProductDetails(slug) {
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
    ['product-details-printer-desktop-v27',catalogueEnvironment,slug],
    { revalidate: 300, tags: ['products'] }
  );

  return withCatalogueFallback(getCachedProduct,error=>{
    const products=referenceProducts();
    const product=products.find(item=>item.slug===slug);
    if(product)return {product,relatedProducts:products.filter(item=>item.category===product.category && item.id!==product.id).slice(0,4).map(cardProduct)};
    const legacy=catalogue.find(item=>item.slug===slug && !excludedFromStorefront(item));
    if(legacy)return {product:referenceOnlyProduct(legacyVisual(legacy)),relatedProducts:[]};
    // Unknown database-only slugs must not become cached false 404s during outages.
    throw error;
  },{operation:'product'});
}
