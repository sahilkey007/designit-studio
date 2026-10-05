#!/usr/bin/env python3
"""Master URL inventory (blueprint step 2 / section 94). Reads the HTML on disk plus vercel.json and both
sitemaps, and writes docs/seo-blueprint/01-url-inventory.csv. GSC positions are the owner-supplied
September 2026 figures from the blueprint; backlinks are not available from any connected tool, so that
column says so instead of guessing.  Usage: python3 scripts/seo/url_inventory.py"""
import csv, html, json, os, re, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://designit.co.in"
SKIP = {"node_modules", ".git", "scripts", "docs", "_next", "data", ".vercel", ".claude"}

def url_for(rel):
    if rel == "index.html": return "/"
    if rel.endswith("/index.html"): return "/" + rel[: -len("index.html")]
    return "/" + rel[:-5] + "/"

# Owner-supplied GSC page positions (blueprint sections 6 and 32).
GSC = {
    "/blog/edtech-ux-design-india/": 5.62, "/blog/fintech-onboarding-kyc-ux-india/": 5.93,
    "/blog/fintech-ux-design-agency-india/": 6.75, "/blog/saas-dashboard-design-best-practices/": 7.44,
    "/blog/how-ai-is-changing-ux-design-india/": 8, "/blog/hire-ui-ux-designer-vs-agency-india/": 9.7,
    "/blog/cost-ui-ux-design-mobile-app-india/": 10.06, "/blog/saas-onboarding-ux-best-practices-india/": 11.38,
    "/blog/cro-strategies-for-b2b-saas-india/": 17.67, "/blog/b2b-saas-ui-ux-design-services-india/": 20.47,
    "/blog/best-branding-agency-tech-startups-india/": 21.36, "/blog/branding-services-for-startups-india-cost/": 14.17,
    "/blog/how-to-choose-a-product-design-agency/": 19, "/blog/how-to-improve-website-conversion-rate-india/": 47.35,
    "/ui-ux-design-agency-usa/": 22.76, "/ui-ux-design-agency-uk/": 37.4,
}
QUERY_NOTES = {
    "/services/saas-product-design/": "query 'saas product design agency' pos 91",
    "/services/ux-audit/": "ux audit agency 100; ux audit services 97.75; user experience audit services 100; ux audit companies 95.5; ux audit company 77.5; website ux audit company 98",
}
# Blueprint section 32 actions, plus decisions for URLs the table does not list (marked *).
ACTION = {
    "/": ("REWRITE", "Make entity, positioning and commercial architecture clear"),
    "/services/": ("KEEP + REWRITE", "Services hub"),
    "/services/product-design/": ("KEEP + REWRITE", "Core commercial page"),
    "/services/saas-product-design/": ("KEEP + REWRITE", "High-value SaaS opportunity"),
    "/services/ux-audit/": ("KEEP + REWRITE", "Major ranking gap"),
    "/services/ux-research/": ("KEEP + REWRITE", "Major service opportunity"),
    "/services/design-systems/": ("KEEP + EXPAND", "Existing visibility and strategic value"),
    "/services/ui-ux-design/": ("KEEP + RETARGET*", "Owns the 'ui ux design company / studio / services' pool so /services/product-design/ can own 'product design agency' without cannibalising it"),
    "/industries/": ("KEEP + REWRITE", "Industry hub"),
    "/industries/b2b-saas/": ("KEEP + EXPAND", "Strong topical opportunity"),
    "/industries/fintech/": ("KEEP + EXPAND", "Existing authority seed"),
    "/industries/e-commerce/": ("KEEP + EXPAND", "Existing category"),
    "/industries/automotive/": ("KEEP + EXPAND", "Existing visibility"),
    "/industries/edtech/": ("KEEP + EXPAND*", "Blueprint lists CREATE; the page already exists, so it is expanded around the edtech-ux-design-india seed"),
    "/industries/real-estate/": ("KEEP + REPOSITION AS PROPTECH*", "Blueprint asks for /industries/proptech/; the existing URL is kept (equity) and /industries/proptech/ redirects to it"),
    "/projects/": ("KEEP + REWRITE", "Canonical work hub (nav label 'Work'; /work/ redirects here)"),
    "/projects/adda247/": ("KEEP + EXPAND", "Existing impressions and proof"),
    "/projects/adda247/ios-app/": ("KEEP", "Distinct product artifact"),
    "/projects/adda247/homepage-revamp/": ("KEEP, review for consolidation later", "Preserve existing search equity"),
    "/projects/adda247/live-class/": ("KEEP", "Unique scope"),
    "/projects/adda247/sankalp-bharat/": ("KEEP", "Unique scope"),
    "/projects/adda247/test-series/": ("KEEP", "Unique scope"),
    "/projects/betacrew/": ("KEEP + EXPAND", "Case-study opportunity"),
    "/projects/kelp-global/": ("KEEP + EXPAND", "SaaS/product proof"),
    "/projects/rcentric/": ("KEEP + EXPAND", "Existing case study"),
    "/projects/tata-elxsi/": ("KEEP + EXPAND", "Existing visibility"),
    "/blog/": ("KEEP", "Preserve existing content ecosystem; becomes the Insights hub with clusters"),
    "/blog/b2b-saas-ui-ux-design-services-india/": ("UPDATE + EXPAND", "Position 20.47"),
    "/blog/edtech-ux-design-india/": ("KEEP + REFRESH", "Position 5.62"),
    "/blog/fintech-onboarding-kyc-ux-india/": ("KEEP + REFRESH", "Position 5.93"),
    "/blog/fintech-ux-design-agency-india/": ("KEEP + EXPAND", "Position 6.75"),
    "/blog/saas-dashboard-design-best-practices/": ("KEEP + EXPAND", "Position 7.44"),
    "/blog/how-ai-is-changing-ux-design-india/": ("KEEP + REFRESH", "Position 8"),
    "/blog/saas-onboarding-ux-best-practices-india/": ("UPDATE + EXPAND", "Position 11.38"),
    "/blog/cost-ui-ux-design-mobile-app-india/": ("KEEP + EXPAND", "Position 10.06"),
    "/blog/hire-ui-ux-designer-vs-agency-india/": ("KEEP + EXPAND", "Position 9.7"),
    "/blog/cro-strategies-for-b2b-saas-india/": ("UPDATE + EXPAND", "Position 17.67"),
    "/blog/how-to-choose-a-product-design-agency/": ("UPDATE + EXPAND", "Position 19"),
    "/blog/best-branding-agency-tech-startups-india/": ("KEEP + EXPAND", "Position 21.36"),
    "/blog/branding-services-for-startups-india-cost/": ("KEEP + EXPAND", "Position 14.17"),
    "/blog/how-to-improve-website-conversion-rate-india/": ("UPDATE + REPOSITION", "Position 47.35"),
    "/careers/": ("KEEP", "Existing visibility (/careers.html already 308s here via cleanUrls)"),
    "/about/": ("KEEP for now", "Existing impressions (/about.html already 308s here)"),
    "/contact/": ("KEEP", "Existing indexed page (/contact.html already 308s here)"),
    "/ui-ux-design-agency-usa/": ("KEEP + REWRITE", "Position 22.76"),
    "/ui-ux-design-agency-uk/": ("KEEP + REWRITE", "Position 37.4"),
    "/ux-design-agency-dubai/": ("KEEP + REWRITE", "Existing impressions but weak ranking"),
    "/blog/ui-ux-design-agency-dubai-proptech/": ("KEEP + EXPAND", "Existing strong topical relevance"),
    "/404/": ("KEEP (not indexable)*", "Error page"),
    "/privacy-policy/": ("KEEP noindex*", "Legal page, intentionally noindex"),
    "/terms/": ("KEEP noindex*", "Legal page, intentionally noindex"),
    "/project-detail/": ("REVIEW*", "Orphan template not in sitemap; see notes"),
    "/about-designit/": ("REDIRECT (exists)*", "301 to /about/ in vercel.json"),
}
# New URLs created on staging from the blueprint IA (sections 15, 23-28, 78, 90, 8B).
for _u, _why in [
    ("/services/ai-product-design/", "Section 23: long-term AI authority category"),
    ("/services/website-design/", "Section 24: website redesign pool (SE Ranking)"),
    ("/services/mobile-app-design/", "Section 98: tenth core commercial page"),
    ("/services/conversion-optimization/", "Section 25: commercial destination for CRO content"),
    ("/services/branding/", "Section 26: GSC branding queries need a commercial destination"),
    ("/solutions/", "Section 28: solutions hub"),
    ("/solutions/mvp-design/", "Section 28"), ("/solutions/product-redesign/", "Section 28"),
    ("/solutions/legacy-product-modernization/", "Section 28"), ("/solutions/design-system-scaling/", "Section 28"),
    ("/solutions/conversion-improvement/", "Section 28"),
    ("/industries/ai/", "Sections 27 and 32: strategic emerging category"),
    ("/locations/", "Section 78: hub linking the existing USA/UK/Dubai pages"),
    ("/resources/", "Section 8B: resources layer (checklists now, reports later)"),
    ("/start-a-project/", "Section 90: qualification flow"),
    ("/resources/ux-audit-checklist/", "Section 52: interactive checklist (linkable asset)"),
    ("/resources/website-ux-scorecard/", "Section 52: interactive checklist (linkable asset)"),
    ("/resources/saas-onboarding-friction-checklist/", "Section 52: interactive checklist (linkable asset)"),
    ("/resources/ai-product-ux-checklist/", "Section 52: interactive checklist (linkable asset)"),
]:
    ACTION[_u] = ("CREATE", _why)

def text(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>", " ", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

pages = {}
for root, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for f in files:
        if f.endswith(".html"):
            rel = os.path.relpath(os.path.join(root, f), ROOT)
            pages[url_for(rel)] = (rel, open(os.path.join(root, f), encoding="utf-8").read())

sitemap = set()
for sm in ("sitemap.xml", "blog/sitemap.xml"):
    sitemap |= {u.replace(SITE, "") for u in re.findall(r"<loc>(.*?)</loc>", open(os.path.join(ROOT, sm)).read())}

inlinks = collections.defaultdict(set)
def norm(href, base):
    href = href.split("#")[0].split("?")[0]
    if href.startswith(SITE): href = href[len(SITE):]
    if not href.startswith("/") or href.startswith("//"): return None
    if href.endswith(".html"): href = href[:-5] + "/"
    if href.endswith("/index/"): href = href[:-6]
    if not href.endswith("/") and "." not in href.rsplit("/", 1)[-1]: href += "/"
    return href
for u, (rel, s) in pages.items():
    body = s[s.find("<body"):]
    for h in set(re.findall(r'<a\b[^>]*href="([^"]+)"', body)):
        t = norm(h, u)
        if t and t != u: inlinks[t].add(u)

redirects = json.load(open(os.path.join(ROOT, "vercel.json"))).get("redirects", [])
rows = []
for u in sorted(pages):
    rel, s = pages[u]
    head = s[: s.find("</head>")]
    m = lambda p: (re.search(p, head, re.S) or [None, ""])[1] if re.search(p, head, re.S) else ""
    title = html.unescape(m(r"<title>(.*?)</title>")).strip()
    desc = html.unescape(m(r'name="description" content="([^"]*)"'))
    canon = m(r'rel="canonical" href="([^"]*)"')
    robots = m(r'name="robots" content="([^"]*)"')
    h1 = text((re.search(r"<h1[^>]*>(.*?)</h1>", s, re.S) or [None, ""])[1]) if "<h1" in s else ""
    types = sorted(set(re.findall(r'"@type":\s*"([A-Za-z]+)"', s)))
    main = re.search(r"<main.*?</main>", s, re.S)
    words = len(text(main.group(0) if main else s).split())
    action, reason = ACTION.get(u, ("KEEP*", "Not in the blueprint table; kept as-is, joins the internal-link graph"))
    rows.append({
        "url": u, "file": rel, "in_sitemap": "yes" if u in sitemap else "no",
        "indexable": "no" if "noindex" in robots.lower() else "yes",
        "canonical_self": "yes" if canon == SITE + u else ("none" if not canon else canon),
        "title": title, "title_len": len(title), "meta_description_len": len(desc), "h1": h1[:90],
        "schema_types": " ".join(types), "main_words": words, "internal_inlinks": len(inlinks.get(u, ())),
        "gsc_position_sep2026": GSC.get(u, ""), "gsc_query_notes": QUERY_NOTES.get(u, ""),
        "backlinks": "not checked (no backlink export available)",
        "action": action, "reason": reason,
    })
for r in redirects:
    rows.append({"url": r["source"], "file": "vercel.json", "in_sitemap": "no", "indexable": "redirect",
                 "canonical_self": "", "title": "", "title_len": "", "meta_description_len": "", "h1": "",
                 "schema_types": "", "main_words": "", "internal_inlinks": "", "gsc_position_sep2026": "",
                 "gsc_query_notes": "", "backlinks": "", "action": "REDIRECT (exists)",
                 "reason": "-> " + r["destination"] + (" (permanent)" if r.get("permanent") else "")})

out = os.path.join(ROOT, "docs", "seo-blueprint", "01-url-inventory.csv")
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
pg = [r for r in rows if r["file"] != "vercel.json"]
print(f"{len(pg)} pages, {len(rows)-len(pg)} redirects -> {os.path.relpath(out, ROOT)}")
print("orphans (0 internal inlinks, indexable, in sitemap):", [r["url"] for r in pg if r["internal_inlinks"] == 0 and r["in_sitemap"] == "yes"])
print("indexable pages missing from sitemap:", [r["url"] for r in pg if r["indexable"] == "yes" and r["in_sitemap"] == "no"])
