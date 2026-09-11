#!/usr/bin/env node
/**
 * Regenerates sitemap.xml and blog/sitemap.xml from the HTML files actually on
 * disk, so the sitemaps can never drift from real content the way they did
 * before this script existed (22 blog URLs duplicated across both files, 21 of
 * those pairs disagreeing on lastmod/changefreq/priority, dates as old as
 * 2025-08-14 while the pages themselves had since changed).
 *
 * This is the static-site equivalent of next-sitemap's `postbuild` hook: run it
 * as the last step of any content change. It is idempotent — running it twice
 * in a row produces byte-identical output, since lastmod comes from git history
 * rather than the current wall-clock time.
 *
 * Usage:
 *   node generate-sitemaps.js         # write sitemap.xml + blog/sitemap.xml
 *   node generate-sitemaps.js --check # exit 1 if the files are out of date (CI)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const SITE = 'https://designit.co.in';

// Pages that exist on disk but must never appear in a sitemap, with why.
// Checked by hand against the live site — see the commit this script shipped in.
const EXCLUDE = new Set([
  '404.html',          // error page
  'project-detail.html', // orphan template, not linked from anywhere, not routed
  'about-designit.html', // 308s to /about/ — a redirect is not a page
  'privacy-policy.html', // noindex, follow — submitting it earns a GSC warning
  'terms.html',          // noindex, follow — same reason
]);

const SKIP_DIRS = new Set(['.git', 'node_modules', '_next', '.vercel', 'scripts']);

// Per-directory defaults. Pages not matched fall through to DEFAULT.
const RULES = [
  { test: (rel) => rel === 'index.html', changefreq: 'weekly', priority: 1.0 },
  { test: (rel) => rel.startsWith('blog/') && rel !== 'blog/index.html', changefreq: 'monthly', priority: 0.8 },
  { test: (rel) => rel === 'blog/index.html', changefreq: 'weekly', priority: 0.9 },
  { test: (rel) => rel.startsWith('projects/'), changefreq: 'monthly', priority: 0.7 },
  { test: (rel) => rel.startsWith('services/') || rel.startsWith('industries/'), changefreq: 'monthly', priority: 0.8 },
  { test: (rel) => rel === 'contact.html' || rel === 'pricing.html', changefreq: 'monthly', priority: 0.9 },
];
const DEFAULT = { changefreq: 'yearly', priority: 0.6 };

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function toUrl(rel) {
  if (rel === 'index.html') return SITE + '/';
  if (rel.endsWith('/index.html')) return SITE + '/' + rel.slice(0, -'index.html'.length);
  return SITE + '/' + rel.slice(0, -'.html'.length) + '/';
}

function gitLastmod(absPath) {
  try {
    const out = execSync(`git log -1 --format=%cI -- ${JSON.stringify(absPath)}`, {
      cwd: ROOT, encoding: 'utf8',
    }).trim();
    if (out) return out.slice(0, 10); // YYYY-MM-DD
  } catch (_) { /* not a git repo, or file untracked */ }
  // Fallback: file mtime. Only hit for files not yet committed.
  const st = fs.statSync(absPath);
  return st.mtime.toISOString().slice(0, 10);
}

function rulesFor(rel) {
  for (const r of RULES) if (r.test(rel)) return r;
  return DEFAULT;
}

function buildXml(entries) {
  const body = entries
    .map(
      (e) =>
        `  <url>\n` +
        `    <loc>${e.url}</loc>\n` +
        `    <lastmod>${e.lastmod}</lastmod>\n` +
        `    <changefreq>${e.changefreq}</changefreq>\n` +
        `    <priority>${e.priority.toFixed(1)}</priority>\n` +
        `  </url>`
    )
    .join('\n');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
  );
}

function main() {
  const check = process.argv.includes('--check');

  const files = walk(ROOT, []).map((abs) => ({
    abs,
    rel: path.relative(ROOT, abs).split(path.sep).join('/'),
  }));

  const entries = [];
  for (const { abs, rel } of files) {
    if (EXCLUDE.has(rel)) continue;
    const rule = rulesFor(rel);
    entries.push({
      url: toUrl(rel),
      rel,
      lastmod: gitLastmod(abs),
      changefreq: rule.changefreq,
      priority: rule.priority,
    });
  }

  entries.sort((a, b) => a.url.localeCompare(b.url));

  const blog = entries.filter((e) => e.rel.startsWith('blog/'));
  const main = entries.filter((e) => !e.rel.startsWith('blog/'));

  const targets = [
    [path.join(ROOT, 'sitemap.xml'), buildXml(main), main.length],
    [path.join(ROOT, 'blog', 'sitemap.xml'), buildXml(blog), blog.length],
  ];

  let dirty = false;
  for (const [file, xml, count] of targets) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current !== xml) {
      dirty = true;
      if (check) {
        console.log(`OUT OF DATE: ${path.relative(ROOT, file)}`);
      } else {
        fs.writeFileSync(file, xml, 'utf8');
        console.log(`✓ ${path.relative(ROOT, file)} (${count} urls)`);
      }
    } else if (!check) {
      console.log(`= ${path.relative(ROOT, file)} (${count} urls, unchanged)`);
    }
  }

  const overlap = main.filter((m) => blog.some((b) => b.url === m.url));
  if (overlap.length) {
    console.error(`ERROR: ${overlap.length} URL(s) would appear in both sitemaps:`);
    overlap.forEach((o) => console.error('  ' + o.url));
    process.exit(1);
  }

  if (check && dirty) {
    console.log('\nRun `node generate-sitemaps.js` to update.');
    process.exit(1);
  }
  if (!check) {
    console.log(`\n${main.length + blog.length} total URLs (${main.length} main + ${blog.length} blog), zero overlap.`);
  }
}

main();
