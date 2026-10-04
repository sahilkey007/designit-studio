#!/usr/bin/env python3
"""Site quality gate (blueprint sections 73, 81, 95, 107). Run before asking to deploy.
Checks every served HTML page. Exit code 1 on any failure.  Usage: python3 scripts/seo/quality_gate.py"""
import collections, html, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://designit.co.in"
SKIP = {"node_modules", ".git", "scripts", "docs", "_next", "data", "content"}
REDIRECTED = {"about-designit.html", "project-detail.html"}  # vercel.json redirects these
BANNED = [r"Deloitte", r"Phenomenon Studio", r"Skins Factory", r"45%[^.]{0,60}onboarding", r"60%[^.]{0,50}support ticket",
          r"3x[^.]{0,50}qualified lead", r"100% (?:client )?retention", r"40%[^.]{0,50}onboarding time", r"2x[^.]{0,30}feature adoption",
          r"60%[^.]{0,40}cognitive", r"4x[^.]{0,50}documentation", r"30%[^.]{0,40}driver distraction", r"founded in 20(19|20)",
          r"TODO\(owner\)", r">\s*undefined\s*<", r"Lorem ipsum", r"Trusted by 20\+"]
def url_for(rel):
    if rel == "index.html": return "/"
    if rel.endswith("/index.html"): return "/" + rel[:-10]
    return "/" + rel[:-5] + "/"
def text(s):
    s = re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.S)
    s = re.sub(r"</?(a|strong|em|b|i|span|code|abbr)\b[^>]*>", "", s)   # inline tags render without a gap
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))
fails = collections.defaultdict(list); titles = collections.defaultdict(list); descs = collections.defaultdict(list); n = 0
for root, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for f in files:
        if not f.endswith(".html"): continue
        rel = os.path.relpath(os.path.join(root, f), ROOT)
        if rel in REDIRECTED: continue
        s = open(os.path.join(root, f), encoding="utf-8").read(); n += 1
        u = url_for(rel); head = s.split("</head>")[0]
        robots = (re.search(r'name="robots" content="([^"]*)"', head) or [None, ""])[1]
        indexable = "noindex" not in robots.lower() and rel != "404.html"
        h1 = len(re.findall(r"<h1[\s>]", s))
        if h1 != 1: fails["h1 count != 1"].append(f"{u} ({h1})")
        t = html.unescape((re.search(r"<title>(.*?)</title>", head, re.S) or [None, ""])[1]).strip()
        d = html.unescape((re.search(r'name="description" content="([^"]*)"', head) or [None, ""])[1])
        vis = text(s)
        for b in BANNED:
            if re.search(b, s if "TODO" in b or "undefined" in b else vis, re.I): fails["banned claim/placeholder"].append(f"{u}: {b}")
        if not indexable: continue
        titles[t].append(u); descs[d].append(u)
        if len(t) > 60: fails["title > 60"].append(f"{u} ({len(t)})")
        if not 110 <= len(d) <= 160: fails["description outside 110-160"].append(f"{u} ({len(d)})")
        can = re.findall(r'rel="canonical" href="([^"]*)"', head)
        if can != [SITE + u]: fails["canonical not self"].append(f"{u} {can}")
        for tag in ('property="og:title"', 'property="og:description"', 'property="og:image"', 'property="og:url"', 'property="og:type"',
                    'name="twitter:card"', 'name="twitter:title"', 'name="twitter:description"', 'name="twitter:image"'):
            if tag not in head: fails["missing " + tag.split('"')[1]].append(u)
        if 'name="robots"' not in head: fails["missing meta robots"].append(u)
        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
            try: data = json.loads(m.group(1))
            except Exception as e: fails["json-ld parse"].append(u); continue
            for node in (data.get("@graph", [data]) if isinstance(data, dict) else []):
                if node.get("@type") == "FAQPage":
                    for q in node.get("mainEntity", []):
                        a = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", q["acceptedAnswer"]["text"]))).strip()
                        if a not in vis: fails["FAQ schema answer not visible"].append(f"{u}: {q['name'][:50]}")
        for img in re.findall(r"<img\b[^>]*>", s):
            if " alt=" not in img: fails["img without alt"].append(u)
            if not (" width=" in img and " height=" in img):
                src = re.search(r'src="([^"]*)', img)
                fails["img without width/height"].append(u + " " + (src.group(1)[-40:] if src else ""))
for t, us in titles.items():
    if len(us) > 1: fails["duplicate title"].append(f"{t[:50]} -> {us}")
for d, us in descs.items():
    if len(us) > 1: fails["duplicate description"].append(f"{d[:50]} -> {us}")
print(f"pages checked: {n}")
for k, v in sorted(fails.items()):
    print(f"FAIL {k}: {len(v)}"); [print("   ", x) for x in sorted(set(v))[:12]]
print("ALL CHECKS PASS" if not fails else "GATE FAILED"); sys.exit(1 if fails else 0)
