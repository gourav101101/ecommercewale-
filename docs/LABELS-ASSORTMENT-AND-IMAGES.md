# Labels assortment and source-based imagery

## Category URL: Labels only

The active category identifier and URL are now `labels` and `/shop?category=labels`. Navigation, category filters, breadcrumbs, marketplace guidance, supplier products and admin selectors use the new identifier. Existing database records with the old category are normalised on read; new admin saves use `labels`. Old `/shop?category=labels-stickers` links permanently redirect to the Labels URL while preserving other query parameters. No database records were deleted or bulk-migrated, and no tests or deployment were run. This supersedes the earlier internal-identifier compatibility note below.

## Current storefront: edited images only

At the owner's follow-up request, original supplier label photos were removed from customer galleries. The barcode gallery now contains its reviewed edit only; thermal labels contain the two size-specific edits only. Original photos are preserved in research/admin, not deleted. Other category galleries are unchanged. This supersedes the earlier label-gallery comparison notes below.

The exported legacy product catalogue and the product-list GET endpoint now also filter excluded sticker/card records, closing alternate data paths beyond the primary storefront filter. Cache keys were changed so previous gallery/list results are not reused. No tests or deployment were performed.

## Follow-up: review cards also excluded

The owner also explicitly removed `thank-you-review-card` / Thank You + Review Card. The assortment policy excludes this product by slug, saved supplier product ID and its exact name. Its 30 source variants and original photographs remain in research/admin for reference. On reload, saved card selections are archived with other retired selections before being removed from active cart/wishlist lists. Admin marks excluded products as not sold and does not offer a broken storefront preview link. The customer-facing Labels category now contains the supplier's barcode label roll and thermal shipping label roll; their recorded sizes/prices are unchanged.

The owner stopped selling stickers. The customer-facing category is now “Labels”; the internal `labels-stickers` identifier remains for existing links and stored product records. `src/lib/storefront-policy.js` excludes sticker-named products from supplier transformation, storefront cards, details, recommendations and active cart/wishlist selections. Supplier refresh cannot reintroduce them. The Thank You Sticker supplier product and the legacy Warning/Fragile Stickers listing are excluded. Labels remain; the subsequent explicit instruction also excludes Thank You + Review Card.

No supplier CSV, source catalogue, database record or original photo was deleted. Supplier admin retains excluded source products with an explicit status. Removed local cart/wishlist selections are archived in the browser's `ecommercewale_retired_sticker_cart` / `ecommercewale_retired_sticker_wishlist` keys when storage permits, before filtering the active lists.

Three built-in image-generation reference edits improve background/framing for the barcode roll, thermal 4×6 and thermal 3×5. Source-specific assets are `public/images/supplier-edited/barcode-label-roll-v1.webp`, `thermal-label-4x6-v1.webp` and `thermal-label-3x5-v1.webp`. Prompts, source URLs, image IDs and generated-original paths are recorded in `research/label-image-edits.json`; mapping lives in `src/data/label-edited-images.json`. Original label photos are retained as reference records, not customer gallery slides. Review-card artwork was not altered and that product is excluded from sale.

The images were visually compared for displayed digits/dimensions, roll shape/count, die-cut shape and white/cream backing. This is not a claim of pixel-identical artwork, verified barcode scannability or physical SKU certification. Barcode/size markings in source visuals do not promise supplied printing on plain labels. Roll count shown does not define the selected pack. Printer compatibility requires confirmation.

All thermal variants sharing the supplier's exact size option now resolve to that size's photo, including multi-roll 3×5 selections. Prices, sizes and pack quantities were not changed. No unprovided new product was invented for the ambiguous “add this” instruction.

No tests, lint, build or deployment were run at the owner's request.
