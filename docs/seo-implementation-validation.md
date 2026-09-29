# SEO implementation: validation

Branch `seo/implementation` vs base `8315857`. Run against a local static server (`npx serve`), before and after
side by side. "Before" is `git archive 8315857`; "after" is the branch tip. Third-party requests were blocked
during render and layout tests so results are deterministic.

## 1. `node scripts/validate-site.mjs`: PASS
89 pages scanned, 175 JSON-LD blocks, 0 parse failures, 0 broken internal links, 0 links costing a 308.

## 2. Site-wide script check: PASS (88 served pages)
| Check | Result |
|---|---|
| Exactly one `<h1>` | all pages |
| Titles unique, ≤60 chars (indexable) | 0 duplicates, 0 over |
| Descriptions unique, 110–160 chars (indexable) | 0 duplicates, 0 outside range |
| Canonical present and self-referencing (indexable) | all pages |
| Every `<img>` has an `alt` attribute | all images |
| JSON-LD parses | 173 blocks, 0 errors |
| Each FAQ question and answer appears in visible text | 619 of 619 |
| `TODO(owner)` in shipped `.html/.js/.css/.xml/.json` | 0 (they live only in `docs/`) |

`about-designit.html` is excluded: it is a 301 in `vercel.json` and never served.
Two defects were found and fixed on the way: a stray space in one FAQ's schema text (`/industries/b2b-saas/`,
pre-existing) and, earlier, an image-regex mistake in my own new page (fixed before commit).

## 3. Before/after render diff: PASS
85 changed URLs × 1440px and 390px = 168 pairs, 0 load errors. Images keyed by `src`, headings by text; compared
box sizes, computed font-size / line-height / weight / letter-spacing / colour / margins, and horizontal overflow.

| | Result |
|---|---|
| Image boxes changed | **0** (2 added: the new post's card on `/blog/`, at both widths) |
| Heading computed styles changed | **0** |
| Horizontal overflow after | **0** on every page |
| Headings added (intended) | new blog card title; 3 real `/projects/` FAQs; "What is a UX audit?" |
| Headings removed (intended) | 2 placeholder FAQs on `/projects/` |
| Largest page-height change | `/services/ux-audit/` +911px (added content), `/blog/` +467px (new card) |

The new page `/blog/ux-audit-checklist/` has no "before"; checked separately: 0 overflow at both widths, one H1,
all images sized.

**The first run of this diff found real regressions**, all now fixed and re-diffed to zero:
- `Contents` on `/privacy-policy/` and `/terms/` rendered at 64px white instead of a 12px grey label.
- Letter-spacing / line-height drift on `/industries/` card titles, `/projects/` process titles and the
  `homepage-revamp` challenge titles.

`/pricing/` is excluded from the diff. It is a `<meta http-equiv="refresh">` stub to the homepage (unchanged by
this branch); see `owner-actions.md`.

## 4. Lighthouse (mobile emulation, local, 2 runs each; mean shown)
| Page | | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| Home | before | 100/100 | 100 | 100 | 100 | 1.58s | 0.006 | 8 |
| | after | 100/100 | 100 | 100 | 100 | 1.58s | 0.016 | 13 |
| `/services/ux-audit/` | before | 100/100 | 100 | 100 | 100 | 1.36s | 0.033 | 7 |
| | after | 100/100 | 100 | 100 | 100 | 1.36s | 0.039 | 6 |
| Blog post | before | 100/98 | 100 | 100 | 100 | 1.36s | 0.047 | 24 |
| | after | 100/100 | 100 | 100 | 100 | 1.36s | 0.009 | 6 |
| Case study (LIV) | before | 100/100 | 100 | 100 | 100 | 1.65s | 0.012 | 12 |
| | after | 100/100 | 100 | 100 | 100 | 1.65s | 0.015 | 5 |

No regression: every category is 100 on both sides, LCP is identical, and all CLS values are below 0.05. The
small CLS differences on home, UX audit and LIV are within run-to-run noise; the blog post genuinely improved.
These are lab numbers from one machine, and local Lighthouse is far kinder than field data.

## 5. Layout shift under slow-network emulation (throttled 4× CPU, ~1.6 Mbps, 150ms RTT)
Lighthouse's own throttling hid two real problems, so shifts were also traced directly.

| Page | Before branch | After branch |
|---|---|---|
| Blog post (`/blog/saas-dashboard-…`) | 0.092 (whole `<body>` shifts as CSS arrives) | 0.007 |
| Home | 0.000–0.014 | 0.000 |
| `/services/ux-audit/` | 0.012 | 0.012 |
| New checklist post | n/a | 0.0006 |

Two intermediate states are worth recording. With the patches applied but before the fixes, every page type
showed an extra 0.031 shift (the skip link's style lived in the async stylesheet). Inlining that rule in each
page's critical CSS removed it. The 0.092 blog-post figure is the state **currently live**: those posts paint
unstyled until the stylesheet arrives.

## 6. Not run
Google Rich Results Test, Search Console, CrUX/field INP, Bing Webmaster (no access). Playwright was not
installed; the same checks were run with `puppeteer-core` driving Chrome, which is functionally equivalent for
these measurements. Lighthouse was run locally only, so the branch has not been re-crawled on production.
