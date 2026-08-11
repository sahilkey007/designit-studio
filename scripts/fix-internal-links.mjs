#!/usr/bin/env node
/**
 * Rewrites internal hrefs that point at .html paths so they match the URL the
 * server actually serves. vercel.json sets cleanUrls + trailingSlash, so every
 * `/about.html` link costs a 308 hop before the page is reached.
 *
 * Run with --dry to preview counts without writing.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not .pathname — the repo path contains spaces.
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DRY = process.argv.includes("--dry");

function htmlFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === "_next") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, acc);
    else if (entry.endsWith(".html")) acc.push(full);
  }
  return acc;
}

// `/foo/index.html` -> `/foo/`, `/index.html` -> `/`, `/foo.html` -> `/foo/`
function canonicalise(path) {
  if (path === "/index.html") return "/";
  if (path.endsWith("/index.html")) return path.slice(0, -"index.html".length);
  return path.replace(/\.html$/, "/");
}

const files = htmlFiles(ROOT);
let totalLinks = 0;
let touchedFiles = 0;
const perTarget = new Map();

for (const file of files) {
  const before = readFileSync(file, "utf8");
  let count = 0;

  // Only internal, root-relative links. Leaves external URLs and anchors alone.
  let after = before.replace(/href="(\/[^"#?]*\.html)"/g, (_m, path) => {
    const next = canonicalise(path);
    count++;
    perTarget.set(path, (perTarget.get(path) ?? 0) + 1);
    return `href="${next}"`;
  });

  // Second pass: trailingSlash is on, so a slash-less directory link is also a
  // 308. Skip the root and anything that looks like a real asset.
  after = after.replace(/href="(\/[^"#?]*)"/g, (m, path) => {
    if (path === "/" || path.endsWith("/")) return m;
    if (/\.[a-z0-9]{2,5}$/i.test(path)) return m; // .css, .xml, .png …
    count++;
    perTarget.set(path, (perTarget.get(path) ?? 0) + 1);
    return `href="${path}/"`;
  });

  if (count > 0) {
    totalLinks += count;
    touchedFiles++;
    if (!DRY) writeFileSync(file, after, "utf8");
  }
}

const top = [...perTarget.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log(`${DRY ? "[dry run] " : ""}rewrote ${totalLinks} links across ${touchedFiles} files`);
console.log("\nmost-rewritten targets:");
for (const [path, n] of top) {
  console.log(`  ${String(n).padStart(4)}  ${path}  ->  ${canonicalise(path)}`);
}
