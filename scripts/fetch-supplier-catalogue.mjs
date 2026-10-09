import { writeFile } from 'node:fs/promises';
const origin = 'https://www.ecosoftindia.in';
const products = [];
const seen = new Set();
let exhausted = false;
const pages = [];
for (let page = 1; page <= 100; page++) {
  const url = `${origin}/products.json?limit=250&page=${page}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Product page ${page}: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error('Unexpected supplier response');
  pages.push({ page, count: data.products.length });
  if (!data.products.length) { exhausted = true; break; }
  for (const product of data.products) {
    if (seen.has(product.id)) throw new Error('Repeated page detected; refusing to claim completeness.');
    seen.add(product.id);
    products.push({
      supplierId: product.id, title: product.title, handle: product.handle,
      source: `${origin}/products/${product.handle}`,
      productType: product.product_type, vendor: product.vendor, tags: product.tags,
      updatedAt: product.updated_at, publishedAt: product.published_at,
      options: product.options,
      variants: product.variants,
      images: product.images,
      reviewStatus: 'unreviewed',
      sellingPriceINR: null,
    });
  }
}
if (!exhausted) throw new Error('Pagination limit reached; export incomplete.');
const sitemapResponse = await fetch(origin + '/sitemap.xml', { signal: AbortSignal.timeout(30000) });
const sitemap = sitemapResponse.ok ? await sitemapResponse.text() : '';
const sitemapLinks = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&')).filter(url => url.startsWith(origin + '/sitemap_products'));
const sitemapProducts = new Set();
for (const url of sitemapLinks) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) continue;
  const xml = await response.text();
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) if (match[1].includes('/products/')) sitemapProducts.add(match[1].split('?')[0]);
}
const missingFromFeed = [...sitemapProducts].filter(url => !products.some(product => product.source === url));
const result = {
  source: origin, fetchedAt: new Date().toISOString(),
  scope: 'All products returned by the public paginated feed; not private inventory, customers, orders, policies or the whole website.',
  status: 'REVIEW_ONLY_NOT_IMPORTED', currency: 'INR',
  note: 'Source variant prices are not validated supplier costs or EcommerceWale selling prices. Pack/size options must be confirmed. Descriptions and policies intentionally not copied.',
  feedExhausted: exhausted, pages, productCount: products.length,
  variantCount: products.reduce((sum, product) => sum + product.variants.length, 0),
  sitemapProductCount: sitemapProducts.size, sitemapChecked: sitemapProducts.size > 0, missingFromFeed,
  products,
};
await writeFile('research/ecosoft-full-catalogue.json', JSON.stringify(result, null, 2));
const escape = value => '"' + String(value ?? '').replaceAll('"', '""').replace(/^[=+@-]/, "'$&") + '"';
const rows = [['supplier_id','title','product_url','variant_id','variant','sku','option_1','option_2','option_3','source_price_INR','available','image_url','selling_price_INR','review_status']];
for (const product of products) for (const variant of product.variants) rows.push([product.supplierId,product.title,product.source,variant.id,variant.title,variant.sku,variant.option1,variant.option2,variant.option3,variant.price,variant.available,product.images.find(image => image.variant_ids?.includes(variant.id))?.src || product.images[0]?.src,'','unreviewed']);
await writeFile('research/ecosoft-full-variants.csv', '\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\n'));
console.log(JSON.stringify({ productCount: result.productCount, variantCount: result.variantCount, pages, sitemapProductCount: result.sitemapProductCount, missingFromFeed }, null, 2));
