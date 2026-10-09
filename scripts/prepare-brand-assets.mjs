import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Encode the owner's supplied artwork without redrawing or changing the logo.
const root = fileURLToPath(new URL('../', import.meta.url));
const circle = process.argv[2];
const square = process.argv[3];
if (!circle || !square) throw new Error('Provide the circular and square logo PNG paths.');
const brand = path.join(root, 'public/images/brand');
await mkdir(brand, { recursive: true });
await sharp(circle).resize(128, 128, { fit: 'contain' }).webp({ quality: 95 }).toFile(path.join(brand, 'logo-circle.webp'));
await sharp(square).resize(256, 256, { fit: 'contain' }).png().toFile(path.join(root, 'src/app/icon.png'));
await sharp(square).resize(180, 180, { fit: 'contain' }).png().toFile(path.join(root, 'src/app/apple-icon.png'));
// Next.js's ICO decoder requires an RGBA PNG frame, even for opaque artwork.
const png = await sharp(square)
  .resize(32, 32, { fit: 'contain' })
  .toColourspace('srgb')
  .ensureAlpha()
  .png({ palette: false })
  .toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(path.join(root, 'src/app/favicon.ico'), Buffer.concat([header, png]));
console.log('Prepared supplied brand artwork for the website and browser icons.');
