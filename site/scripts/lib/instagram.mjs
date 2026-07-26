// Shared helpers for the Instagram catalog scripts
// (import-instagram-catalog.mjs and add-instagram-post.mjs).
import { join } from 'node:path';

export const ASSETS_DIRECTORY = join(process.cwd(), 'src', 'assets', 'instagram');
export const DATA_PATH = join(process.cwd(), 'src', 'data', 'instagram-posts.json');
export const AMAZON_ASSOCIATES_TAG = 'susannefari09-20';

/**
 * Instagram occasionally exposes a lone UTF-16 surrogate in an emoji.
 * Site rule: no em-dashes anywhere in catalog text. Imports normalize them to
 * a comma (crude, but a human reviews and rewords after each import).
 */
export const cleanText = (value = '') =>
  value
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�')
    .replace(/\s*—\s*/g, ', ');

export const truncate = (value, length) => {
  const characters = Array.from(value);
  return characters.length > length
    ? `${characters.slice(0, length - 1).join('').trimEnd()}…`
    : value;
};

export const toIsoDate = (value) => {
  // Already ISO (YYYY-MM-DD): keep as-is.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(`${value} 12:00:00 UTC`);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Could not parse date: ${value}`);
  return parsed.toISOString().slice(0, 10);
};

export const titleFromCaption = (caption) => {
  const firstLine = caption.split(/\n+/).find((line) => line.trim())?.trim() ?? 'A look from Susanne';
  return truncate(firstLine, 88);
};

export const snippetFromCaption = (caption) => {
  const withoutSignoff = caption
    .replace(/\n+Xo,?\s*\n+Sus[\s\S]*$/i, '')
    .replace(/\n+🔗[^\n]*/g, '')
    .replace(/\n+#.*$/s, '')
    .trim();
  const paragraphs = withoutSignoff.split(/\n{2,}/).filter(Boolean);
  const snippet = paragraphs.slice(0, 2).join(' ');
  return truncate(snippet, 260);
};

export const categoryFromCaption = (caption) => {
  const text = caption.toLowerCase();
  if (/vacation|travel|airport|turks|conference|packing|out of office/.test(text)) return 'travel';
  if (/office|workwear|work outfit|in-office|company color|corporate/.test(text)) return 'office';
  if (/easter|fourth of july|pride|birthday|anniversary|concert|cubs game|celebrat|date night/.test(text)) {
    return 'occasion';
  }
  if (/spring|summer|holiday/.test(text)) return 'seasonal';
  if (/scarf|monochrome|color therapy|accessor/.test(text)) return 'color-and-accessories';
  return 'everyday';
};

export const CATEGORIES = [
  'office',
  'travel',
  'occasion',
  'color-and-accessories',
  'seasonal',
  'everyday',
];

/** Newest first; ties broken by id so output is deterministic. */
export const sortPosts = (posts) =>
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

/**
 * Ensure an amazon.com product URL carries the Associates tag. Short amzn.to
 * links are returned unchanged (the tag is baked into them when created).
 */
export const withAffiliateTag = (url) => {
  const parsed = new URL(url);
  if (!/(^|\.)amazon\.[a-z.]+$/.test(parsed.hostname)) return url;
  if (parsed.searchParams.get('tag') === AMAZON_ASSOCIATES_TAG) return url;
  parsed.searchParams.set('tag', AMAZON_ASSOCIATES_TAG);
  return parsed.toString();
};
