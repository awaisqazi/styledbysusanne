# Styled by Susanne — Website

Service-first personal-styling studio site with a shoppable editorial layer,
built with [Astro](https://astro.build). Strategy lives in
[`../WEBSITE_STRATEGY_PLAN.md`](../WEBSITE_STRATEGY_PLAN.md).

## Commands

Run from this `site/` directory:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Dev server at `localhost:4321`                |
| `npm run build`   | Production build to `./dist/`                |
| `npm run preview` | Preview the production build locally         |

One-time asset scripts (already run; re-run only if inputs change):

- `node scripts/prep-photos.mjs` — crops research screenshots into `src/assets/photos/`
- `node scripts/make-og-image.mjs` — regenerates `public/og-default.jpg`

## Adding a new Instagram post (the everyday path)

1. Write a small spec file (see the header comment in
   `scripts/add-instagram-post.mjs` for the full shape): post code, date,
   caption, likes/comments, and one entry per photo with real `alt` text
   describing what's visible (garments, colors, setting; 60–160 chars).
   Photos can be given as a CDN `url`, a local `file`, or pre-placed in
   `src/assets/instagram/` as `<code>-01.jpg`.
2. `npm run post:add <spec.json>` — downloads media, computes
   title/snippet/category (override `category` in the spec when the guess
   is wrong), and inserts the post into `src/data/instagram-posts.json`.
3. Optional "Shop this look": add `"shop": { "slug": "my-look" }` to the
   spec. The first run scaffolds `src/content/looks/my-look.md` as a draft;
   fill in the TODOs and affiliate links, set `draft: false`, then re-run
   the same command — the post's shop link goes live only once the page is
   publishable, so a dead link can never ship.
4. `npm run qa` — builds and verifies links, text, and affiliate hygiene.

The newest post with a `shopHref` automatically leads /looks as the
featured edit.

## Full re-import (rare)

`npm run import:instagram <browser-catalog.json>` re-imports a captured
post catalog: images land in `src/assets/instagram/` and post data in
`src/data/instagram-posts.json`. Hand-set `shopHref` values survive the
re-import. Afterwards, hand-review the JSON: the importer flattens
em-dashes crudely (site rule: none anywhere), and every `media[].alt`
should be rewritten to describe what's actually visible.

## Where things live

- **Contact info, booking-form URL, nav, announcement bar** → `src/lib/site.ts`.
  One file to update when the phone/email/form/domain changes.
- **Services + pricing** → `src/data/services.ts` (three families + the
  seven-step Susanne Standard). Prices shown on the site come from here only.
- **FAQ** → `src/data/faq.ts`
- **Design tokens** (colors, type, spacing) → `src/styles/global.css`
- **Shoppable looks** → `src/content/looks/*.md` (see below)
- **Style notes (blog)** → `src/content/notes/*.md`
- **Client stories** → `src/content/stories/` (template included; entries stay
  `draft: true` until written permission is on file)

## How to add a new shoppable look

1. Add the photo to `src/assets/photos/` (portrait, ~1200px wide is plenty).
2. Copy any file in `src/content/looks/`, rename it (the filename becomes the
   URL), and update the frontmatter: title, date, category (`office`, `travel`,
   `occasion`, `color-and-accessories`, `seasonal`, `everyday`), image path,
   teaser, `whyItWorks`, pieces, and the related-service CTA.
3. Product links: give each piece a descriptive `label` ("Cream balloon-hem
   pants — Amazon"). Add `url` only when you have the affiliate link — items
   without a `url` display "shoppable link coming soon" instead of a dead link.
4. Write the story (the markdown body) in Susanne's voice — short, warm, one
   real moment.
5. `featured: true` on at most one look controls the homepage feature.

## Before launch checklist

- [ ] Point the `styledbysusanne.com` DNS at the host and confirm `site` in
      `astro.config.mjs` matches the final domain.
- [ ] Replace provisional imagery (currently cropped from Instagram
      screenshots) with the professional shoot from the strategy plan's
      photography list.
- [ ] Fill in real affiliate `url`s on look pages (Amazon / Mavely). Keep the
      Amazon Associates tag `susannefari09-20` on Amazon links; existing
      Mavely deep links can be reused as-is (see `../LINKTREE_AUDIT.md`).
- [ ] Connect an email provider and set `EMAIL_SIGNUP_ACTION` in
      `src/lib/site.ts` (the signup forms activate automatically).
- [ ] Have an attorney review the three `/policies` drafts.
- [ ] Add analytics (GA4/pixel) with consent controls — deliberately not
      installed yet.
- [ ] Update the Instagram bio link to `styledbysusanne.com/links` (keep
      Linktree live during transition).

## Deploying

Static output — any static host works (Netlify, Vercel, Cloudflare Pages).
Build command `npm run build`, output directory `dist/`, root directory `site/`.
