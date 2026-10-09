# Shredded Paper — reference-based presentation edits

## Bowl-format follow-up

The owner requested that Blue, Orange and White match the other six bowl-style images. Their active assets are now `blue-paper-shredded-v2.webp`, `orange-paper-shredded-v2.webp` and `paper-shredded-white-v2.webp` in `public/images/supplier-edited/`. The built-in image tool used the actual supplier photo for product colour/cut/texture and the existing light-blue bowl image for presentation only. Boxes, mugs and jars were replaced by the same bowl-style prop, with a newly arranged paper mound. This is a reference-based presentation composite, not a claim that the original product pixels or arrangement were preserved. White remains straight-cut; blue and orange remain crinkle-cut. The original supplier images remain in product galleries, and v1 assets were not overwritten. Full prompts and output paths are in `research/shredded-paper-bowl-v2.json`. No tests or deployment were run.

Only the nine Shredded Paper colour products were changed in this image pass. Built-in image generation was used in reference-edit mode, with each actual local supplier photograph inspected first. The prompt removes background distractions, promotional typography and inset graphics, retains existing primary product arrangements and asks to preserve paper colour, strip width, matte texture and cut style. White paper stays straight-cut; the eight coloured papers stay crinkle-cut. No SKU data, variant options, quantities, pricing or other categories were changed.

Outputs were visually compared to the original references, not physically verified against stock. AI editing is not guaranteed pixel-identical, and the site does not describe these as original photographs taken by EcommerceWale. Props such as bowls, boxes, mugs and jars are not included. Displayed fill volume does not prove the selected pack weight.

Final WebP files: `public/images/supplier-edited/*-paper-shredded-v1.webp` plus `paper-shredded-white-v1.webp` (all nine paths are enumerated in the provenance file). Original generation outputs remain at their recorded generated-images paths. Original supplier images and local copies were not overwritten.

- `research/shredded-paper-image-edits.json`: full prompt set, source URLs, image IDs, saved asset paths, generated-original paths, tool mode and visual-review note.
- `src/data/supplier-edited-images.json`: exact source-image approval mapping, scoped to this category.
- `scripts/prepare-shredded-paper-edits.mjs`: non-cropping WebP conversion of the selected outputs.

The new presentation appears in cards, variant detail, Quick Shop, cart/wishlist and admin through the source-ID mapping. Source URL changes invalidate the edit match and fall back to actual supplier photos, avoiding reuse against a changed source image. The Shredded Paper category tile uses the orange reference edit. Original supplier photos remain in product galleries for direct comparison.

No tests, lint, build or deployment were run, as requested by the owner.
