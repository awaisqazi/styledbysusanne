// Bulk (re-)import of a captured Instagram catalog. For adding a single new
// post day-to-day, use scripts/add-instagram-post.mjs instead.
// Usage: node scripts/import-instagram-catalog.mjs <browser-catalog.json>
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import {
  ASSETS_DIRECTORY,
  DATA_PATH,
  cleanText,
  categoryFromCaption,
  snippetFromCaption,
  sortPosts,
  titleFromCaption,
  toIsoDate,
} from './lib/instagram.mjs';

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node scripts/import-instagram-catalog.mjs <browser-catalog.json>');
  process.exit(1);
}

const catalog = JSON.parse(await readFile(inputPath, 'utf8'));

await mkdir(ASSETS_DIRECTORY, { recursive: true });

// Hand-curated fields survive re-imports: keep each post's existing shopHref.
const existingShopHrefs = new Map();
try {
  for (const post of JSON.parse(await readFile(DATA_PATH, 'utf8'))) {
    if (post.shopHref) existingShopHrefs.set(post.id, post.shopHref);
  }
} catch {
  // First import: no existing catalog.
}

const sourceFilename = (url) => basename(new URL(url).pathname);

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
    const destination = join(ASSETS_DIRECTORY, filename);

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
    shopHref: existingShopHrefs.get(post.code) ?? null,
    likes: Number(String(post.likes).replaceAll(',', '')) || 0,
    comments: Number(String(post.comments).replaceAll(',', '')) || 0,
    media,
  });
}

sortPosts(output);
await writeFile(DATA_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Imported ${output.length} posts and ${output.reduce((n, post) => n + post.media.length, 0)} media files.`);
