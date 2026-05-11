# SEO Manual Steps — designit.co.in

All technical SEO work is shipped (commit `ef7f90c`). These steps require
browser access and cannot be done from code.

---

## Step 1 — Google Search Console (do first, today)

**Why:** Tells Google the site exists. Without this, indexing is passive and
slow. With it, you can request crawling immediately.

1. Go to https://search.google.com/search-console/
2. Click **Add property → Domain** (not URL prefix)
3. Enter `designit.co.in`
4. Google will give you a DNS TXT record like:
   ```
   google-site-verification=XXXXXXXXXXXXXXXXXXXXXXX
   ```
5. Add that TXT record at GoDaddy (same place you just set the A record)
6. Click **Verify** in Search Console
7. Once verified, go to **Sitemaps** and submit:
   - `https://designit.co.in/sitemap.xml`
   - `https://designit.co.in/blog/sitemap.xml`
8. Go to **URL Inspection** and request indexing for these URLs one by one:
   - `https://designit.co.in/`
   - `https://designit.co.in/about`
   - `https://designit.co.in/projects`
   - `https://designit.co.in/pricing`
   - `https://designit.co.in/blog/`

**Expected:** Google will crawl within 24–72 hours. First rankings appear
in 2–4 weeks.

---

## Step 2 — Google Business Profile

**Why:** Boosts branded search (`"designit studio noida"`, `"designit.co.in"`).
Even remote studios benefit.

1. Go to https://business.google.com/
2. Search for `Designit` — if it already exists, claim it
3. If not, **Add your business**:
   - Business name: `Designit`
   - Category: `Web designer` or `Graphic designer`
   - Location: Noida, Uttar Pradesh (service-area business is fine if fully remote)
   - Website: `https://designit.co.in`
   - Phone: your number
4. Verify by postcard or phone call
5. After verification, add:
   - Description (500 chars): copy from the site's hero
   - Services: UI/UX Design, Product Design, Branding, Website Redesign
   - Photos: logo + 3–4 project screenshots

---

## Step 3 — Design directory submissions

Submit to all of these — each gives a real backlink and referral traffic.
Paste the same blurb everywhere: *"India's B2B SaaS product design agency.
End-to-end UI/UX, branding, and CRO for startups."*

| Directory | URL | Type |
|---|---|---|
| Dribbble | https://dribbble.com | Portfolio — add shots linking to designit.co.in |
| Behance | https://behance.net | Portfolio — same |
| Layers.to | https://layers.to | Agency listing — free |
| Contra | https://contra.com | Freelance/agency profile |
| Clutch | https://clutch.co | B2B agency directory — high DA, worth the effort |
| GoodFirms | https://goodfirms.co | Similar to Clutch |
| DesignRush | https://designrush.com | Agency listing |
| IndianDesign | https://indiandesign.in | India-specific design directory |

**Priority order:** Clutch > Layers.to > GoodFirms > Dribbble > rest.

Clutch is the highest-value because it ranks well for `"UI/UX design agency India"`
queries directly.

---

## Step 4 — LinkedIn profile update

1. Go to your LinkedIn profile → **Contact info → Website**
2. Add `https://designit.co.in` (type: Website or Company)
3. This is a DA-90+ backlink — one of the easiest you can get

---

## Step 5 — Validate structured data (5 min check)

Paste any page URL into Google's Rich Results Test to confirm the schema
is being parsed correctly:

https://search.google.com/test/rich-results

Test these:
- `https://designit.co.in/` → should show Organization
- `https://designit.co.in/blog/b2b-saas-ui-ux-design-services-india/` → BlogPosting + FAQPage
- `https://designit.co.in/projects/adda247` → BreadcrumbList

---

## Step 6 — PageSpeed check (Core Web Vitals)

Run after the site is live on HTTPS:

https://pagespeed.web.dev/report?url=https://designit.co.in/

Target scores: Performance > 80, LCP < 2.5s, CLS < 0.1.

If LCP is slow, the main fix will be adding `fetchpriority="high"` to the
hero image and ensuring the SVG assets aren't blocking.

---

## Ongoing — content cadence

The 20 blog posts are live. To sustain and grow rankings:

- Publish 1–2 new posts per month targeting specific long-tail queries
- Run `node generate-blog.js` after adding any new markdown file to
  `SEO_Blog_App/content/blogs/`
- Add internal links: each service page should link to 2–3 related blog posts,
  and each blog post should link to the most relevant service or project page
- After 90 days, check Search Console → **Performance** to see which queries
  are getting impressions but low CTR — those titles need updating

---

## Timeline expectations

| Milestone | When |
|---|---|
| Google crawls homepage | 1–3 days after Search Console submission |
| `"designit studio"` appears in branded search | 1–2 weeks |
| Blog posts appear for long-tail queries | 4–8 weeks |
| Top 10 for `"UI/UX design agency Noida"` | 3–6 months (with backlinks) |
| Top 10 for `"B2B SaaS design agency India"` | 6–12 months |
