#!/usr/bin/env python3
"""Master SEO/AEO/GEO site map + keyword-to-URL matrix (blueprint section 114's "immediate deliverable").

Every URL — live, new on staging, redirect alias, or planned-but-not-built — mapped to
KEEP / REWRITE / EXPAND / MERGE / REDIRECT / CREATE with its primary keyword, cluster, intent,
buyer stage, H1, H2s, FAQ questions, schema, internal links, case-study links, evidence, CTA
and priority.

Sources (nothing here is invented):
  data/pages-index.json            SEO model of every generated page (section 62)
  docs/seo-blueprint/01-url-inventory.csv   action/reason/GSC per existing URL (url_inventory.py)
  the HTML on disk                 H1/H2/FAQ/schema/links for hand-written pages and posts
  vercel.json                      redirect aliases
  PLANNED below                    URLs the blueprint names (sections 35-42, 52, 71, 72, 99)

Writes:
  docs/seo-blueprint/02-master-sitemap-keyword-matrix.csv  (full detail)
  docs/seo-blueprint/02-master-sitemap-keyword-matrix.md   (readable summary)
  docs/seo-blueprint/09-content-backlog.md                 (planned assets, section 108 format)
  data/keywords.json        keyword -> owning URL (cannibalisation check, section 93)
  data/internal-links.json  url -> internal links in main content (link graph, sections 66-67)

Usage: python3 scripts/seo/build_matrix.py   (run url_inventory.py first)
"""
import csv
import html
import json
import os
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(ROOT, "docs", "seo-blueprint")
SITE = "https://designit.co.in"

# Blog post -> cluster pillar (mirrors scripts/seo/blog_graph.py POST/CL).
import importlib.util
_spec = importlib.util.spec_from_file_location("bg", os.path.join(ROOT, "scripts/seo/blog_graph.py"))
_src = open(_spec.origin).read()
CL = eval(re.search(r"^CL = (\{.*?^\})", _src, re.S | re.M).group(1))
POST = eval(re.search(r"^POST = (\{.*?^\})", _src, re.S | re.M).group(1))
# Owner-supplied September 2026 GSC queries (blueprint section 5) attached to the existing post that serves them.
BLOG_GSC = {
    "saas-onboarding-ux-best-practices-india": ["fix saas onboarding drop offs ux"],
    "cro-strategies-for-b2b-saas-india": ["cro tactics for b2b saas enterprise"],
    "hire-ui-ux-designer-vs-agency-india": ["hire ux designers for startups"],
    "how-to-choose-a-product-design-agency": ["how to choose a product design agency"],
    "branding-services-for-startups-india-cost": ["startup branding packages india (supporting; commercial owner /services/branding/)"],
    "best-branding-agency-tech-startups-india": ["branding company for startups (supporting; commercial owner /services/branding/)"],
    "b2b-saas-ui-ux-design-services-india": ["b2b ui/ux design services (supporting; commercial owner /industries/b2b-saas/)"],
}
CLUSTER_NAME = {"saas": "B2B SaaS Product Design", "audit": "UX Audit", "website": "Website Redesign", "ai": "AI Product Design",
                "brand": "Branding", "startup": "Startup Product Design", "mobile": "Mobile App Design", "ds": "Design Systems",
                "edtech": "EdTech", "fintech": "Fintech", "proptech": "PropTech", "research": "UX Research"}

# Planned URLs named in the blueprint. (url, title, cluster, pillar, source section, priority, overlap/decision)
# "overlap" points at an existing page that already serves the intent: that page is expanded instead (section 33).
PLANNED = [
    # Cluster 1: SaaS (section 35)
    ("/blog/saas-product-design-process/", "SaaS Product Design Process", "saas", "/services/saas-product-design/", "35, 99#9", "P2", ""),
    ("/blog/saas-product-design-cost/", "SaaS Product Design Cost", "saas", "/services/saas-product-design/", "35, 72, 99#10", "P2", ""),
    ("/blog/saas-product-redesign/", "SaaS Product Redesign Guide", "saas", "/services/saas-product-design/", "35, 99#13", "P2", ""),
    ("/blog/saas-ux-mistakes/", "SaaS UX Mistakes", "saas", "/services/saas-product-design/", "35", "P2", ""),
    ("/blog/saas-design-system/", "SaaS Design System", "saas", "/services/saas-product-design/", "35", "P2", "Check against /services/design-systems/ 'Design systems for SaaS' section before writing"),
    ("/blog/saas-ux-audit/", "SaaS UX Audit", "audit", "/services/ux-audit/", "35, 36", "P2", "Listed in both cluster 1 and 2: one page, owned by the UX audit cluster"),
    ("/blog/b2b-saas-product-discovery/", "B2B SaaS Product Discovery", "saas", "/services/saas-product-design/", "35", "P2", ""),
    # Cluster 2: UX audit (section 36)
    ("/blog/ux-audit-process/", "UX Audit Process", "audit", "/services/ux-audit/", "36", "P2", ""),
    ("/blog/ux-audit-cost/", "UX Audit Cost", "audit", "/services/ux-audit/", "36, 72, 99#3", "P2", "Cost drivers only; no invented prices (section 72)"),
    ("/blog/heuristic-evaluation-website-example/", "Heuristic Evaluation of a Website", "audit", "/services/ux-audit/", "36, 99#17", "P2", "Needs a real (or clearly hypothetical) example; no invented client"),
    ("/blog/website-ux-audit/", "Website UX Audit", "audit", "/services/ux-audit/", "36", "P2", "OVERLAP: /blog/ui-ux-audit-for-website-india/ serves this intent; expand it instead"),
    ("/blog/ux-audit-vs-ux-research/", "UX Research vs UX Audit", "audit", "/services/ux-audit/", "36, 38, 99#16", "P2", "Cluster 4 lists /blog/ux-research-vs-ux-audit/ too: build ONE page, redirect the other slug"),
    ("/blog/ux-audit-report-example/", "UX Audit Report Example", "audit", "/services/ux-audit/", "36", "P2", "Needs an anonymised real report with client permission"),
    # Cluster 3: Website redesign (section 37)
    ("/blog/how-to-redesign-a-website/", "How to Redesign a Website", "website", "/services/website-design/", "3, 4, 37, 99#7", "P2", ""),
    ("/blog/website-redesign-cost/", "Website Redesign Cost", "website", "/services/website-design/", "4, 37, 72, 99#8", "P2", "Cost drivers only"),
    ("/blog/website-redesign-checklist/", "Website Redesign Checklist", "website", "/services/website-design/", "4, 37", "P2", ""),
    ("/blog/landing-page-ux-case-study/", "Landing Page UX Case Study", "website", "/services/website-design/", "4, 37", "P2", "Needs a real landing-page project with permission; do not invent"),
    ("/blog/website-conversion-rate/", "Website Conversion Rate", "website", "/services/conversion-optimization/", "37", "P2", "OVERLAP: /blog/how-to-improve-website-conversion-rate-india/ (UPDATE + REPOSITION) serves this"),
    ("/blog/website-ux-principles/", "Website UX Principles", "website", "/services/website-design/", "37, 70", "P2", "Targets 'website designing principles' (SE Ranking pool)"),
    # Cluster 4: UX research (section 38)
    ("/blog/ux-research-methods/", "UX Research Methods", "research", "/services/ux-research/", "38", "P2", ""),
    ("/blog/ux-research-process/", "UX Research Process", "research", "/services/ux-research/", "38", "P2", ""),
    ("/blog/ux-research-cost/", "UX Research Cost", "research", "/services/ux-research/", "38, 72", "P2", "Cost drivers only"),
    ("/blog/user-interviews-for-saas/", "User Interviews for SaaS", "research", "/services/ux-research/", "38", "P2", ""),
    ("/blog/usability-testing-methods/", "Usability Testing Methods", "research", "/services/ux-research/", "38", "P2", ""),
    ("/blog/ux-research-consulting/", "UX Research Consulting", "research", "/services/ux-research/", "38, 70", "—", "DO NOT CREATE: commercial query, owned by /services/ux-research/ (section 3 rule)"),
    # Cluster 5: Design systems (section 39)
    ("/blog/design-system-cost/", "Design System Cost", "ds", "/services/design-systems/", "39, 72", "P2", "OVERLAP: /blog/design-system-cost-india-2026/ serves this; expand it"),
    ("/blog/design-system-roi/", "Design System ROI", "ds", "/services/design-systems/", "39, 99#14", "P2", ""),
    ("/blog/design-tokens/", "Design Tokens", "ds", "/services/design-systems/", "39", "P2", ""),
    ("/blog/design-system-governance/", "Design System Governance", "ds", "/services/design-systems/", "39, 99#15", "P2", ""),
    ("/blog/enterprise-design-system/", "Enterprise Design System", "ds", "/services/design-systems/", "39", "P2", ""),
    ("/blog/figma-design-system/", "Figma Design System", "ds", "/services/design-systems/", "39", "P2", ""),
    ("/blog/design-system-vs-component-library/", "Design System vs Component Library", "ds", "/services/design-systems/", "39", "P2", ""),
    # Cluster 6: AI (section 40)
    ("/blog/ai-product-design-guide/", "AI Product Design Guide", "ai", "/services/ai-product-design/", "40", "P2", ""),
    ("/blog/ai-ux-design-patterns/", "AI Product UX Patterns", "ai", "/services/ai-product-design/", "40, 99#18", "P2", ""),
    ("/blog/chatbot-ui-design/", "Chatbot UI Design", "ai", "/services/ai-product-design/", "3, 40, 70, 99#19", "P2", "Targets 'chatbot ui' (SE Ranking: 360 / KD 43, revalidate)"),
    ("/blog/ai-agent-ux/", "AI Agent UX Guide", "ai", "/services/ai-product-design/", "10, 40, 99#20", "P2", "Answer the section 10B agent questions"),
    ("/blog/agentic-experience-design/", "Agentic Experience Design", "ai", "/services/ai-product-design/", "40", "P2", "Check overlap with ai-agent-ux before writing"),
    ("/blog/human-ai-interaction-design/", "Human-AI Interaction Design", "ai", "/services/ai-product-design/", "40", "P2", ""),
    ("/blog/designing-trustworthy-ai-products/", "Designing Trustworthy AI Products", "ai", "/services/ai-product-design/", "40", "P2", ""),
    ("/blog/ai-onboarding-ux/", "AI Onboarding UX", "ai", "/services/ai-product-design/", "40", "P2", ""),
    ("/blog/ai-product-discovery/", "AI Product Discovery", "ai", "/services/ai-product-design/", "40", "P2", ""),
    # Cluster 7: Startup (section 41)
    ("/blog/how-much-does-product-design-cost/", "How Much Does Product Design Cost?", "startup", "/services/product-design/", "41, 72, 99#1", "P2", "Cost drivers only. /blog/ui-ux-design-pricing-india-2026/ is adjacent (UI/UX pricing India); differentiate or consolidate"),
    ("/blog/product-design-agency-vs-freelancer/", "Product Design Agency vs Freelancer", "startup", "/services/product-design/", "41, 99#5", "P2", "OVERLAP: /blog/freelancer-vs-design-agency-startups/ serves this; expand it"),
    ("/blog/in-house-vs-design-agency/", "In-House Designer vs Design Agency", "startup", "/services/product-design/", "41, 99#6", "P2", "OVERLAP (partial): /blog/hire-ui-ux-designer-vs-agency-india/; decide expand vs new"),
    ("/blog/when-should-a-startup-hire-a-product-designer/", "When Should a Startup Hire a Product Designer?", "startup", "/services/product-design/", "41", "P2", ""),
    ("/blog/mvp-design-guide/", "MVP Design Guide", "startup", "/solutions/mvp-design/", "41", "P2", ""),
    ("/blog/startup-product-design-mistakes/", "Startup Product Design Mistakes", "startup", "/services/product-design/", "41", "P2", ""),
    ("/blog/how-to-choose-a-ui-ux-design-agency/", "How to Choose a UI/UX Design Agency", "startup", "/services/ui-ux-design/", "71", "P2", "OVERLAP (partial): /blog/how-to-choose-a-product-design-agency/; prefer expanding it with the section 71 questions"),
    # Cluster 8: Branding (section 42)
    ("/blog/startup-branding-cost/", "Startup Branding Cost", "brand", "/services/branding/", "42, 72", "P2", "OVERLAP: /blog/branding-services-for-startups-india-cost/ serves this; expand it"),
    ("/blog/startup-branding-process/", "Startup Branding Process", "brand", "/services/branding/", "42", "P2", ""),
    ("/blog/brand-positioning-for-b2b-saas/", "Brand Positioning for B2B SaaS", "brand", "/services/branding/", "42", "P2", ""),
    ("/blog/brand-research/", "Brand Research", "brand", "/services/branding/", "3, 42, 70", "P2", "Targets 'brand research' (SE Ranking: 170 / KD 23, revalidate)"),
    # Industry deferred (section 27)
    ("/industries/healthtech/", "HealthTech", "industry", "/industries/", "15, 27, 32", "—", "DEFERRED: create only after an evidence audit shows first-party HealthTech work"),
    # Linkable assets / research (sections 8B, 52)
    ("/resources/ux-audit-checklist/", "UX Audit Checklist Tool", "audit", "/services/ux-audit/", "52#1, 99#2", "P2", "Article exists at /blog/ux-audit-checklist/; interactive version is the asset"),
    ("/resources/saas-ux-maturity-model/", "SaaS UX Maturity Model", "saas", "/services/saas-product-design/", "52#2", "P2", ""),
    ("/resources/design-system-maturity-model/", "Design System Maturity Model", "ds", "/services/design-systems/", "8B, 52#3", "P2", ""),
    ("/resources/product-design-cost-calculator/", "Product Design Cost Calculator", "startup", "/services/product-design/", "52#4", "P2", "Needs owner-approved pricing inputs before it can show numbers"),
    ("/resources/website-ux-scorecard/", "Website UX Scorecard", "website", "/services/website-design/", "52#5", "P2", ""),
    ("/resources/saas-onboarding-friction-checklist/", "SaaS Onboarding Friction Checklist", "saas", "/services/saas-product-design/", "52#6", "P2", ""),
    ("/resources/ai-product-ux-checklist/", "AI Product UX Checklist", "ai", "/services/ai-product-design/", "52#7", "P2", ""),
    ("/resources/design-system-roi-calculator/", "Design System ROI Calculator", "ds", "/services/design-systems/", "52#8", "P2", ""),
    ("/resources/saas-ux-benchmark/", "SaaS UX Benchmark (report)", "saas", "/services/saas-product-design/", "8B", "P2", "Original research: needs a real study and method"),
    ("/resources/ai-product-design-report/", "AI Product Design Report", "ai", "/services/ai-product-design/", "8B", "P2", "Original research"),
    ("/resources/ux-audit-benchmark/", "UX Audit Benchmark", "audit", "/services/ux-audit/", "8B", "P2", "Original research"),
    ("/resources/startup-product-design-cost-guide/", "Startup Product Design Cost Guide", "startup", "/services/product-design/", "8B", "P2", ""),
    ("/resources/website-conversion-friction-report/", "Website Conversion Friction Report", "website", "/services/conversion-optimization/", "8B", "P2", "Original research"),
]

COLS = ["url", "status", "action", "priority", "page_type", "primary_keyword", "secondary_keywords", "keyword_source",
        "cluster", "pillar", "search_intent", "buyer_stage", "h1", "h2s", "faq_questions", "schema",
        "internal_links_out", "related_services", "related_industries", "case_study_links", "evidence_ids",
        "cta", "conversion_event", "refresh_interval", "gsc_position_sep2026", "notes"]


def text(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>", " ", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def norm(href):
    href = href.split("#")[0].split("?")[0]
    if href.startswith(SITE):
        href = href[len(SITE):]
    if not href.startswith("/") or href.startswith("//"):
        return None
    if href.endswith(".html"):
        href = href[:-5] + "/"
    if not href.endswith("/") and "." not in href.rsplit("/", 1)[-1]:
        href += "/"
    return href


def parse_html(rel):
    s = open(os.path.join(ROOT, rel), encoding="utf-8").read()
    main = (re.search(r"<main.*?</main>", s, re.S) or re.search(r"<body.*</body>", s, re.S)).group(0)
    main = re.sub(r"<!-- next-steps:start -->.*?<!-- next-steps:end -->", lambda m: m.group(0), main, flags=re.S)
    h1 = text((re.search(r"<h1[^>]*>(.*?)</h1>", main, re.S) or [None, ""])[1]) if "<h1" in main else ""
    h2s = [text(x) for x in re.findall(r"<h2[^>]*>(.*?)</h2>", main, re.S)]
    links = []
    for h in re.findall(r'<a\b[^>]*href="([^"]+)"', main):
        t = norm(h)
        if t and t not in links:
            links.append(t)
    faqs = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try:
            d = json.loads(m.group(1))
        except Exception:
            continue
        for node in (d.get("@graph", [d]) if isinstance(d, dict) else []):
            if node.get("@type") == "FAQPage":
                faqs += [q.get("name", "") for q in node.get("mainEntity", [])]
    return h1, h2s, links, faqs


def blog_stage(slug):
    if re.search(r"cost|pricing|price", slug):
        return "commercial investigation", "buying"
    if re.search(r"-vs-|choose|best-|hire-|agency", slug):
        return "commercial investigation", "evaluation / vendor"
    if re.search(r"why-|signs-", slug):
        return "informational", "problem-aware"
    return "informational", "solution-aware"


def build():
    pidx = json.load(open(os.path.join(ROOT, "data/pages-index.json")))
    inv = {r["url"]: r for r in csv.DictReader(open(os.path.join(DOCS, "01-url-inventory.csv")))}
    rows, link_graph = [], {}

    for url, r in sorted(inv.items()):
        if r["action"].startswith("REDIRECT"):
            continue
        h1, h2s, links, faqs = parse_html(r["file"])
        link_graph[url] = links
        cases = [l for l in links if l.startswith("/projects/") and l != "/projects/"]
        p = pidx.get(url)
        if p:
            row = dict(
                page_type=p["pageType"], primary_keyword=p["primaryKeyword"], secondary_keywords="; ".join(p.get("secondaryKeywords", [])),
                keyword_source="page spec (content/pages)", cluster=p.get("topicCluster", ""), pillar=p.get("pillarPage", ""),
                search_intent=p.get("searchIntent", ""), buyer_stage=p.get("funnelStage", ""), h1=p["h1"], h2s=" | ".join(p.get("h2s", [])),
                faq_questions=" | ".join(p.get("faq", [])), schema=p.get("schemaType", ""),
                related_services="; ".join(p.get("relatedServices", [])), related_industries="; ".join(p.get("relatedIndustries", [])),
                case_study_links="; ".join(p.get("relatedCaseStudies", []) or cases), evidence_ids="; ".join(p.get("evidenceIds", [])),
                cta=(p.get("cta") or {}).get("heading", "") if isinstance(p.get("cta"), dict) else str(p.get("cta", "")),
                conversion_event=p.get("conversionEvent", ""), refresh_interval=p.get("refreshInterval", ""),
                priority=p.get("priority", ""), status="new on staging" if r["action"] == "CREATE" else "live, rebuilt on staging")
        elif url.startswith("/blog/") and url != "/blog/":
            slug = url.strip("/").split("/")[-1]
            cl = POST.get(slug, "")
            pillar = CL[cl][0][1] if cl else ""
            intent, stage = blog_stage(slug)
            row = dict(
                page_type="article", primary_keyword=slug.replace("-", " "), secondary_keywords="; ".join(BLOG_GSC.get(slug, [])),
                keyword_source="primary derived from slug (confirm in the section 65 brief at next refresh)" + ("; secondary = GSC Sep 2026 queries" if slug in BLOG_GSC else ""),
                cluster=CLUSTER_NAME.get(cl, cl), pillar=pillar, search_intent=intent, buyer_stage=stage,
                h1=h1, h2s=" | ".join(h2s), faq_questions=" | ".join(faqs), schema=r["schema_types"],
                related_services=pillar if pillar.startswith("/services/") else "", related_industries=pillar if pillar.startswith("/industries/") else "",
                case_study_links="; ".join(cases), evidence_ids="",
                cta=CL[cl][3][0] if cl else "", conversion_event="cta_click (post_cta)", refresh_interval="6-12 months (AI topics: quarterly)",
                priority="P1" if r.get("gsc_position_sep2026") else "P2", status="live (byline, reviewer, next-steps added on staging)")
        elif url.startswith("/projects/"):
            parts = url.strip("/").split("/")
            row = dict(page_type="case-study (sub-project)", primary_keyword=" ".join(parts[1:]).replace("-", " ") + " design",
                       secondary_keywords="", keyword_source="derived from URL; sub-projects support the parent case study",
                       cluster="Work", pillar="/" + "/".join(parts[:2]) + "/", search_intent="informational / proof", buyer_stage="evaluation",
                       h1=h1, h2s=" | ".join(h2s), faq_questions=" | ".join(faqs), schema=r["schema_types"], related_services="",
                       related_industries="", case_study_links="/" + "/".join(parts[:2]) + "/", evidence_ids="", cta="",
                       conversion_event="", refresh_interval="when new evidence is available", priority="P2", status="live")
        else:
            row = dict(page_type="utility" if "noindex" in r["action"] or url in ("/404/",) else ("hub" if url == "/blog/" else "company"),
                       primary_keyword="", secondary_keywords="", keyword_source="navigational / brand", cluster="", pillar="", search_intent="navigational", buyer_stage="",
                       h1=h1, h2s=" | ".join(h2s), faq_questions=" | ".join(faqs), schema=r["schema_types"], related_services="",
                       related_industries="", case_study_links="; ".join(cases), evidence_ids="", cta="", conversion_event="",
                       refresh_interval="6 months", priority="P1" if url in ("/about/", "/contact/") else "P2", status="live")
        row.update(url=url, action=r["action"], internal_links_out=len(links), gsc_position_sep2026=r.get("gsc_position_sep2026", ""),
                   notes=r["reason"] + (f" | GSC: {r['gsc_query_notes']}" if r.get("gsc_query_notes") else ""))
        rows.append(row)

    for rd in json.load(open(os.path.join(ROOT, "vercel.json"))).get("redirects", []):
        src = rd["source"] if rd["source"].endswith("/") else rd["source"] + "/"
        if any(x["url"] == src for x in rows):
            continue
        rows.append(dict(url=src, status="redirect", action="REDIRECT", priority="", page_type="alias",
                         notes=f"{'301' if rd.get('permanent', True) else '302'} -> {rd['destination']}"))

    existing = {r["url"] for r in rows}
    for url, title, cl, pillar, sec, prio, note in PLANNED:
        overlap = re.search(r"OVERLAP[^:]*: (/[^ ;]+)", note)
        action = "DO NOT CREATE" if note.startswith("DO NOT") else "DEFERRED" if note.startswith("DEFERRED") else \
                 (f"EXPAND {overlap.group(1)} instead" if overlap else ("exists" if url in existing else "CREATE"))
        if url in existing:
            continue
        intent, stage = blog_stage(url.strip("/").split("/")[-1])
        rows.append(dict(url=url, status="planned (not built)", action=action, priority=prio,
                         page_type="tool / report" if url.startswith("/resources/") else ("industry" if url.startswith("/industries/") else "article"),
                         primary_keyword=title.lower().rstrip("?").replace(" (interactive)", "").replace(" (report)", ""),
                         keyword_source=f"blueprint section {sec}", cluster=CLUSTER_NAME.get(cl, cl), pillar=pillar,
                         search_intent=intent, buyer_stage=stage, h1=title, related_services=pillar if pillar.startswith("/services/") else "",
                         notes=note))

    with open(os.path.join(DOCS, "02-master-sitemap-keyword-matrix.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLS)
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in COLS})

    # keywords.json: who owns which query (one owner per primary keyword).
    kw, clashes = {}, []
    for r in rows:
        if r.get("status", "").startswith(("redirect",)) or r.get("action", "").startswith(("DO NOT", "EXPAND", "DEFERRED")):
            continue
        for k in [r.get("primary_keyword", "")] + [x.strip() for x in r.get("secondary_keywords", "").split(";")]:
            k = k.split(" (")[0]  # drop "(supporting; ...)" annotations
            if not k:
                continue
            role = "primary" if k == r.get("primary_keyword") else "secondary"
            commercial = r.get("page_type") not in ("article", "tool / report")
            if k in kw and kw[k]["role"] == "primary" and role == "primary" and kw[k]["url"] != r["url"]:
                clashes.append((k, kw[k]["url"], r["url"]))
            # primary beats secondary; for secondary ties a commercial page beats an article (section 3 rule)
            if k not in kw or role == "primary" or (kw[k]["role"] == "secondary" and commercial and not kw[k]["commercial"]):
                kw[k] = {"url": r["url"], "role": role, "commercial": commercial, "cluster": r.get("cluster", ""), "status": r.get("status", "")}
    json.dump({"_note": "Generated by scripts/seo/build_matrix.py. One owning URL per keyword; check here before creating a page.",
               "keywords": dict(sorted(kw.items())), "primaryClashes": clashes},
              open(os.path.join(ROOT, "data/keywords.json"), "w"), indent=1, ensure_ascii=False)
    json.dump({"_note": "Generated by scripts/seo/build_matrix.py. Internal links inside <main> per URL.", "links": link_graph},
              open(os.path.join(ROOT, "data/internal-links.json"), "w"), indent=1)

    write_md(rows)
    write_backlog(rows)
    by = defaultdict(int)
    for r in rows:
        by[r["status"].split(" (")[0].split(",")[0]] += 1
    print(f"{len(rows)} rows: {dict(by)}; {len(kw)} keywords, {len(clashes)} primary clashes")
    for c in clashes:
        print("  CLASH", c)


def write_md(rows):
    def table(sel, cols, heads):
        out = ["| " + " | ".join(heads) + " |", "|" + "---|" * len(heads)]
        for r in rows:
            if sel(r):
                out.append("| " + " | ".join(str(r.get(c, "")).replace("|", "/").replace("\n", " ")[:140] for c in cols) + " |")
        return out
    L = ["# Master site map + keyword-to-URL matrix", "",
         "> Blueprint section 114's immediate deliverable. Generated by `scripts/seo/build_matrix.py` from the page specs, "
         "the URL inventory, the HTML on disk, `vercel.json` and the blueprint's named-but-unbuilt URLs. The CSV "
         "(`02-master-sitemap-keyword-matrix.csv`) has every column (H2s, FAQ questions, schema, internal links, evidence, "
         "CTA, refresh interval, GSC); this page is the readable summary. Regenerate after any page change.", "",
         "Actions use the blueprint vocabulary: KEEP / REWRITE / EXPAND / MERGE / REDIRECT / CREATE. An asterisk (*) marks a "
         "decision for a URL the blueprint's section 32 table does not list; the reason is in the CSV `notes` column.", "",
         "## Commercial pages (services, solutions, industries, markets, hubs)", ""]
    L += table(lambda r: r.get("page_type") in ("service", "solution", "industry", "location", "hub", "home") and r["status"] != "planned (not built)",
               ["url", "action", "priority", "primary_keyword", "search_intent", "buyer_stage", "h1"],
               ["URL", "Action", "P", "Primary keyword", "Intent", "Stage", "H1"])
    L += ["", "## Case studies", ""]
    L += table(lambda r: r.get("page_type", "").startswith("case-study"),
               ["url", "action", "priority", "primary_keyword", "evidence_ids", "notes"], ["URL", "Action", "P", "Primary keyword", "Evidence", "Notes"])
    L += ["", "## Insights (existing articles)", ""]
    L += table(lambda r: r.get("page_type") == "article" and not r["status"].startswith("planned"),
               ["url", "action", "gsc_position_sep2026", "cluster", "pillar", "buyer_stage"], ["URL", "Action", "GSC pos.", "Cluster", "Pillar", "Stage"])
    L += ["", "## Company and utility pages", ""]
    L += table(lambda r: r.get("page_type") in ("company", "utility", "tool"), ["url", "action", "priority", "notes"], ["URL", "Action", "P", "Notes"])
    L += ["", "## Planned, deferred and rejected URLs", "",
          "Named in the blueprint but not built, by design: section 114 says not to start the new articles yet. "
          "`EXPAND … instead` means an existing page already serves the intent (section 33: don't create a second page for one intent).", ""]
    L += table(lambda r: r["status"].startswith("planned"), ["url", "action", "priority", "cluster", "pillar", "keyword_source", "notes"],
               ["URL", "Action", "P", "Cluster", "Pillar", "Source", "Notes"])
    L += ["", "## Redirect aliases", ""]
    L += table(lambda r: r["status"] == "redirect", ["url", "notes"], ["Alias", "Target"])
    open(os.path.join(DOCS, "02-master-sitemap-keyword-matrix.md"), "w").write("\n".join(L) + "\n")


def write_backlog(rows):
    planned = [r for r in rows if r["status"].startswith("planned")]
    first20 = {}
    for url, title, cl, pillar, sec, prio, note in PLANNED:
        m = re.search(r"99#(\d+)", sec)
        if m:
            first20[int(m.group(1))] = url
    existing20 = {2: "/blog/ux-audit-checklist/", 4: "/blog/how-to-choose-a-product-design-agency/",
                  11: "/blog/saas-onboarding-ux-best-practices-india/", 12: "/blog/saas-dashboard-design-best-practices/"}
    L = ["# Content backlog", "",
         "> Generated by `scripts/seo/build_matrix.py`. Blueprint sections 35-42 (clusters), 52 (linkable assets), "
         "70-72 (competitor-derived, top-agency and pricing content), 99 (first 20 assets) and 108 (task format).", "",
         "**Status: nothing here is written yet, on purpose.** Section 114: *\"I would not start writing the new articles yet.\"* "
         "The core site comes first; these tasks start after the owner approves staging. Every task must pass the section 81 "
         "quality gate and cite evidence IDs from `data/evidence.json` (section 47).", "",
         "## First 20 content assets (section 99), in priority order", "",
         "| # | Asset | URL | State |", "|---|---|---|---|"]
    titles = {1: "How Much Does Product Design Cost?", 2: "UX Audit Checklist", 3: "UX Audit Cost", 4: "How to Choose a Product Design Agency",
              5: "Product Design Agency vs Freelancer", 6: "In-House Designer vs Design Agency", 7: "How to Redesign a Website",
              8: "Website Redesign Cost", 9: "SaaS Product Design Process", 10: "SaaS Product Design Cost", 11: "SaaS UX Onboarding Guide",
              12: "SaaS Dashboard UX Best Practices", 13: "SaaS Product Redesign Guide", 14: "Design System ROI", 15: "Design System Governance",
              16: "UX Research vs UX Audit", 17: "Heuristic Evaluation of a Website", 18: "AI Product UX Patterns", 19: "Chatbot UI Design", 20: "AI Agent UX Guide"}
    byurl = {r["url"]: r for r in rows}
    for i in range(1, 21):
        if i in existing20:
            u = existing20[i]
            L.append(f"| {i} | {titles[i]} | `{u}` | Exists — UPDATE/EXPAND per matrix (`{byurl.get(u, {}).get('action', '')}`) |")
        else:
            u = first20.get(i, "")
            r = byurl.get(u, {})
            L.append(f"| {i} | {titles[i]} | `{u}` | {r.get('action', 'CREATE')}{' — ' + r['notes'] if r.get('notes') else ''} |")
    L += ["", "## Task cards (section 108 format)", "",
          "One card per planned URL. Fields the owner or writer must fill before work starts are marked *(brief)*: "
          "they need first-party input this repository does not contain.", ""]
    for r in planned:
        L += [f"### {r['h1']}", "",
              f"- **Problem / question:** *(brief)*",
              f"- **Keyword:** {r['primary_keyword']} · **Parent topic:** {r['cluster']} · **Search intent:** {r['search_intent']} · **Buyer stage:** {r['buyer_stage']}",
              f"- **Why this topic matters:** named in blueprint section {r['keyword_source'].replace('blueprint section ', '')}",
              f"- **Target URL:** `{r['url']}` · **Existing page?** {'YES — ' + r['action'] if r['action'].startswith('EXPAND') else 'NO'}",
              f"- **Action:** {r['action']}",
              f"- **Secondary topics / AEO questions / GEO entities / SERP competitors / information gaps:** *(brief, section 65)*",
              f"- **Original Designit contribution · first-party evidence:** *(brief; evidence IDs from data/evidence.json)*",
              f"- **Internal links:** pillar `{r['pillar']}` + 2 siblings in the cluster + 1 service + 1 case study where genuinely useful (section 67)",
              f"- **External sources:** *(brief)* · **CTA:** by intent (section 89) · **Schema:** {'BlogPosting + BreadcrumbList + WebPage' if r['page_type'] == 'article' else 'WebPage + BreadcrumbList'}",
              f"- **Visual assets:** *(brief, section 97)* · **Author:** Designit · **Reviewer:** Sahil Sharma, only if he reviews it (section 48) · **Review date:** set at publish",
              f"- **Notes:** {r.get('notes') or '—'}", ""]
    L += ["## Rules carried into every task", "",
          "- **Pricing content (section 72):** structure around what determines price (scope, research, platforms, complexity, team, timeline, "
          "design-system needs, iteration, implementation support). No universal prices; ranges only with evidence. Owner decision 2026-10-04: "
          "cost drivers only, no numbers.",
          "- **Top-agency queries (section 71):** no thin \"Top 20 agencies\" lists. Answer the buyer's evaluation questions instead.",
          "- **Competitor-derived topics (section 70):** the SE Ranking file gives language and problems, not a page list. Noise terms "
          "(2017/2018 trends, unrelated queries) are ignored.",
          "- **No invented stories, statistics, clients or research (section 46).** If a topic needs a case study that does not exist, "
          "the task waits.", ""]
    open(os.path.join(DOCS, "09-content-backlog.md"), "w").write("\n".join(L) + "\n")


if __name__ == "__main__":
    build()
