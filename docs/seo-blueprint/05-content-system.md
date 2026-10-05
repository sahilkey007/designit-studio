# Content system

> How content is defined, built, linked, checked and refreshed on designit.co.in. Covers blueprint sections 43–46
> (AEO, GEO, citation-worthy writing, humanization), 62 (data model), 64 (workflow), 65 (brief), 66–69 (internal
> links), 79–81 (refresh and quality), 87–89 (asset types, content-to-revenue, CTA by intent), 92–93 (components and
> folders), 108 (backlog format), 109 (modules A–E), 110–111 (corrections and definitions).

## 1. Working definitions (section 111)

| Discipline | The question it answers | Where it shows up here |
|---|---|---|
| SEO | Can the search engine crawl, understand and rank this? | Metadata, canonicals, sitemaps, schema, internal links (`quality_gate.py`, `validate-site.mjs`) |
| AEO | Can the page directly answer the question? | `answer` blocks and FAQs in every page spec |
| GEO | Can an AI system identify, retrieve, summarise and attribute the useful information? | Entity data (`data/entities.json`), standalone answer sentences, crawlable HTML, AI crawler access |
| E-E-A-T / Evidence | Why should anyone trust it? | Evidence ledger (`data/evidence.json`), reviewer byline, founder entity, verbatim recommendations |
| CRO | What should a qualified visitor do next? | CTA by intent, `/start-a-project/` qualification flow, lead attribution |

Flow: SEO → discovery · AEO → answer · GEO → AI discovery / retrieval / citation · Evidence → trust · CRO → revenue.

## 2. Four asset types and the content-to-revenue chain (sections 87–88)

| Type | What | Status on staging |
|---|---|---|
| A. Commercial | Service, solution, industry and location pages | 11 services, 5 solutions, 7 industries, 3 locations and 5 hubs, built |
| B. Authority | Guides, research, frameworks | 34 existing articles upgraded (byline, reviewer, next steps). New articles not started (section 114) |
| C. Proof | Case studies | 5 case studies rebuilt on the section 29 template; 22 sub-project pages kept |
| D. Tools | Calculators, checklists, assessments | `/resources/` hub built; tools planned (see `09-content-backlog.md`) |

Every content page gets one commercial destination: **search → useful answer → problem awareness → solution →
capability → proof → CTA**. On articles this is the "Where to go next" block: pillar, sibling, case study, then an
intent CTA (`scripts/seo/blog_graph.py`, map `CL`).

## 3. The page spec is the SEO data model (section 62)

Generated pages are defined by one JSON file each in `content/pages/**` (not served). `scripts/seo/build_pages.py`
renders them into the live page shell and writes `data/pages-index.json`.

| Blueprint field | Spec field | Notes |
|---|---|---|
| slug / canonicalUrl | `url` (+ optional `file`) | Canonical is always `https://designit.co.in` + `url` |
| title / metaTitle | `metaTitle` | Lint: ≤ 60 characters, unique site-wide |
| metaDescription | `metaDescription` | Lint: 110–160 characters, unique |
| h1 | `h1` | Exactly one per page |
| primaryKeyword, secondaryKeywords | same | Ownership checked in `data/keywords.json` |
| searchIntent, businessIntent, funnelStage | same | |
| audience | `audience` / `audienceType` | `audienceType` feeds Service schema |
| topicCluster, pillarPage, parentTopic | same | `topicCluster` is also written to `<main data-cluster>` for analytics |
| author / reviewer | `author` (Designit) | Articles carry "By Designit · Reviewed by Sahil Sharma, Founder" plus `WebPage.reviewedBy` (owner decision 2026-10-04) |
| publishedAt / updatedAt | `updatedAt` | Shown as "Last updated" on the page and as `dateModified` |
| contentType / schemaType | `pageType` / `schemaType` | Drives the JSON-LD set (section 58) |
| evidenceIds | `evidenceIds` | Must exist in `data/evidence.json`; the quality gate fails otherwise |
| externalSources | not yet used | Add when a page cites third-party research |
| internalLinks | computed | `data/internal-links.json` (from the built HTML) |
| relatedServices / relatedIndustries / relatedCaseStudies | same | Rendered as links/work cards |
| faq | `faq` (`q`/`a`) | Visible FAQ; FAQPage JSON-LD only mirrors visible text |
| cta | `cta` (`heading`, `body`, `buttons`) | By intent, see section 8 below |
| indexable | implicit `true` | Legal pages are hand-written and `noindex` |
| refreshInterval | `refreshInterval` | Section 80 intervals |
| aiAnswerTargets | `aiAnswerTargets` | Questions the page must answer in one extractable sentence |
| conversionEvent | `conversionEvent` | `start_project`, `form_submit`, `asset_open` |

Hand-written pages (about, contact, careers, blog posts) keep their HTML as the source of truth. Organization/WebSite
JSON-LD is synced into them from `data/entities.json` by `scripts/seo/sync_entities.py`.

## 4. Component system (section 92)

| Blueprint component | Implementation |
|---|---|
| SEOHead | `seo_head()` in `build_pages.py`: title, description, canonical, robots, OG, Twitter, hreflang |
| OrganizationSchema | `data/entities.json` → `jsonld()`; `sync_entities.py` for hand-written pages |
| ServiceSchema | `jsonld()` for `pageType: service` (provider = Organization `@id`, areaServed = four markets) |
| ArticleSchema | Case studies: `Article` with `about` = client; posts: existing `BlogPosting` + `reviewedBy` |
| Breadcrumbs | `breadcrumbs_html()` (visible) + `BreadcrumbList` JSON-LD from the same `breadcrumb` array |
| AnswerBlock | `r_answer` (section type `answer`) |
| ProofStrip | `r_logos`, `r_facts`, `r_quotes` |
| ServiceCard / IndustryCard / CaseStudyCard / InsightCard | `r_cards`, `r_links`, `r_work` (from `data/work.json`), `r_clusters` |
| FAQBlock | `faq_block()` |
| SourceNote | Not built yet: needed when articles cite external research |
| RelatedContent | `r_links`, `r_work`, the article "Where to go next" block |
| CTA | `cta_section()` |
| AuthorBlock / LastUpdated | `page_meta()` renders "Last updated" (and "Reviewed by" when a spec sets `reviewer`); article bylines and `reviewedBy` from `blog_graph.py` |

Folder mapping (section 93; the existing static stack was preserved rather than rebuilt):
`content/pages/{services,industries,solutions,locations,work}` · `data/{entities,evidence,keywords,internal-links,work,testimonials,pages-index}.json` ·
`scripts/seo/components/{shell.html,nav.html,footer.html,page.css,nav.css}`. Redirects live in `vercel.json`
(single source; no separate `redirects.json`). There is no `/authors/` yet: section 48 says to create it only when
there are enough contributors.

## 5. Workflow (section 64), mapped to this repository

| Stage | Output | Where / how |
|---|---|---|
| 1 Discover | Customer problem, queries, competitor topics, community questions, AI prompts | `03-keyword-pools.md`, `06-ai-prompt-library.csv`, GSC export |
| 2 Validate | Intent, buyer stage, business value, feasibility, gap, cannibalisation decision | `data/keywords.json` owner check; matrix row in `02-…csv` |
| 3 Research | SERP notes, primary sources, Designit evidence | Brief (section 6 below); evidence IDs |
| 4 Strategize | Page type, primary keyword, parent topic, differentiation, links, CTA, AI answer targets | Spec fields |
| 5 Create | Article, tables, examples, original framework, FAQ, visuals | Spec `sections` / post HTML |
| 6 Optimize | SEO, AEO, GEO, schema, links, accessibility, conversion | Generator + `blog_graph.py` |
| 7 Validate | Fact, source, human, technical, link and schema checks | `build_evidence.py`, `quality_gate.py`, `validate-site.mjs`, axe and CLS checks; human review |
| 8 Publish | Live page, sitemap, indexing, analytics, Search Console | `generate-sitemaps.js`; deploy; owner submits the sitemap |
| 9 Learn | Ranking, queries, CTR, AI impressions, conversions, backlinks | `06-measurement.md` dashboards |

### Build runbook for a new or changed generated page

```
python3 scripts/seo/build_pages.py        # render specs, write data/pages-index.json
python3 scripts/seo/build_evidence.py     # evidence IDs exist; writes 04-evidence-ledger.md
python3 scripts/seo/quality_gate.py       # metadata, schema, FAQ parity, images, evidence
node scripts/validate-site.mjs            # links, JSON-LD parse, redirects
python3 scripts/seo/url_inventory.py      # 01-url-inventory.csv
python3 scripts/seo/build_matrix.py       # 02 matrix, 09 backlog, keywords.json, internal-links.json
python3 scripts/seo/build_llms.py         # llms.txt, llms-full.txt, ai/*.json
node generate-sitemaps.js && node generate-sitemaps.js --check
```

Bump `?v=N` site-wide when editing an immutable-cached file (`design-system.css`, `pages.css`, `main.js`,
`analytics.js`, `intake-form.js`, `theme.js`). Add purely technical bulk commits to `sitemap-ignore-commits.txt` so
`lastmod` reflects real content changes.

## 6. Content brief template (section 65)

Copy this for every new article or major rewrite. Fields marked † need first-party input.

```
CONTENT ID:
Page type:                  Primary keyword:            Parent topic:
Secondary terms:            Search intent:              Business intent:
ICP:                        Buyer stage:

Problem:                    Question:                   Desired outcome:

Current SERP:               Competitors:                Content gaps:
Missing information:        Differentiation wedge:

Designit expertise †:       First-party evidence † (evidence IDs):      Required expert input †:

Primary CTA (by intent, section 89):        Commercial destination:
Pillar page:                Sibling content (2):        Case study (only if genuinely relevant):

SEO title (≤60):            Meta description (110–160):
H1:                         H2s:                        H3s:

AEO questions:              GEO entities:               Definitions:            Decision tables:
Sources:                    Evidence IDs:
Schema:                     Image requirements (section 97):                    Alt text:
Publication date:           Last updated:               Review interval (section 80):
```

The task-card format (section 108) is generated per planned URL in `09-content-backlog.md`.

## 7. Writing rules: answer units, citation-worthy sentences, humanization (sections 43–46)

- **Answer first.** Each important question gets a direct one- or two-sentence answer, then explanation, examples,
  method and checklist. In specs this is the `answer` block (for example "What is a UX audit?").
- **Sentences that stand alone.** Specific, useful, defensible, attributable and understandable out of context.
  Weak: "Our process is designed to create better experiences." Strong: "For a SaaS redesign, we usually map the
  highest-friction workflows before changing the interface, because redesigning screens without understanding the
  underlying workflow can preserve the original product problem."
- **GEO is not keyword stuffing.** Clear entities, original expertise, first-party evidence, strong internal
  relationships, useful answer units, author identity, credible sources, structured data, crawlable HTML and genuine
  external references. Not: repeating the brand name, AI filler, "llms.txt and stop", fake mentions, or hundreds of AI pages.
- **Unmistakably Designit, not "undetectable".** Real project observations, real interface examples, original
  diagrams, specific trade-offs, first-party frameworks, named authors and reviewers, real limitations and uncertainty,
  varied rhythm, practical conclusions. No "In today's rapidly evolving digital landscape…", no repeated AI phrases, no
  manufactured stories, no invented "our research", no fabricated statistics, no invented case studies.

## 8. Internal links (sections 66–69) and CTA by intent (section 89)

**Graph.** Homepage → services, industries, work · services → insights, case studies · industries → case studies ·
work → services · everything → CTA. Example paths: Homepage → SaaS Product Design → B2B SaaS → SaaS case study → SaaS
dashboard article → UX Audit → Start a Project; and Website redesign article → Website Design → Conversion
Optimization → landing-page case study (none published yet) → Start a Project.

**Article rule (section 67).** One pillar, two relevant siblings, one commercial service, one case study only where
genuinely useful. Descriptive anchors ("UX audit services for SaaS products"), never "click here". Implemented for
all 34 posts by the "Where to go next" block. Sibling links inside article bodies are a refresh task.

**Homepage link equity (section 68).** The homepage links to all six priority pages: product design, SaaS product
design, UX audit, UX research, AI product design and design systems. It also links to conversion optimization and
branding, 45 internal links in `<main>` (`data/internal-links.json`). It does not spray links across 30
miscellaneous pages.

**CTA by intent.**

| Intent | Blueprint example | Staging implementation |
|---|---|---|
| Informational | Explore the UX Audit Checklist | Article "Where to go next" CTAs point at the cluster's service or `/start-a-project/` |
| Problem-aware | Review your product with our UX audit framework | SaaS-cluster posts: "Review your product with our UX audit" |
| Commercial | Discuss your product with Designit | Service, solution and industry pages: "Discuss your SaaS product / app / brand / funnel …" |
| Vendor-ready | Start a project | Hubs, case studies, nav button: "Start a Project" |
| Enterprise | Talk to the Designit team | Not separated yet; enterprise buyers use the same flow |

Refinement to consider: UX-audit and website-cluster articles end with "Request a UX audit" or "Discuss your
website" (vendor-ready). Once the interactive UX audit checklist exists, informational posts should end with the
softer "Explore the UX audit checklist" CTA.

## 9. Refresh system (sections 79–80)

Triggers: traffic decline, ranking decline, CTR decline, outdated information, weak competitor coverage, missing
subtopics, weak internal links, lost backlinks, SERP intent change. Added: **AI-visibility decline**. When it happens,
check freshness, sources, completeness, entity clarity, competitor updates, direct answers and first-party insight
before rewriting anything.

| Content | Review interval | Spec value |
|---|---|---|
| AI tools / AI UX | Monthly to quarterly | `monthly to quarterly` |
| Pricing | At least annually, or when the commercial model changes | `annually (pricing) / 6 months` (pages with a pricing section) |
| Industry pages | 6 months | `6 months` |
| Core service pages | Quarterly | `quarterly` |
| Evergreen UX guides | 6–12 months | articles: `6-12 months` (matrix) |
| Case studies | When new evidence is available | `when new evidence is available` |
| Location pages | 6 months | `6 months` |
| Research reports | Annual or methodology-based | none published yet |

## 10. Quality gates (section 81)

**Editorial gate (human, before publishing).** Score each 1–10: search-intent satisfaction, information
completeness, originality, evidence quality, founder usefulness, commercial relevance, SEO structure, GEO readiness,
AEO readiness, human editorial quality, and **trust**. Publish only when the critical dimensions (intent, evidence,
originality and trust) meet the threshold. Reject content that is generic, repetitive, derivative, unsupported, copied
or without original insight.

**Technical gate (automated).** `scripts/seo/quality_gate.py` checks one H1; title ≤ 60 and unique; description
110–160 and unique; self-canonical; OG and Twitter tags; meta robots; JSON-LD parses; FAQPage answers visible on the
page; every image has alt, width and height; banned claims and placeholders absent; evidence IDs exist. Last run:
102 pages, all pass. Run `validate-site.mjs` (links and redirects) and the accessibility and CLS checks before any merge.

## 11. Modules A–E added to the 100X system (section 109)

| Module | What | Implementation |
|---|---|---|
| A Entity intelligence | Designit as an entity: services, industries, markets, related concepts, proof entities; consistent everywhere | `data/entities.json` (Organization + founder + knowsAbout + sameAs), synced to all pages; `llms.txt` and `ai/*.json` generated from the same data |
| B Evidence ledger | Every important factual claim maps to verified evidence | `data/evidence.json`, `04-evidence-ledger.md`, gate check |
| C Answer-unit architecture | Every important question gets an extractable answer | `answer` blocks, `aiAnswerTargets`, visible FAQs |
| D AI prompt visibility | Prompt library, mentions, citations, cited URLs, competitors, changes | `06-ai-prompt-library.csv` (owner runs it monthly) |
| E Multimodal search | Screenshots, diagrams, visual case studies, image metadata | Alt text and dimensions on every image (gated). Descriptive filenames on case-study assets. Diagrams and captions are a case-study upgrade task |

## 12. FAQ correction (section 110)

FAQ content: yes. FAQ for AEO and user questions: yes. FAQPage structured data: kept only where the answers are
visible on the page (enforced by the gate). Expecting FAQ rich snippets to drive growth: **no**. Google removed the
FAQ rich result in 2026.
