#!/usr/bin/env python3
"""FAQs are always open, site-wide (owner decision, October 2026): no disclosure buttons, no chevrons.
Turns <h3 class="faq-h"><button class="faq-q" ...>Question <span class="faq-chevron">⌄</span></button></h3>
into <h3 class="faq-h">Question</h3> on every hand-written page. Generated pages get the same markup from
build_pages.py. Idempotent. Usage: python3 scripts/seo/faq_open.py"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKIP = {"node_modules", ".git", "docs", "_next", "data", "content", "scripts"}
PAT = re.compile(r'<h3 class="faq-h"><button class="faq-q"[^>]*>(.*?)\s*<span class="faq-chevron"[^>]*>.*?</span>\s*</button></h3>', re.S)
n = files = 0
for root, dirs, fs in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for f in fs:
        if not f.endswith(".html"): continue
        p = os.path.join(root, f); s = open(p, encoding="utf-8").read()
        s2, k = PAT.subn(lambda m: f'<h3 class="faq-h">{m.group(1).strip()}</h3>', s)
        if k: open(p, "w", encoding="utf-8").write(s2); n += k; files += 1
print(f"opened {n} FAQ items in {files} files")
