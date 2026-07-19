import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Shop the Look pages. The markdown body is Susanne's story in her own
 * voice; structured commerce data lives in frontmatter so product links
 * can be maintained centrally and swapped when items sell out.
 */
const looks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/looks' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      category: z.enum([
        'office',
        'travel',
        'occasion',
        'color-and-accessories',
        'seasonal',
        'everyday',
      ]),
      image: image(),
      imageAlt: z.string(),
      /** One-line hook for cards and link hub. */
      teaser: z.string(),
      /** The transferable style principle: "why this works". */
      whyItWorks: z.string(),
      /**
       * Exact pieces. Leave `url` off until the affiliate link is added,
       * the page renders "link coming soon" rather than a dead link.
       */
      pieces: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url().optional(),
            source: z.string().optional(),
          }),
        )
        .default([]),
      /** Similar alternatives at other price points. */
      similar: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url().optional(),
            note: z.string().optional(),
          }),
        )
        .default([]),
      /** Related service CTA ("Make it yours"). */
      service: z
        .object({
          label: z.string(),
          href: z.string(),
          blurb: z.string().optional(),
        })
        .optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

/** Style Notes: short editorial posts teaching one principle each. */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Client stories. Ships empty of published entries until real client
 * quotes exist (collected with written permission), pages handle the
 * empty state gracefully. Never publish invented testimonials.
 */
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    client: z.string(),
    situation: z.string(),
    result: z.string(),
    quote: z.string(),
    service: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { looks, notes, stories };
