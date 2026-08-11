#!/usr/bin/env node
/**
 * Pre-deploy check. Verifies that every internal link resolves to a real file,
 * that none of them cost a redirect hop, and that all JSON-LD parses.
 *
 * Vercel's cleanUrls serves BOTH `foo.html` and `foo/index.html` at `/foo/`,
 * so both layouts count as valid targets.
 *
 * Exits non-zero on failure so it can gate a deploy.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SKIP = new Set(["node_modules", ".git", "_next", "scripts"]);
const ASSET = /\.(css|js|xml|txt|svg|png|jpe?g|webp|ico|pdf|json|avif|gif|woff2?)$/i;

function htmlFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, acc);
    else if (entry.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const files = htmlFiles(ROOT);
const broken = new Map();
const hops = new Map();
let jsonldBlocks = 0;
const jsonldFails = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const rel = file.slice(ROOT.length);

  for (const [, block] of src.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    jsonldBlocks++;
    try {
      JSON.parse(block.trim());
    } catch (err) {
      jsonldFails.push(`${rel}: ${err.message}`);
    }
  }

  for (const [, href] of src.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (ASSET.test(href)) continue;
    const bare = href.replace(/^\//, "").replace(/\/$/, "");
    const resolves =
      href === "/"
        ? existsSync(join(ROOT, "index.html"))
        : existsSync(join(ROOT, `${bare}.html`)) ||
          existsSync(join(ROOT, bare, "index.html"));

    if (!resolves) broken.set(href, (broken.get(href) ?? 0) + 1);
    // trailingSlash is on, so a slash-less directory link costs a 308
    else if (href !== "/" && !href.endsWith("/")) hops.set(href, (hops.get(href) ?? 0) + 1);
  }
}

const report = (label, map) => {
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  console.log(`${label}: ${total}`);
  for (const [k, n] of [...map].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`    ${String(n).padStart(4)}  ${k}`);
  }
};

console.log(`pages scanned         : ${files.length}`);
console.log(`json-ld blocks        : ${jsonldBlocks}`);
console.log(`json-ld parse failures: ${jsonldFails.length}`);
jsonldFails.forEach((f) => console.log(`    ${f}`));
report("broken internal links ", broken);
report("links costing a 308   ", hops);

const failed = broken.size > 0 || hops.size > 0 || jsonldFails.length > 0;
console.log(failed ? "\nFAIL" : "\nPASS — safe to deploy");
process.exit(failed ? 1 : 0);
