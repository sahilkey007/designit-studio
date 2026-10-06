#!/usr/bin/env python3
"""Blog authorship + internal-link graph (blueprint sections 48, 66-69, 88-89).
For every post: visible "By Designit · Reviewed by Sahil Sharma, Founder" (owner decision 2026-10-04),
WebPage.reviewedBy in JSON-LD, and a "Where to go next" block linking the cluster pillar, a related
service or industry, a relevant case study and an intent-matched CTA. Idempotent (marker comments).
Usage: python3 scripts/seo/blog_graph.py"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REVIEWER = {"@type": "Person", "@id": "https://designit.co.in/about/#sahil-sharma", "name": "Sahil Sharma", "jobTitle": "Founder",
            "url": "https://www.linkedin.com/in/best-design-studio/", "sameAs": ["https://www.linkedin.com/in/best-design-studio/"]}
CL = {  # cluster: pillar, second link, case study, CTA (label, href)
 "saas":    (("SaaS product design services", "/services/saas-product-design/"), ("B2B SaaS product design", "/industries/b2b-saas/"), ("Case study: Kelp Global's SaaS suite", "/projects/kelp-global/"), ("Review your product with our UX audit", "/services/ux-audit/")),
 "audit":   (("UX audit services for SaaS, websites and apps", "/services/ux-audit/"), ("UX audit vs UX research", "/services/ux-audit/#ux-audit-vs-ux-research-vs-usability-testing"), ("Case study: Adda247 platform redesign", "/projects/adda247/"), ("Request a UX audit", "/start-a-project/")),
 "website": (("Website design and redesign", "/services/website-design/"), ("Conversion optimization through UX", "/services/conversion-optimization/"), ("Case study: seven luxury property websites", "/projects/rcentric/"), ("Discuss your website", "/start-a-project/")),
 "ai":      (("AI product design services", "/services/ai-product-design/"), ("Product design for AI startups", "/industries/ai/"), ("How we design products end to end", "/services/product-design/"), ("Discuss your AI product", "/start-a-project/")),
 "brand":   (("Branding for tech startups and B2B SaaS", "/services/branding/"), ("Website design", "/services/website-design/"), ("Branding resources", "/resources/"), ("Discuss your brand", "/start-a-project/")),
 "startup": (("Product design services", "/services/product-design/"), ("MVP design for startups", "/solutions/mvp-design/"), ("Selected product design work", "/projects/"), ("Start a project", "/start-a-project/")),
 "mobile":  (("Mobile app design for iOS and Android", "/services/mobile-app-design/"), ("Product design services", "/services/product-design/"), ("Case study: Adda247 app homepage redesign", "/projects/adda247/homepage-revamp/"), ("Discuss your app", "/start-a-project/")),
 "ds":      (("Design system services", "/services/design-systems/"), ("Scaling a design system", "/solutions/design-system-scaling/"), ("Case study: Kelp Global, three products on one system", "/projects/kelp-global/"), ("Discuss your design system", "/start-a-project/")),
 "edtech":  (("EdTech product design", "/industries/edtech/"), ("UX research services", "/services/ux-research/"), ("Case study: Adda247 learning platform", "/projects/adda247/"), ("Discuss your learning product", "/start-a-project/")),
 "fintech": (("Fintech UX design", "/industries/fintech/"), ("UX audit for onboarding and KYC", "/services/ux-audit/"), ("Case study: Betacrew Portle", "/projects/betacrew/"), ("Discuss your fintech product", "/start-a-project/")),
 "proptech":(("PropTech and real estate design", "/industries/real-estate/"), ("UX design for Dubai and the UAE", "/ux-design-agency-dubai/"), ("Case study: R-Centric property websites", "/projects/rcentric/"), ("Discuss your property platform", "/start-a-project/")),
}
POST = {
 "b2b-saas-ui-ux-design-services-india": "saas", "saas-onboarding-ux-best-practices-india": "saas", "saas-dashboard-design-best-practices": "saas", "cro-strategies-for-b2b-saas-india": "saas",
 "ux-audit-checklist": "audit", "ui-ux-audit-for-website-india": "audit", "landing-page-conversion-audit-services-india": "audit",
 "how-to-improve-website-conversion-rate-india": "website", "why-website-not-converting-visitors-india": "website", "landing-page-design-lead-generation-india": "website",
 "b2b-website-redesign-services-india": "website", "custom-website-vs-template-roi-india": "website", "why-ecommerce-bounce-rate-so-high-india": "website",
 "how-ai-is-changing-ux-design-india": "ai", "generative-ai-website-personalization": "ai", "ai-driven-website-design-services-india": "ai", "best-ai-tools-ui-ux-designers-2026": "ai",
 "branding-services-for-startups-india-cost": "brand", "best-branding-agency-tech-startups-india": "brand", "visual-identity-vs-branding-startups": "brand", "signs-your-company-needs-a-rebrand-india": "brand",
 "how-to-choose-a-product-design-agency": "startup", "hire-ui-ux-designer-vs-agency-india": "startup", "freelancer-vs-design-agency-startups": "startup", "ui-ux-design-pricing-india-2026": "startup",
 "cost-ui-ux-design-mobile-app-india": "mobile", "design-system-cost-india-2026": "ds",
 "edtech-ux-design-india": "edtech", "edtech-onboarding-ux-india": "edtech", "edtech-ux-design-agency-india": "edtech",
 "fintech-onboarding-kyc-ux-india": "fintech", "fintech-ux-design-agency-india": "fintech",
 "arabic-rtl-ux-design-proptech-uae": "proptech", "ui-ux-design-agency-dubai-proptech": "proptech",
}
A = 'style="color:#fff;text-decoration:underline;text-underline-offset:3px"'
def box(cluster, slug):
    (pl, ph), (sl, sh), (cl, ch), (cta, ctah) = CL[cluster]
    items = "".join(f'<li style="margin:0 0 10px"><a href="{h}" {A}>{l}</a></li>' for l, h in ((pl, ph), (sl, sh), (cl, ch)) if h.rstrip("/").split("#")[0] != f"/blog/{slug}")
    return ('<!-- next-steps:start -->\n<aside class="next-steps" aria-labelledby="next-steps-h" style="max-width:760px;margin:0 auto 3rem;padding:0 1.5rem">'
            '<div style="border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:1.75rem;background:#141414">'
            '<h2 id="next-steps-h" style="font-size:1.25rem;font-weight:700;color:#fff;margin:0 0 1rem">Where to go next</h2>'
            f'<ul style="list-style:none;padding:0;margin:0 0 1.25rem;font-size:1rem;line-height:1.5">{items}</ul>'
            f'<a href="{ctah}" data-track="post_cta" style="display:inline-block;padding:.7rem 1.25rem;border-radius:999px;background:#fff;color:#000;font-weight:600;text-decoration:none">{cta}</a>'
            '</div></aside>\n<!-- next-steps:end -->')
BYLINE = '<span class="byline-reviewed" style="color:#8f8f8f;font-size:.85rem;">· By Designit · Reviewed by <a href="/about/" style="color:#ddd;text-decoration:underline;text-underline-offset:3px">Sahil Sharma</a>, Founder</span>'

def jsonld_reviewer(s):
    out, pos, n = [], 0, 0
    for m in re.finditer(r'(<script type="application/ld\+json">)(.*?)(</script>)', s, re.S):
        try: d = json.loads(m.group(2))
        except Exception: continue
        nodes = d.get("@graph", [d]) if isinstance(d, dict) else []
        hit = False
        for node in nodes:
            t = node.get("@type"); t = t if isinstance(t, list) else [t]
            if "WebPage" in t and node.get("reviewedBy") != REVIEWER:
                node["reviewedBy"] = REVIEWER; hit = True
        if hit:
            out += [s[pos:m.start(2)], "\n" + json.dumps(d, indent=2, ensure_ascii=False) + "\n"]; pos = m.end(2); n += 1
    out.append(s[pos:]); return "".join(out), n

report = {"byline": 0, "box": 0, "schema": 0, "missing": []}
for slug, cluster in POST.items():
    p = os.path.join(ROOT, "blog", slug, "index.html")
    if not os.path.exists(p): report["missing"].append(slug); continue
    s = open(p, encoding="utf-8").read(); o = s
    s = re.sub(r"<!-- next-steps:start -->.*?<!-- next-steps:end -->\n?", "", s, flags=re.S)
    s = re.sub(r'<span class="byline-reviewed".*?</span></span>|<span class="byline-reviewed"[^>]*>.*?Founder</span>', "", s, flags=re.S)
    # byline: after the "N min read" span inside the post meta row; guide template: after the hero subtitle
    m = re.search(r'(<span[^>]*>\d+ min read</span>)', s)
    if m: s = s[: m.end()] + BYLINE + s[m.end():]; report["byline"] += 1
    else:
        m = re.search(r'(<p class="subtitle reveal">.*?</p>)', s, re.S)
        if m:
            s = s[: m.end()] + '\n            <p class="byline-reviewed-p" style="color:#8f8f8f;font-size:.9rem;margin-top:1rem">By Designit · Reviewed by <a href="/about/" style="color:#ddd;text-decoration:underline">Sahil Sharma</a>, Founder</p>' + s[m.end():]
            s = re.sub(r'(\n\s*<p class="byline-reviewed-p".*?</p>)(?=\n\s*<p class="byline-reviewed-p")', "", s, flags=re.S)
            report["byline"] += 1
    # next-steps block: after the article; guide template: before its closing CTA section
    if "</article>" in s: s = s.replace("</article>", "</article>\n" + box(cluster, slug), 1); report["box"] += 1
    elif '<section class="geo-cta-section">' in s: s = s.replace('<section class="geo-cta-section">', box(cluster, slug) + '\n    <section class="geo-cta-section">', 1); report["box"] += 1
    s = re.sub(r'<main\b([^>]*?)(?: data-cluster="[^"]*")?>', lambda m: f'<main{m.group(1)} data-cluster="{cluster}">', s, count=1)
    s, n = jsonld_reviewer(s); report["schema"] += min(n, 1)
    if s != o: open(p, "w", encoding="utf-8").write(s)
print(report)
