import { getCollection, type CollectionEntry } from 'astro:content';

/** Display labels for look categories (plan: Shop the Looks sub-nav). */
export const LOOK_CATEGORIES = {
  office: 'Office',
  travel: 'Travel',
  occasion: 'Occasion',
  'color-and-accessories': 'Color & Accessories',
  seasonal: 'Seasonal Edits',
  everyday: 'Everyday',
} as const;

export type LookCategory = keyof typeof LOOK_CATEGORIES;

/** Published looks, newest first. */
export async function getPublishedLooks(): Promise<CollectionEntry<'looks'>[]> {
  const looks = await getCollection('looks', ({ data }) => !data.draft);
  return looks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
