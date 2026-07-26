// Affiliate-link hygiene check over dist/: every Amazon link must carry the
// Associates tag, every outbound shop link must be https and rel-attributed
// so commissions and SEO both survive.
// Usage: node scripts/check-affiliates.mjs  (run after `npm run build`)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { AMAZON_ASSOCIATES_TAG } from './lib/instagram.mjs';

const DIST = path.resolve(import.meta.dirname, '../dist');

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const problems = [];
let shopLinks = 0;

for (const file of htmlFiles(DIST)) {
  const page = path.relative(DIST, file);
  const html = readFileSync(file, 'utf8');

  for (const anchor of html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>/g)) {
    const [tag, href] = anchor;
    if (!/^https?:/.test(href)) continue;

    const url = new URL(href);
    const isAmazon = /(^|\.)amazon\.[a-z.]+$/.test(url.hostname);
    const isShortAmazon = url.hostname === 'amzn.to';
    const isMavely = /(^|\.)mavely|shop\.mave/.test(url.hostname);
    if (!isAmazon && !isShortAmazon && !isMavely) continue;

    shopLinks++;
    if (url.protocol !== 'https:') {
      problems.push(`${page}: shop link is not https: ${href}`);
    }
    if (isAmazon && url.searchParams.get('tag') !== AMAZON_ASSOCIATES_TAG) {
      problems.push(`${page}: Amazon link missing tag=${AMAZON_ASSOCIATES_TAG}: ${href}`);
    }
    if (!/rel="[^"]*sponsored[^"]*"/.test(tag)) {
      problems.push(`${page}: shop link missing rel="sponsored": ${href}`);
    }
  }
}

if (problems.length) {
  console.log(`✗ ${problems.length} affiliate problem(s):`);
  for (const p of [...new Set(problems)]) console.log('  ' + p);
  process.exit(1);
} else {
  console.log(`✓ all ${shopLinks} affiliate/shop links carry the tag and rel attributes`);
}
