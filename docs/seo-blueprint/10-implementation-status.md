# Implementation status: blueprint sections 1–114

> Status of every section of `00-blueprint-source.md` on the `staging` branch, 2026-10-05. Nothing is live until
> the owner approves the merge.
>
> **Done**: implemented and verified. **Done (adapted)**: implemented with a deliberate deviation, explained.
> **Partial**: started; the remainder needs input this repository does not have. **Planned**: queued by design
> (section 114 says not to write new articles yet). **Owner**: needs the owner's accounts, data or decision.
> **Guidance**: a principle, applied throughout.

| § | Section | Status | Where / notes |
|---|---|---|---|
| 1 | The strategic decision (rebuild first) | Done | Order followed: positioning → IA → URL/keyword map → commercial → industry → case studies → clusters → links → measurement. No new articles published |
| 2 | Competitor keyword file → five pools | Done | `03-keyword-pools.md` §1; noise pool ignored |
| 3 | Keyword opportunities | Done (figures to revalidate) | `03` §2: every visible query mapped to an owner. SE Ranking figures copied as given; revalidation = owner |
| 4 | Parent-topic rule | Done | `/services/website-design/` and `/services/ui-ux-design/` own their pools; `data/keywords.json` enforces one primary owner per query (0 clashes) |
| 5 | What the GSC data adds | Done | `03` §4: every September query mapped to an owning page |
| 6 | Authority seeds | Done | 12 seed posts link to their pillar, a sibling, a case study and an intent CTA ("Where to go next"), with byline and reviewer. Content refresh = `09` backlog |
| 7 | TheFinch | Done | Problem-based blocks (homepage, hubs); `/start-a-project/` scope & fit assessment, no prices; case-study template. `07-competitor-notes.md` |
| 8 | Lollypop | Done | Research & Strategy menu column; `/resources/`; `/locations/` (no city doorways). Reports planned, not faked |
| 9 | NetBramha | Done | Method stages on the homepage and every service page |
| 10 | Onething | Done | `/services/ai-product-design/` and `/industries/ai/` cover uncertainty, approval, autonomy, recovery and agentic patterns in Designit's own words. Agent questions in the prompt library and backlog |
| 11 | DD.NYC | Done (owner to confirm) | Delivery boundary stated: design through handoff, design QA and launch support; no development (`EV-DELIVERY-BOUNDARY`). Trust stack limited to verified items |
| 12 | UX Studio | Done | Five solutions by buyer situation; "embedded product design" covered on `/services/product-design/` |
| 13 | What not to take | Done | Do-not-copy list (`07` §2); `quality_gate.py` `BANNED` list |
| 14 | New positioning | Done | `data/entities.json` description and homepage H1/subtitle use the section 14/17 wording |
| 15 | Recommended IA | Done (adapted) | All services, solutions, hubs and `/start-a-project/` built. Kept URLs: `/projects/` (`/work/` 301s to it), `/industries/real-estate/` (`/industries/proptech/` 301s), `/industries/e-commerce/` (`/industries/ecommerce/` 301s), existing USA/UK/Dubai URLs (`/locations/*` aliases 301 to them; India → `/locations/`). Blog categories are anchors on `/blog/`, not URLs. `/industries/healthtech/` deferred (no evidence) |
| 16 | Main navigation | Done (adapted) | Services / Industries / Solutions / Work / Insights / About + Start a Project. Menus follow section 16. Differences: "UI/UX Design" added under Product Experience (it owns the ui/ux pool); Industries omits "Enterprise Software" (no page; covered by B2B SaaS and legacy modernization) and "HealthTech" (deferred). Accessible disclosure buttons; CSS hover on desktop |
| 17 | Homepage blueprint | Done | H1 and supporting copy as specified; problems (7, each routed); How we work (6 stages); 6 core services; industries; selected work cards (client, industry, product, service, problem, outcome); evidence-based Why Designit; insights as clusters; genuine FAQ; CTA "Tell us what's not working" |
| 18 | Product Design page | Done | H1, H2 structure, stages, process, collaboration, work. Cost: drivers only (owner decision) |
| 19 | SaaS Product Design page | Done | H1 and all listed H2s; problems list; process; case studies; cost and timeline answers |
| 20 | UX Audit page | Done | H1 "Find the friction before it costs you users"; title "UX Audit Services for SaaS, Websites & Apps \| Designit"; every listed H2 including vs-research and vs-usability-testing |
| 21 | UX Research page | Done | |
| 22 | Design Systems page | Done | |
| 23 | AI Product Design page | Done | |
| 24 | Website Design page | Done | Includes development handoff, QA and redesign cost (drivers only) |
| 25 | Conversion Optimization page | Done | |
| 26 | Branding page | Done | Includes "Branding packages: how we scope them" (no prices) |
| 27 | Industry architecture | Done (HealthTech deferred) | B2B SaaS, Fintech, EdTech, PropTech (`/industries/real-estate/`), AI (new), E-commerce, Automotive |
| 28 | Solutions pages | Done | MVP, product redesign, legacy modernization, design-system scaling, conversion improvement |
| 29 | Work / case-study architecture | Partial | 5 case studies rebuilt: breadcrumb, H1 client + product + outcome, executive summary answering "problem / what we did / what changed", project facts, business and user problem, what we did (research, architecture, prototyping, design & handoff), key lessons, related. **Needs project material:** before/after, validation, verified outcomes, "what we would do differently". Outcomes stay qualitative (headline metrics removed, owner decision) |
| 30 | No filter index bloat | Done | SEO-008 |
| 31 | Work index | Done (adapted) | H1 "Selected product design work"; machine-readable cards; filters for industry and service. Product type and stage filters not added: 5 projects do not need four filter dimensions |
| 32 | Existing URL action plan | Done | Actions in `01-url-inventory.csv`; deviations starred with reasons |
| 33 | What to merge | Done | Nothing merged; `.html` duplicates already 308 via `cleanUrls`; branding and audit articles kept separate by intent |
| 34 | Search journey architecture | Done (structural) | UX audit journey: problem posts → "What is a UX audit?" → vs-research table → cost answer → how-to-choose guide → "Request a UX audit". Same pattern on other pillars |
| 35–42 | Content clusters 1–8 | Done (pillars and links) / Planned (new articles) | Pillars live; existing posts mapped and linked (`blog_graph.py`); 52 planned article URLs (plus 13 resources and the deferred HealthTech page) with overlap decisions (`02` matrix, `09` backlog) |
| 43 | AEO architecture | Done | `answer` blocks on every commercial page; `aiAnswerTargets` per spec |
| 44 | GEO architecture | Done | Entities, first-party evidence, internal relationships, answer units, author identity, structured data, crawlable HTML. External references = section 51 (owner) |
| 45 | Citation-worthy content | Guidance (applied) | New copy written as standalone, defensible sentences; rule in `05` §7 |
| 46 | Humanization | Guidance (applied) | No fabricated stories, statistics or research; ledger enforces it |
| 47 | Evidence ledger | Done | `data/evidence.json` (33 records + 8 unverified published claims); gate fails on unknown IDs; `04-evidence-ledger.md` |
| 48 | Author and expertise | Done | "By Designit · Reviewed by Sahil Sharma, Founder" + `reviewedBy` on posts; founder Person entity. `/authors/` not created (one contributor). **Owner:** confirm reviews actually happen |
| 49 | Trust architecture | Done (site side) | Consistent name, logo, description, URL, location, contact and profiles from one entity file. External references = owner |
| 50 | sameAs strategy | Done (owner to verify) | Existing profiles only; nothing invented. Add Behance, Dribbble, Clutch or GBP only if real |
| 51 | Third-party validation | Owner | No outreach was sent (standing rule). Ideas: "Designed by Designit" credits, publications, podcasts, teardown content |
| 52 | Linkable assets | Planned | `/resources/` hub live; 8 tools and 6 reports in the matrix and backlog |
| 53 | AI platform discovery | Done | OAI-SearchBot, Googlebot and Bingbot allowed; live CDN returns 200 to them; ARIA on nav and forms |
| 54 | Robots.txt | Done | Allow-all plus explicit AI crawlers; sitemaps listed; staging `noindex` via header |
| 55 | Don't spend the rebuild on llms.txt | Done | `llms.txt` / `ai/*.json` generated from specs in one script (low cost, mirrors visible content only) |
| 56 | Google AI visibility measurement | Owner | KPIs defined in `06-measurement.md`; GSC access needed |
| 57 | Multimodal discovery | Partial | Alt text and dimensions on every image (gated); case-study images use descriptive names (e.g. `homepage-revamp-hero.webp`). Captions and diagrams need project material |
| 58 | Structured data architecture | Done | Home: Organization + WebSite + WebPage. Service: + Service + Breadcrumb. Industry/solution/hub: WebPage / CollectionPage + Breadcrumb. Blog: BlogPosting + Person (reviewer) + Breadcrumb. Case study: Article (no invented CaseStudy type). FAQPage only with visible answers. No VideoObject (no videos) |
| 59 | Organization schema | Done | SEO-004 |
| 60 | Service schema | Done | SEO-005 |
| 61 | Breadcrumb schema | Done | SEO-006; visible breadcrumbs everywhere except the homepage |
| 62 | SEO data model | Done | Page spec fields (`05` §3), `data/pages-index.json` |
| 63 | Evidence database | Done | Fields: ID, claim, page(s), source, source type, date, verifier, client approval, public, recheck |
| 64 | Content workflow | Done (documented + tooled) | `05` §5 runbook |
| 65 | Content brief template | Done | `05` §6 |
| 66 | Internal linking graph | Done | Nav, hubs, related blocks, next-steps; `data/internal-links.json` |
| 67 | Internal-link rules | Done for the end-of-post block | Every post links pillar, sibling, case study and service. In-body sibling links = refresh task |
| 68 | Homepage link equity | Done | Homepage links all six priority services (verified) |
| 69 | Content feeds commercial pages | Done | 34 posts → commercial destination |
| 70 | Competitor-derived opportunities | Done (mapping) / Planned (articles) | `03` §6 |
| 71 | "Top UI/UX agency" keywords | Done (decision) / Planned (expansion) | No listicle; expand the how-to-choose guide |
| 72 | Pricing content strategy | Done for pages / Planned for articles | Commercial pages: "what moves the price", no numbers (owner decision 2026-10-04). Homepage FAQ still shows the pre-existing ₹1.5L–₹4L retainer range: **owner decision** |
| 73 | Technical SEO architecture | Done | SEO-007; robots meta added to 60 hand-written pages |
| 74 | Crawlability | Done | Content in HTML; navigation is `<a href>`; mega-menu links present in HTML; hubs link every child |
| 75 | Page hierarchy | Done | Every commercial page within two clicks (nav → page, or nav → hub → page) |
| 76 | URL rules | Done | Short, descriptive, no dates or IDs, one canonical form |
| 77 | International SEO | Done (adapted) | USA/UK/UAE pages rewritten with real context (time zones, contracting, accessibility norms, regional work). India is covered on `/locations/`, with no separate India page. Currency statements conflict across pages: **owner decision** (`EV-OWNER-GBP-INVOICING`) |
| 78 | Existing USA/UK/Dubai pages | Done | URLs kept; `/locations/` hub links them |
| 79 | Content refresh system | Done (process) | Triggers incl. AI-visibility decline (`05` §9) |
| 80 | Review intervals | Done | `refreshInterval` on every spec |
| 81 | Content quality gate | Done | Editorial scorecard (11 dimensions incl. trust) documented; technical gate automated |
| 82 | Competitor content gap system | Planned (procedure ready) / Owner (data) | `07` §3; needs organic-keyword exports |
| 83 | What competitors reveal | Done | Synthesis = positioning |
| 84 | "Problem authority" | Done (structural) | Solutions, answer blocks, prompt-library questions |
| 85 | AI prompt library | Done (library) / Owner (runs) | `06-ai-prompt-library.csv`, 103 prompts with target URLs |
| 86 | Google AI monitoring | Owner | `06` §2 |
| 87 | Four asset types | Partial | Commercial ✓, Proof ✓, Authority (existing upgraded; new planned), Tools (planned) |
| 88 | Content-to-revenue architecture | Done | Next-steps chain on every post |
| 89 | CTA by intent | Done | `05` §8; enterprise variant not separate |
| 90 | Start a Project flow | Done | 10 steps exactly as listed; budget optional; recommends UX Audit / Discovery / MVP / Redesign / SaaS / AI / Design System / Website / Branding; lead → Supabase + email; tested with network stubbed |
| 91 | Analytics event architecture | Done (except calculators, country) | `06` §1; consent-gated; lead attribution in every lead |
| 92 | Component system | Done (except SourceNote) | `05` §4 |
| 93 | Content folders | Done (adapted) | `content/pages`, `data/*.json`, `scripts/seo/components`; redirects stay in `vercel.json` |
| 94 | Migration safety protocol | Done (site side) / Owner (backlinks, GSC exports) | `01b` baseline, `11b` matrix, `migration_matrix.py` (0 removals, 0 page→redirect, 0 canonical/sitemap/index changes) |
| 95 | Deployment sequence | Stages 1–3 done; 4–7 await approval | `11-migration-deploy-checklist.md` |
| 96 | Core Web Vitals | Done (lab) / Owner (field) | Font-delayed CLS sweep: all ≤ 0.05 except one pre-existing 0.09–0.11 lab case (DEV-B). LCP/INP need field data |
| 97 | Image strategy | Partial | No decorative placeholders (About placeholder replaced with real work); diagrams and before/after need project files |
| 98 | Publishing priorities | Done | 10 commercial pages, then the industry pages (6 + automotive), then case studies; content clusters after approval |
| 99 | First 20 content assets | Planned | `09` table; 4 already exist and are marked for update |
| 100 | Month 1: foundation | Done (except Figma and backlink inventory) | Audit, inventory, keyword map, competitor map, entity map, IA; homepage, nav, hubs; core four pages; schema, breadcrumbs, metadata, robots, sitemap, analytics, redirects. Figma design = owner (section 114 step 4) |
| 101 | Month 2: authority | Done | Design Systems, AI, Website, Conversion, Branding; B2B SaaS, Fintech, EdTech, PropTech, AI, E-commerce; case-study upgrades |
| 102 | Month 3: content engine | Planned | Starts after approval: refresh top 10 articles, 6–10 new pieces, 1 linkable asset, 1 research asset, 1 tool; PR = owner |
| 103 | Six-month target architecture | On track | Services 11 (target 8–10), industries 7 (6–8), solutions 5 (4–6), case studies 5 + 22 sub-projects (8–15 strong), insights 34 (25–40), tools 0 (2–5), location pages 3 + hub (4), Start a Project ✓, link graph ✓, schema ✓, AI dashboard (owner) |
| 104 | Weekly dashboard | Done (definition) / Owner (operation) | `06` §4 |
| 105 | Monthly executive dashboard | Done (definition) / Owner (operation) | `06` §5 |
| 106 | Priority framework | P0 done; P1 done; P2 not started | P0: IA, URL map, homepage, SaaS, UX audit, product design, UX research, technical SEO, canonicals, redirects, schema, links, robots, sitemap, analytics. P1: AI, DS, website, branding, conversion, industries, case studies |
| 107 | Developer backlog | Done | `08-developer-backlog.md`: SEO-001…010 done (SEO-010 CRM columns = owner) + DEV-A…G |
| 108 | Content backlog format | Done | `09` task cards |
| 109 | Modules A–E | Done | `05` §11 |
| 110 | FAQ correction | Done | FAQ for users and AEO; schema only with visible answers; no reliance on FAQ rich results |
| 111 | SEO / AEO / GEO / Evidence / CRO definitions | Done | `05` §1 |
| 112 | Final content architecture | Done | Services, Industries, Work → Solutions, Insights, Proof → knowledge graph (entity + links + schema) |
| 113 | Top 10 priorities | See below | |
| 114 | Next steps 1–15 | See below | |

## Section 113: the ten priorities

| # | Priority | Status |
|---|---|---|
| 1 | Rebuild the architecture before scaling publishing | Done |
| 2 | SaaS Product Design as a genuine commercial authority page | Done |
| 3 | Completely rebuild UX Audit | Done |
| 4 | Startup / technology branding commercial destination | Done (`/services/branding/`) |
| 5 | AI Product Design as a long-term authority category | Done (service + industry); cluster articles planned |
| 6 | EdTech, Fintech and SaaS content into industry hubs | Done |
| 7 | Case studies into evidence-rich authority pages | Partial: structure done; deeper evidence needs project material |
| 8 | Website redesign / conversion cluster | Pillars done; articles planned |
| 9 | A real internal-link graph | Done |
| 10 | Proprietary research and tools | Planned |

## Section 114: the fifteen next steps

| Step | Status |
|---|---|
| 1 Freeze the URL structure; delete nothing | Done: 0 URLs removed (`migration_matrix.py`) |
| 2 Master URL inventory | Done: `01`, `01b`; backlinks and full GSC = owner |
| 3 Keyword-to-URL map from GSC + SE Ranking (+ fresh competitor export) | Done for GSC + SE Ranking (`02`, `03`, `data/keywords.json`); fresh competitor export = owner |
| 4 Sitemap and IA in Figma | **Owner**: the Figma connection needs authorisation. IA source of truth is `02-master-sitemap-keyword-matrix.md` |
| 5 Rewrite the core commercial pages | Done (11) |
| 6 Upgrade the strongest case studies | Done (structure); evidence depth needs project files |
| 7 Six priority industry hubs | Done (7) |
| 8 Technical SEO, structured data, crawler access, analytics, internal links | Done |
| 9 Refresh pages ranking 5–20 | Partial: bylines, reviewer and next-steps added; content refresh queued (`09`) |
| 10 Launch SaaS, UX audit, website, AI and branding clusters | Pillars live; articles queued |
| 11 First proprietary tool or benchmark | Not started (P2) |
| 12 Authority and digital PR | Owner |
| 13 Weekly GSC + AI visibility monitoring | Owner (`06`) |
| 14 Monthly refresh and competitor gap reviews | Owner (process in `05`, `07`) |
| 15 Feed performance data back into the content engine | Process defined (`05` §5 stage 9) |
