// Static link integrity check over dist/: verifies every internal href/src
// resolves to a built file, and every in-page anchor target exists.
// Usage: node scripts/check-links.mjs  (run after `npm run build`)
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const problems = [];
let checked = 0;

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  const page = path.relative(DIST, file);

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);

  for (const ref of refs) {
    checked++;
    if (/^(https?:|mailto:|tel:|data:|#$)/.test(ref)) continue;

    if (ref.startsWith('#')) {
      if (!ids.has(ref.slice(1))) {
        problems.push(`${page}: missing in-page anchor ${ref}`);
      }
      continue;
    }

    const [clean, anchor] = ref.split('#');
    const target = clean.split('?')[0].replace(/\/$/, '');
    const candidates = [
      path.join(DIST, target),
      path.join(DIST, target, 'index.html'),
      path.join(DIST, `${target}.html`),
    ];
    const hit = candidates.find((c) => existsSync(c) && statSync(c).isFile());
    if (!hit) {
      problems.push(`${page}: broken internal link ${ref}`);
      continue;
    }
    if (anchor && hit.endsWith('.html')) {
      const targetHtml = readFileSync(hit, 'utf8');
      if (!new RegExp(`\\sid="${anchor}"`).test(targetHtml)) {
        problems.push(`${page}: link ${ref} → anchor #${anchor} not found in target`);
      }
    }
  }
}

if (problems.length) {
  console.log(`✗ ${problems.length} problem(s) in ${checked} refs:`);
  for (const p of [...new Set(problems)]) console.log('  ' + p);
  process.exit(1);
} else {
  console.log(`✓ all ${checked} internal refs resolve`);
}
