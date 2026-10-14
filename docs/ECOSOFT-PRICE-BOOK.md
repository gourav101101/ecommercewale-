# Ecosoft purchase price book

Open `/admin/price-book` through **Purchase costs & pricing**. The supplied PDF is transcribed in `src/data/ecosoft-price-book.js`: 12 families, 171 size/POD/colour variants, 425 quoted costs. All costs are INR per bag, excluding GST and delivery as confirmed by the owner on 14 October 2026. The source file is private server data, never imported by storefront code. The PDF itself is not published.

Plain and bubble bags have separate POD options. Colours are separate variants. Reused supplier codes are scoped by family, dimension and option. NP1 dimensions and NP3 illustration discrepancies are retained as flags, not silently corrected. Missing MOQ, validity, thickness, GST/HSN and stock are not fabricated. Listed quantities are exact quote quantities; no unconfirmed bulk threshold is inferred.

Choose a supplier quantity, selling pack count and allowances. Enter 0 only for genuinely zero costs. The default 25% target margin is a planning suggestion. Suggested unit price is rounded upward to paise:

`(purchase cost + inbound freight/batch bags + handling/bag + nonrecoverable goods GST/bag + outbound delivery/selling pack bags) / (1 - margin% - fee allowance%)`

All percent inputs are divided by 100 in the calculation. Fee allowance is a budget percentage of ex-GST revenue. Confirm the appropriate GST rate/HSN and purchase GST treatment with business records. Freight/handling are final business-cost allowances, not inputs to a service-tax engine. The goods GST preview is not a tax invoice.

Private records save in MongoDB `supplierpricerecords`; source rates remain immutable, revised supplier costs are separate overrides. Revision checks reject stale saves. A disconnected database allows source inspection/calculation but prevents writes/export of saved records. Export is authenticated, private, no-store, and neutralizes spreadsheet formula cells.

To apply a price: select an exact existing website product and variant, confirm dimensions/POD/colour and the selling pack count, save, then use **Apply pack estimate to website**. Incomplete costings and below-cost prices are blocked. This updates only the selected supplier override, preserves owned stock/quote availability, records purchase cost separately and resets final commercial confirmation. Stock is never inferred from a purchase batch. Existing website quotes still require GST/delivery confirmation; the calculator does not change checkout tax handling. No new public products are created and no source feed prices are overwritten.

Only the existing authenticated admin session can access these APIs; proxy origin checks protect writes. Existing supplier refreshes cannot overwrite price-book records. Database configuration and credentials are unchanged.

## Verification

The pricing unit tests cover source counts, quantity rules, unknown versus zero allowances, margin math, recoverable/nonrecoverable goods GST, loss prevention and CSV escaping. `scripts/review-price-book.mjs --browser` uses disposable MongoDB and temporary admin credentials to exercise authentication, origin protection, saving/reloading, unique records, stale revisions, exact-variant application, stock preservation, public cost privacy, CSV export and desktop/mobile rendering. It never writes the configured store database. Production build and focused lint pass. The broader existing supplier-product suite still has three stale image/assortment/variant-title assertions; these are unrelated to the price book.
