// Scans rendered dist/ HTML for whitespace-collapse artifacts: the bug where
// Astro collapses the newline between text and an INLINE element, producing
// "to you.Here's" or "links:how that works" in the visible page.
// Block-level adjacency (</p><h2>) is fine and ignored.
// Usage: node scripts/check-text.mjs  (after `npm run build`)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');
const INLINE = 'a|em|strong|span|i|b|small|cite';

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const CHECKS = [
  {
    // punctuation glued to an opening inline tag: "you.<a>Here"
    re: new RegExp(`[a-z][.!?:;,]<(?:${INLINE})(?:\\s[^>]*)?>[A-Za-z“”"']`, 'g'),
    name: 'punct→inline-tag collapse',
  },
  {
    // closing inline tag glued to a following word: "</a>Here"
    re: new RegExp(`</(?:${INLINE})>[A-Za-z]`, 'g'),
    name: 'inline-tag→word collapse',
  },
];

// inside a single text node: "familiar,you're" / "works.Here"
const TEXT_NODE_RE = />([^<>]+)</g;
const IN_TEXT = [
  { re: /[a-z][.!?][A-Z][a-z]/g, name: 'sentence collapse in text' },
  { re: /[a-z][,;:][A-Za-z][a-z]{2}/g, name: 'punct collapse in text' },
];

const hits = [];
for (const file of htmlFiles(DIST)) {
  const page = path.relative(DIST, file);
  let html = readFileSync(file, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  for (const { re, name } of CHECKS) {
    for (const m of html.matchAll(re)) {
      const ctx = html
        .slice(Math.max(0, m.index - 50), m.index + 60)
        .replace(/\s+/g, ' ');
      hits.push(`${page} [${name}]: …${ctx}…`);
    }
  }

  for (const tn of html.matchAll(TEXT_NODE_RE)) {
    const text = tn[1];
    if (!/[A-Za-z]/.test(text)) continue;
    for (const { re, name } of IN_TEXT) {
      for (const m of text.matchAll(re)) {
        const ctx = text
          .slice(Math.max(0, m.index - 40), m.index + 44)
          .replace(/\s+/g, ' ')
          .trim();
        hits.push(`${page} [${name}]: …${ctx}…`);
      }
    }
  }
}

const unique = [...new Set(hits)];
if (unique.length) {
  console.log(`✗ ${unique.length} possible collapse artifact(s):`);
  for (const h of unique) console.log('  ' + h);
  process.exit(1);
} else {
  console.log('✓ no whitespace-collapse artifacts found');
}
