# Ecosoft supplier catalogue review

**Integration update:** the captured 44-product / 688-variant snapshot is now connected to the local storefront with exact variant prices as reference quote estimates. Admin overrides are separate from these original research files. See [connected catalogue notes](../docs/CONNECTED-SUPPLIER-CATALOGUE.md). The historical review-only notes below describe the export's original preparation; no production deployment or destructive database import was performed.

## Complete public product feed — 9 October 2026

**44 public products and 688 variants captured; none imported or approved.** The feed now responds successfully. Pagination reached an empty page, and all 44 product URLs in the supplier's product sitemap are represented in the export.

- `ecosoft-full-variants.csv`: current variant-level review spreadsheet, with supplier prices, options, availability, image references and blank EcommerceWale selling prices.
- `ecosoft-full-catalogue.json`: structured snapshot, including all returned variants and image references, pagination evidence and sitemap reconciliation.
- `ecosoft-access-report.json`: public endpoint access checks.
- `/admin/suppliers`: authenticated searchable review, variant details, photo previews and CSV download.

This covers the public product feed, not all website content or private supplier data. Descriptions, policies and photo binaries were not copied into the storefront. Feed availability is not a guarantee of current inventory; supplier pack/roll prices are not necessarily per-piece costs. Review zero-price or unavailable variants before import.

Refresh with `node scripts/fetch-supplier-catalogue.mjs`, then rebuild the application to update the bundled admin snapshot. Refreshing does not import products into MongoDB.

## Historical partial review — 8 October 2026

**30 candidate products; none imported or approved.** Retained for comparison; use the full export above for current coverage.

Open `ecosoft-catalogue-review.csv` in Excel to review. JSON includes additional product-page observations.

This is a partial factual inventory assembled from accessible public pages, not an authoritative supplier export. The automatic public JSON feed returned HTTP 402. Cached pages have differing crawl dates; prices and availability must be reconfirmed. The courier collection reports 18 products but exposes only 16 entries in the accessible page. The paper-shredded collection could not be retrieved.

## Before import

For each approved product, provide exact sizes and units, pack quantity, current supplier cost, EcommerceWale selling price, GST treatment, minimum order, stock, and supplier permission to reuse its product photos. Marketplace branding and compatibility claims also require confirmation.

Do not treat a pack price as a per-piece price. Do not transfer supplier shipping, payment, return policies, promotions or guarantees to EcommerceWale.

## Conflicts requiring review

| Candidate | Collection price | Product-page price | Decision |
| --- | ---: | ---: | --- |
| Plain mailer with pocket | ₹169 | ₹179 | Confirm selected size and pack |
| Brown 3-ply shipping box | ₹225 | ₹399 | Confirm selected size and pack |
| Thermal shipping label roll | ₹400 | ₹450 | Confirm size, labels per roll and rolls per pack |
| Clear Meesho mailer without pocket | ₹0 | Not verified | Never publish as a free product |

Sources: [courier collection](https://www.ecosoftindia.in/collections/courier-bag), [boxes and tapes](https://www.ecosoftindia.in/collections/boxes-tapes), [labels](https://www.ecosoftindia.in/collections/labels-stickers-1), [homepage](https://www.ecosoftindia.in/), [plain pocket mailer](https://www.ecosoftindia.in/products/plain-tamper-proof-courier-bag-with-pocket), [thermal label roll](https://www.ecosoftindia.in/products/thermal-shipping-label-roll).

Descriptions and supplier photographs have not been copied into the storefront. Product labels in this sheet are shortened factual review names, not final merchandising copy.
