# Boxes and tapes: assortment and image plan

## Remaining corrugated images remade — current update

All 26 remaining size-linked corrugated images in the current catalogue now have individual built-in image_gen reference edits. The single open 5.3×5.3×5.3-inch box is separated from its background stack without changing its open construction. Three wood-background references receive lighter studio backgrounds. The other single-view diagrams receive clearer typography and framing. Four multi-view layouts use their main perspective photo with all three measurements retained beside the appropriate edges; original front/side panels remain available in the comparison section.

Every output was visually compared with its own source for numeric labels, arrow placement, construction and kraft colour family. This is visual review, not physical SKU certification, pixel-identical geometry, or runtime testing. Dimensions are source-listed annotations, not claims about internal measurements or manufacturing tolerances.

Assets: `public/images/supplier-edited/corrugated-dimensions-*-v1.webp`. Exact prompts, original references and generated paths: `research/corrugated-dimension-image-edits.json`. Variant-only mapping: `src/data/corrugated-dimension-edited-images.json`. Source-ID and URL matching prevents arbitrary substitution; existing non-pack option matching reuses the same image for identical sizes in different packs. Family-level product cards retain their clean main edits. Saved variant selections also resolve to the reviewed dimension photos.

The current catalogue’s remaining corrugated selected-size photos are now remade, alongside the earlier flap-box edits. Unused advertising/repetitive source gallery photos are not imported or newly generated. Unchanged supplier originals are intentionally retained for the expandable comparison and research records. No source data, selling prices or pack quantities were changed. No tests, lint, build or deployment were run. This update supersedes statements below that corrugated diagrams remain unchanged.

## Size-specific dimensional photos — current presentation

Eight built-in image_gen reference edits now replace the rejected floating HTML/CSS measurement overlays and extra legend card. Each image places fine arrows beside the corresponding box edges, following the supplier's perspective-photo example. White sizes: 6×4×2, 4×4×1.5, 4×3×1, 9.75×9.75×2, 7×7×2 and 8×4×2 inches. Brown sizes: 6×4×2 and 9×6×2 inches.

Only exact matching source image IDs and URLs resolve to these edits for selected variants. Family catalogue cards keep their clean, undimensioned images. Changing pack count for the same size reuses its linked photo; changing size restores its matching image. The 26 original corrugated size diagrams remain unchanged. No dimensions are guessed for malformed supplier size text such as `4x4.x1.5 inches`.

Assets: `public/images/supplier-edited/box-dimensions-*-v1.webp`. Exact prompts and provenance: `research/box-dimension-image-edits.json`. Variant-only mapping: `src/data/box-dimension-edited-images.json`. WebP encoding uses Sharp, not creative image manipulation. Originals and earlier edited versions remain preserved; the collapsed original-size comparison remains available. Images are reference-constrained presentation edits, not physical SKU certification, pixel-identical geometry, or a guarantee of internal dimensions/tolerances. Prices and pack quantities are unchanged. No tests, lint, build or deployment were run.

The following sections document earlier passes; this section supersedes their flap-box dimension presentation.

## Implemented image refinement

### Follow-up: cluttered size-linked box references

Six additional built-in image_gen reference edits replace four white flap-box promotional/multi-view layouts (4x3x1, 9.75x9.75x2, 7x7x2, 8x4x2) and two brown flap-box lifestyle collages (6x4x2, 9x6x2). Only the existing box view is used: top open white box or bottom closed brown box, with promotional panels, props and external captions removed. No dimensional numbers were regenerated. The white 4x4x1.5 diagram and 26 corrugated box size references remain unchanged because their measurement information is useful.

Assets: `public/images/supplier-edited/box-variant-{sourceImageId}-v1.webp`. Prompt set, source links, output paths and review limitations: `research/box-variant-image-edits.json`. Runtime mapping: `src/data/box-variant-edited-images.json`. The imagegen skill guided explicit geometry/colour/open-state invariants and non-destructive saves. Each image resolves through its exact supplier source ID and URL; multi-pack reuse requires matching all non-pack options. General galleries remain concise and show the active size image rather than adding every size thumbnail.

For edited box references, the unchanged original source photo is accessible in a separate collapsed “Original supplier size reference” panel. It follows the selected variant and includes a warning that any pictured bottles, filler and other props are not included. Existing main box edits also offer original comparison when relevant. Visual comparison does not establish pixel-identical geometry or physical SKU certification. Source dimensions, prices and pack quantities were not edited. No tests, lint, build or deployment were run.

Created and visually reviewed 16 supplier-reference edits with the built-in image_gen tool: 11 main images plus 5 additional width-specific plain-tape references. The imagegen skill guided background-only edits, explicit product invariants and non-destructive versioned assets. Files are saved as `public/images/supplier-edited/box-tape-{sourceImageId}-v1.webp`. Full prompts, source URLs, original output paths and review limitations are in `research/box-tape-image-edits.json`; runtime mapping is `src/data/box-tape-edited-images.json`.

The general galleries use reviewed allowlists (`src/data/box-tape-galleries.json`): 1 image for each box family and printed-tape product, 4 transparent tape widths and 3 brown tape views. Repetitive and unreviewed supplier photos and advertising graphics are omitted from the general gallery, not deleted from source records. The selected option reference is additionally accessible in thumbnails, so original box dimension diagrams remain available without filling the gallery with all sizes. Selecting an option restores its linked photo. Multi-pack images are reused only when all non-pack identity options match; different widths/designs are not substituted. Future supplier image replacements require review before inclusion in curated galleries.

Category cards use the new edits. Images do not establish pack quantities, exact colours or physical SKU certification. Demonstration cartons in printed tape photos are props and not included. Source artwork was visually compared but is not certified pixel-identical; order confirmation remains necessary. Prices, size options and pack quantities are unchanged. No tests, lint, build or deployment were performed. This supersedes the initial no-generation plan below.

The owner requested separate Boxes and Tapes collections and stopped selling Tape Dispenser. Active collection URLs are `/shop?category=boxes` and `/shop?category=tapes`. The former combined category URL redirects to all packaging, preserving other filters. Existing combined-category database records are classified on read by product title/type/slug; new saves use separate categories. No bulk database migration or deletion was performed.

Tape Dispenser is excluded by title, both `tape-dispanser` and `tape-dispenser` spellings, and its saved supplier product ID. The existing assortment policy applies to catalogue transformation, storefront details, public lists, recommendations and active cart/wishlist selections. Source records are retained for admin reference. Cache keys were updated.

The captured supplier catalogue contains 3 box products with 56 photos and 8 tape products with 30 photos, excluding the dispenser. These are source-photo counts, not distinct SKU designs. No new image generation was requested in this turn; the owner asked for a quota-conscious plan first.

Recommended first pass: one source-reference edit for each of the 11 product main images. Improve lighting, background and framing without changing the actual box construction, colour, tape width or printed design. Keep original dimension diagrams and size-specific reference photos unchanged. Reuse an edited image only for packs of the same physically identical product; different colours, constructions, widths or printed artwork need their own accurate reference. Printed logos and measurements should not be regenerated without careful comparison; non-generative photo cleanup is safer for exact artwork. WebP optimisation and consistent storefront framing do not require image-generation calls. Additional gallery edits are optional and should be selected after the main images are reviewed.

Category cards now use actual supplier box/tape images instead of generic renders. No product images were newly edited in this turn. No tests, build or deployment were run.
