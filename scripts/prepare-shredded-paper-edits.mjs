import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('research/shredded-paper-image-edits.json','utf8'));
const directory='public/images/supplier-edited';
await fs.mkdir(directory,{recursive:true});
for(const item of manifest.images) {
  if(!/^[a-z0-9-]+$/.test(item.slug))throw new Error('Invalid asset slug');
  await sharp(item.generatedPath).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:88,effort:6}).toFile(path.join(directory,`${item.slug}-v1.webp`));
}
console.log(`Saved ${manifest.images.length} reference-edited Shredded Paper photos. Original supplier files were preserved.`);
