import { writeFile } from 'node:fs/promises';
const urls = ['https://www.ecosoftindia.in/products.json?limit=250', 'https://www.ecosoftindia.in/sitemap.xml', 'https://www.ecosoftindia.in/collections/all'];
const checks = [];
for (const url of urls) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    checks.push({ url, status: response.status, accessible: response.ok });
    console.log(response.status, url);
  } catch (error) { checks.push({ url, error: error.message, accessible: false }); }
}
await writeFile('research/ecosoft-access-report.json', JSON.stringify({ checkedAt: new Date().toISOString(), completeCatalogue: false, checks }, null, 2));
