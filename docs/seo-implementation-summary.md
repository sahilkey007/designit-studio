# SEO implementation summary

Branch `seo/implementation`, based on `8315857`. 15 commits (plus the one that corrects this line), 102 files changed (89 HTML, 9 added), +2,887 / −973.
Nothing was pushed to `main` or deployed. Validation results are in `seo-implementation-validation.md`;
what only you can do is in `owner-actions.md`; briefs that were held back are in `seo-todo.md`.

## What was implemented

### Step 0: patches
| Commit | Change |
|---|---|
| `fd918c6` | `designit-seo-fixes.patch` applied cleanly (90 files): skip link, `<main>` landmarks, image width/height, `name="twitter:*"`, heading order, 404 and `about-designit` hygiene, CSS cache-bust (`design-system.css?v=7`, `pages.css?v=8`). |
| `86c0e03` | `designit-onpage.patch` applied. 20 files conflicted, every one in the same 5-line Twitter meta block: the technical patch had `name=`, the on-page patch had new title/description text with the old `property=`. Resolved as on-page text with `name=` (verified that nothing else differed). Titles are all ≤60 chars and unique. |

### Step 1–2: technical and on-page
- Verified present after the merge: `/projects/` title, meta and FAQ (visible = schema), UX audit definition and
  cost FAQ, About disambiguation from Designit A/S, audit blog claims removed, 42 internal-link anchors added,
  no heading-level skips inside `<main>` on any indexable page.
- `6abd944`: the 8 short case-study descriptions (Anwa Aria, Vela Viento, Orla Infinity, OPUS, LIV, Tata Elxsi
  ×2, Portle) rewritten to 110–160 chars from each page's own text; og/twitter descriptions kept in sync.

### Step 3: entity
- `21f03fe`: `alternateName` and `disambiguatingDescription` added to the Organization node on 85 pages (name,
  phone, address, logo and `sameAs` were already identical on all 86). The description omits the founding year
  because it is disputed.
- `2c7fa70`: homepage hero names Noida, India; homepage WebPage/Article schema synced to the current title/meta
  (they still said "Global Product Design Studio"). Booking link centralised: `site.config.json` +
  `scripts/set-booking-url.mjs` (72 links, 63 files + the blog generator; `--check` mode).
- `c4c5e33`: `llms-full.txt` gained an About block (facts already in `llms.txt`).

### Step 4: conversion
- `f65b339`: secondary "Book a 30-minute teardown" CTA after the UX audit Proof block (that wording already
  existed on the page). `/projects/` cards show one result metric each, copied verbatim from that client's hub.
  Intake-form events (`form_opened/started/step_complete/submitted`) already exist and carry the page path, so
  no tracking code was changed. Form fields untouched.

### Step 5: content
- `a094dc1`: `/blog/ux-audit-checklist/` (48 checks, 10 groups) with Article/Breadcrumb/FAQ schema, share image,
  sitemap + feed + blog index + `llms-full.txt` entries, and 4 inbound links.
- `c99dd4a`: the unsourced "25–40% B2B activation" sentence replaced with Userpilot's *Product Metrics
  Benchmark Report 2024* figures, read from the source page.

## Problems found and fixed during validation (things the reports did not catch)

1. **Heading retags changed styling.** The render diff showed `Contents` on `/privacy-policy/` and `/terms/`
   rendering at 64px white instead of a 12px grey label, plus letter-spacing/line-height drift on `/industries/`,
   `/projects/` and `homepage-revamp`. The technical report claimed identical computed styles. Fixed in
   `f86fc43`; re-diffed to zero differences.
2. **Unstyled flash and layout shift on blog posts** (introduced by the earlier async-CSS change, not by the
   patches). 26 posts painted white with an 8px body margin until `design-system.css` arrived (CLS 0.114 under
   slow-network emulation, 0.092 on a repeat). Fixed in `5f02217` by reusing the site's existing inline
   critical-CSS block.
3. **Skip link caused a 0.031 layout shift on every page type**, because its style lived only in the async
   stylesheet. Fixed in `a731521`. Final CLS is at or below the pre-branch baseline.
4. **Pre-existing:** FAQ schema on `/industries/b2b-saas/` had a stray space so it did not match visible text.
   Fixed in `c380b47`.
5. My own new page initially replaced the nav logo with the post's hero card (a regex hit the wrong `<img>`);
   caught by inspecting every `<img>` and fixed before the first commit.

## Skipped, and why
- **Visible "last updated" dates (Step 2.9):** most pages carry a bulk-stamped `dateModified` of 2026-09-11,
  so showing it would present a rollout date as a content date.
- **Founding year, founder entity, new `sameAs` profiles:** need your input (see owner-actions).
- **Enterprise UX, product redesign, e-commerce, branding and AI pages, benchmark page:** no proof or data
  (see seo-todo).
- **Sitemap regeneration:** `generate-sitemaps.js` was not run; this branch touched almost every file so it would
  stamp everything today. The new post was added to `blog/sitemap.xml` by hand.
- **`/pricing/`:** resolved after review: 301 to home, removed from sitemap/llms, 19 pointers reworded (see owner-actions).

## Unverified claims still on the site
Listed in full in `owner-actions.md` §1. In short: About and homepage headline stats, all case-study metrics
(now also repeated on `/projects/` cards), several blog statistics including a "Deloitte 2025" citation, the
"activation below 40%" threshold, and the ₹ cost ranges.

## Follow-up round (owner decisions)
- `/pricing/` retired properly (301, sitemap, llms, pointers); founding year removed everywhere; third-party
  statistics removed from 7 blog posts. Details in `owner-actions.md`.
