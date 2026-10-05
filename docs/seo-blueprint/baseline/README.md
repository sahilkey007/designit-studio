# Pre-merge baseline (exported 2026-10-05)

Raw exports from the owner's Search Console, kept here so the post-launch numbers can be compared like for like
(blueprint section 94). Not published (`docs/` is in `.vercelignore`).

| File | What it is |
|---|---|
| `gsc-performance-pages-2026-10-05.csv` | Top 82 pages, last 3 months: clicks, impressions, CTR, position |
| `gsc-performance-queries-2026-10-05.csv` | Top 195 queries, same window |
| `gsc-performance-countries / devices / daily` | Same window by country, device and day |
| `gsc-indexing-daily-2026-10-05.csv` | Indexed vs not-indexed pages per day, from 2026-07-10 |
| `gsc-indexing-critical-2026-10-05.csv` | Why pages are not indexed |
| `gsc-links-top-linking-sites / top-target-pages` | Search Console Links report |

The Ahrefs backlink screenshots (OCR text in `Landing page/GSC/merged_ahrefs_backlinks_all_content.csv`) are too noisy
to use as data, so the Search Console Links report is the backlink baseline.

## Headline numbers (3 months to 2026-10-05, Web search)

| Metric | Value |
|---|---|
| Clicks / impressions (top 82 pages) | 79 / 8,181 |
| Queries listed | 195: 46 contain the brand name (4,095 impressions, 36 clicks), 149 do not (617 impressions, **0 clicks**) |
| Country | India 74 clicks of 5,664 impressions; US 877 impressions, 1 click; UAE 104; UK 115, 0 clicks |
| Device | Mobile 54 clicks / 3,955 impr., position 6.5; desktop 24 / 3,577, position 19.3 |
| Indexed / not indexed (21 Sep) | 79 / 83 |

**Reading:** the site is found almost only by people who already know the name (about 87% of impressions are
brand or brand-misspelling queries: "designit", "desigit", "design it", "desingit", "designit careers"), and no
non-brand query has produced a click yet. That is the gap the rebuild targets. The closest non-brand queries are
"startup branding packages india" (37 impr., position 6.65), "fix saas onboarding drop offs ux" (22, 18.7),
"cro tactics for b2b saas enterprise" (21, 15.5), "branding company for startups" (35, 19.7) and
"ux research agency" (21, position 60.7).

## Why 83 pages are "not indexed": mostly expected

| Reason (Search Console) | Pages | Meaning |
|---|---|---|
| Page with redirect | 46 | The old `.html`, no-slash and alias URLs that 308 to the clean URL. Expected |
| Alternate page with proper canonical tag | 25 | Duplicate variants pointing at the canonical. Expected |
| Excluded by 'noindex' tag | 3 | Privacy, Terms, 404: intentional |
| Not found (404) | 4 | Old removed URLs, e.g. `/pricing/`. Only 4; the list of URLs is not in the export |
| Crawled, currently not indexed | 3 | Worth watching after launch |
| Discovered, currently not indexed | 2 | Same |

## Migration check against this data

All **82** URLs Google currently lists resolve on staging: 77 serve directly, 4 are old `.html` addresses that
308 to the clean URL (`/careers.html`, `/contact.html`, `/about.html`, `/projects.html`), and 1 is a Vercel
redirect (`/about-designit/` to `/about/`). **None would 404 after the merge.** The only linked page with
outside links is the homepage (27 links from 5 sites); `/contact.html` has one, and it already 308s to `/contact/`.

Linking sites (Search Console): goodfirms.co (10 pages), designrush.com (9), linkedin.com (6), deepnlp.org, domainrank.app
and medium.com (1 each).

## Targets for comparison after launch (check at 2 and 6 weeks)

1. Non-brand clicks above 0, and non-brand impressions above 617 per 3 months.
2. Indexed pages up from 79 as the 19 new pages are picked up (expect the "not indexed" redirect count to stay flat).
3. Position for "startup branding packages india" at or better than 6.65, now that `/services/branding/` exists.
4. Position for `/services/ux-audit/` queries better than the 73 average; `/services/ux-research/` better than 60.
5. No new 404s beyond the 4 above.
