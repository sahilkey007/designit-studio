# Organic Growth Audit — Implementation Status

Branch: `seo/p0-implementation` (uncommitted). Validate with `node scripts/validate-site.mjs`.

## Resolved (18 of 20)

| # | Item | Evidence |
|---|---|---|
| 01 | Internal links firing 308s | 1,267 fixed; validator reports 0 |
| 02 | Self-serving review markup | `aggregateRating` + 6 `Review` nodes removed |
| 03 | Wipro entity collision | `legalName`, `alternateName`, `disambiguatingDescription`, `founder` |
| 04 | `sameAs` entity graph | 5 real company profiles (were already in the footer) |
| 05 | Zero service pages | 7 pages, 544–1,274 words |
| 06 | Duplicate About page | 301 + canonical + removed from sitemap |
| 07 | Non-canonical sitemap URLs | 105 URLs, all trailing-slash |
| 08 | Location pages thin/templated | 3 rebuilt; prose overlap 69% → 7% |
| 09 | Industry pages thin | 6 rebuilt, ~600 → ~1,170 words; overlap 3% |
| 11 | No AI-citable comparison content | Buyer's guide, 1,581 words, `Article` + `FAQPage` |
| 12 | `/project-detail` indexable stub | `noindex,nofollow` |
| 13 | EdTech cannibalisation | Split by intent + reciprocal links (no redirect) |
| 14 | Orphaned blog posts | All added to sitemap |
| 15 | Footer → `/#services` anchors | 188 links repointed |
| 16 | Missing Twitter tags | 88/88 coverage |
| 19 | Services absent from nav | Added on 80 pages |
| 20 | Service pages absent from sitemap | All 7 present (hub caught by exact-match check) |
| 21 | Guide had no inbound links | Linked from 7 service pages |

## Blocked on external access (2)

| # | Item | Needed |
|---|---|---|
| 10 | India blog transformation (24/31 posts) | Search Console — do not redirect without impression data |
| 17 | Search Console | Domain verification; gates item 10 |
| 18 | Clutch / GoodFirms / DesignRush | Account creation; `sameAs` slot ready |

## Scripts

- `scripts/validate-site.mjs` — pre-deploy gate: links, redirect hops, JSON-LD. Exits non-zero on failure.
- `scripts/fix-internal-links.mjs` — normalises internal hrefs (`--dry` to preview).
- `scripts/build-service-page.mjs <slug> [--section services|industries|root|blog]` — page generator.
- `scripts/build-services-hub.mjs` — rebuilds `/services/`.
- Content lives in `scripts/{services,services-2,industries,industries-2,locations,guides}.json`.

## Known caveats

- Keyword targets are reasoned, not measured — Ahrefs returned `Insufficient plan` on every endpoint.
- The audit's original "69% / 52% duplicate" figures counted shared nav/footer/heading lines. Measured on
  prose only, real overlap was far lower. The genuine defect was thinness (~600 words), which is fixed.
- Location pages now state plainly that there is no US/UK office. That is deliberate.
