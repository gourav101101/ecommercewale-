import fs from 'node:fs/promises';
import path from 'node:path';
const snapshot=JSON.parse(await fs.readFile('research/ecosoft-full-catalogue.json','utf8'));
const directory=path.resolve('research/supplier-image-references');
await fs.mkdir(directory,{recursive:true});
const items=[];
for(const product of snapshot.products) {
  const needed=new Map();
  if(product.images[0])needed.set(String(product.images[0].id),product.images[0]);
  for(const variant of product.variants)if(variant.featured_image)needed.set(String(variant.featured_image.id),variant.featured_image);
  for(const [id,image] of needed) {
    const url=new URL(image.src);
    if(url.protocol!=='https:' || url.hostname!=='cdn.shopify.com')throw new Error('Unexpected reference host');
    const extension=path.extname(url.pathname).toLowerCase();
    if(!['.jpg','.jpeg','.png','.webp'].includes(extension))throw new Error('Unsupported reference type');
    const local=path.join(directory,`${id}${extension}`);
    items.push({imageId:id,productId:String(product.supplierId),slug:product.handle,title:product.title,source:image.src,local,primary:image.id===product.images[0]?.id,variants:product.variants.filter(variant=>String(variant.featured_image?.id)===id).map(variant=>({id:String(variant.id),title:variant.title})),width:image.width,height:image.height});
  }
}
for(let index=0;index<items.length;index+=6) {
  await Promise.all(items.slice(index,index+6).map(async item=>{
    try{await fs.access(item.local);return;}catch{}
    const response=await fetch(item.source,{signal:AbortSignal.timeout(25000)});
    if(!response.ok)throw new Error(`Reference ${item.imageId}: HTTP ${response.status}`);
    await fs.writeFile(item.local,Buffer.from(await response.arrayBuffer()));
  }));
  console.log(`Reference images ${Math.min(index+6,items.length)}/${items.length}`);
}
await fs.writeFile('research/supplier-image-reference-index.json',JSON.stringify(items,null,2)+'\n');
console.log('Reference-only downloads complete. These files are not storefront assets.');
