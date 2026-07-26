// Pull affiliate links saved in the /admin portal (Supabase) into
// src/data/affiliate-links.json so they are baked into the static build.
// Look pages hydrate portal links at runtime either way; baking makes them
// part of the crawlable HTML and survives the store being unreachable.
// Usage: npm run sync:affiliates   (commit the JSON afterwards)
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { withAffiliateTag } from './lib/instagram.mjs';

const config = JSON.parse(
  await readFile(join(process.cwd(), 'src', 'data', 'supabase.json'), 'utf8'),
);
const outputPath = join(process.cwd(), 'src', 'data', 'affiliate-links.json');

const response = await fetch(
  `${config.url}/rest/v1/affiliate_links?select=look_slug,piece_index,url,source&order=look_slug,piece_index`,
  { headers: { apikey: config.publishableKey } },
);
if (!response.ok) {
  throw new Error(`Could not fetch affiliate links: HTTP ${response.status}`);
}
const rows = await response.json();

const baked = {};
let retagged = 0;
for (const row of rows) {
  if (!/^https:\/\//.test(row.url)) {
    console.warn(`Skipping non-https link for ${row.look_slug}[${row.piece_index}]`);
    continue;
  }
  const url = withAffiliateTag(row.url);
  if (url !== row.url) retagged++;
  (baked[row.look_slug] ??= {})[row.piece_index] = row.source
    ? { url, source: row.source }
    : { url };
}

await writeFile(outputPath, `${JSON.stringify(baked, null, 2)}\n`);
console.log(
  `Baked ${rows.length} link(s) across ${Object.keys(baked).length} look(s)` +
    (retagged ? ` (${retagged} got the Amazon tag added)` : '') +
    `. Review the diff, then commit src/data/affiliate-links.json.`,
);
