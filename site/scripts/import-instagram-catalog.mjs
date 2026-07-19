import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node scripts/import-instagram-catalog.mjs <browser-catalog.json>');
  process.exit(1);
}

const catalog = JSON.parse(await readFile(inputPath, 'utf8'));
const publicDirectory = join(process.cwd(), 'public', 'images', 'instagram');
const dataPath = join(process.cwd(), 'src', 'data', 'instagram-posts.json');

await mkdir(publicDirectory, { recursive: true });

const sourceFilename = (url) => basename(new URL(url).pathname);

/**
 * Instagram occasionally exposes a lone UTF-16 surrogate in an emoji.
 * Site rule: no em-dashes anywhere in catalog text. Imports normalize them to
 * a comma (crude, but a human reviews and rewords after each import).
 */
const cleanText = (value = '') =>
  value
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�')
    .replace(/\s*—\s*/g, ', ');

const truncate = (value, length) => {
  const characters = Array.from(value);
  return characters.length > length
    ? `${characters.slice(0, length - 1).join('').trimEnd()}…`
    : value;
};

const toIsoDate = (value) => {
  const parsed = new Date(`${value} 12:00:00 UTC`);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Could not parse date: ${value}`);
  return parsed.toISOString().slice(0, 10);
};

const titleFromCaption = (caption) => {
  const firstLine = caption.split(/\n+/).find((line) => line.trim())?.trim() ?? 'A look from Susanne';
  return truncate(firstLine, 88);
};

const snippetFromCaption = (caption) => {
  const withoutSignoff = caption
    .replace(/\n+Xo,?\s*\n+Sus[\s\S]*$/i, '')
    .replace(/\n+🔗[^\n]*/g, '')
    .replace(/\n+#.*$/s, '')
    .trim();
  const paragraphs = withoutSignoff.split(/\n{2,}/).filter(Boolean);
  const snippet = paragraphs.slice(0, 2).join(' ');
  return truncate(snippet, 260);
};

const categoryFromCaption = (caption) => {
  const text = caption.toLowerCase();
  if (/vacation|travel|airport|turks|conference|packing|out of office/.test(text)) return 'travel';
  if (/office|workwear|work outfit|in-office|company color|corporate/.test(text)) return 'office';
  if (/easter|fourth of july|pride|birthday|anniversary|concert|cubs game|celebrat/.test(text)) {
    return 'occasion';
  }
  if (/spring|summer|holiday/.test(text)) return 'seasonal';
  if (/scarf|monochrome|color therapy|accessor/.test(text)) return 'color-and-accessories';
  return 'everyday';
};

const shopRoutes = {
  Davb0iDOqg3: '/looks/blush-and-cream-balloon-hem',
  DaYNd4AOvbG: '/looks/red-eyelet-fourth-of-july',
  DZclbaxONP5: '/looks/pastel-column-office-look',
};

const output = [];

for (const post of catalog) {
  const caption = cleanText(post.caption);
  const bundledByName = new Map(
    (post.bundle?.assets ?? []).map((asset) => [sourceFilename(asset.url), asset.path]),
  );
  const media = [];

  for (const [index, item] of post.media.entries()) {
    const sourceName = sourceFilename(item.url);
    const sourcePath = bundledByName.get(sourceName);
    const extension = extname(sourceName) || '.jpg';
    const filename = `${post.code}-${String(index + 1).padStart(2, '0')}${extension}`;
    const destination = join(publicDirectory, filename);

    if (sourcePath) {
      await copyFile(sourcePath, destination);
    } else {
      const response = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!response.ok) {
        throw new Error(`Could not download ${post.code} media ${index + 1}: ${response.status}`);
      }
      await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    }

    const lead = titleFromCaption(caption).replace(/\s+/g, ' ');
    const itemAlt = cleanText(item.alt?.trim());
    const profileAlt = cleanText(post.profileAlt?.trim());
    media.push({
      src: `/images/instagram/${filename}`,
      alt:
        itemAlt && itemAlt.length < 240
          ? itemAlt
          : index === 0 && profileAlt && profileAlt.length < 240
            ? profileAlt
          : `${lead}, ${post.media.length > 1 ? `slide ${index + 1} of ${post.media.length}` : 'Instagram post'}`,
    });
  }

  output.push({
    id: post.code,
    title: titleFromCaption(caption),
    date: toIsoDate(post.date),
    category: categoryFromCaption(caption),
    kind: post.kind,
    location: cleanText(post.location) || null,
    caption: caption.trim(),
    snippet: snippetFromCaption(caption),
    instagramUrl: post.url,
    shopHref: shopRoutes[post.code] ?? null,
    likes: Number(String(post.likes).replaceAll(',', '')) || 0,
    comments: Number(String(post.comments).replaceAll(',', '')) || 0,
    media,
  });
}

output.sort((a, b) => b.date.localeCompare(a.date));
await writeFile(dataPath, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Imported ${output.length} posts and ${output.reduce((n, post) => n + post.media.length, 0)} media files.`);
