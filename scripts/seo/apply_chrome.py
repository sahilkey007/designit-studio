#!/usr/bin/env python3
"""Apply the shared site chrome (mega-menu header, IA footer, nav CSS, main.js version) to every page.
Idempotent: re-running replaces the previous chrome. Pages with their own legacy layouts are reported, not
touched; generated pages get the chrome from build_pages.py instead.  Usage: python3 scripts/seo/apply_chrome.py"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = os.path.join(ROOT, "scripts", "seo", "components")
NAV = open(os.path.join(C, "nav.html"), encoding="utf-8").read().rstrip("\n")
FOOT = open(os.path.join(C, "footer.html"), encoding="utf-8").read().rstrip("\n")
CSS = "/*chrome:start*/" + open(os.path.join(C, "nav.min.css"), encoding="utf-8").read() + "/*chrome:end*/"
MAINJS = "main.js?v=5"
SKIP_DIRS = {"node_modules", ".git", "scripts", "docs", "_next", "data", "content"}

def section(rel):
    u = "/" + rel
    for key, pref in (("services", "/services/"), ("industries", "/industries/"), ("solutions", "/solutions/"),
                      ("work", "/projects"), ("insights", "/blog/"), ("about", "/about")):
        if u.startswith(pref): return key
    return None

def nav_for(rel):
    sec = section(rel)
    if not sec: return NAV
    return NAV.replace(f'class="nav-top" data-nav="{sec}"', f'class="nav-top active" data-nav="{sec}" aria-current="true"')

def apply(s, rel):
    changed = []
    nav_re = re.compile(r'[ \t]*<nav class="nav-links" id="navLinks"[^>]*>.*?</nav>\s*<a [^>]*class="btn btn-primary btn-sm nav-cta"[^>]*>.*?</a>', re.S)
    if nav_re.search(s):
        s = nav_re.sub(lambda m: nav_for(rel), s, count=1); changed.append("nav")
    foot_re = re.compile(r'[ \t]*<footer class="footer">.*?</footer>', re.S)
    if foot_re.search(s):
        s = foot_re.sub(lambda m: FOOT, s, count=1); changed.append("footer")
    if "nav" in changed:
        s = re.sub(r"/\*chrome:start\*/.*?/\*chrome:end\*/", "", s, flags=re.S)
        m = re.search(r'<style id="critical-css">(.*?)</style>', s, re.S)
        if m:
            s = s[: m.end(1)] + CSS + s[m.end(1):]
        else:
            s = re.sub(r'<style id="chrome-css"></style>\n?', "", s)
            s = s.replace("</head>", f'<style id="chrome-css">{CSS}</style>\n</head>', 1)
        changed.append("css")
    n = len(re.findall(r"main\.js\?v=\d+", s))
    s = re.sub(r"main\.js\?v=\d+", MAINJS, s)
    if n: changed.append("mainjs")
    return s, changed

if __name__ == "__main__":
    only = sys.argv[1:]
    report = {"updated": 0, "legacy": []}
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if not f.endswith(".html"): continue
            p = os.path.join(root, f); rel = os.path.relpath(p, ROOT)
            if only and rel not in only: continue
            s = open(p, encoding="utf-8").read()
            if "<!-- generated: build_pages.py -->" in s: continue
            s2, ch = apply(s, rel)
            if "nav" not in ch and rel != "about-designit.html": report["legacy"].append(rel)
            if s2 != s:
                open(p, "w", encoding="utf-8").write(s2); report["updated"] += 1
    print("updated", report["updated"], "| legacy layouts (not touched):", report["legacy"])
