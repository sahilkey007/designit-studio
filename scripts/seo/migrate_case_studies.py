#!/usr/bin/env python3
"""One-off migration (October 2026): the 22 hand-written sub-project case studies (projects/<client>/<slug>.html)
become JSON specs under content/pages/work/<client>/<slug>.json, rendered by build_pages.py's case-study template.

Every heading, paragraph, card, image and FAQ answer on the old page is carried into the spec; --check proves it by
comparing word counts of the old <main> with the spec text. New storytelling fields (problem statement, who we
designed for, pain points, deliverables, platform, extra FAQs) are added to the specs afterwards, by hand.

Usage: python3 scripts/seo/migrate_case_studies.py            # write specs (only if the spec does not exist yet)
       python3 scripts/seo/migrate_case_studies.py --check    # verify no text was lost (old page vs spec)
"""
import glob, html, json, os, re, sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLIENT_DIR = {"adda247": "Adda247", "betacrew": "Betacrew", "kelp-global": "Kelp Global", "rcentric": "R-Centric",
              "tata-elxsi": "Tata Elxsi"}

def txt(x):
    x = re.sub(r"<br\s*/?>", " ", x)
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", x)).split())

def inner(x):
    """Keep inline markup (links, strong, em) but drop layout wrappers and line breaks."""
    x = re.sub(r"<br\s*/?>", " ", x)
    x = re.sub(r"</?(span|div)[^>]*>", "", x)
    return " ".join(x.split())

def label_of(body):
    m = re.search(r'class="(?:section-label|sec-label)"[^>]*>(.*?)</(?:p|span)>', body, re.S)
    return txt(m.group(1)) if m else ""

def h2_of(body):
    m = re.search(r"<h2[^>]*>(.*?)</h2>", body, re.S)
    return inner(m.group(1)) if m else ""

def paras(body):
    # top-level paragraphs that are not labels
    return [inner(p) for c, p in re.findall(r'<p(?:\s+class="([^"]*)")?[^>]*>(.*?)</p>', body, re.S)
            if not (c and ("label" in c)) and txt(p)]

def imgs(body):
    out = []
    for tag in re.findall(r"<img[^>]+>", body):
        g = lambda k: (re.search(k + r'="([^"]*)"', tag) or [None, None])[1]
        out.append({"src": g("src"), "alt": html.unescape(g("alt") or "")})
    return out

def extract(path):
    s = open(path, encoding="utf-8").read()
    head = s.split("</head>")[0]
    m = re.search(r"<main.*?</main>", s, re.S).group(0)
    m = re.sub(r"<svg.*?</svg>", "", m, flags=re.S)
    client_dir = path.split("/")[-2]
    slug_ = os.path.basename(path)[:-5]
    meta = lambda pat: html.unescape((re.search(pat, head) or [None, ""])[1])
    spec = {
        "url": f"/projects/{client_dir}/{slug_}/", "file": f"projects/{client_dir}/{slug_}.html",
        "template": "casestudy", "pageType": "case-study", "schemaType": "Article",
        "client": CLIENT_DIR[client_dir], "clientUrl": f"/projects/{client_dir}/",
        "metaTitle": meta(r"<title>(.*?)</title>"), "metaDescription": meta(r'<meta name="description" content="([^"]*)"'),
        "author": "Designit", "topicCluster": "Work", "funnelStage": "evaluation / vendor", "searchIntent": "evaluation",
        "conversionEvent": "start_project", "refreshInterval": "when new evidence is available", "action": "KEEP + RESTRUCTURE",
        "priority": "P2", "updatedAt": "2026-10-06",
    }
    secs = re.findall(r'<section class="([^"]+)"(.*?)</section>', m, re.S)
    for cls, body in secs:
        lab = label_of(body)
        if "pd-hero-img" in cls:
            spec["hero"] = imgs(body)[0]
        elif "pd-hero" in cls:
            bc = re.findall(r"<li>(.*?)</li>", body, re.S)
            spec["breadcrumbTrail"] = [txt(x) for x in bc]
            spec["kicker"] = lab
            spec["h1"] = inner(re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S).group(1))
            ps = [p for p in paras(body)]
            spec["summary"] = ps[0] if ps else ""
            spec["tags"] = [txt(x) for x in re.findall(r'<span(?: class="chip")?>([^<]+)</span>', body)
                            if txt(x) and txt(x) not in spec["breadcrumbTrail"]]
            live = re.search(r'<a[^>]+href="(https?://[^"]+)"[^>]*>(?:(?!</a>).)*View Website', body, re.S)
            if live: spec["liveUrl"] = live.group(1)
        elif "geo-glance" in cls:
            spec["glance"] = [[txt(v), txt(l)] for v, l in re.findall(
                r'class="glance-value"[^>]*>(.*?)</span>.*?class="glance-label"[^>]*>(.*?)</span>', body, re.S)]
        elif "pd-meta-grid" in body:
            cards = [[txt(l), inner(v)] for l, v in re.findall(
                r'class="label"[^>]*>(.*?)</div>\s*<div class="value"[^>]*>(.*?)</div>', body, re.S)]
            left = body.split('<ul class="pd-meta-grid"')[0] if '<ul class="pd-meta-grid"' in body else body.split("pd-meta-grid")[0]
            spec["overview"] = {"label": lab, "heading": h2_of(body), "paras": paras(left)}
            spec["metaCards"] = cards
        elif "pd-insight-row" in body:
            spec["insights"] = {"label": lab, "heading": h2_of(body), "intro": paras(body.split("pd-insight-row")[0]),
                                "items": [[txt(a), txt(b)] for a, b in re.findall(
                                    r'pd-insight-stat">(.*?)</div>\s*<div class="pd-insight-label">(.*?)</div>', body, re.S)]}
        elif "pd-challenges" in body:
            spec["challenges"] = {"label": lab, "heading": h2_of(body), "intro": paras(body.split("pd-challenges")[0]),
                                  "items": [{"title": inner(t), "body": inner(b)} for t, b in re.findall(
                                      r'pd-challenge">\s*<h3[^>]*>(.*?)</h3>\s*<p>(.*?)</p>', body, re.S)]}
        elif "pd-section-dark" in cls and "Problem Statement" in lab:
            spec["problemStatement"] = txt(re.search(r"<h2[^>]*>(.*?)</h2>", body, re.S).group(1)).strip('"“” ')
        elif "pd-process-steps" in body:
            steps = re.findall(r'class="(?:pd-process-num|step-num)"[^>]*>(.*?)</div>\s*<h3[^>]*>(.*?)</h3>\s*<p>(.*?)</p>', body, re.S)
            spec["approach"] = {"label": lab, "heading": h2_of(body), "intro": paras(body.split("pd-process-steps")[0]),
                                "steps": [{"k": txt(k), "title": inner(t), "body": inner(b)} for k, t, b in steps]}
        elif "pd-features" in body:
            items = re.findall(r'class="pd-feature(?:-card)?"[^>]*>\s*(?:<div[^>]*>.*?</div>\s*)?<h3[^>]*>(.*?)</h3>\s*<p>(.*?)</p>', body, re.S)
            key = "decisions" if "Design Decisions" in lab else "features"
            spec[key] = {"label": lab, "heading": h2_of(body), "intro": paras(body.split("pd-features")[0]),
                         "items": [{"title": inner(t), "body": inner(b)} for t, b in items]}
        elif "pd-gallery" in body:
            spec["gallery"] = {"label": lab, "heading": h2_of(body), "images": imgs(body)}
        elif "pd-results-grid" in body:
            nums = re.findall(r'class="(?:pd-result-num|num)"[^>]*>(.*?)</(?:div|span)>\s*<(?:div|span) class="(?:pd-result-label|label)"[^>]*>(.*?)</(?:div|span)>', body, re.S)
            spec["results"] = {"label": lab, "heading": h2_of(body), "intro": paras(body.split("pd-results-grid")[0]),
                               "items": [[txt(a), txt(b)] for a, b in nums]}
        elif "pd-nav" in body:
            spec["navLinks"] = [[txt(t), h] for h, t in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', body, re.S)]
        elif "pd-section-dark" in cls and "similar challenge" in body:
            continue
        elif "geo-faq" in cls:
            continue
        elif "pd-section" in cls and lab in ("The Problem", "Problem Statement"):
            spec["challenges"] = {"label": lab, "heading": h2_of(body), "paras": paras(body)}
        elif "pd-section" in cls and lab in ("The Solution", "Solution"):
            spec["solution"] = {"label": lab, "heading": h2_of(body), "paras": paras(body)}
        else:
            spec.setdefault("unmapped", []).append({"cls": cls, "label": lab, "text": txt(body)[:400]})
    # FAQ: full answers live in the FAQPage JSON-LD
    for blk in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        d = json.loads(blk)
        for node in d.get("@graph", [d]):
            if node.get("@type") == "FAQPage":
                spec["faqExisting"] = [{"q": q["name"], "a": q["acceptedAnswer"]["text"]} for q in node["mainEntity"]]
    return spec

def words(t):
    return Counter(re.findall(r"[A-Za-z0-9'’&+/.%-]+", t))

def spec_text(spec):
    out = []
    def walk(v):
        if isinstance(v, dict):
            for k, x in v.items():
                if k not in ("src", "url", "file", "template", "pageType", "schemaType", "clientUrl", "href"): walk(x)
        elif isinstance(v, list):
            for x in v: walk(x)
        elif isinstance(v, str):
            out.append(txt(v))
    walk(spec)
    return " ".join(out)

if __name__ == "__main__":
    check = "--check" in sys.argv
    pages = sorted(glob.glob(os.path.join(ROOT, "projects/*/*.html")))
    bad = 0
    for p in pages:
        rel = os.path.relpath(p, ROOT)
        client_dir, slug_ = rel.split("/")[1], os.path.basename(rel)[:-5]
        dest = os.path.join(ROOT, "content/pages/work", client_dir, slug_ + ".json")
        if check:
            src = os.popen(f'git -C "{ROOT}" show HEAD:"{rel}"').read() or open(p).read()
            if "generated: build_pages.py" in src.split("<main")[0] and not os.path.exists(dest):
                continue
            main_old = re.sub(r"<svg.*?</svg>", "", re.search(r"<main.*?</main>", src, re.S).group(0), flags=re.S)
            main_old = re.sub(r'<section class="pd-section-dark">\s*<div[^>]*>\s*<h2[^>]*>Have a similar challenge\?.*?</section>', "", main_old, flags=re.S)
            main_old = re.sub(r'<div class="pd-nav">.*?</div>\s*</div>', "", main_old, flags=re.S)
            old = words(txt(main_old).replace("⌄", ""))
            new = words(spec_text(json.load(open(dest))))
            miss = {w: c - new[w] for w, c in old.items() if new[w] < c}
            print(("OK  " if not miss else "MISS"), rel, "" if not miss else miss)
            bad += bool(miss)
            continue
        spec = extract(p)
        if spec.get("unmapped"):
            print("  unmapped in", rel, [u["label"] or u["cls"] for u in spec["unmapped"]])
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if os.path.exists(dest):
            print("exists, skipped", dest); continue
        json.dump(spec, open(dest, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
        open(dest, "a").write("\n")
        print("wrote", os.path.relpath(dest, ROOT))
    sys.exit(1 if bad else 0)
