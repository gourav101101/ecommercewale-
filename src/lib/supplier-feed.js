const ORIGIN = 'https://www.ecosoftindia.in';

async function resource(fetcher, url) {
  const response = await fetcher(url, { signal: AbortSignal.timeout(12000), cache: 'no-store' });
  if (!response.ok) throw new Error(`Supplier returned HTTP ${response.status}. The existing catalogue was kept.`);
  return response;
}

export async function fetchSupplierSnapshot(fetcher = fetch) {
  const products = [];
  const ids = new Set();
  const variantIds = new Set();
  const pages = [];
  let exhausted = false;
  for (let page = 1; page <= 20; page++) {
    const data = await (await resource(fetcher, `${ORIGIN}/products.json?limit=250&page=${page}`)).json();
    if (!Array.isArray(data.products)) throw new Error('Invalid supplier feed. The existing catalogue was kept.');
    pages.push({ page, count: data.products.length });
    if (!data.products.length) { exhausted = true; break; }
    for (const item of data.products) {
      if (ids.has(String(item.id)) || !item.id || !item.handle || !item.title || !Array.isArray(item.variants) || !item.variants.length || !Array.isArray(item.options)) throw new Error('Incomplete or repeated supplier product. The existing catalogue was kept.');
      ids.add(String(item.id));
      for (const variant of item.variants) {
        if (!variant.id || variantIds.has(String(variant.id)) || !Number.isFinite(Number(variant.price)) || Number(variant.price) < 0 || typeof variant.available !== 'boolean') throw new Error('Invalid supplier variant. The existing catalogue was kept.');
        variantIds.add(String(variant.id));
      }
      products.push({ supplierId: item.id, title: item.title, handle: item.handle, source: `${ORIGIN}/products/${item.handle}`, productType: item.product_type || '', vendor: item.vendor || '', tags: item.tags || [], updatedAt: item.updated_at, publishedAt: item.published_at, options: item.options, variants: item.variants, images: item.images || [] });
    }
  }
  if (!exhausted || !products.length) throw new Error('Supplier pagination did not complete. The existing catalogue was kept.');
  const xml = await (await resource(fetcher, ORIGIN + '/sitemap.xml')).text();
  const links = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&')).filter(url => url.startsWith(ORIGIN + '/sitemap_products'));
  if (!links.length) throw new Error('Supplier product sitemap is unavailable. The existing catalogue was kept.');
  const sitemapProducts = new Set();
  for (const link of links) {
    const content = await (await resource(fetcher, link)).text();
    for (const match of content.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = match[1].split('?')[0];
      if (url.startsWith(ORIGIN + '/products/')) sitemapProducts.add(url);
    }
  }
  const feedUrls = new Set(products.map(item => item.source));
  if (!sitemapProducts.size || [...sitemapProducts].some(url => !feedUrls.has(url))) throw new Error('Supplier feed and sitemap do not reconcile. The existing catalogue was kept.');
  return { source: ORIGIN, fetchedAt: new Date().toISOString(), currency: 'INR', feedExhausted: true, pages, productCount: products.length, variantCount: variantIds.size, sitemapProductCount: sitemapProducts.size, sitemapChecked: true, missingFromFeed: [], products };
}

export function snapshotChanges(before, after) {
  const previous = new Map(before.products.flatMap(product => product.variants.map(variant => [String(variant.id), variant])));
  const next = new Map(after.products.flatMap(product => product.variants.map(variant => [String(variant.id), variant])));
  return { addedVariants: [...next.keys()].filter(id => !previous.has(id)).length, removedVariants: [...previous.keys()].filter(id => !next.has(id)).length,
    priceChanges: [...next].filter(([id,item]) => previous.has(id) && Number(previous.get(id).price) !== Number(item.price)).length,
    stockChanges: [...next].filter(([id,item]) => previous.has(id) && previous.get(id).available !== item.available).length };
}
