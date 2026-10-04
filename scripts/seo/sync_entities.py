#!/usr/bin/env python3
"""Sync the Organization and WebSite JSON-LD nodes in every hand-written page to data/entities.json
(blueprint section 49: one consistent entity). Generated pages already use the file. Only blocks that
contain one of those nodes are re-serialised.  Usage: python3 scripts/seo/sync_entities.py"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENT = json.load(open(os.path.join(ROOT, "data", "entities.json"), encoding="utf-8"))
ORG_ID, WEB_ID = ENT["organization"]["@id"], ENT["website"]["@id"]
SKIP = {"node_modules", ".git", "scripts", "docs", "_next", "data", "content"}

def swap(node):
    if isinstance(node, dict):
        if node.get("@id") == ORG_ID and "name" in node: return ENT["organization"], True
        if node.get("@id") == WEB_ID and "name" in node: return ENT["website"], True
        changed = False
        for k, v in list(node.items()):
            nv, c = swap(v); node[k] = nv; changed |= c
        return node, changed
    if isinstance(node, list):
        changed = False
        for i, v in enumerate(node):
            nv, c = swap(v); node[i] = nv; changed |= c
        return node, changed
    return node, False

pages = blocks = 0
for root, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for f in files:
        if not f.endswith(".html"): continue
        p = os.path.join(root, f); s = open(p, encoding="utf-8").read()
        if "<!-- generated: build_pages.py -->" in s: continue
        out, pos, touched = [], 0, False
        for m in re.finditer(r'(<script type="application/ld\+json">)(.*?)(</script>)', s, re.S):
            try: data = json.loads(m.group(2))
            except Exception: continue
            data, c = swap(data)
            if c:
                out.append(s[pos:m.start(2)]); out.append("\n" + json.dumps(data, indent=2, ensure_ascii=False) + "\n"); pos = m.end(2)
                touched = True; blocks += 1
        if touched:
            out.append(s[pos:]); open(p, "w", encoding="utf-8").write("".join(out)); pages += 1
print(f"synced {blocks} JSON-LD blocks on {pages} hand-written pages")
