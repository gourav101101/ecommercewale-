// Diagnostic contact sheets only; no creative edits or source mutations.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const catalogue=JSON.parse(await fs.readFile('research/ecosoft-full-catalogue.json','utf8'));
const references=JSON.parse(await fs.readFile('research/supplier-image-reference-index.json','utf8'));
const indexed=new Map(references.map(item=>[String(item.imageId),item]));
await fs.mkdir('research/box-tape-review',{recursive:true});
for(const product of catalogue.products.filter(item=>/box|tape/i.test(item.title)&&item.handle!=='tape-dispanser')) {
  const images=product.images.filter(item=>indexed.has(String(item.id)));
  const columns=4,cell=240;
  const layers=[];
  for(const [i,photo]of images.entries()) {
    const reference=indexed.get(String(photo.id));
    const thumb=await sharp(reference.local).resize(230,210,{fit:'contain',background:'white'}).png().toBuffer();
    layers.push({input:thumb,left:(i%columns)*cell,top:Math.floor(i/columns)*cell});
    const label=Buffer.from(`<svg width="240" height="30"><rect width="240" height="30" fill="white"/><text x="5" y="20" font-size="15">${photo.id}</text></svg>`);
    layers.push({input:label,left:(i%columns)*cell,top:Math.floor(i/columns)*cell+210});
  }
  await sharp({create:{width:columns*cell,height:Math.ceil(images.length/columns)*cell,channels:3,background:'white'}}).composite(layers).png().toFile(`research/box-tape-review/${product.handle}.png`);
  console.log(`${product.handle}: ${images.length}/${product.images.length} locally available references`);
}
