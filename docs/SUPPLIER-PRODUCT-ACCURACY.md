# Supplier product accuracy and commercial confirmation

## Admin records and complete galleries

Commercial review now takes place at `/admin/suppliers`: open a product, find the exact variant and expand “Costs, stock, GST & delivery”. Records include purchase cost, target margin, owned stock, HSN, GST rate/treatment, delivery rule/charge, notes and owner confirmation. Saving requires MongoDB. Blank values remain unknown; zero is meaningful. Owner confirmation requires a selling price and the required cost, stock, tax and delivery fields. Editing commercial details clears the confirmation checkbox until the owner confirms again. Costs/margins never enter public catalogue payloads. The authenticated CSV export includes saved commercial records; the local research CSV is not automatically synchronised with the database.

These are quoting records, not automatic GST/delivery calculations or stock reservations. Availability for WhatsApp selection remains a separate explicit control. Stock record and confirmation timestamps are saved by the server.

Product pages and admin now expose all supplier gallery images present in the captured/feed catalogue, rather than only primary and variant-featured photos. Existing optimised local reference copies are used where available; other actual gallery photos load from the permitted supplier CDN. Gallery photos can show different options; selecting a photo does not change the chosen variant, and changing a variant resets the displayed photo to its linked reference. No image generation, deployment, build or tests were performed for this change.

## Current status — supplier photos restored with owner permission

The owner authorised restoring actual supplier photos after the placeholder-only correction below. `scripts/restore-supplier-photos.mjs` converted 92 downloaded primary/variant reference images to local WebP assets in `public/images/supplier/`, resizing without cropping or generating new product details. `src/data/supplier-reference-images.json` records source URLs, image IDs and product/variant mappings. Source-specific local photos are preferred; newly refreshed images can use the permitted supplier CDN. Exact ID mappings also restore older saved cart/wishlist entries.

Products use the variant's featured image when provided, otherwise the supplier's main photo. Main-photo fallback is not a claim that every size, colour or design has its own photograph. Catalogue images use contain-fit to preserve visible artwork. AI redraws remain withdrawn. Commercial and physical-SKU confirmation remain pending. No tests or deployment were performed for this restoration.

## Correction — 9 October 2026

The earlier 32 generated family illustrations did not faithfully represent all Ecosoft products. They must not be used as supplier SKU photos. In particular, printed Prime tape, branded mailers, dispenser geometry and the ten review-card designs were misrepresented. Those generic assets remain on disk as historical drafts, but supplier catalogue mappings and persisted supplier cart/wishlist images no longer select them.

No product identifiers, variant selections or supplier reference prices were replaced. Supplier products now display a neutral “Exact product image under review” placeholder. Actual supplier product links remain available; original photos are research references and are not republished as storefront assets.

`src/lib/supplier-visuals.js` is an intentionally empty approval registry keyed by source image ID and source URL. A variant with its own reference image cannot inherit an unrelated design render. Before adding an approved asset, compare actual colour, silhouette, dimensions, components, quantity, branding and every printed detail against that exact reference. Owner/supplier confirmation is still required for the physical SKU.

## Reference inventory and rejected edits

- 44 products and 688 variants in the captured catalogue.
- 92 distinct primary/variant references downloaded into the ignored `research/supplier-image-references/` folder; the full source export also contains additional gallery photos. This is not a claim that every site image or private supplier field was scraped.
- `research/supplier-image-reference-index.json` records the reference-to-product/variant mapping.
- Four built-in image-generation reference edits were attempted for Prime tape, Amazon mailers, dispensers and review cards. All were rejected for exact-SKU use because generation still alters printed/artwork details. Prompts and original generated output paths are recorded in `research/supplier-image-edit-review.json`. No pilot was published.
- Conceptual homepage/about packaging artwork is inspiration, not SKU photography, and must remain labelled as such.

Faithful final photographs require either owner/supplier-approved real photos or permission to preserve actual product pixels while editing only the background. Do not regenerate brand lettering or printed designs from scratch.

## Commercial confirmation

`research/ecosoft-commercial-confirmation.csv` contains one row per captured variant. The admin CSV export uses the same schema and includes any persisted store quote estimate separately. Blank commercial fields mean unknown, not zero or tax exempt. The local preparation script reads the immutable captured source and does not read live store overrides.

Confirm purchase cost per complete selection, target margin, selling price, owned stock and verification date, HSN/GST rate and whether tax is included, destination-dependent delivery rules/charges, exact colour/design and photo approval. Supplier public price is not evidence of purchase cost; source availability is not evidence of owned stock; a `taxable` flag does not establish a GST rate. Quote-selection availability controls are not stock accounting.

Supplier shipping policy leaves applicable charges to checkout and destination: https://www.ecosoftindia.in/policies/shipping-policy . Do not assume universally free delivery. Public Prime-tape description says 150m while the captured option says 130m; confirm this discrepancy rather than silently changing the variant.

Supplier prices remain reference estimates pending a final WhatsApp quote. No new margin, GST or delivery surcharge has been invented. No deployment, build, lint or test run was performed during this correction, at the owner's request.
