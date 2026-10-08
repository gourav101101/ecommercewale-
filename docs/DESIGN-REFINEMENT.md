# Readability and catalogue refinement — 8 October 2026

## Implemented locally

- Larger locally hosted Manrope typography: 17px base text, 18–19px hero copy, 21–22px product titles, 27px card prices. Minimum text scale is checked in the browser test.
- New original packaging campaign visual, wider layouts, more generous spacing, rounded cards and clearer primary actions.
- Full-width three-column desktop catalogue; large single-column mobile products; category tabs, search, sorting, collapsible filters and useful empty states.
- Horizontal product browsing on the mobile homepage and related-product section, with native scrolling and scroll snapping.
- Larger navigation targets, size controls, checkout typography and footer links. Search fields use readable input text.
- WhatsApp remains the enquiry checkout. No payment gateway or false order confirmation added.

Design references reviewed: [Bellroy catalogue](https://bellroy.com/products/category/all) for product-led browsing, and [Apple shop](https://www.apple.com/shop/buy-iphone) for hierarchy, space and clear choices. The implementation uses original layouts and assets, not copied code or brand imagery.

## Supplier data

The owner confirmed Ecosoft is their supplier and requested a review catalogue. See [review guide](../research/README.md), CSV and JSON in `research/`. Thirty candidate products have been recorded from accessible public pages. This is partial, unapproved data; no product/price/stock imports occurred. An authoritative variant export is still needed for a complete catalogue.

## Original image

Created with the built-in image-generation tool under the imagegen skill, then losslessly retained as a source PNG and converted to a 151,742-byte WebP for the site. It is generic campaign artwork, not supplier product photography.

Source: `public/images/packaging-campaign.png`

Web asset: `public/images/packaging-campaign.webp`

Prompt: Create an original premium ecommerce campaign photograph for an Indian packaging supplies brand, EcommerceWale. Photorealistic editorial still life, landscape 3:2 composition. A sculptural arrangement of unbranded kraft corrugated shipping boxes, one open kraft mailer box with soft crinkle paper, neatly stacked ivory-white courier mailers, a white thermal label roll and a single brown packing tape roll. Place on a warm sand-colored architectural plinth against a seamless warm ivory studio background. Objects arranged with beautiful generous spacing, deliberate asymmetry, softly directional late afternoon light from upper left, sophisticated long shadows, tactile paper fibers, restrained honey kraft, cream, and deep charcoal palette, tiny terracotta accent platform. Camera at front three-quarter view, normal lens, crisp realistic edges and material detail. Composition fills middle and lower frame while keeping breathing room, all objects fully visible. Art direction: quiet premium industrial design catalogue, minimal, elegant, tangible. This is generic packaging campaign art, not a representation of a specific supplier SKU. No words, no typography, no logos, no labels printed on boxes, no watermarks, no people, no plants, no decorative sparkles.

## Checks and remaining work

Production build, lint, four unit tests and the browser shopping-flow suite pass. Browser checks cover desktop, mobile, 320px layout, typography, search/reset, keyboard navigation dismissal, cart tiers/variants/persistence, wishlist, WhatsApp handoffs, dark mode and protected routes.

No live performance score is claimed. The local font avoids external font requests; the hero uses optimized responsive imagery. Re-run Lighthouse/Core Web Vitals after deployment with real traffic and the production database.

Existing product images are still repeated across different SKUs. Obtain the supplier's approved exact-product photographs and variant/pack pricing before launch. Database-backed production inventory remains unverified locally. Nothing has been committed, pushed or deployed by this refinement.
