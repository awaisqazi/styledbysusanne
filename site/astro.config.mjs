// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://styledbysusanne.com',
  // No-trailing-slash URLs everywhere: internal links, canonicals, sitemap,
  // and JSON-LD all agree, and GitHub Pages serves /about from about.html.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
});
