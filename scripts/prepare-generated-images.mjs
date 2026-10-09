import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// JSON manifest is produced from built-in imagegen output; originals remain intact.
const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const destination = path.resolve('public/images/catalogue');
await fs.mkdir(destination, {recursive:true});
const report = [];
for (const item of manifest) {
  if (!/^[a-z0-9-]+$/.test(item.key)) throw new Error('Invalid image key');
  const output = path.join(destination, `${item.key}.webp`);
  await sharp(item.source).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(output);
  report.push({key:item.key,output:`public/images/catalogue/${item.key}.webp`,bytes:(await fs.stat(output)).size,prompt:item.prompt,origin:'Original AI-generated product-family illustration; not a verified SKU photograph'});
}
await fs.writeFile('research/generated-image-provenance.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({images:report.length,totalBytes:report.reduce((sum,item)=>sum+item.bytes,0),largestBytes:Math.max(...report.map(item=>item.bytes))}));
