// Add (or update) ONE Instagram post in the lookbook catalog, and optionally
// scaffold its Shop-this-Look page. This is the everyday path for keeping the
// site in sync with the feed; the bulk importer is only for full re-imports.
//
// Usage: node scripts/add-instagram-post.mjs <post.json>
//
// post.json shape (only code, date, caption, media are required):
// {
//   "code": "DbMQkRaiICA",              // the /p/<code>/ from the post URL
//   "date": "2026-07-24",               // or "July 24, 2026"
//   "kind": "post",                     // or "reel"
//   "location": "Chicago, Illinois",
//   "likes": 31,
//   "comments": 3,
//   "caption": "Full caption\n\nwith paragraphs…",
//   "category": "occasion",             // optional; guessed from caption if omitted
//   "elements": ["red", "stripes", "brooch"],  // what's visible; powers similar-looks
//                                       // (see existing posts for the vocabulary)
//   "media": [
//     { "url": "https://…cdninstagram…jpg", "alt": "What the photo shows" },
//     { "file": "/absolute/or/relative.jpg", "alt": "…" }
//   ],
//   "shop": {                            // optional: scaffold the look page
//     "slug": "mustard-polka-dot-set",
//     "pieces": [
//       { "label": "Mustard polka dot maxi skirt (Amazon)",
//         "url": "https://www.amazon.com/dp/XXXX" }   // tag added automatically
//     ]
//   }
// }
import { copyFile, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import {
  ASSETS_DIRECTORY,
  DATA_PATH,
  CATEGORIES,
  cleanText,
  categoryFromCaption,
  snippetFromCaption,
  sortPosts,
  titleFromCaption,
  toIsoDate,
  withAffiliateTag,
} from './lib/instagram.mjs';

const specPath = process.argv[2];
if (!specPath) {
  console.error('Usage: node scripts/add-instagram-post.mjs <post.json>');
  process.exit(1);
}

const spec = JSON.parse(await readFile(specPath, 'utf8'));

for (const field of ['code', 'date', 'caption']) {
  if (!spec[field]) throw new Error(`post.json is missing required field "${field}"`);
}
if (!Array.isArray(spec.media) || spec.media.length === 0) {
  throw new Error('post.json needs at least one media entry');
}
if (spec.category && !CATEGORIES.includes(spec.category)) {
  throw new Error(`Unknown category "${spec.category}". One of: ${CATEGORIES.join(', ')}`);
}
for (const [index, item] of spec.media.entries()) {
  if (!item.alt?.trim()) {
    throw new Error(
      `media[${index}] is missing alt text. Describe what's visible: garments, colors, setting (60-160 chars).`,
    );
  }
}

await mkdir(ASSETS_DIRECTORY, { recursive: true });

const caption = cleanText(spec.caption).trim();
const media = [];

for (const [index, item] of spec.media.entries()) {
  const sourceName = item.file ?? (item.url ? new URL(item.url).pathname : `${spec.code}.jpg`);
  const extension = extname(sourceName) || '.jpg';
  const filename = `${spec.code}-${String(index + 1).padStart(2, '0')}${extension}`;
  const destination = join(ASSETS_DIRECTORY, filename);

  if (item.file) {
    await copyFile(resolve(item.file), destination);
  } else if (item.url) {
    const response = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) {
      throw new Error(`Could not download media ${index + 1}: HTTP ${response.status}`);
    }
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  } else {
    // Neither file nor url: the image must already be in src/assets/instagram.
    await access(destination).catch(() => {
      throw new Error(`media[${index}] has no file/url and ${filename} is not in src/assets/instagram`);
    });
  }

  media.push({ src: `/images/instagram/${filename}`, alt: cleanText(item.alt.trim()) });
}

/* -------------------------------------------- optional look page scaffold */
// A "Shop this look" link only goes live when the look page is published:
// linking a draft (or missing) page would ship a dead link, and check-links
// would fail the build. Run this script again after setting draft: false.
let shopHref = null;

if (spec.shop?.slug) {
  const lookPath = join(process.cwd(), 'src', 'content', 'looks', `${spec.shop.slug}.md`);
  const lookExists = await access(lookPath).then(() => true, () => false);

  if (lookExists) {
    const look = await readFile(lookPath, 'utf8');
    if (/^draft:\s*true/m.test(look)) {
      console.log(`Look page is still draft: true, not linking it yet: ${lookPath}`);
    } else {
      shopHref = `/looks/${spec.shop.slug}`;
    }
  }
}

const entry = {
  id: spec.code,
  title: titleFromCaption(caption),
  date: toIsoDate(spec.date),
  category: spec.category ?? categoryFromCaption(caption),
  kind: spec.kind ?? 'post',
  location: cleanText(spec.location ?? '') || null,
  caption,
  snippet: snippetFromCaption(caption),
  instagramUrl: `https://www.instagram.com/styled.by.susanne/p/${spec.code}/`,
  shopHref,
  likes: Number(spec.likes) || 0,
  comments: Number(spec.comments) || 0,
  elements: Array.isArray(spec.elements) ? spec.elements : [],
  media,
};

if (entry.elements.length === 0) {
  console.warn(
    'Warning: no "elements" tags in the spec; the post will sit out the similar-looks module until tagged.',
  );
}

const posts = JSON.parse(await readFile(DATA_PATH, 'utf8'));
const existingIndex = posts.findIndex((post) => post.id === entry.id);
if (existingIndex >= 0) {
  // Keep a hand-set shopHref unless this run supplies one.
  entry.shopHref = entry.shopHref ?? posts[existingIndex].shopHref;
  posts[existingIndex] = entry;
  console.log(`Updated existing post ${entry.id}.`);
} else {
  posts.push(entry);
  console.log(`Added post ${entry.id}.`);
}
sortPosts(posts);
await writeFile(DATA_PATH, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`Catalog now has ${posts.length} posts. Title: ${entry.title}`);

if (spec.shop?.slug) {
  const lookPath = join(process.cwd(), 'src', 'content', 'looks', `${spec.shop.slug}.md`);
  const lookExists = await access(lookPath).then(() => true, () => false);

  if (lookExists) {
    console.log(`Look page already exists, leaving it alone: ${lookPath}`);
  } else {
    const pieces = (spec.shop.pieces ?? []).map((piece) => {
      const lines = [`  - label: ${JSON.stringify(piece.label)}`];
      if (piece.url) lines.push(`    url: ${JSON.stringify(withAffiliateTag(piece.url))}`);
      if (piece.source) lines.push(`    source: ${JSON.stringify(piece.source)}`);
      return lines.join('\n');
    });

    const scaffold = `---
title: ${JSON.stringify(spec.shop.title ?? entry.title)}
date: ${entry.date}
category: ${entry.category}
image: ../../assets/instagram/${media[0].src.split('/').pop()}
imageAlt: ${JSON.stringify(media[0].alt)}
teaser: ${JSON.stringify(spec.shop.teaser ?? 'TODO: one-line hook for cards and the link hub.')}
whyItWorks: ${JSON.stringify(spec.shop.whyItWorks ?? 'TODO: the transferable style principle behind this outfit.')}
pieces:
${pieces.length ? pieces.join('\n') : '  - label: "TODO: exact piece (add url when the affiliate link exists)"'}
similar: []
service:
  label: 'The Occasion Edit'
  href: '/services/style-a-moment'
featured: false
draft: true
---

TODO: two short paragraphs in Susanne's voice. Set draft: false to publish.
`;

    await writeFile(lookPath, scaffold);
    console.log(`Scaffolded look page (draft): ${lookPath}`);
    console.log(
      'Next: fill in the TODOs, set draft: false, then re-run this script to wire up "Shop this look".',
    );
  }
}
