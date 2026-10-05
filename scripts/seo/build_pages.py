#!/usr/bin/env python3
"""
Designit page builder (blueprint sections 92-93: reusable SEO/content components for a static site).

Every page spec lives in content/pages/**.json and follows the SEO data model from blueprint section 62
(primaryKeyword, searchIntent, funnelStage, topicCluster, pillarPage, evidenceIds, relatedServices, ...).
This script renders each spec into the live site shell so head scripts, consent handling, critical CSS,
navigation and footer stay identical to the rest of the site, and writes:

  * the HTML page (marked <!-- generated: build_pages.py -->, so apply_chrome.py leaves it alone)
  * data/pages-index.json  - the SEO data model for every generated page (feeds the keyword/URL matrix)

Components: SEOHead, OrganizationSchema, ServiceSchema, WebPage/CollectionPage schema, Breadcrumbs (visible +
JSON-LD), AnswerBlock, ProblemMap, Cards, Steps, Stages, Checklist, Table, Compare, CaseStudyCard,
Testimonials, InsightClusters, ProjectFacts, Prose, FAQBlock, SourceNote, RelatedContent, CTA, LastUpdated.

Usage:  python3 scripts/seo/build_pages.py            # build every spec
        python3 scripts/seo/build_pages.py services/ux-audit   # build one (path under content/pages, no .json)
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMP = os.path.join(ROOT, "scripts", "seo", "components")
CONTENT = os.path.join(ROOT, "content", "pages")
SITE = "https://designit.co.in"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_chrome import nav_for  # noqa: E402  (same nav markup + active state as hand-written pages)

def read(p): return open(p, encoding="utf-8").read()
SHELL = read(os.path.join(COMP, "shell.html"))
FOOTER = read(os.path.join(COMP, "footer.html")).rstrip("\n")
TOOL_CSS = re.sub(r"\s*\n\s*", "", re.sub(r"/\*.*?\*/", "", read(os.path.join(COMP, "tool.css")), flags=re.S))
PAGE_CSS = re.sub(r"\s*\n\s*", "", re.sub(r"/\*.*?\*/", "", read(os.path.join(COMP, "page.css")), flags=re.S))
ENT = json.load(open(os.path.join(ROOT, "data", "entities.json"), encoding="utf-8"))
WORK = json.load(open(os.path.join(ROOT, "data", "work.json"), encoding="utf-8"))
QUOTES = json.load(open(os.path.join(ROOT, "data", "testimonials.json"), encoding="utf-8"))

def a(s): return html.escape(str(s), quote=True)
def plain(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", str(s)))).strip()
def slug(s): return re.sub(r"[^a-z0-9]+", "-", plain(s).lower()).strip("-")[:60]

# ---------------------------------------------------------------- components
def cta_button(c, primary=True):
    cls = "btn btn-primary btn-lg" if primary else "btn btn-outline btn-lg"
    href = c.get("href", "/start-a-project/")
    ev = f' data-track="{a(c["event"])}"' if c.get("event") else ""
    ext = ' target="_blank" rel="noopener"' if href.startswith("http") else ""
    return f'<a href="{a(href)}" class="{cls}"{ev}{ext}>{c["label"]}</a>'

def breadcrumbs_html(crumbs):
    items = []
    for i, (name, href) in enumerate(crumbs):
        last = i == len(crumbs) - 1
        items.append(f'<li><span aria-current="page">{name}</span></li>' if last else f'<li><a href="{a(href)}">{name}</a></li>')
    return f'<nav aria-label="Breadcrumb"><ol class="bc">{"".join(items)}</ol></nav>'

def hero(p):
    pills = "".join(f'<span class="tag">{x}</span>' for x in p.get("eyebrow", []))
    ctas = p.get("ctas", [])
    btns = "".join(cta_button(c, i == 0) for i, c in enumerate(ctas))
    bc = breadcrumbs_html(p["breadcrumb"]) if p.get("breadcrumb") and len(p["breadcrumb"]) > 1 else ""
    return f'''    <section class="geo-hero">
        <div class="container">
            {bc}
            {f'<div class="hero-pills reveal">{pills}</div>' if pills else ''}
            <h1 class="gradient-text reveal">{p["h1"]}</h1>
            <p class="subtitle reveal">{p["subtitle"]}</p>
            {f'<div class="hero-ctas reveal">{btns}</div>' if btns else ''}
        </div>
    </section>
'''

def head_block(s):
    out = ""
    if s.get("heading"): out += f'<h2 class="pg-h2">{s["heading"]}</h2>'
    if s.get("intro"): out += f'<p class="pg-intro">{s["intro"]}</p>'
    return out

def sec(s, inner):
    sid = s.get("id") or slug(s.get("heading", "section"))
    return f'''    <section class="pg-section" id="{a(sid)}">
        <div class="container">
            {head_block(s)}
            {inner}
        </div>
    </section>
'''

def r_answer(s):
    body = "".join(f"<p>{x}</p>" for x in s.get("body", []))
    return sec(s, f'<div class="answer-block"><p class="answer">{s["answer"]}</p>{body}</div>')

def r_prose(s):
    return sec(s, '<div class="prose">' + "".join(f"<p>{x}</p>" for x in s["paras"]) + "</div>")

def card(it):
    kicker = f'<p class="card-kicker">{it["kicker"]}</p>' if it.get("kicker") else ""
    body = f'<div class="card-body"><p>{it["body"]}</p></div>' if it.get("body") else ""
    if it.get("href"):
        more = f'<span class="card-more">{it.get("more", "Learn more")} &rarr;</span>'
        return f'<a class="card" href="{a(it["href"])}">{kicker}<h3>{it["title"]}</h3>{body}{more}</a>'
    return f'<div class="card">{kicker}<h3>{it["title"]}</h3>{body}</div>'

def r_cards(s): return sec(s, '<div class="card-grid">' + "".join(card(i) for i in s["items"]) + "</div>")

def r_problems(s):
    rows = "".join(
        f'<div class="problem-row"><div><h3>{i["problem"]}</h3><p>{i["detail"]}</p></div>'
        f'<a class="route" href="{a(i["href"])}"><span>Start with</span> {i["route"]} &rarr;</a></div>'
        for i in s["items"])
    return sec(s, f'<div class="problem-map">{rows}</div>')

def r_steps(s):
    return sec(s, '<ol class="steps">' + "".join(f'<li class="step"><h3>{i["title"]}</h3><p>{i["body"]}</p></li>' for i in s["items"]) + "</ol>")

def r_stages(s):
    return sec(s, '<div class="stage-list">' + "".join(
        f'<div class="stage"><div class="stage-k">{i["key"]}</div><div><h3>{i["title"]}</h3><p>{i["body"]}</p></div></div>'
        for i in s["items"]) + "</div>")

def r_checklist(s):
    return sec(s, '<ul class="check-grid">' + "".join(f"<li><span>{i}</span></li>" for i in s["items"]) + "</ul>")

def r_table(s):
    th = "".join(f'<th scope="col">{c}</th>' for c in s["columns"])
    rows = "".join("<tr>" + f'<th scope="row">{r[0]}</th>' + "".join(f"<td>{c}</td>" for c in r[1:]) + "</tr>" for r in s["rows"])
    label = a(plain(s.get("heading", "Comparison table")))
    return sec(s, f'<div class="table-wrap" tabindex="0" role="region" aria-label="{label}"><table class="data-table"><thead><tr>{th}</tr></thead><tbody>{rows}</tbody></table></div>')

def r_compare(s):
    def col(c):
        pts = "".join(f"<li>{x}</li>" for x in c["points"])
        return f'<div class="card"><h3>{c["title"]}</h3><div class="card-body"><p>{c.get("summary", "")}</p></div><ul>{pts}</ul></div>'
    return sec(s, f'<div class="compare">{col(s["left"])}{col(s["right"])}</div>')

def work_card(key):
    w = WORK[key]
    return (f'<a class="work-card" href="{a(w["href"])}" data-industry="{a(w["filterIndustry"])}" data-service="{a(" ".join(w["filterServices"]))}">'
            f'<img src="{a(w["img"])}" width="1200" height="750" alt="{a(w["alt"])}" loading="lazy">'
            f'<div class="wc-body"><h3>{w["client"]}</h3><p class="wc-product">{w["product"]}</p>'
            f'<dl><dt>Industry</dt><dd>{w["industry"]}</dd><dt>Service</dt><dd>{w["service"]}</dd>'
            f'<dt>Problem</dt><dd>{w["problem"]}</dd><dt>Outcome</dt><dd>{w["outcome"]}</dd></dl>'
            f'<span class="wc-more">Read the case study &rarr;</span></div></a>')

def r_work(s): return sec(s, '<div class="work-grid">' + "".join(work_card(k) for k in s["items"]) + "</div>")

def r_quotes(s):
    out = []
    for k in s["items"]:
        q = QUOTES[k]
        out.append(f'<figure class="quote"><blockquote>&ldquo;{q["quote"]}&rdquo;</blockquote>'
                   f'<figcaption><strong>{q["name"]}</strong>{q["role"]}</figcaption></figure>')
    note = f'<p class="source-note">{s["note"]}</p>' if s.get("note") else ""
    return sec(s, '<div class="quote-grid">' + "".join(out) + "</div>" + note)

def r_clusters(s):
    out = []
    for c in s["items"]:
        lis = "".join(f'<li><a href="{a(l["href"])}">{l["label"]}</a></li>' for l in c["links"])
        title = f'<a href="{a(c["href"])}">{c["title"]}</a>' if c.get("href") else c["title"]
        out.append(f'<div class="cluster"><h3>{title}</h3><p>{c.get("desc", "")}</p><ul>{lis}</ul></div>')
    return sec(s, '<div class="cluster-grid">' + "".join(out) + "</div>")

def r_facts(s):
    return sec(s, '<dl class="facts">' + "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in s["items"]) + "</dl>")

def r_links(s):
    return sec(s, '<div class="card-grid">' + "".join(card({**i, "more": i.get("more", "Read")}) for i in s["items"]) + "</div>")

def r_html(s): return sec(s, s["html"])

def _img_dims(src):
    try:
        from PIL import Image
        with Image.open(os.path.join(ROOT, src.lstrip("/"))) as im: return im.size
    except Exception:
        return (1200, 750)

def r_modules(s):
    out = []
    for m in s["items"]:
        w, h = _img_dims(m["img"])
        out.append(f'<a class="work-card" href="{a(m["href"])}"><img src="{a(m["img"])}" width="{w}" height="{h}" alt="{a(m.get("alt", plain(m["title"])))}" loading="lazy">'
                   f'<div class="wc-body"><h3>{m["title"]}</h3><p class="wc-product">{m["desc"]}</p><span class="wc-more">Read the case study &rarr;</span></div></a>')
    return sec(s, '<div class="work-grid">' + "".join(out) + "</div>")

def r_logos(s):
    """Logo marquee (Magic UI "Marquee" pattern, plain CSS). The second list is a visual duplicate for the seamless
    loop, hidden from assistive tech. The pause button satisfies WCAG 2.2.2; ui.js reveals and wires it."""
    def lis(dup):
        return "".join(f'<li><img src="{a(l["src"])}" alt="{"" if dup else a(l["alt"])}" width="{l["w"]}" height="{l["h"]}" loading="lazy"></li>'
                       for l in s["items"])
    pause = ('<button class="logo-pause" type="button" aria-pressed="false" hidden><span class="sr-only">Pause logo animation</span>'
             '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path class="i-pause" d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor"/>'
             '<path class="i-play" d="M3 2l7 4-7 4z" fill="currentColor"/></svg></button>')
    return sec(s, f'<div class="logo-rail"><div class="logo-marquee"><ul class="logo-strip">{lis(False)}</ul>'
                  f'<ul class="logo-strip" aria-hidden="true">{lis(True)}</ul></div>{pause}</div>')

def r_tool(s):
    """Interactive self-assessment (blueprint section 52). Every question is plain HTML, so the checklist is readable
    and crawlable without JavaScript; checklist-tool.js adds scoring, a start-here list, copy, print and saving."""
    k = 0
    groups = []
    for gi, g in enumerate(s["groups"], 1):
        items = []
        for q in g["items"]:
            k += 1
            opts = "".join(f'<label class="ct-opt"><input type="radio" name="q{k}" value="{v}"><span>{l}</span></label>'
                           for v, l in (("2", "Yes"), ("1", "Partly"), ("0", "No"), ("na", "N/A")))
            items.append(f'<div class="ct-item" data-q="{k}"><p class="ct-q" id="{a(s["tool"])}-q{k}">{q}</p>'
                         f'<div class="ct-opts" role="radiogroup" aria-labelledby="{a(s["tool"])}-q{k}">{opts}</div></div>')
        groups.append(f'<fieldset class="ct-group"><legend class="ct-gh">{gi}. {g["title"]}</legend>{"".join(items)}</fieldset>')
    bands = a(json.dumps(s["bands"], ensure_ascii=False))
    inner = (f'<form class="ct" data-tool="{a(s["tool"])}" data-name="{a(s["name"])}" data-bands="{bands}" novalidate>'
             + "".join(groups)
             + '<div class="ct-bar" aria-hidden="true"><span class="ct-bar-p">0 answered</span><span class="ct-bar-s"></span></div>'
             '<div class="ct-summary" aria-live="polite"><p class="ct-progress">Answer the questions above to see your score.</p>'
             '<div class="ct-result" hidden></div>'
             '<div class="ct-actions" hidden><button type="button" class="btn btn-sm" data-act="copy">Copy results</button>'
             '<button type="button" class="btn btn-sm" data-act="print">Print</button>'
             '<button type="button" class="btn btn-sm" data-act="reset">Start again</button></div></div></form>')
    return sec(s, inner)

RENDER = {"answer": r_answer, "prose": r_prose, "cards": r_cards, "problems": r_problems, "steps": r_steps,
          "stages": r_stages, "checklist": r_checklist, "table": r_table, "compare": r_compare, "work": r_work,
          "quotes": r_quotes, "clusters": r_clusters, "facts": r_facts, "links": r_links, "html": r_html, "logos": r_logos, "modules": r_modules, "tool": r_tool}

def faq_block(p):
    if not p.get("faq"): return ""
    items = "".join(
        f'<div class="faq-item"><h3 class="faq-h"><button class="faq-q" type="button">{f["q"]} <span class="faq-chevron" aria-hidden="true">&#8964;</span></button></h3>'
        f'<div class="faq-a"><p>{f["a"]}</p></div></div>' for f in p["faq"])
    heading = p.get("faqHeading", "Frequently asked questions")
    return f'''    <section class="pg-section" id="faq">
        <div class="container">
            <h2 class="pg-h2">{heading}</h2>
            <div class="faq-list">{items}</div>
        </div>
    </section>
'''

def cta_section(p):
    c = p.get("cta")
    if not c: return ""
    btns = "".join(cta_button(b, i == 0) for i, b in enumerate(c.get("buttons", [])))
    return f'''    <section class="geo-cta-section">
        <div class="container">
            <h2 class="gradient-text reveal">{c["heading"]}</h2>
            <p class="reveal">{c["body"]}</p>
            <div class="hero-ctas reveal">{btns}</div>
        </div>
    </section>
'''

def page_meta(p):
    bits = [f'Last updated {fmt_date(p["updatedAt"])}']
    if p.get("reviewer"): bits.append(f'Reviewed by {p["reviewer"]}')
    return f'    <p class="page-meta">{" &middot; ".join(bits)}</p>\n'

def fmt_date(d):
    y, m, dd = d.split("-")
    return f"{int(dd)} {['January','February','March','April','May','June','July','August','September','October','November','December'][int(m)-1]} {y}"

# ---------------------------------------------------------------- head + schema
def seo_head(p, url):
    title = p["metaTitle"]; desc = p["metaDescription"]
    og_t = p.get("ogTitle", title); img = SITE + p.get("ogImage", "/og-preview.jpg")
    robots = "index,follow,max-image-preview:large" if p.get("indexable", True) else "noindex,follow"
    kw = f'\n    <meta name="keywords" content="{a(", ".join([p["primaryKeyword"]] + p.get("secondaryKeywords", [])))}">' if p.get("primaryKeyword") else ""
    return f'''    <title>{a(title)}</title>
    <meta name="description" content="{a(desc)}">{kw}
    <meta name="robots" content="{robots}">

    <!-- Open Graph -->
    <meta property="og:site_name" content="Designit">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_US"/>
    <meta property="og:url" content="{url}">
    <meta property="og:title" content="{a(og_t)}">
    <meta property="og:description" content="{a(desc)}">
    <meta property="og:image" content="{img}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{url}">
    <meta name="twitter:title" content="{a(og_t)}">
    <meta name="twitter:description" content="{a(desc)}">
    <meta name="twitter:image" content="{img}">

    <!-- Canonical + hreflang -->
    <link rel="canonical" href="{url}">
    <link rel="alternate" hreflang="en" href="{url}"/>
    <link rel="alternate" hreflang="x-default" href="{url}"/>'''

def jsonld(p, url):
    org, web = ENT["organization"], ENT["website"]
    graph = [org, web]
    crumbs = p.get("breadcrumb") or [["Home", "/"]]
    bc_id = url + "#breadcrumb"
    if len(crumbs) > 1:
        graph.append({"@type": "BreadcrumbList", "@id": bc_id, "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": plain(n), "item": SITE + h} for i, (n, h) in enumerate(crumbs)]})
    wp_type = "CollectionPage" if p["pageType"] in ("hub",) else ("AboutPage" if p["pageType"] == "about" else "WebPage")
    webpage = {"@type": wp_type, "@id": url + "#webpage", "url": url, "name": plain(p["metaTitle"]),
               "description": plain(p["metaDescription"]), "isPartOf": {"@id": SITE + "/#website"},
               "inLanguage": "en", "dateModified": p["updatedAt"], "publisher": {"@id": SITE + "/#organization"}}
    if len(crumbs) > 1: webpage["breadcrumb"] = {"@id": bc_id}
    if p.get("about"): webpage["about"] = [{"@type": "Thing", "name": x} for x in p["about"]]
    if p["pageType"] == "service":
        svc = {"@type": "Service", "@id": url + "#service", "name": p["serviceName"], "url": url,
               "description": plain(p.get("serviceDescription", p["metaDescription"])),
               "serviceType": p.get("serviceType", [p["serviceName"]]),
               "provider": {"@id": SITE + "/#organization"},
               "areaServed": [{"@type": "Country", "name": c} for c in ("India", "United States", "United Kingdom", "United Arab Emirates")],
               "audience": {"@type": "BusinessAudience", "audienceType": p.get("audienceType", "SaaS, technology and enterprise teams")}}
        webpage["mainEntity"] = {"@id": url + "#service"}
        graph.append(svc)
    if p["pageType"] == "hub" and p.get("itemList"):
        graph.append({"@type": "ItemList", "@id": url + "#list", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "url": SITE + h, "name": plain(n)} for i, (n, h) in enumerate(p["itemList"])]})
        webpage["mainEntity"] = {"@id": url + "#list"}
    if p["pageType"] == "case-study":
        art = {"@type": "Article", "@id": url + "#article", "headline": plain(p["h1"]), "description": plain(p["metaDescription"]),
               "url": url, "mainEntityOfPage": {"@id": url + "#webpage"}, "author": {"@id": SITE + "/#organization"},
               "publisher": {"@id": SITE + "/#organization"}, "dateModified": p["updatedAt"], "inLanguage": "en",
               "about": [{"@type": "Organization", "name": p["client"]}] + [{"@type": "Thing", "name": x} for x in p.get("about", [])]}
        if p.get("ogImage"): art["image"] = SITE + p["ogImage"]
        graph.append(art)
    graph.append(webpage)
    if p.get("faq"):
        graph.append({"@type": "FAQPage", "@id": url + "#faq", "mainEntity": [
            {"@type": "Question", "name": plain(f["q"]), "acceptedAnswer": {"@type": "Answer", "text": plain(f["a"])}} for f in p["faq"]]})
    return ('    <!-- Structured Data -->\n    <script type="application/ld+json">\n'
            + json.dumps({"@context": "https://schema.org", "@graph": graph}, indent=2, ensure_ascii=False) + "\n    </script>")

# ---------------------------------------------------------------- build
def out_path(p):
    if p.get("file"): return os.path.join(ROOT, p["file"])
    u = p["url"].strip("/")
    if not u: return os.path.join(ROOT, "index.html")
    flat = os.path.join(ROOT, u + ".html")
    return flat if os.path.exists(flat) else os.path.join(ROOT, u, "index.html")

def build(spec_path):
    p = json.load(open(spec_path, encoding="utf-8"))
    url = SITE + p["url"]
    main = hero(p) + "".join(RENDER[s["type"]](s) for s in p.get("sections", [])) + faq_block(p) + cta_section(p) + page_meta(p)
    rel = os.path.relpath(out_path(p), ROOT)
    html_out = (SHELL.replace("{{SEO_HEAD}}", seo_head(p, url))
                     .replace("{{JSONLD}}", jsonld(p, url))
                     .replace("{{MODIFIED_META}}", f'<meta property="article:modified_time" content="{p["updatedAt"]}T00:00:00Z">')
                     .replace("{{PAGE_CSS}}", PAGE_CSS + p.get("css", "") + (TOOL_CSS if any(x["type"] == "tool" for x in p.get("sections", [])) else ""))
                     .replace("{{NAV}}", nav_for(rel))
                     .replace("{{FOOTER}}", FOOTER)
                     .replace("{{MAIN}}", main.rstrip("\n")))
    if p.get("topicCluster"):
        html_out = html_out.replace('<main id="main" tabindex="-1">', f'<main id="main" tabindex="-1" data-cluster="{a(p["topicCluster"])}">', 1)
    if p.get("scripts"):
        tags = "".join(f'    <script defer src="{a(src)}"></script>\n' for src in p["scripts"])
        html_out = html_out.replace("</body>", tags + "</body>", 1)
    os.makedirs(os.path.dirname(out_path(p)), exist_ok=True)
    open(out_path(p), "w", encoding="utf-8").write(html_out)
    model_keys = ["url", "pageType", "metaTitle", "metaDescription", "h1", "primaryKeyword", "secondaryKeywords",
                  "searchIntent", "businessIntent", "funnelStage", "audience", "topicCluster", "pillarPage", "parentTopic",
                  "author", "reviewer", "publishedAt", "updatedAt", "schemaType", "evidenceIds", "externalSources",
                  "relatedServices", "relatedIndustries", "relatedCaseStudies", "aiAnswerTargets", "cta",
                  "conversionEvent", "refreshInterval", "indexable", "priority", "action"]
    rec = {k: p.get(k) for k in model_keys if k in p}
    rec["h2s"] = [plain(s.get("heading", "")) for s in p.get("sections", []) if s.get("heading")] + (["FAQ"] if p.get("faq") else [])
    rec["faq"] = [plain(f["q"]) for f in p.get("faq", [])]
    rec["internalLinks"] = sorted(set(re.findall(r'href="(/[^"#?]*)', main)))
    rec["file"] = rel
    warn = []
    if len(plain(p["metaTitle"])) > 60: warn.append(f"title {len(plain(p['metaTitle']))} > 60")
    if not 110 <= len(plain(p["metaDescription"])) <= 160: warn.append(f"description {len(plain(p['metaDescription']))} outside 110-160")
    if main.count("<h1") != 1: warn.append("h1 count != 1")
    for w in warn: print(f"  WARN {p['url']}: {w}")
    return rec, len(main)

if __name__ == "__main__":
    want = sys.argv[1:]
    specs = []
    for root, _, files in os.walk(CONTENT):
        for f in files:
            if f.endswith(".json"):
                key = os.path.relpath(os.path.join(root, f), CONTENT)[:-5]
                if not want or key in want: specs.append((key, os.path.join(root, f)))
    index_path = os.path.join(ROOT, "data", "pages-index.json")
    index = json.load(open(index_path)) if os.path.exists(index_path) else {}
    for key, path in sorted(specs):
        rec, n = build(path)
        index[rec["url"]] = rec
        print(f"built {rec['url']:44} -> {rec['file']:40} ({n:,} chars of main)")
    json.dump(dict(sorted(index.items())), open(index_path, "w"), indent=2, ensure_ascii=False)
