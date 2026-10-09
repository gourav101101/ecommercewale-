// Encoding only; creative reference edits were made with built-in image_gen.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const manifestPath=process.argv[2] || 'research/box-tape-image-edits.json';
if(!['research/box-tape-image-edits.json','research/box-variant-image-edits.json','research/box-dimension-image-edits.json','research/corrugated-dimension-image-edits.json'].includes(manifestPath))throw new Error('Unsupported image manifest');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
await fs.mkdir('public/images/supplier-edited',{recursive:true});
for(const image of manifest.images) {
  if(!/^[a-z0-9-]+$/.test(image.key))throw new Error('Invalid asset key');
  await sharp(image.generatedPath).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:88,effort:6}).toFile(`public/images/supplier-edited/${image.key}-v1.webp`);
}
console.log(`Saved ${manifest.images.length} box/tape reference edits. Source originals preserved.`);
