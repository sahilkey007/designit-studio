#!/usr/bin/env python3
"""Build llms.txt, llms-full.txt and ai/{summary,service,faq}.json from the
same sources the pages are rendered from, so the machine-readable summaries
can never say something the visible site does not.

Sources: data/entities.json, data/work.json, content/pages/**.json,
sitemap.xml + blog/sitemap.xml (for the full index and blog list).

Blueprint §55: llms.txt is not a ranking lever for Google. These files exist
for other AI clients and must stay a faithful mirror of visible content.

Usage: python3 scripts/seo/build_llms.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://designit.co.in"

SERVICE_ORDER = ["ux-research", "ux-audit", "product-design", "saas-product-design",
                 "mobile-app-design", "ai-product-design", "ui-ux-design", "design-systems",
                 "conversion-optimization", "website-design", "branding"]
SOLUTION_ORDER = ["mvp-design", "product-redesign", "legacy-product-modernization",
                  "design-system-scaling", "conversion-improvement"]
INDUSTRY_ORDER = ["b2b-saas", "ai", "fintech", "edtech", "real-estate", "e-commerce", "automotive"]
LOCATION_ORDER = ["usa", "uk", "dubai"]


def load(p):
    return json.loads((ROOT / p).read_text())


def text(s):
    """Visible text of an HTML fragment."""
    s = re.sub(r"<[^>]+>", "", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def spec(group, name):
    return load(f"content/pages/{group}/{name}.json")


def first(sections, kind):
    return next((s for s in sections if s["type"] == kind), None)


def item_title(i):
    if isinstance(i, dict):
        return text(i.get("title") or i.get("label") or i.get("text") or "")
    if isinstance(i, list):
        return text(i[0])
    return text(i)


def crumb(p):
    """Short page name: the last breadcrumb label."""
    bc = p.get("breadcrumb") or []
    return text(bc[-1][0]) if bc else text(p["h1"])


def page_block(p, level="###"):
    """Heading, link, H1 and the direct-answer unit for one page spec."""
    name = p.get("serviceName") or crumb(p)
    out = [f"{level} {name}", "", f"Page: [{name}]({SITE}{p['url']})", "", f"**{text(p['h1'])}**", ""]
    answers = [s for s in p.get("sections", []) if s["type"] == "answer"]
    ans = next((a for a in answers if "cost" not in a["heading"].lower()), None)  # a price answer is not a definition
    if ans:
        out += [f"*{text(ans['heading'])}*", "", text(ans["answer"]), ""]
    else:
        out += [text(p.get("subtitle") or p["metaDescription"]), ""]
    cards = first(p.get("sections", []), "cards") or first(p.get("sections", []), "problems")
    if cards and cards.get("items"):
        titles = [t for t in (item_title(i) for i in cards["items"]) if t]
        if titles:
            h = text(cards["heading"]).rstrip(":")
            out += [h + (" " if h.endswith("?") else ": ") + "; ".join(titles) + ".", ""]
    return out


def sitemap_urls(path):
    return re.findall(r"<loc>(.*?)</loc>", (ROOT / path).read_text())


def file_for(url):
    rel = url.replace(SITE, "").strip("/")
    for cand in ([ROOT / "index.html"] if not rel else
                 [ROOT / rel / "index.html", ROOT / f"{rel}.html"]):
        if cand.exists():
            return cand
    return None


def page_meta(url):
    f = file_for(url)
    if not f:
        return None, None
    h = f.read_text(errors="ignore")
    t = re.search(r"<title>(.*?)</title>", h, re.S)
    d = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', h)
    title = text(t.group(1)) if t else url
    title = re.sub(r"\s*[|–-]\s*Designit(\s+Studio)?\s*$", "", title)
    return title, (html.unescape(d.group(1)) if d else "")


def build():
    ent = load("data/entities.json")
    org = ent["organization"]
    work = load("data/work.json")
    work = work if isinstance(work, list) else list(work.values())
    home = load("content/pages/home.json")
    services = [spec("services", n) for n in SERVICE_ORDER]
    solutions = [spec("solutions", n) for n in SOLUTION_ORDER]
    industries = [spec("industries", n) for n in INDUSTRY_ORDER]
    locations = [spec("locations", n) for n in LOCATION_ORDER]
    desc = org["description"]
    founder = org.get("founder", {})
    addr = org.get("address", {})
    email = org.get("email", "contact@designit.co.in")
    phone = re.sub(r"^\+91(\d{3})(\d{3})(\d{4})$", r"+91 \1 \2 \3", org.get("telephone", ""))
    same_as = org.get("sameAs", [])
    stages = first(home["sections"], "stages")
    why = next(s for s in home["sections"] if s.get("id") == "why-designit")
    home_faq = [(text(f.get("q") or f.get("question")), text(f.get("a") or f.get("answer"))) for f in home.get("faq", [])]

    blog_urls = [u for u in sitemap_urls("blog/sitemap.xml") if u.rstrip("/") != f"{SITE}/blog"]
    blog = [(u, *page_meta(u)) for u in blog_urls]

    # ── llms.txt ──────────────────────────────────────────────────────
    L = ["# Designit", "", f"> {desc}", "",
         f"This file is a plain-text summary of designit.co.in for AI assistants. It mirrors what the website says; "
         f"it adds nothing that is not on the site. A complete page index is at [llms-full.txt]({SITE}/llms-full.txt).", "",
         "## What is Designit?", "", desc, "",
         "**Disambiguation:** Designit Studio (designit.co.in) is an independent product design studio headquartered in Noida, India. "
         "It is not affiliated with Designit A/S, the Aarhus-founded design consultancy owned by Wipro.", ""]
    if founder:
        L += [f"**Founder:** {founder.get('name', 'Sahil Sharma')}, {text(founder.get('description', 'a product designer with more than ten years of experience'))} "
              f"([LinkedIn]({next((s for s in founder.get('sameAs', []) if 'linkedin' in s), 'https://www.linkedin.com/in/best-design-studio/')})). "
              f"[About the studio]({SITE}/about/).", ""]
    L += ["## Why teams choose Designit", ""]
    for i in why["items"]:
        body = re.sub(r"\.\s*<a [^>]*>[^<]*</a>\.?\s*$", ".", i["body"])  # drop trailing "see also" link sentences
        if "below" in body:  # refers to on-page layout; meaningless out of context
            continue
        L.append(f"- **{text(i['title'])}** — {text(body)}")
    L += ["", "## How we work", "", text(stages.get("intro", "")), ""]
    L += [f"{n}. **{text(i['key'])}: {text(i['title'])}** — {text(i['body'])}" for n, i in enumerate(stages["items"], 1)]
    L += ["", "Designit designs, specifies and supports build through design QA and launch support. "
          "Development itself is done by the client's team or development partner.", ""]
    L += ["## Services", "", f"All services: [{SITE}/services/]({SITE}/services/)", ""]
    for p in services:
        L += page_block(p)
    L += ["## Solutions", "", "Engagements organised around a business situation rather than a deliverable. "
          f"Hub: [{SITE}/solutions/]({SITE}/solutions/)", ""]
    for p in solutions:
        L += page_block(p)
    L += ["## Industries", "", f"Hub: [{SITE}/industries/]({SITE}/industries/)", ""]
    for p in industries:
        L += page_block(p)
    L += ["## Markets", "", "Clients in India and the UAE; projects for teams in the United States and the United Kingdom. "
          f"Hub: [{SITE}/locations/]({SITE}/locations/)", ""]
    L += [f"- [{text(p['h1'])}]({SITE}{p['url']}) — {text(p['metaDescription'])}" for p in locations]
    L += ["", "## Clients and case studies", "",
          f"Published case studies: [{SITE}/projects/]({SITE}/projects/). Outcomes are described qualitatively; "
          "the site does not publish client metrics it cannot verify.", ""]
    for w in work:
        L += [f"### {w['client']} — {w['industry']}", "", f"Case study: [{w['client']}]({SITE}{w['href']})", "",
              f"- Product: {w['product']}", f"- Services: {w['service']}", f"- Problem: {w['problem']}",
              f"- What was delivered: {w['outcome']}", ""]
    L += ["## Frequently asked questions", "", "Answers as published on the homepage.", ""]
    for q, a in home_faq:
        L += [f"**{q}**", "", a, ""]
    L += ["## Contact", "", f"- Website: [designit.co.in]({SITE}/)", f"- Start a project: [{SITE}/start-a-project/]({SITE}/start-a-project/)",
          f"- Contact form: [{SITE}/contact/]({SITE}/contact/)", f"- Email: {email}"]
    if phone:
        L.append(f"- Phone: {phone}")
    if addr:
        L.append(f"- Location: {addr.get('streetAddress', '')}, {addr.get('addressLocality', '')}, "
                 f"{addr.get('addressRegion', '')} {addr.get('postalCode', '')}, India".replace(" ,", ","))
    L += [f"- Profile: [{s}]({s})" for s in same_as]
    L += ["", "## Key pages", ""]
    for label, path in [("Homepage", "/"), ("About", "/about/"), ("Services", "/services/"), ("Solutions", "/solutions/"),
                        ("Industries", "/industries/"), ("Work / case studies", "/projects/"), ("Insights", "/blog/"),
                        ("Resources", "/resources/"), ("Start a project", "/start-a-project/"), ("Contact", "/contact/"),
                        ("Careers", "/careers/")]:
        L.append(f"- [{label}]({SITE}{path})")
    L += ["", "## Insights", "", f"Practical writing for founders, product leaders and CTOs. Full index: [{SITE}/blog/]({SITE}/blog/)", ""]
    L += [f"- [{t}]({u}) — {d}" for u, t, d in blog if t]
    L += ["", "## Optional", "",
          f"- [Full page index (llms-full.txt)]({SITE}/llms-full.txt)",
          f"- [AI crawler permissions (ai.txt)]({SITE}/.well-known/ai.txt)",
          f"- [Machine-readable summary]({SITE}/ai/summary.json)",
          f"- [Structured FAQ]({SITE}/ai/faq.json)",
          f"- [Service catalogue]({SITE}/ai/service.json)",
          f"- [Blog RSS feed]({SITE}/blog/feed.xml)",
          f"- [XML sitemap]({SITE}/sitemap.xml)", ""]
    (ROOT / "llms.txt").write_text("\n".join(L))

    # ── llms-full.txt ─────────────────────────────────────────────────
    groups = [("Home", lambda p: p == ""), ("Services", lambda p: p.startswith("services")),
              ("Solutions", lambda p: p.startswith("solutions")), ("Industries", lambda p: p.startswith("industries")),
              ("Markets", lambda p: p.startswith("locations") or "design-agency" in p),
              ("Work", lambda p: p.startswith("projects")), ("Insights", lambda p: p.startswith("blog") or p.startswith("resources")),
              ("Company", lambda p: True)]
    seen, buckets = set(), {g: [] for g, _ in groups}
    for u in sitemap_urls("sitemap.xml") + sitemap_urls("blog/sitemap.xml"):
        if u in seen:
            continue
        seen.add(u)
        rel = u.replace(SITE, "").strip("/")
        g = next(g for g, test in groups if test(rel))
        buckets[g].append((u, page_meta(u)[0] or u))
    F = ["# Designit — full page index (llms-full.txt)", "",
         f"> Companion to [/llms.txt]({SITE}/llms.txt). Every indexable page on designit.co.in, from the XML sitemaps, with its page title.", "",
         "## About Designit", "", desc, "",
         "Designit Studio (designit.co.in) is independent and not affiliated with Designit A/S (Wipro).", "",
         f"- Founder: {founder.get('name', 'Sahil Sharma')} ([LinkedIn](https://www.linkedin.com/in/best-design-studio/))",
         f"- Email: {email}", f"- Start a project: [{SITE}/start-a-project/]({SITE}/start-a-project/)", ""]
    for g, _ in groups:
        if buckets[g]:
            F += [f"## {g}", ""] + [f"- [{t}]({u})" for u, t in buckets[g]] + [""]
    (ROOT / "llms-full.txt").write_text("\n".join(F))

    # ── ai/*.json ─────────────────────────────────────────────────────
    # Last content change, not build time: the newest updatedAt across the specs these files are built from.
    now = max(p.get("updatedAt", "") for p in [home] + services + solutions + industries + locations) + "T00:00:00Z"
    svc = [{"name": p.get("serviceName") or text(p["h1"]), "description": text(p.get("serviceDescription") or p["metaDescription"]),
            "url": SITE + p["url"]} for p in services]
    summary = {
        "name": "Designit", "legalName": "Designit",
        "description": desc, "url": SITE,
        "disambiguation": "Independent studio in Noida, India. Not affiliated with Designit A/S (Wipro).",
        "foundingLocation": "Noida, India",
        "founder": {"name": founder.get("name", "Sahil Sharma"), "url": "https://www.linkedin.com/in/best-design-studio/"},
        "location": {k: addr[k] for k in ("addressLocality", "addressRegion", "postalCode", "addressCountry") if k in addr},
        "contact": {"email": email, "phone": phone, "contactPage": f"{SITE}/contact/", "startAProject": f"{SITE}/start-a-project/"},
        "areaServed": ["India", "United Arab Emirates", "United States", "United Kingdom"],
        "industries": [crumb(p) for p in industries],
        "services": [s["name"] for s in svc],
        "solutions": [crumb(p) for p in solutions],
        "caseStudies": [{"client": w["client"], "industry": w["industry"], "url": SITE + w["href"]} for w in work],
        "deliveryModel": "Design through handoff, design QA and launch support; development by the client's team or development partner.",
        "sameAs": same_as,
        "lastModified": now,
    }
    (ROOT / "ai/summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n")
    service = {
        "name": "Designit", "description": desc, "url": SITE, "serviceType": "Product design studio",
        "areaServed": summary["areaServed"],
        "services": svc,
        "solutions": [{"name": n, "description": text(p["metaDescription"]), "url": SITE + p["url"]}
                      for n, p in zip(summary["solutions"], solutions)],
        "industries": [{"name": n, "url": SITE + p["url"]} for n, p in zip(summary["industries"], industries)],
        "deliveryModel": summary["deliveryModel"],
        "lastModified": now,
    }
    (ROOT / "ai/service.json").write_text(json.dumps(service, indent=2, ensure_ascii=False) + "\n")
    faq = {"source": f"{SITE}/", "faqs": [{"question": q, "answer": a} for q, a in home_faq]}
    for p in services:
        for f in p.get("faq", [])[:2]:
            faq["faqs"].append({"question": text(f["q"]), "answer": text(f["a"]), "source": SITE + p["url"]})
    (ROOT / "ai/faq.json").write_text(json.dumps(faq, indent=2, ensure_ascii=False) + "\n")
    print(f"llms.txt {len(L)} lines · llms-full.txt {sum(len(v) for v in buckets.values())} urls · "
          f"{len(svc)} services · {len(faq['faqs'])} faqs · {len(blog)} posts")


if __name__ == "__main__":
    build()
