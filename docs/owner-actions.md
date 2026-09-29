# Owner actions

Things the code cannot, or should not, decide. Nothing here has been done for you.
Priority order within each section.

## 1. Decisions that affect what visitors and Google see (do these first)

**TODO(owner): `/pricing/` is a redirect stub, but 19 pages send people to it.**
`pricing.html` contains `<meta http-equiv="refresh" content="0; url=/">`, added on 2026-05-25 in the commit
"…pricing removal". Every visit lands on the homepage. Yet:
- `sitemap.xml` still lists `/pricing/`.
- 19 pages say pricing "bands are published on the pricing page" (UX audit, industry pages, several blog FAQs).
- The technical audit reported "all 83 sitemap URLs return 200" because a meta refresh returns 200 while
  redirecting in the browser, so this was never flagged.
Choose one: (a) restore the page (remove the meta refresh) and confirm the bands are current, or (b) keep it
removed, take `/pricing/` out of the sitemap, and rewrite the 19 sentences. The new checklist page deliberately
does not link to it.

**TODO(owner): confirm the founding year.** `about.html` says "founded in 2019". The homepage
`foundingDate`, `disambiguatingDescription` and `llms.txt` say 2020. Nothing was changed. Once confirmed,
update the losing side. The new `disambiguatingDescription` on the other 85 pages omits the year on purpose.

**TODO(owner): approve or remove unverified claims currently on the site.** These are the site's own numbers
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
