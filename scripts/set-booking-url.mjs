#!/usr/bin/env node
// Single source of truth for the booking link: site.config.json -> bookingUrl.
// Usage:
//   node scripts/set-booking-url.mjs --check   report only (exit 1 if any page differs)
//   node scripts/set-booking-url.mjs           rewrite every booking link to bookingUrl
// Booking links are calendly.com/<handle>/<event> (two path segments);
// calendly.com/privacy and other one-segment URLs are left alone.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { bookingUrl } = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));
if (!/^https:\/\/calendly\.com\/[^/\s"]+\/[^/\s"]+$/.test(bookingUrl)) {
  console.error(`site.config.json bookingUrl is not a calendly.com/<handle>/<event> URL: ${bookingUrl}`);
  process.exit(2);
}
const check = process.argv.includes('--check');
const BOOKING = /https:\/\/calendly\.com\/(?!privacy\b)[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g;
const SKIP = new Set(['node_modules', '_next', '.git', '.claude', 'docs']);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (extname(name) === '.html' || name === 'generate-blog.js') yield p;
  }
}

let total = 0, stale = 0, files = 0;
for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8');
  let out = src, n = 0;
  out = src.replace(BOOKING, (m) => { n++; if (m !== bookingUrl) stale++; return bookingUrl; });
  if (!n) continue;
  total += n; files++;
  if (!check && out !== src) writeFileSync(file, out);
}
console.log(`${total} booking links in ${files} files; ${stale} ${check ? 'differ from' : 'rewritten to'} ${bookingUrl}`);
process.exit(check && stale ? 1 : 0);
