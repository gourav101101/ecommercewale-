import { getShopProducts } from '@/lib/products';

const siteUrl = 'https://www.ecommercewale.in';

export const revalidate = 86400;

export default async function sitemap() {
  const products = await getShopProducts();
  const pages = [
    ['', '1.0'],
    ['/shop', '0.9'],
    ['/about', '0.7'],
    ['/contact', '0.7'],
    ['/faq', '0.6'],
    ['/policies/privacy', '0.3'],
    ['/policies/terms', '0.3'],
    ['/policies/refund', '0.3'],
  ];

  return [
    ...pages.map(([path, priority]) => ({ url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: 'weekly', priority: Number(priority) })),
    ...products.map((product) => ({ url: `${siteUrl}/product/${product.slug}`, lastModified: product.updatedAt, changeFrequency: 'weekly', priority: 0.8 })),
  ];
}
