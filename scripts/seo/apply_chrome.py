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
MAINJS = "main.js?v=6"
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

# ---- legacy layouts: same top-level IA, rendered with each page's own link styling ----
LEGACY_TOP = [("/services/", "Services"), ("/industries/", "Industries"), ("/solutions/", "Solutions"),
              ("/projects/", "Work"), ("/blog/", "Insights"), ("/about/", "About")]
LEGACY_SERVICES = [("/services/product-design/", "Product Design"), ("/services/saas-product-design/", "SaaS Product Design"),
                   ("/services/ux-audit/", "UX Audit"), ("/services/ux-research/", "UX Research"),
                   ("/services/design-systems/", "Design Systems"), ("/services/ai-product-design/", "AI Product Design")]
LEGACY_COMPANY = [("/about/", "About"), ("/projects/", "Work"), ("/blog/", "Insights"), ("/industries/", "Industries"),
                  ("/careers/", "Careers"), ("/contact/", "Contact")]

def _relink(block, links, first_tag_re=r'<a href="[^"]*"([^>]*)>'):
    """Rebuild a run of <a> tags, reusing the attributes (inline styles, hover handlers) of the first one."""
    m = re.search(first_tag_re, block)
    attrs = m.group(1) if m else ""
    attrs = re.sub(r'\s*class="active"', "", attrs)
    return "".join(f'<a href="{h}"{attrs}>{t}</a>' for h, t in links)

def apply_legacy(s, rel):
    out = s
    # old blog template (dz-header)
    m = re.search(r'(<nav class="dz-nav"[^>]*>)(.*?)(</nav>)', out, re.S)
    if m:
        out = out[: m.start(2)] + _relink(m.group(2), LEGACY_TOP) + out[m.end(2):]
        out = re.sub(r'<a href="[^"]*"( class="dz-cta"[^>]*)>[^<]*</a>', r'<a href="/start-a-project/"\1>Start a Project</a>', out, count=1)
        # footer columns: Services + Company link runs following their <h4>
        def col(name, links):
            nonlocal out
            fm = re.search(r'(<h4[^>]*>' + name + r'</h4>\s*)((?:<a [^>]*>[^<]*</a>\s*)+)', out)
            if fm: out = out[: fm.start(2)] + _relink(fm.group(2), links) + "\n      " + out[fm.end(2):]
        col("Services", LEGACY_SERVICES); col("Company", LEGACY_COMPANY)
    # homepage-revamp style header (.header > .container > nav.nav-links)
    m = re.search(r'(<header class="header" id="header">.*?<nav class="nav-links" id="navLinks"[^>]*>)(.*?)(</nav>\s*)<a href="[^"]*" class="btn btn-primary btn-sm">[^<]*</a>', out, re.S)
    if m:
        active = ' class="active"'
        links = "".join("\n                " + f'<a href="{h}"{active if t == "Work" else ""}>{t}</a>' for h, t in LEGACY_TOP)
        out = out[: m.start(2)] + links + "\n            " + m.group(3) + '<a href="/start-a-project/" class="btn btn-primary btn-sm">Start a Project</a>' + out[m.end():]
    return out

def run_legacy():
    n = 0
    for rel in ["projects/adda247/homepage-revamp.html"] + [
        f"blog/{s}/index.html" for s in ("how-to-improve-website-conversion-rate-india", "ui-ux-design-agency-dubai-proptech",
        "edtech-ux-design-agency-india", "fintech-ux-design-agency-india", "b2b-saas-ui-ux-design-services-india",
        "saas-onboarding-ux-best-practices-india")]:
        p = os.path.join(ROOT, rel); s = open(p, encoding="utf-8").read(); s2 = apply_legacy(s, rel)
        if s2 != s: open(p, "w", encoding="utf-8").write(s2); n += 1
    print("legacy pages updated", n)

if __name__ == "__main__":
    run_legacy()
