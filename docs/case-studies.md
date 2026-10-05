# Case studies (October 2026)

Every case study on the site follows one storytelling structure, inspired by thefinch.design's portfolio pages and
extended with a problem statement, empathy and an FAQ. 27 pages use it: 22 project case studies and 5 client overviews.

## Structure of a project case study

| # | Section | Source field | Notes |
|---|---|---|---|
| 1 | Hero: breadcrumb, eyebrow, H1, one-paragraph summary | `kicker`, `h1`, `summary` | H1s were kept from the old pages (except Truenorth, renamed to match its screens). |
| 2 | Meta row: Client, Industry, Deliverables, Platform, Duration | `client`, `industry`, `deliverables`, `platform`, `duration` | **Duration is shown only when the owner supplies it.** Add `"duration": "6 weeks"` to a spec. |
| 3 | Cover image | `hero` | Branded mockup; also the card image and the OG image. |
| 4 | Overview + tags + facts | `overview`, `tags`, `overviewFacts`, `metaCards` | Original Category/Services/Tools values stay visible here. |
| 5 | Problem statement ("How might we…") | `problemStatement` | Reverse-engineered from what the shipped design solves. |
| 6 | Empathize: who we designed for + pain points | `empathy` | 3 user groups, 4 pain points, grounded in the page's own problem text and what the screens show. |
| 7 | Challenges | `challenges` (`items`, or `paras` + `titles`) | The original "What needed to change" text, with short titles added. |
| 8 | Research insights (where published) | `insights` | Adda247 homepage only. |
| 9 | Approach | `approach.steps` | Original process text; first sentence is shown as the lead. |
| 10 | The experience we created | `solution`, `showcase`, `features` | Screens paired with features (image-led rows), remaining features in a grid. |
| 11 | Design decisions (where published) | `decisions` | Adda247 homepage only. |
| 12 | Gallery | `gallery` | Captions supported (`caption`), `wide` images, `columns: 3` for phone screens. Images already shown on the page are skipped. |
| 13 | Results (where published) | `results` | Only figures already on the site and confirmed by the owner. |
| 14 | Quote (where a client recommendation exists) | `quote` | Key into `data/testimonials.json`. |
| 15 | FAQ, always open | `faq` | 7–14 per page: the core three (what, problem, approach), researched contextual questions, then the studio's general questions. |
| 16 | More projects + CTA | automatic | Next case study of the same client, one more from that client, one from another client. |

Client overview pages (`template: "client"`) use the same hero and cover, then their own sections, with a problem
statement and empathy block after the facts and an image-led grid of their case studies (`casegrid`).

## Honesty rules (owner-approved, 2026-10-06)

- Storytelling is reasoned from what each design visibly solves and from the existing page text. No invented
  numbers, research sessions, user quotes or outcomes. Research figures already published on the old pages were
  confirmed by the owner (2026-10-05) and are kept.
- **Kelp Global** pages were rewritten to describe what the screens show (private-markets deal intelligence and an
  investor portal) instead of the earlier sales-CRM text, with the owner's approval. Evidence record `EV-KELP-SCOPE`
  was updated.

## Files

- Specs: `content/pages/work/<client>/<slug>.json` (projects) and `content/pages/work/<client>.json` (clients).
- Template: `case_main()` and the `cs_*` components in `scripts/seo/build_pages.py`; styles in
  `scripts/seo/components/case.css` (inlined only on case-study, client and Work pages).
- Work hub: `content/pages/projects.json` (`casegrid` with filters; `work-filter.js` filters `.cs-card`).
- One-off migration from the old hand-written pages: `scripts/seo/migrate_case_studies.py` (`--check` compares text).
- FAQs everywhere are always open: `scripts/seo/faq_open.py` for hand-written pages, `faq_block()` for generated ones.

## Adding a case study

1. Copy a spec in `content/pages/work/<client>/`, change `url`, `file`, texts and images.
2. Set `cardTitle`, `cardLine` (one sentence), `cardTags` (3), `filterIndustry`, `filterServices`.
3. `python3 scripts/seo/build_pages.py && python3 scripts/seo/apply_ds.py && python3 scripts/seo/apply_ui.py`.
4. Run the quality gate, link validator and accessibility audit.
