import { mkdir, writeFile } from 'node:fs/promises';

const response = await fetch('https://www.ecosoftindia.in/products.json?limit=250');
if (!response.ok) console.warn(`Ecosoft feed unavailable: HTTP ${response.status}; use public product pages for review.`);
if (response.ok) {
const data = await response.json();
const products = (data.products || []).map((product) => ({
  title: product.title,
  source: `https://www.ecosoftindia.in/products/${product.handle}`,
  productType: product.product_type,
  options: product.options?.map(({ name, values }) => ({ name, values })),
  variants: product.variants?.map(({ title, price, available }) => ({ title, price, available })),
  referenceImage: product.images?.[0]?.src,
}));
await mkdir('research', { recursive: true });
await writeFile('research/ecosoft-catalogue-reference.json', JSON.stringify({ source: 'https://www.ecosoftindia.in/', purpose: 'Reference only. Not imported into the EcommerceWale sales catalogue. Prices are source-listed variant prices and may refer to packs, not single units.', retrievedAt: new Date().toISOString(), products }, null, 2));
console.log(`Saved ${products.length} public product records for review.`);
}

const font = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf');
if (!font.ok) throw new Error('Font download failed');
await mkdir('public/fonts', { recursive: true });
await writeFile('public/fonts/manrope-variable.ttf', Buffer.from(await font.arrayBuffer()));
const license = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt');
if (!license.ok) throw new Error('Font license download failed');
await writeFile('public/fonts/Manrope-OFL.txt', await license.text());
console.log('Saved local Manrope font and its open font license.');
