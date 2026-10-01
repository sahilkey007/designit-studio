# Owner actions

Things the code cannot, or should not, decide. Nothing here has been done for you.
Priority order within each section.

## 00. Audit round (2026-10-01)

Automated fixes from the site audit, all verified before deploy:
- **Layout shift from the web-font swap:** Inter now has a metric-matched fallback (`Inter Fallback`) in the inline
  critical CSS and `design-system.css` (`?v=8`). With the font delayed 2 s: home 0.130 to 0.069, UX audit 0.091 to
  0.008, EdTech post 0.038 to 0.002.
- **Accessibility (axe, 166 page views):** four issue types fixed: unlabeled/duplicate `<nav>` landmarks (121),
  scrollable tables now keyboard-focusable (4), contrast on "Phase 01" labels and the footer copyright line, and the
  CTA band on Careers and Projects moved inside `<main>`. Re-run: 0 violations.
- **Sitemap lastmod:** `generate-sitemaps.js` skips the bulk non-content commits listed in
  `sitemap-ignore-commits.txt`; sitemaps regenerated.
- **Canonical:** already correct everywhere (self-referencing, all variants 308 to it). No change.
- **LCP on the new checklist post:** lab noise (3.2 s, 1.8 s, 1.2 s on three runs of the same page). No change.
Still yours: directory profiles, reviews, backlinks, and confirming the career-number stats.

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

**Decided 2026-09-30:**
- Headline stats kept but relabelled as career numbers: "(Career)" labels on the About, homepage and industries stat
  blocks, a footnote saying the figures reflect the founder's and designers' combined 10+ years and that the studio
  launched in 2026, "Years of Practice" now 10+, and the homepage heading "Trusted by 20+ Founders" replaced with
  "Kind Words From Founders We've Worked With". The numbers themselves are still unverified.
- Sub-project "Measured outcomes" and the KYC post's unnamed "31% to 62%" story: kept by owner decision.
- Privacy policy and Terms: effective and last-updated dates set to 30 September 2026.
- **GTM (read-only check of the published container, GTM-TQPPB8B7):** it holds only two tags, a Google tag for
  G-HCN5Q8W144 (all pages) and one GA4 event tag that forwards dataLayer events with Meta fbp/fbc parameters. There is
  no PostHog, Contentsquare or Apollo tag, so nothing to delete there. The Google tag duplicates the hard-coded
  `gtag('config', ...)`, but a live load sends a single page_view. Optional cleanup: remove one of the two; unpublished
  draft workspaces cannot be seen from outside.

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
