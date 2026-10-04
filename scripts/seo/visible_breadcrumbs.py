#!/usr/bin/env python3
"""Visible breadcrumbs for hand-written pages (blueprint section 61, backlog SEO-006).

Generated pages already render a visible breadcrumb from the same array as their BreadcrumbList. Hand-written
pages had the JSON-LD only. This script reads each page's own BreadcrumbList, normalises labels to the site's
names (/projects/ is "Work", R-Centric is "R-Centric", matching the nav and the generated parents), writes the
labels back to the JSON-LD, and inserts a matching visible <nav aria-label="Breadcrumb"> at the top of the hero.

Idempotent: the nav sits between <!-- bc:start --> and <!-- bc:end -->, the CSS between /*bc:start*/ and /*bc:end*/.
Usage: python3 scripts/seo/visible_breadcrumbs.py
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://designit.co.in"
RENAME = {"/projects/": "Work", "/projects/rcentric/": "R-Centric"}

# Inserted inside critical CSS so the hero does not shift when stylesheets load.
CSS = ("/*bc:start*/.bc-nav{margin:0 0 20px}.bc-nav ol{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:0;padding:0;"
       "font-size:14px;line-height:1.5;color:#999}.bc-nav.center ol{justify-content:center}.bc-nav li{display:flex;align-items:center;gap:6px}"
       ".bc-nav li+li::before{content:\"/\";color:#555}.bc-nav a{color:#999;text-decoration:underline;text-underline-offset:3px}"
       ".bc-nav a:hover{color:#fff}.bc-nav [aria-current]{color:#ddd}/*bc:end*/")

# (file pattern, regex for the insertion anchor; the nav goes right after the match, centred?)
TEMPLATES = [
    (r"^projects/[^/]+/[^/]+\.html$", r'<section class="pd-hero"[^>]*>\s*(?:<div class="container center hero-padding"[^>]*>\s*)?', True),
    (r"^(about|careers)\.html$", r'<section class="page-hero">\s*<div class="container[^"]*">\s*', True),
    (r"^contact\.html$", r'<div class="contact-info">\s*', False),
    (r"^blog/index\.html$", r'<section class="blog-hero">\s*<div class="container">\s*', True),
    (r"^blog/how-to-choose-a-product-design-agency/index\.html$", r'<section class="geo-hero">\s*<div class="container">\s*', True),
]


def crumbs_and_fix(s):
    """Return (crumbs, updated_html). crumbs = [(name, path)]; JSON-LD names normalised in place."""
    out, pos, crumbs = [], 0, None
    for m in re.finditer(r'(<script type="application/ld\+json">)(.*?)(</script>)', s, re.S):
        try:
            d = json.loads(m.group(2))
        except Exception:
            continue
        changed = False
        for node in (d.get("@graph", [d]) if isinstance(d, dict) else []):
            if node.get("@type") != "BreadcrumbList":
                continue
            items = sorted(node["itemListElement"], key=lambda i: i["position"])
            for it in items:
                path = it.get("item", "").replace(SITE, "") or "/"
                if path in RENAME and it["name"] != RENAME[path]:
                    it["name"] = RENAME[path]
                    changed = True
            crumbs = [(it["name"], it.get("item", "").replace(SITE, "") or "/") for it in items]
        if changed:
            out += [s[pos:m.start(2)], "\n" + json.dumps(d, indent=2, ensure_ascii=False) + "\n"]
            pos = m.end(2)
    out.append(s[pos:])
    return crumbs, "".join(out)


def nav(crumbs, center):
    lis = []
    for i, (name, path) in enumerate(crumbs):
        n = html.escape(name)
        lis.append(f'<li><span aria-current="page">{n}</span></li>' if i == len(crumbs) - 1 else f'<li><a href="{path}">{n}</a></li>')
    cls = "bc-nav center" if center else "bc-nav"
    return f'<!-- bc:start --><nav aria-label="Breadcrumb" class="{cls}"><ol>{"".join(lis)}</ol></nav><!-- bc:end -->\n'


def run():
    done = []
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in ("node_modules", ".git", ".claude", "scripts", "docs", "data", "content")]
        for f in fn:
            rel = os.path.relpath(os.path.join(dp, f), ROOT)
            tpl = next(((a, c) for p, a, c in TEMPLATES if re.match(p, rel)), None)
            if not tpl:
                continue
            path = os.path.join(ROOT, rel)
            s = open(path, encoding="utf-8").read()
            crumbs, s = crumbs_and_fix(s)
            if not crumbs:
                print("no BreadcrumbList:", rel)
                continue
            s = re.sub(r"<!-- bc:start -->.*?<!-- bc:end -->\n?", "", s, flags=re.S)
            anchor = re.search(tpl[0], s)
            if not anchor:
                print("anchor not found:", rel)
                continue
            s = s[:anchor.end()] + nav(crumbs, tpl[1]) + s[anchor.end():]
            s = re.sub(r"/\*bc:start\*/.*?/\*bc:end\*/", "", s, flags=re.S)
            s = s.replace("</style>", CSS + "</style>", 1) if 'id="critical-css"' not in s else \
                re.sub(r'(<style id="critical-css">.*?)(</style>)', lambda m: m.group(1) + CSS + m.group(2), s, count=1, flags=re.S)
            open(path, "w", encoding="utf-8").write(s)
            done.append(rel)
    print(f"breadcrumbs on {len(done)} pages")


if __name__ == "__main__":
    run()
