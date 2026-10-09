# Original visuals, live catalogue refresh and verification

> Historical implementation notes: the generated supplier-product renders described below were withdrawn on 9 October 2026 because they altered actual product details. See [Supplier product accuracy](SUPPLIER-PRODUCT-ACCURACY.md) for the current image policy and commercial-confirmation status. The earlier verification results do not validate the subsequent correction; no tests or deployment were run for it.

## What changed

- 32 newly generated product-family studio illustrations cover the 44 captured supplier products. No Ecosoft photos are rendered in the supplier catalogue, product pages, quick shop, saved lists or supplier-admin preview.
- Courier bags distinguish transparent/opaque material, pocket/no-pocket and six colours plus brown. Boxes distinguish standard/flap and white/brown. Tapes, dispenser, thermal/barcode labels, inserts/stickers and nine shredded-paper colours have separate illustrations.
- Original source images remain in the historical research export for auditing; they are not storefront assets. Generated originals remain outside the repo. Optimised 1200px-max WebP assets live in `public/images/catalogue/`.
- `research/generated-image-provenance.json` records the prompt and final file for every generated catalogue image. These are illustrative family visuals, not proof of exact SKU appearance. Product and quick-shop disclosures explicitly ask customers to confirm printing, colour, proportions and pack contents.
- Product-family descriptions and practical fit/ordering guidance replace the repeated generic description. Exact recorded size/design/pack options and prices are unchanged.
- Cards no longer ship all 688 variant records on the initial shop render. Quick Shop requests the selected product's options when opened; shop search still includes size and pack option text.
- The shop Suspense fallback now renders the complete default catalogue rather than a tiny loading message, preventing a large hydration layout jump. Generated-image disclosures remain visible on mobile product pages.
- Cached catalogue reads use a hashed database-environment identifier, preventing a disposable test database from sharing cache entries with the no-database preview.

## Refresh workflow

Authenticated administrators can use **Refresh supplier prices & stock** in `/admin/suppliers`. The complete public product feed is checked through an empty pagination page and reconciled with all public product sitemaps before an atomic snapshot update. Repeated IDs, bad prices, incomplete feeds, sitemap mismatches and unexpected product-count drops over 30% keep the previous snapshot. Existing store-specific variant overrides are stored separately and preserved.

`vercel.json` schedules `/api/cron/supplier-refresh` once daily at 03:00 UTC. Set `CRON_SECRET` to a random secret of at least 32 characters in Vercel, and configure `MONGODB_URI`. Without these, the endpoint deliberately refuses to run; the bundled catalogue remains available when no database is configured. Vercel supplies the cron secret in its Authorization header. The schedule is daily to fit Hobby-plan scheduling restrictions. See [Vercel cron authentication](https://vercel.com/docs/cron-jobs/manage-cron-jobs) and [plan limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).

This refresh uses public product/variant data, not hidden supplier admin data, private discounts, live warehouse stock or unpublished designs. Prices remain reference estimates until confirmed on WhatsApp. The raw research CSV remains the historical review export; export the current admin CSV after a successful refresh to review the latest snapshot.

## Verification commands

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
node scripts/review-database.mjs
node scripts/review-admin.mjs
```

`review-database.mjs` runs a disposable real MongoDB instance and isolated Next server. It checks authenticated persistence, exact-variant prices, availability, removing a price override, preserved source prices, refreshed-snapshot reads and malformed cron credentials. No production database is touched. The MongoDB binary is downloaded into ignored `test-artifacts/` on first use.

Start a local production preview and then run the browser checks:

```powershell
npm.cmd start -- --hostname 127.0.0.1 --port 3001
$env:REVIEW_URL='http://127.0.0.1:3001'
node scripts/review-storefront.mjs
node scripts/review-performance.mjs
```

Reports/screenshots are in ignored `test-artifacts/`. Performance observations are local diagnostics, not a production Lighthouse score or real-user Core Web Vitals. Measure the deployed site again after release.

The post-fix local cold/mobile diagnostic recorded home LCP 1.17s, shop 1.38s and the brown-mailer product 0.86s, with CLS under 0.001 on each. Before the fallback fix, the same shop check recorded LCP 4.88s and CLS 0.739. No broken eagerly loaded images, copied external product photos or horizontal overflow were found in these three routes. These are single local observations, not guarantees for production traffic.

## Deployment boundary

Production Vercel settings and database credentials are not present in this workspace. Configure `MONGODB_URI`, `ADMIN_EMAIL`, an `ADMIN_PASSWORD` of at least 12 characters, `ADMIN_SESSION_SECRET` of at least 32 characters, and the new `CRON_SECRET` directly in Vercel. Never paste secrets into chat or commit them. Local verification does not prove production configuration or deployment success.

The production-only npm audit reported zero known vulnerabilities. A full audit still reports five linked development-only findings through ESLint's `braces` dependency. The registry exposes no patched `braces` version; avoid the suggested forced Next/ESLint downgrade. Recheck when a patch is available. See [upstream advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
