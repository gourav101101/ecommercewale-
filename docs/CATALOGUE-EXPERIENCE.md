# Product-led storefront refinement

This pass supersedes the homepage and catalogue direction in DESIGN-REFINEMENT.md. It keeps the existing Next.js/GitHub/Vercel deployment architecture. The Sites skill's local-only workflow was used; no new hosted Site or deployment was created.

## Direction

Reference: https://bellroy.com/products/category/all

Bellroy's navigation and partially loaded catalogue were inspected in a browser. Product loading did not complete in the reference capture, so no claim is made that all of its interactions were audited. No Bellroy assets, code or branding were copied.

The previous oversized introductory sections and rounded boxed cards were replaced with a white, image-led shopping surface, compact category navigation, a shorter campaign area, eight featured products, and an editorial finishing-touches section.

## Shopping interactions

- Category images and product-oriented navigation.
- Four-column desktop catalogue, readable mobile cards and horizontal homepage browsing.
- Search matches multiple words; filters have removable chips, empty-state recovery and product counts.
- Category, marketplace, availability and sort settings use URL parameters. Search is live locally and included in the URL when submitted or another filter changes.
- A lazily loaded native dialog lets shoppers choose a real size and quantity before adding. No silent default-size quick-add.
- Quantity-tier buttons update the estimate. Integer quantities from 1 to 999999 are accepted.
- Native modal focus containment, Escape dismissal, labelled controls, radio-button size selection and restored trigger focus.
- Confirmation links to the existing order list. Mobile total and add action remain visible while browsing options.
- Existing WhatsApp enquiry checkout remains unchanged. No online payment or implied confirmed purchase.

## Performance

The option-panel code is dynamically loaded when requested. Catalogue projections omit detail-page galleries, reviews and specifications, including in local fallback mode. Responsive Next images, explicit image aspect ratios, local typography and five-minute catalogue caching remain in place.

The browser test saves local-performance.json under test-artifacts. Those measurements are warm, unthrottled local diagnostics, not production Lighthouse or Core Web Vitals claims.

## Verification and content limits

Run npm test, npm run build and scripts/review-storefront.mjs against the production preview. Browser coverage includes the new filter URL, quick-shop quantity estimate, mobile action visibility and end-to-end order enquiry.

The 30-candidate Ecosoft review files are unchanged. Their prices and images have not been imported. Existing repeated SKU imagery remains a content limitation; accurate supplier-authorized product photos and validated variant/pack pricing are required for a complete production catalogue.

Nothing in this pass was committed, pushed or deployed.
