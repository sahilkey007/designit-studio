#!/usr/bin/env python3
"""Add the interaction layer (ui.css, Lenis, ui.js) to every page and to the generator shell. Idempotent: re-running
replaces the previous blocks, so bumping a version here and re-running updates the whole site.
Usage: python3 scripts/seo/apply_ui.py"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKIP_DIRS = {"node_modules", ".git", "docs", "_next", "data", "content"}
UI_CSS = "/ui.css?v=3"
UI_JS = "/ui.js?v=2"
LENIS = "/assets/vendor/lenis/lenis-1.3.26.min.js"
HEAD = (f'<!-- ui:css:start --><link rel="preload" href="{UI_CSS}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">'
        f'<noscript><link rel="stylesheet" href="{UI_CSS}"></noscript><!-- ui:css:end -->')
BODY = f'<!-- ui:js:start --><script defer src="{LENIS}"></script><script defer src="{UI_JS}"></script><!-- ui:js:end -->'

def apply(s):
    s = re.sub(r"<!-- ui:css:start -->.*?<!-- ui:css:end -->\n?", "", s, flags=re.S)
    s = re.sub(r"<!-- ui:js:start -->.*?<!-- ui:js:end -->\n?", "", s, flags=re.S)
    if "</head>" not in s or "</body>" not in s:
        return s
    s = s.replace("</head>", HEAD + "\n</head>", 1)
    i = s.rindex("</body>")
    return s[:i] + BODY + "\n" + s[i:]

if __name__ == "__main__":
    n = 0
    targets = [os.path.join(ROOT, "scripts", "seo", "components", "shell.html")]
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not (root == ROOT and d == "scripts")]
        targets += [os.path.join(root, f) for f in files if f.endswith(".html")]
    for p in targets:
        s = open(p, encoding="utf-8").read()
        s2 = apply(s)
        if s2 != s:
            open(p, "w", encoding="utf-8").write(s2); n += 1
    print(f"ui layer applied to {n} files")
