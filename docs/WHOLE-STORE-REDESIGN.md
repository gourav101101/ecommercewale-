# Storefront journey redesign — 9 October 2026

This pass changes page structure and interactions beyond the homepage. It preserves the existing Next.js/GitHub/Vercel architecture and the WhatsApp enquiry model. The Sites skill was used for its local implementation and responsive-preview workflow; no hosting migration or publication was performed.

## Pages changed

- **Shop:** split editorial heading, persistent desktop category rail with live catalogue counts, larger three-column product grid, mobile category scrolling, retained URL filters and search.
- **Product:** rebuilt sticky photography / configuration layout; explicit size cards; clickable quantity-price tiers; live estimate; invalid-quantity handling; in-page add confirmation; size advice, specifications and ordering accordions; compact optional review form.
- **Cart:** product-first order cards replace the spreadsheet layout; larger images and touch controls; actionable next-price-break suggestions; plain-language estimate and quote summary.
- **Checkout:** shared three-step enquiry navigation; stronger hierarchy; photo-based order summary with edit link; existing WhatsApp handoff, message recovery and saved cart preserved.
- **Wishlist:** rebuilt saved collection. Fetches current product information and opens size/quantity choices instead of silently adding the first size.
- **Help centre:** topic filters, live search counts, native accessible accordions and combined reset state.
- **Order support:** distinct WhatsApp assistance and recorded-order lookup; accurate status timeline, product-selection count and useful temporary-failure feedback.
- **Contact:** task-based routing for product advice, existing orders and quick answers.
- **About:** illustrated explanation of the ordering process using the existing labelled conceptual editorial asset.
- Floating support/back-to-top overlays are omitted from enquiry/support forms to avoid covering mobile inputs. Inline support links remain available.

## Verification

`npm test` passed all 9 tests. Production build passed. The expanded Windows Edge browser script covers desktop/mobile layouts, catalogue search/filter reset, product price-break selection, invalid quantities, separate size selections, wishlist option selection, cart pricing/persistence, enquiry/contact WhatsApp handoffs, help topics/search/accordion states, and simulated tracking success/failure responses. Simulated tracking records exist only in browser memory. No messages are sent or live orders changed by these checks.

Screenshots and reports are written to ignored `test-artifacts/`. Local warm-browser timing is diagnostic only, not a production Lighthouse/Core Web Vitals score. Production MongoDB writes, real customer tracking records and review submission persistence were not exercised.

The final run also passed 320px dark-mode overflow checks for shop, product, cart, checkout, help centre, tracking and wishlist, with no uncaught browser exceptions. Floating overlays are absent from the quote/contact/tracking forms.

## Remaining catalogue work

This redesign does not automatically publish supplier products or set selling prices. The 44-product / 688-variant supplier snapshot remains review-only. Several existing storefront SKUs share sample photography; verified product-specific imagery, accurate variation mappings and approved selling prices remain necessary for a production-ready catalogue. No invented product photographs or business guarantees were introduced in this pass.

The design references were [Bellroy's catalogue](https://bellroy.com/products/category/all) and [Apple's shopping page](https://www.apple.com/shop/buy-iphone); neither branding nor product imagery was copied.

No GitHub push or Vercel deployment has been performed.
