#!/usr/bin/env python3
"""Insights hub: topic clusters on /blog/ (blueprint sections 15, 17, 35-42). Each cluster links its pillar
page and its articles, with an anchor matching the blueprint's category path (/blog/saas/ -> #saas).
Category URLs are deferred until a cluster has enough articles to justify its own page. Idempotent."""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = [
 ("saas", "SaaS", "/services/saas-product-design/", "SaaS product design", [("SaaS onboarding UX best practices", "/blog/saas-onboarding-ux-best-practices-india/"), ("SaaS dashboard design best practices", "/blog/saas-dashboard-design-best-practices/"), ("B2B SaaS UI/UX design guide", "/blog/b2b-saas-ui-ux-design-services-india/"), ("CRO strategies for B2B SaaS", "/blog/cro-strategies-for-b2b-saas-india/")]),
 ("ux-audit", "UX audit", "/services/ux-audit/", "UX audit services", [("UX audit checklist", "/blog/ux-audit-checklist/"), ("What to expect from a UI/UX audit", "/blog/ui-ux-audit-for-website-india/"), ("Landing page conversion audits", "/blog/landing-page-conversion-audit-services-india/")]),
 ("ux-research", "UX research", "/services/ux-research/", "UX research services", [("UX audit vs UX research vs usability testing", "/services/ux-audit/#ux-audit-vs-ux-research-vs-usability-testing"), ("Research across the product lifecycle", "/services/ux-research/#research-across-the-product-lifecycle")]),
 ("ai", "AI and UX", "/services/ai-product-design/", "AI product design", [("How AI is changing UX design", "/blog/how-ai-is-changing-ux-design-india/"), ("Generative AI website personalisation", "/blog/generative-ai-website-personalization/"), ("AI-driven website design", "/blog/ai-driven-website-design-services-india/"), ("AI tools for UI/UX designers", "/blog/best-ai-tools-ui-ux-designers-2026/")]),
 ("design-systems", "Design systems", "/services/design-systems/", "Design system services", [("Design system cost in India", "/blog/design-system-cost-india-2026/"), ("Scaling a design system", "/solutions/design-system-scaling/")]),
 ("cro", "Conversion and websites", "/services/conversion-optimization/", "Conversion optimization", [("How to improve website conversion rate", "/blog/how-to-improve-website-conversion-rate-india/"), ("Why websites don't convert visitors", "/blog/why-website-not-converting-visitors-india/"), ("Landing page design for lead generation", "/blog/landing-page-design-lead-generation-india/"), ("B2B website redesign", "/blog/b2b-website-redesign-services-india/"), ("Custom website vs template", "/blog/custom-website-vs-template-roi-india/"), ("Why e-commerce bounce rates run high", "/blog/why-ecommerce-bounce-rate-so-high-india/")]),
 ("branding", "Branding", "/services/branding/", "Branding services", [("Startup branding: what it includes and costs", "/blog/branding-services-for-startups-india-cost/"), ("Choosing a branding agency for tech startups", "/blog/best-branding-agency-tech-startups-india/"), ("Visual identity vs branding", "/blog/visual-identity-vs-branding-startups/"), ("Signs your company needs a rebrand", "/blog/signs-your-company-needs-a-rebrand-india/")]),
 ("startup", "Startup decisions", "/services/product-design/", "Product design services", [("How to choose a product design agency", "/blog/how-to-choose-a-product-design-agency/"), ("Hire a designer or an agency?", "/blog/hire-ui-ux-designer-vs-agency-india/"), ("Freelancer vs design agency", "/blog/freelancer-vs-design-agency-startups/"), ("UI/UX design pricing in India", "/blog/ui-ux-design-pricing-india-2026/"), ("Mobile app UI/UX design cost", "/blog/cost-ui-ux-design-mobile-app-india/")]),
 ("industries", "Industry guides", "/industries/", "All industries", [("UX design for EdTech in India", "/blog/edtech-ux-design-india/"), ("EdTech onboarding UX", "/blog/edtech-onboarding-ux-india/"), ("Fintech KYC onboarding UX", "/blog/fintech-onboarding-kyc-ux-india/"), ("Fintech UX design playbook", "/blog/fintech-ux-design-agency-india/"), ("Arabic RTL UX for PropTech", "/blog/arabic-rtl-ux-design-proptech-uae/"), ("Dubai PropTech UI/UX", "/blog/ui-ux-design-agency-dubai-proptech/")]),
]
STYLE = ("<style>.topics{padding:8px 0 40px}.topics h2{font-size:clamp(24px,3vw,32px);font-weight:700;color:#fff;margin:0 0 6px;letter-spacing:-.5px}"
 ".topics>.container>p{color:var(--text-tertiary);margin:0 0 22px}.topic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}"
 ".topic{background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:16px;padding:22px;scroll-margin-top:96px}"
 ".topic h3{font-size:17px;font-weight:700;color:#fff;margin:0 0 4px}.topic .pillar{font-size:13px;color:#cfcfcf;text-decoration:underline;text-underline-offset:3px}"
 ".topic ul{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:7px}.topic li a{font-size:14px;color:#bdbdbd;text-decoration:underline;text-decoration-color:#555;text-underline-offset:3px}"
 ".topic li a:hover,.topic .pillar:hover{color:#fff}</style>")
def block():
    cards = "".join(
        f'<div class="topic" id="{cid}"><h3>{name}</h3><a class="pillar" href="{ph}">{pl} &rarr;</a><ul>'
        + "".join(f'<li><a href="{h}">{t}</a></li>' for t, h in links) + "</ul></div>"
        for cid, name, ph, pl, links in C)
    return ("<!-- topics:start -->\n" + STYLE + '\n  <section class="topics" aria-labelledby="topics-h"><div class="container">'
            '<h2 id="topics-h">Explore by topic</h2><p>Guides grouped by the problem you are working on, each linked to the service that solves it.</p>'
            f'<div class="topic-grid">{cards}</div></div></section>\n<!-- topics:end -->\n')
p = os.path.join(ROOT, "blog", "index.html"); s = open(p, encoding="utf-8").read()
s = re.sub(r"<!-- topics:start -->.*?<!-- topics:end -->\n", "", s, flags=re.S)
anchor = "  <!-- Category Filters -->"
assert anchor in s
s = s.replace(anchor, block() + anchor, 1)
open(p, "w", encoding="utf-8").write(s); print("topics block written:", len(C), "clusters")
