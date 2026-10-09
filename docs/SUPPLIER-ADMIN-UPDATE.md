# Supplier catalogue and admin update

Updated 9 October 2026. Local changes only; no GitHub push or Vercel deployment performed.

## Supplier coverage

The public [product feed](https://www.ecosoftindia.in/products.json?limit=250&page=1) returned 44 products and 688 variants. The next page was empty. All 44 product URLs from the product sitemap linked by [the sitemap index](https://www.ecosoftindia.in/sitemap.xml) match the export; no sitemap product is missing.

Review [the full CSV](../research/ecosoft-full-variants.csv) or [the structured snapshot](../research/ecosoft-full-catalogue.json). The earlier 30-candidate review files are preserved as historical research.

This is a complete snapshot of the public product feed, not a scrape of every website page or private supplier system. It includes product metadata, variant options, supplier prices, availability and image URLs. Supplier descriptions and policies were not copied. Photo binaries have not been imported; admin previews reference the supplier CDN.

No supplier product has been added to the live catalogue. Before import, approve exact size and pack mappings, minimum order, current cost and stock, EcommerceWale selling prices, GST treatment, photo usage permission and marketplace claims. Do not confuse pack prices with per-piece prices or publish zero-price variants as free products.

## Admin changes

- `/admin/suppliers`: protected search, flagged-product filtering, all variant details, source/image links and CSV export. Review-only; no import or approval persistence is implied.
- Product editing preserves existing pricing tiers, with explicit editable quantity ranges. Server validation rejects gaps, overlaps, invalid prices and unsafe product fields.
- Dashboard figures come from recorded orders instead of fabricated growth or sales. Delivered order value is not payment-confirmed revenue. WhatsApp enquiries do not automatically create order records.
- Database failures have visible recovery guidance. Admin API routes require authentication; cross-origin mutations are rejected.

## Original editorial image

Generated using the built-in image-generation tool in generation mode, then locally optimized with Sharp. The image is conceptual packaging inspiration, not a photograph of a supplier SKU. The homepage visibly labels it “AI-created packaging inspiration.” Existing product images were not replaced with invented supplier photographs.

- Source: `public/images/finishing-editorial.png`
- Optimized website asset: `public/images/finishing-editorial.webp` (1536 × 1024, 218,362 bytes)

Prompt:

> Use case: ads-marketing. Asset type: premium packaging store editorial campaign image, not a specific SKU photograph. Create a photorealistic landscape still life of an open unbranded kraft mailer box filled with delicate honey-brown crinkle paper, with two folded sheets of ivory tissue paper and a blank cream thank-you card placed nearby on a pale warm stone packing surface. The box is empty of merchandise. Sophisticated quiet editorial composition viewed from a high three-quarter angle, soft sunlight from a nearby window, natural tactile paper fibers, restrained kraft and ivory palette with gentle deep olive background in upper edge. Generous spacing, beautifully clean but believable materials, premium minimal styling. No text, no logos, no people, no decorative plants, no watermark. All principal packaging materials fully visible. Landscape 3:2. This is conceptual packaging inspiration, not documentation of a supplier product.

## Verification and limits

- `npm test`: 9 tests passed, including pricing round trips for all 14 bundled products and invalid product input rejection.
- `npm run build`: passed.
- `node scripts/review-admin.mjs`: passed authentication, 44/688 snapshot counts, CSV download, mutation validation, cross-origin rejection, supplier desktop/mobile layout, search, variants and database-error recovery checks. Uses temporary local credentials and an empty database URI; no database writes attempted.
- Storefront browser review: passed 16 check groups including responsive layout, quick shop, quantity pricing, cart persistence, product options, wishlist, WhatsApp handoff, secondary pages, protected APIs, sitemap and security headers. WhatsApp handoffs were intercepted; no messages sent.

Production MongoDB writes and real production credentials were not exercised. Configure and separately verify `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` before enabling production admin operations. Review the catalogue and business settings before publishing. Supplier refreshes require rebuilding the bundled snapshot.
