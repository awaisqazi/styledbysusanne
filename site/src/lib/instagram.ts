import type { ImageMetadata } from 'astro';
import instagramCatalog from '../data/instagram-posts.json';
import type { LookCategory } from './looks';

export interface InstagramMedia {
  src: string;
  alt: string;
}

export interface InstagramPost {
  id: string;
  title: string;
  date: string;
  category: LookCategory;
  kind: 'post' | 'reel';
  location: string | null;
  caption: string;
  snippet: string;
  instagramUrl: string;
  shopHref: string | null;
  likes: number;
  comments: number;
  /** Image-recognition tags of what's visible; powers the similar-looks module. */
  elements: string[];
  media: InstagramMedia[];
}

/** The full catalog, newest first (as stored). */
export const instagramPosts = instagramCatalog as InstagramPost[];

/**
 * Catalog images live in src/assets/instagram so they flow through Astro's
 * image pipeline (responsive srcset + modern formats). JSON `src` values are
 * matched by filename, so the stored path prefix doesn't matter.
 */
const catalogImages = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/instagram/*.{jpg,jpeg,png,webp}',
  { eager: true },
);
const imagesByName = new Map(
  Object.entries(catalogImages).map(([path, module]) => [path.split('/').pop()!, module.default]),
);

export const resolveInstagramImage = (src: string): ImageMetadata => {
  const name = src.split('/').pop()!;
  const image = imagesByName.get(name);
  if (!image) throw new Error(`Instagram catalog image not found in src/assets/instagram: ${name}`);
  return image;
};

/** Color tags carry less matching weight than garment/accessory tags. */
const COLOR_TAGS = new Set([
  'white', 'cream', 'tan', 'brown', 'black', 'navy', 'blue', 'light-blue',
  'green', 'sage', 'olive', 'red', 'pink', 'hot-pink', 'blush', 'purple',
  'lavender', 'yellow', 'mustard', 'orange', 'taupe', 'gold', 'multicolor',
  'pastel', 'neutrals',
]);

export interface SimilarPost {
  post: InstagramPost;
  /** Shared elements, strongest (non-color) first. */
  shared: string[];
  score: number;
}

/**
 * Posts that share visible elements with the given post: +2 per shared
 * garment/accessory/pattern, +1 per shared color, minimum score 4 so a
 * single coincidental color never counts as "similar".
 */
export function similarToPost(source: InstagramPost, limit = 3): SimilarPost[] {
  if (!source.elements?.length) return [];
  const sourceElements = new Set(source.elements);
  return instagramPosts
    .filter((post) => post.id !== source.id && post.elements?.length > 0)
    .map((post) => {
      const shared = post.elements
        .filter((tag) => sourceElements.has(tag))
        .sort((a, b) => Number(COLOR_TAGS.has(a)) - Number(COLOR_TAGS.has(b)))
        // "waist-scarf" implies "scarf"; keep the specific tag for display.
        .filter((tag, _, all) => !(tag === 'scarf' && all.some((t) => t.endsWith('-scarf'))));
      const score = shared.reduce((total, tag) => total + (COLOR_TAGS.has(tag) ? 1 : 2), 0);
      return { post, shared, score };
    })
    .filter(({ score }) => score >= 4)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit);
}

/** The catalog post a Shop-this-Look page came from, if any. */
export function postForLook(lookSlug: string): InstagramPost | undefined {
  return instagramPosts.find((post) => post.shopHref === `/looks/${lookSlug}`);
}

/** Human label for an element tag: "waist-scarf" → "waist scarf". */
export const elementLabel = (tag: string) => tag.replaceAll('-', ' ');
