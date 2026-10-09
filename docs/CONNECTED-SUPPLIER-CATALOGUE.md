# Connected supplier catalogue

9 October 2026. Supersedes earlier review-only storefront notes. Changes are local; no GitHub push or Vercel deployment has been performed.

## Behaviour

All 44 products and 688 variants from the captured Ecosoft public product feed are now served by the storefront. Every source variant ID, factual option combination and numeric price is preserved in the transformation. Supplier images are referenced directly through Next.js image optimisation. This is a bundled snapshot, not continuous stock/price synchronisation.

Supplier prices are displayed as **reference quote estimates**, without an invented margin. A quantity of 1 means one complete selected supplier pack/item. No pack price is divided into a guessed per-piece price. Changes to size, design or pack resolve an exact variant and update its price. Two variants of the same product remain distinct cart lines. Cart, quick shop, wishlist options, checkout and WhatsApp messages retain variant identity and pack/item semantics.

Example: Brown Plain Tamper Proof Courier Bag with Pocket:

| Size | Pack | Reference price |
| --- | --- | --- |
| 6x8 | 100 | ₹249 |
| 8x10 | 100 | ₹399 |
| 8x10 | 500 | ₹1,799 |

Two 6x8 / 100 packs produce a ₹498 line estimate, not 2 pieces or a ₹2.49 unit price.

Unavailable and zero-price variants remain visible but cannot be added. Supplier `NOTE: Free Delivery` is retained in the original export, not transferred into EcommerceWale options or promises. Unverified `100% barcode working` claims are removed from public titles. All underlying raw source fields remain in the research snapshot. Supplier reference estimates do not emit misleading fixed-price schema offers.

## Storage and admin

The normalised supplier snapshot is composed with existing custom MongoDB products. No existing Product records are overwritten or deleted. Supplier handles take precedence on identical storefront slugs; existing records remain available in the custom-products admin. In a no-database preview, the shop shows 44 supplier products, replacing the earlier 14 sample cards. Old sample product URLs still resolve for compatibility with saved lists.

`/admin/suppliers` lists source prices and lets the owner save a selling-price override and quote-selection availability for each exact variant. Settings are stored in the separate `SupplierVariantOverride` collection; successful saves invalidate the shared product cache. Blank selling prices restore supplier reference pricing. Positive prices and valid variant IDs are required. Enabling a zero-price variant requires a positive store price first. Authentication and same-origin mutation checks apply.

When MongoDB is absent/unavailable, source review remains accessible but editing is explicitly disabled. Configured-database failures are not silently replaced with stale catalogue defaults in the public loader. Source CSV/JSON files remain immutable research evidence; refreshing them requires rebuilding/redeploying, while admin overrides persist by variant ID.

## Verification

- 13 tests pass, including full 44/688 price parity, exact size/pack prices, blocked variants, cart/WhatsApp pack identity and isolated override validation.
- Production build passes.
- Updated storefront browser review covers all 44 cards, exact 249 → 399 → 1799 price changes, pack-count multiplication, saved cart, distinct variants, wishlist options, WhatsApp handoff, blocked zero-price product, supplier image loading, and desktop/mobile/320px dark-mode layouts.
- Isolated admin browser/API review passes with temporary credentials, invalid override rejection, safe no-database save failure, source export and responsive variant review.

Production MongoDB persistence has not been integration-tested. No real customer records were changed, no messages sent and no deployment made. Existing saved cart lines remain estimates until confirmed; supplier prices/stock are not live guarantees. Verify supplier photo-use rights and business terms before public deployment.

Implementation follows the website skill's local workflow; existing Next.js/Vercel hosting is preserved.
