// One-time asset prep: crop Instagram UI artifacts out of research screenshots
// and emit web-ready JPEGs into src/assets/photos/.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve(import.meta.dirname, '../../research-screenshots');
const OUT = path.resolve(import.meta.dirname, '../src/assets/photos');
await mkdir(OUT, { recursive: true });

const jobs = [
  // { file, out, crop: { left, top, width, height } }
  {
    file: '06-cute-aunt-look.png',
    out: 'look-blush-neutrals.jpg',
    crop: { left: 95, top: 0, width: 1258 - 95, height: 1260 },
  },
  {
    file: '07-fourth-of-july-look.png',
    out: 'look-red-dress.jpg',
    crop: { left: 95, top: 30, width: 1262 - 95, height: 1268 - 30 },
  },
  {
    file: '08-pride-office-look.png',
    out: 'look-color-office.jpg',
    crop: { left: 10, top: 10, width: 1254 - 20, height: 1260 - 20 },
  },
  {
    file: '04-susanne-standard.png',
    out: 'flatlay-neutrals.jpg',
    crop: { left: 36, top: 496, width: 550, height: 622 },
  },
];

for (const j of jobs) {
  const outPath = path.join(OUT, j.out);
  await sharp(path.join(SRC, j.file))
    .extract(j.crop)
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(outPath);
  const meta = await sharp(outPath).metadata();
  console.log(`${j.out}: ${meta.width}x${meta.height}`);
}
