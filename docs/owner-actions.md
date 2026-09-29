# Owner actions

Things the code cannot, or should not, decide. Nothing here has been done for you.
Priority order within each section.

## 0. Round 3 (2026-09-30): decisions applied

- **Done:** Apollo, PostHog and Contentsquare removed from every page (plus `cs-tracking.js`); first-party
  `analytics.js` now sends nothing until the visitor accepts the cookie banner (`dsn_consent`), `?v=2`; privacy policy
  updated and its "Last updated" set to 30 Sep 2026.
- **Done:** headline case-study metrics removed everywhere (hub pages, `/projects/` cards, industry/service/geo pages,
  `llms.txt`, `data/projects.json`). Case studies themselves stay.
- **Done:** About rewritten for a studio launched about five months ago with 10+ years of founder/designer experience;
  timeline removed; Sahil Sharma added as founder (visible line, `founder` Person schema on About, `llms` files).
- **Done:** both KYC "audit dataset" tables removed.
- **Done:** 121 unreferenced PNGs (~145 MB) added to `.vercelignore`.

**Still open, same category as what you just removed (need a yes/no from you):**
- The About strip still says "98% Client Satisfaction", "100+ Projects Delivered", "10M+ Monthly Users"; the homepage
  says "98% Client Satisfaction Rate", "2x Average Conversion Lift", "50+ Products Shipped", "Trusted by 20+ founders";
  the About founder card says "Adda247 (50M+ users)". For a five-month-old studio these read as studio results. Either
  reframe as "career" numbers (with wording that says so) or remove.
- Sub-project pages still list their own "Measured outcomes" (about 25 pages, e.g. 72% class attendance, 58% content
  consumption). Same evidence question as the hub metrics.
- The KYC post has an unnamed "31% to 62% completion in 90 days" client story and other unsourced percentages.
- Privacy policy "Effective date: 6 June 2025" predates the studio.
- ₹/USD cost ranges in blog FAQs.
- **GTM (manual, no access):** open the container, confirm there is no second GA4 tag next to the hard-coded
  `gtag('config','G-HCN5Q8W144')`, and delete any leftover PostHog / Contentsquare / Apollo tags there so they cannot
  return through the tag manager.

## 1. Decisions that affect what visitors and Google see (do these first)

**Resolved (owner decision, 2026-09-29): `/pricing/` stays retired.** `pricing.html` was deleted and `/pricing`,
`/pricing/` and `/pricing.html` now 301 to `/` in `vercel.json`. It is out of `sitemap.xml`, `llms.txt` and
`llms-full.txt`; the 404 card and the blog CTA were repointed; the sentences that sent readers to "the pricing page"
were removed or reworded (visible text and FAQ schema together). Still true: ₹/USD cost ranges in blog FAQs and the
homepage "What are your pricing models?" FAQ are unverified by me.

**Resolved (owner decision): founding year removed everywhere** (About copy and FAQ, the 2019 timeline label now
reads "Start", homepage `foundingDate`, `llms.txt`). **TODO(owner):** when you confirm the year, add it back in one
pass. The other timeline years (2020, 2022, 2024) and "5+ Years of Excellence" are also unverified.

**Partly resolved: third-party statistics removed** (Deloitte 2025 / Phenomenon Studio / Skins Factory KYC figures, the
unsourced 25-40% ranges and the "activation below 40%" threshold). Still open, your own numbers, reused verbatim and unchecked: These are the site's own numbers
and were only reused verbatim, never checked:
- About page strip: "98% Client Satisfaction", "100+ Projects Delivered", "5+ Years of Excellence",
  "10M+ Monthly Users" (also on `/industries/`). Homepage: "98% Client Satisfaction Rate", "2x Average
  Conversion Lift", "50+ Products Shipped", "Trusted by 20+ founders".
- Case-study results, which the `/projects/` cards now repeat: Adda247 45% onboarding completion / 60% fewer
  support tickets; R-Centric 3x qualified leads and "100% client retention" (3 pages); Kelp Global 40% faster
  onboarding / 2x feature adoption; Betacrew 60% lower cognitive load / 4x faster documentation; Tata Elxsi 30%
  less driver distraction. The Adda247 hub also says "8 Projects" but now lists 9 case studies.
- Blog statistics: "63% KYC drop-off" (4 pages) attributed to a "Deloitte 2025 Financial Services UX Report"
  (not found in this audit), "+25–40% D7 retention" (EdTech post), "25–40%" (fintech post), "25–40% less handoff
  rework in our observation" (freelancer post), and the "activation below 40%" threshold in the SaaS onboarding
  FAQ (schema + visible).
- ₹ cost ranges in blog FAQs (for example ₹1,50,000–₹4,00,000 for a dashboard redesign). Confirm they are current.

**TODO(owner): approve the hero wording.** The homepage hero now reads "A research-led product design studio in
Noida, India, helping businesses…". Revert if you prefer the location to live only in the title/meta.

**TODO(owner): founder entity.** No founder name or LinkedIn URL was supplied, so no byline/bio or `founder`
schema was added. Send the name, URL and whether you want it visible on About.

## 2. Accounts, profiles and outreach (manual by design)

Nothing was created, submitted or sent.
- Verify Google Search Console (domain property) and Bing Webmaster; submit `sitemap.xml` and
  `blog/sitemap.xml`; export the Links report and 90 days of queries.
- Create or claim: Clutch, DesignRush, TechBehemoths, Topdevelopers, Sortlist, GoodFirms, theorg, Contra,
  Behance. Use the name "Designit Studio (Noida, India)" and say it is not Designit A/S / Wipro. Add a profile
  to `sameAs` only after it exists.
- Google Business Profile only if a verifiable address setup exists.
- Ask past clients for real reviews and written permission to publish case-study metrics and logos.
- Write and send all outreach (`prospect-list.csv`, `03-backlink-gap.csv`). Do not use press-release
  syndication (marked Avoid in the backlink report).
- Do not edit the Wikipedia article for Designit; it describes Designit A/S.

## 3. Technical items blocked on access or approval

- **Third-party JavaScript** is the main remaining performance cost. In GTM check whether a GA4 tag duplicates
  the hard-coded `gtag('config','G-HCN5Q8W144')`; decide whether PostHog and Contentsquare must run on every page.
- **Apollo tracker** loads on 53 pages and returns HTTP 400 "Buy more credits to continue tracking" while still
  setting a third-party cookie. Top up credits or remove it (lowers Best Practices score).
- Self-hosting the Inter font and replacing 10 hotlinked Unsplash images needs your approval to download files.
- 121 unreferenced PNGs (~140 MB) are publicly served; confirm they are unused, then add to `.vercelignore`.
- CSP / Permissions-Policy: deploy as `Content-Security-Policy-Report-Only` first; the tracker stack is large.
- `analytics.js` sends first-party events to Supabase without checking the cookie-consent choice (it stores a
  session id in `sessionStorage`, not a cookie). Confirm this matches your privacy policy.
- Calendly: the booking link uses a personal handle. To change it, edit `site.config.json` and run
  `node scripts/set-booking-url.mjs`, then `--check` to confirm all 72 links agree.
- `ai/service.json` still describes Designit as a "Global UI/UX product design studio". Not changed.
- `llms-full.txt` Blog section lists some posts twice and omits others. Not changed beyond adding the new post.
- The legal pages are `noindex`. Some directories look for indexable privacy/terms pages. Not changed.

## 4. Recommendations not implemented (logged only)

- Intake form: consider asking for budget earlier and shortening steps. Field and step copy was not touched.
- Keep the sitemap `lastmod` honest: run `generate-sitemaps.js` only in a full clone, and only after
  deciding the stamp is right. This branch touched almost every file, so a run now would date everything today.
- Add visible "last updated" dates only after `dateModified` in schema reflects real edits. Most pages carry a
  bulk-stamped 2026-09-11 value, so no visible dates were added.
