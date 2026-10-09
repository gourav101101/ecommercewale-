# Courier bags: selection and pack accuracy

## Implemented

The courier collection uses the same layout and native option selectors as other categories. Mailer-type and document-pocket filters sit inside the standard expandable Filters panel, not an extra always-visible category panel. Pack choices show the verified bag count and selected-size price; a short line shows total bags and approximate price per bag. Dimension separators are normalised for display only; no measurement units or usable dimensions are invented. Order lists and WhatsApp messages retain bag counts for newly saved selections.

The shared supplier product page and quick-shop have reduced repeated instructions. Image disclosures, product features and pricing explanations are expandable rather than permanently visible paragraphs. The selected option, quantity, estimate, availability constraints and WhatsApp enquiry remain accessible. Gallery thumbnails identify the active image. The duplicate collection-sidebar help panel is removed; the existing bottom help section remains. No courier images or source prices were changed in this consistency pass.

The courier collection adds URL-backed mailer-family and document-pocket filters with removable filter chips. Classification comes from supplier titles, with no guessed thickness/material grade. The category image now uses the actual supplier reference rather than an earlier generic render. Main photos plus active option references form a concise gallery; matching non-pack options can reuse a source image for the same size across packs. The existing photos have not been regenerated in this pass.

## Incomplete supplier quantities

The captured export lists `00`, `000` and `0` as pack values for Meesho non-transparent POD with pocket, affecting 24 variants. These are not positive bag counts. They remain unchanged in raw source data, but storefront labels use Pack A/B/C with quantity pending. Prices and variant IDs are preserved. No mapping to 50/100/500/1000 is inferred from price. The supplier page does not provide a verified replacement count in the accessible page text.

These variants remain visible for enquiry but `variantOrderable` and order-list creation reject them until a count is known. Old locally saved selections for this exact product are retained, relabelled as quantity pending when they have no saved count, and explicitly flagged in WhatsApp messages rather than silently discarded.

Admin → Suppliers → Review variants now has a per-variant “Confirmed bags per pack” field. Verify the count with Ecosoft before saving. Null/blank falls back to a valid source count; invalid source quantities remain pending. Values must be whole numbers from 1 to 999,999. Overrides persist separately in MongoDB and survive supplier refreshes; a database connection is required to save. Admin flags include unresolved pack quantities; export CSV appends confirmed bag counts. Source records and prices are not edited. A 24-row review list is saved in `research/courier-pack-review.csv`.

## Still needs supplier/owner verification

- The actual counts for all 24 incomplete pack variants.
- Usable bag dimensions, listed-size units, closure allowance and thickness/material grade.
- Pocket construction and physical printed artwork; supplier barcode/marketplace wording does not establish scanability or marketplace acceptance.
- Reference-constrained photo enhancement can follow separately; this pass keeps actual supplier imagery and does not claim new courier photographs.

No tests, lint, build, browser review, deployment or database writes were performed in this pass.
