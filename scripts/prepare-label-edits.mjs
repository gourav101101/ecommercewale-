import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('research/label-image-edits.json','utf8'));
await fs.mkdir('public/images/supplier-edited',{recursive:true});
for(const image of manifest.images) {
  if(!/^[a-z0-9-]+$/.test(image.key))throw new Error('Invalid asset key');
  await sharp(image.generatedPath).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:88,effort:6}).toFile(path.join('public/images/supplier-edited',`${image.key}-v1.webp`));
}
console.log(`Saved ${manifest.images.length} source-specific label presentation edits. Originals preserved.`);
