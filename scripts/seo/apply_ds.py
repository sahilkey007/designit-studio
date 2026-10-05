#!/usr/bin/env python3
"""Apply the Designit Design System (Claude Design handoff) to every page and the generator shell.
 - fonts block: adds self-hosted Poppins (OFL) + a metric-matched fallback, preloads the Regular weight (statements)
 - <style id="ds-critical"> from components/ds-critical.css, placed after the page's own styles
 - design-system.css: appends the tokens + components/ds-below.css between /* ds:start */ and /* ds:end */
 - bumps design-system.css and pages.css to DS_V on every page
Idempotent. Usage: python3 scripts/seo/apply_ds.py   (then apply_ui.py, then build_pages.py)"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = os.path.join(ROOT, "scripts", "seo", "components")
SKIP_DIRS = {"node_modules", ".git", "docs", "_next", "data", "content"}
DS_V = 9

def mini(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    return re.sub(r"\s+", " ", css).replace(" {", "{").replace("{ ", "{").replace("; ", ";").replace(": ", ":").replace(" }", "}").strip()

CRIT = mini(open(os.path.join(C, "ds-critical.css"), encoding="utf-8").read())
BELOW = open(os.path.join(C, "ds-below.css"), encoding="utf-8").read()
crit_raw = open(os.path.join(C, "ds-critical.css"), encoding="utf-8").read()
ROOT_BLOCK = re.search(r":root\{.*?\n\}", crit_raw, re.S).group(0)

POP = ("<style>"
       "@font-face{font-family:'Poppins';font-style:normal;font-weight:400;font-display:swap;src:url(/assets/fonts/poppins-latin-400.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}"
       "@font-face{font-family:'Poppins';font-style:normal;font-weight:500;font-display:swap;src:url(/assets/fonts/poppins-latin-500.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}"
       "@font-face{font-family:'Poppins';font-style:normal;font-weight:600;font-display:swap;src:url(/assets/fonts/poppins-latin-600.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}"
       "@font-face{font-family:'Poppins Fallback';font-weight:400 500;src:local('Arial');ascent-override:92.5%;descent-override:30.8%;line-gap-override:8.8%;size-adjust:113.5%}"
       "@font-face{font-family:'Poppins Fallback';font-weight:600 700;src:local('Arial Bold'),local('Arial');ascent-override:98.7%;descent-override:32.9%;line-gap-override:9.4%;size-adjust:106.3%}"
       "</style>")
PRELOAD = '<link rel="preload" href="/assets/fonts/poppins-latin-400.woff2" as="font" type="font/woff2" crossorigin>'

ANN_HEAD = "<script id=\"ds-ann\">try{if(localStorage.getItem('dsn_ann')==='off')document.documentElement.classList.add('ann-off')}catch(e){}</script>"
X_ICON = ('<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" '
          'stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>')
ANN = ('<!-- ds:ann:start --><div class="ann-bar" id="annBar" role="region" aria-label="Announcement">'
       '<a href="/resources/ux-audit-checklist/" data-track="announcement_checklist"><span class="ann-k">Free</span>'
       '<span class="ann-long">Score your product against our 48-point UX audit checklist</span>'
       '<span class="ann-short">48-point UX audit checklist</span><span aria-hidden="true">&rarr;</span></a>'
       f'<button type="button" class="ann-x" id="annClose" aria-label="Dismiss announcement">{X_ICON}</button></div><!-- ds:ann:end -->\n')

def apply_html(s):
    s = re.sub(r"<script id=\"ds-ann\">.*?</script>\n?", "", s, flags=re.S)
    s = re.sub(r"<!-- ds:ann:start -->.*?<!-- ds:ann:end -->\n?", "", s, flags=re.S)
    s = re.sub(r'(<html\b[^>]*?)\s+class="has-ann"', r"\1", s, count=1)
    if '<header class="navbar"' in s:
        s = s.replace('<header class="navbar"', ANN + '    <header class="navbar"', 1)
        s = re.sub(r"<html\b(?![^>]*class=)", '<html class="has-ann"', s, count=1)
    s = re.sub(r"<!-- ds:fonts:start -->.*?<!-- ds:fonts:end -->\n?", "", s, flags=re.S)
    s = re.sub(r"<style id=\"ds-critical\">.*?</style>\n?", "", s, flags=re.S)
    if "<!-- fonts:end -->" not in s:
        return s
    s = s.replace("<!-- fonts:end -->", f"<!-- ds:fonts:start -->{PRELOAD}{POP}<!-- ds:fonts:end -->\n    <!-- fonts:end -->", 1)
    block = f'{ANN_HEAD}<style id="ds-critical">{CRIT}</style>\n'
    if "<!-- ui:css:start -->" in s:
        s = s.replace("<!-- ui:css:start -->", block + "<!-- ui:css:start -->", 1)
    else:
        s = s.replace("</head>", block + "</head>", 1)
    s = re.sub(r"design-system\.css\?v=\d+", f"design-system.css?v={DS_V}", s)
    s = re.sub(r"pages\.css\?v=\d+", f"pages.css?v={DS_V}", s)
    return s

def apply_css():
    p = os.path.join(ROOT, "design-system.css")
    s = open(p, encoding="utf-8").read()
    s = re.sub(r"\n?/\* ds:start \*/.*?/\* ds:end \*/\n?", "\n", s, flags=re.S).rstrip("\n") + "\n"
    s += "\n/* ds:start */\n" + ROOT_BLOCK + "\n" + BELOW + "/* ds:end */\n"
    open(p, "w", encoding="utf-8").write(s)

if __name__ == "__main__":
    n = 0
    targets = [os.path.join(C, "shell.html")]
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not (root == ROOT and d == "scripts")]
        targets += [os.path.join(root, f) for f in files if f.endswith(".html")]
    for p in targets:
        s = open(p, encoding="utf-8").read()
        s2 = apply_html(s)
        if s2 != s:
            open(p, "w", encoding="utf-8").write(s2); n += 1
    apply_css()
    print(f"design system applied to {n} html files + design-system.css v{DS_V}")
