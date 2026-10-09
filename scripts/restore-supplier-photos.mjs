import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const snapshot=JSON.parse(await fs.readFile('research/ecosoft-full-catalogue.json','utf8'));
const references=JSON.parse(await fs.readFile('research/supplier-image-reference-index.json','utf8'));
const directory='public/images/supplier';
await fs.mkdir(directory,{recursive:true});
const manifest={images:{},products:{}};
for(const reference of references) {
  const input=path.join('research/supplier-image-references',path.basename(reference.local));
  const filename=`${reference.imageId}.webp`;
  // Encoding/size optimisation only: no generation, cropping or artwork edits.
  await sharp(input).rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toFile(path.join(directory,filename));
  manifest.images[reference.imageId]={source:reference.source,image:`/images/supplier/${filename}`};
}
for(const product of snapshot.products) {
  const variants={};
  for(const variant of product.variants) {
    const reference=variant.featured_image || (product.handle==='thermal-shipping-label-roll' ? product.variants.find(peer=>peer.option1===variant.option1 && peer.featured_image)?.featured_image : null);
    if(reference?.id)variants[String(variant.id)]=String(reference.id);
  }
  manifest.products[`ecosoft-${product.supplierId}`]={imageId:String(product.images[0]?.id || ''),variants};
}
await fs.writeFile('src/data/supplier-reference-images.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Restored ${references.length} actual supplier reference photos for ${snapshot.products.length} products. Product pixels were not regenerated.`);
