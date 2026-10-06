#!/usr/bin/env python3
"""Migration matrix (blueprint section 94): every URL on live `main` and on `staging`, and what the merge changes.

Inputs: docs/seo-blueprint/01b-url-inventory-main-baseline.csv (url_inventory.py run on a `main` worktree) and
docs/seo-blueprint/01-url-inventory.csv (staging). Writes docs/seo-blueprint/11b-migration-matrix.csv and prints the
counts. Fails (exit 1) if staging would remove a live URL, turn a live page into a redirect, or change the
canonical, sitemap membership or indexability of an existing URL, so a risky merge is caught before approval.

Refresh the baseline:
  git worktree add --detach /tmp/mainwt main && cp scripts/seo/url_inventory.py /tmp/mainwt/scripts/seo/
  (cd /tmp/mainwt && python3 scripts/seo/url_inventory.py)
  cp /tmp/mainwt/docs/seo-blueprint/01-url-inventory.csv docs/seo-blueprint/01b-url-inventory-main-baseline.csv
  git worktree remove --force /tmp/mainwt
Usage: python3 scripts/seo/migration_matrix.py
"""
import collections
import csv
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = os.path.join(ROOT, "docs", "seo-blueprint")
base = {r["url"]: r for r in csv.DictReader(open(os.path.join(D, "01b-url-inventory-main-baseline.csv")))}
stag = {r["url"]: r for r in csv.DictReader(open(os.path.join(D, "01-url-inventory.csv")))}
redirects = {r["source"].rstrip("/") + "/": r["destination"] for r in json.load(open(os.path.join(ROOT, "vercel.json")))["redirects"]}


def is_redirect(r):
    return bool(r) and r["action"].startswith("REDIRECT")


# Pages the owner chose to retire, each 301-redirected to its client page (vercel.json). Listed so the gate still fails
# on any other page that turns into a redirect or disappears.
APPROVED_REMOVALS = {  # 2026-10-06, owner request: remove these case studies
    "/projects/adda247/ios-app/", "/projects/adda247/performance-dashboard/",
    "/projects/adda247/sankalp-bharat/", "/projects/rcentric/ela/",
}

rows, risky = [], []
for u in sorted(set(base) | set(stag)):
    a, b = base.get(u), stag.get(u)
    if a and not b:
        change = "REMOVED on staging"
    elif b and not a:
        change = "NEW redirect alias" if is_redirect(b) else "NEW page"
    elif is_redirect(a) and is_redirect(b):
        change = "redirect (unchanged)"
    elif is_redirect(b):
        change = "PAGE -> REDIRECT"
    elif is_redirect(a):
        change = "REDIRECT -> PAGE"
    else:
        diff = [k for k in ("title", "h1", "canonical_self", "in_sitemap", "indexable") if a[k] != b[k]]
        change = "unchanged" if not diff else "same URL, changed: " + ", ".join(diff)
    if change == "PAGE -> REDIRECT" and u in APPROVED_REMOVALS:
        change += " (owner-approved removal)"
    elif change.startswith(("REMOVED", "PAGE ->")) or any(k in change for k in ("canonical_self", "in_sitemap", "indexable")):
        risky.append((u, change))
    src = b or a
    rows.append({
        "url": u, "change": change,
        "main_title": a["title"] if a else "", "staging_title": b["title"] if b else "",
        "main_h1": a["h1"] if a else "", "staging_h1": b["h1"] if b else "",
        "main_in_sitemap": a["in_sitemap"] if a else "", "staging_in_sitemap": b["in_sitemap"] if b else "",
        "canonical_main": a["canonical_self"] if a else "", "canonical_staging": b["canonical_self"] if b else "",
        "redirect_target": redirects.get(u.rstrip("/") + "/", ""),
        "gsc_position_sep2026": src.get("gsc_position_sep2026", ""),
        "backlinks": "not checked (owner: export before merge)",
        "staging_action": b["action"] if b else "", "owner": "Designit (Sahil)", "status": "staging, awaiting approval",
    })

with open(os.path.join(D, "11b-migration-matrix.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0]))
    w.writeheader()
    w.writerows(rows)
print(dict(collections.Counter(r["change"].split(":")[0] for r in rows)))
for u, c in risky:
    print("RISK", u, c)
sys.exit(1 if risky else 0)
