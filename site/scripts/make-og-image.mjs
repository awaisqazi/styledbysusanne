// Generates public/og-default.jpg (1200x630) — the default social share
// card: brand cream panel + wordmark left, neutral flat-lay right, gold
// hairline frame. Re-run after changing brand copy: node scripts/make-og-image.mjs
import sharp from 'sharp';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHOTO = path.join(ROOT, 'src/assets/photos/flatlay-neutrals.jpg');
const OUT = path.join(ROOT, 'public/og-default.jpg');

const W = 1200;
const H = 630;
const PHOTO_W = 420;
const PHOTO_H = H - 54; // sits inside the hairline frame
const TEXT_X = 92;

// Right-side photo, cover-cropped, placed inside the frame.
const photo = await sharp(PHOTO)
  .resize(PHOTO_W, PHOTO_H, { fit: 'cover', position: 'attention' })
  .toBuffer();

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#faf6ef"/>
  <!-- gold hairline frame -->
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="#d8c69f" stroke-width="1.5"/>
  <g font-family="Georgia, 'Times New Roman', serif">
    <text x="${TEXT_X + 2}" y="196" font-size="17" letter-spacing="5" fill="#5f6d55" font-family="Helvetica, Arial, sans-serif">CHICAGO + VIRTUAL PERSONAL STYLING</text>
    <text x="${TEXT_X - 4}" y="282" font-size="64" fill="#362c24">Styled <tspan font-style="italic" fill="#a1854c">by</tspan> Susanne</text>
    <text x="${TEXT_X}" y="360" font-size="28" font-style="italic" fill="#675a4e">Your wardrobe should feel like</text>
    <text x="${TEXT_X}" y="400" font-size="28" font-style="italic" fill="#675a4e">the person you’re becoming.</text>
    <rect x="${TEXT_X + 2}" y="448" width="64" height="2" fill="#a1854c"/>
    <text x="${TEXT_X + 2}" y="496" font-size="20" fill="#675a4e" font-family="Helvetica, Arial, sans-serif">styledbysusanne.com</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: photo, left: W - 27 - PHOTO_W, top: 27 }])
  .flatten({ background: '#faf6ef' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`og-default.jpg: ${meta.width}x${meta.height}`);
