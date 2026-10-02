#!/usr/bin/env python3
"""
Export Google Search Console performance data to CSV using the free Search Console API.

Setup (one time, all free):
  1. Google Cloud Console > create a project > enable "Google Search Console API".
  2. IAM & Admin > Service Accounts > create one > Keys > Add key > JSON. Save it OUTSIDE the repo
     (for example ~/.config/gsc/designit-key.json). Never commit or paste this file anywhere.
  3. Search Console > Settings > Users and permissions > Add user > paste the service account's email
     (looks like name@project.iam.gserviceaccount.com) with "Restricted" (read-only) permission.

Run:
  GSC_KEY_FILE=~/.config/gsc/designit-key.json python3 scripts/gsc-export.py
Optional env: GSC_SITE (default sc-domain:designit.co.in; use https://designit.co.in/ for a URL-prefix
property), GSC_DAYS (default 90).

Output: gsc-data/*.csv (git-ignored). Search Console data lags about 2 days, so the window ends 2 days ago.
"""
import csv, datetime as dt, json, os, sys

try:
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
except ImportError:
    sys.exit("Missing dependency. Run: pip3 install google-auth requests")

KEY = os.path.expanduser(os.environ.get("GSC_KEY_FILE", ""))
SITE = os.environ.get("GSC_SITE", "sc-domain:designit.co.in")
DAYS = int(os.environ.get("GSC_DAYS", "90"))
if not KEY or not os.path.exists(KEY):
    sys.exit("Set GSC_KEY_FILE to the path of your service-account JSON key (see the header of this script).")

creds = service_account.Credentials.from_service_account_file(
    KEY, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
http = AuthorizedSession(creds)
BASE = "https://www.googleapis.com/webmasters/v3/sites/" + SITE.replace(":", "%3A").replace("/", "%2F")

end = dt.date.today() - dt.timedelta(days=2)
start = end - dt.timedelta(days=DAYS - 1)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "gsc-data")
os.makedirs(OUT, exist_ok=True)

def query(dims, search_type="web"):
    rows, start_row = [], 0
    while True:
        body = {"startDate": str(start), "endDate": str(end), "dimensions": dims,
                "rowLimit": 25000, "startRow": start_row, "type": search_type, "dataState": "final"}
        r = http.post(BASE + "/searchAnalytics/query", json=body)
        if r.status_code != 200:
            sys.exit("API error %s: %s\nCheck the site string (GSC_SITE) and that the service account email "
                     "was added as a user in Search Console." % (r.status_code, r.text[:300]))
        batch = r.json().get("rows", [])
        rows += batch
        if len(batch) < 25000:
            return rows
        start_row += 25000

def save(name, dims):
    rows = query(dims)
    path = os.path.join(OUT, name + ".csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(dims + ["clicks", "impressions", "ctr", "position"])
        for r in rows:
            w.writerow(r["keys"] + [r["clicks"], r["impressions"], round(r["ctr"], 4), round(r["position"], 2)])
    print("%-14s %6d rows -> %s" % (name, len(rows), path))
    return rows

print("Site %s, %s to %s" % (SITE, start, end))
save("by_date", ["date"])
q = save("by_query", ["query"])
save("by_page", ["page"])
save("by_query_page", ["query", "page"])
save("by_country", ["country"])
save("by_device", ["device"])

sm = http.get(BASE + "/sitemaps")
if sm.status_code == 200:
    with open(os.path.join(OUT, "sitemaps.json"), "w") as f:
        json.dump(sm.json(), f, indent=2)
    print("sitemaps       -> %s" % os.path.join(OUT, "sitemaps.json"))

print("\nTop 10 queries by impressions:")
for r in sorted(q, key=lambda r: -r["impressions"])[:10]:
    print("  %-50s imp=%-6d clicks=%-4d pos=%.1f" % (r["keys"][0][:50], r["impressions"], r["clicks"], r["position"]))
