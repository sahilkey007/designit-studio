# Measurement: search, AI visibility, events and leads

> Blueprint sections 56–57 (Google AI and multimodal reporting), 85–86 (prompt library, Google AI monitoring), 91
> (event architecture), 96 (Core Web Vitals) and 104–105 (weekly and monthly dashboards). The KPI is
> **organic visitor → qualified lead → sales conversation → proposal → won project → revenue**, not pageviews or rankings.

## 1. What is instrumented on staging

First-party analytics (`analytics.js` v3) writes to the Supabase `events` table, **only after the visitor accepts
cookies** (`localStorage.dsn_consent = granted`). Leads are written to the Supabase `leads` table whether or not
consent was given, because the visitor is submitting a form.

| Blueprint event (section 91) | Implemented as | Fires when | Notes |
|---|---|---|---|
| view_service | `view_service` | Service detail page view | Also `view_industry`, `view_solution` (added) |
| view_case_study | `view_case_study` | Case-study page view | |
| view_article | `view_article` | Blog post view | |
| cta_click | `cta_click` | Any CTA click; carries `track` (e.g. `post_cta`, `start_project`) | |
| start_project | `start_project` | Start a Project flow opened | |
| form_start | `form_start` | First answer in Start a Project | Intake modal also exists |
| form_submit | `form_submit` (Start a Project) · `form_submitted` (intake modal) | Lead sent | Two names for historical reasons; count both |
| — | `form_step_complete`, `recommendation_shown` | Each step / recommendation panel | Funnel drop-off by step |
| calculator_start / calculator_complete | `calculator_start`, `calculator_complete` | First answer / every question answered on a `/resources/` checklist | Props: `tool`, `score`, `answered` (never individual answers) |
| asset_download | `asset_download` | Click on a `.pdf` or download link | |
| schedule_call | `schedule_call` | Calendly link click | |
| — | `page_view`, `scroll_depth`, `outbound_click`, `session_end`, `work_filter` | | Existing and added events |

**Context on every event** (section 91 "Capture"): `page_type`, `service`, `industry`, `content_cluster` (from
`<main data-cluster>`), `landing_page` and `utm_source` / `utm_medium` / `utm_campaign` (first touch, from
sessionStorage), and `referrer`. **Country is not captured client-side.** It can be derived server-side from the
request (Vercel geo headers) if the owner wants it. That would need a small API route, not built.

**Leads (SEO-010).** Every lead, from both the Start a Project flow and the intake modal, now records the landing
page, form page, UTMs and referrer. These ride in the lead's `anything_else` text, because the `leads` table has no
attribution columns and adding unknown columns would make inserts fail. Start a Project leads also carry the
recommended engagement in `project_type` and the answers in `description`. Verified on 2026-10-05 with network calls
stubbed (no real lead sent). **CRM mapping:** add `landing_page`, `utm_source`, `utm_medium`, `utm_campaign`,
`referrer` and `recommended_engagement` columns to `leads` in Supabase, then switch the code from the text field to
the columns. Owner task; the table is outside this repository.

**Third-party tags.** Meta Pixel and leadsy.ai are consent-gated. Google Analytics 4 (`G-HCN5Q8W144`, also via GTM
`GTM-TQPPB8B7`) now runs under **Google Consent Mode v2**: storage denied until the visitor accepts (decided
2026-10-05). GA still receives cookieless pings for modelling; expect lower observed GA counts than before.

## 2. Search Console (sections 56, 57, 86)

Weekly, in Google Search Console (owner access required; no connected tool can read it from here):

- **Performance → Search results:** clicks, impressions, CTR and position by query and page; filter out brand
  (`designit`, `desigit`, `design it`) for non-brand acquisition.
- **Generative AI performance** (rolled out globally by 31 Aug 2026): AI-feature impressions, AI-visible pages,
  countries, devices and dates.
- **Multimodal search** (added Sept 2026): image-led discovery (Lens, image uploads). Relevant because case studies are visual.

Baseline: the September 2026 export in `03-keyword-pools.md`. Take the next export one week after staging goes live,
then compare like-for-like 28-day windows.

## 3. AI prompt visibility (sections 85, 109 module D)

`06-ai-prompt-library.csv` has 103 prompts:

- the 18 prompts the blueprint lists (verbatim)
- the 8 "problem authority" questions (section 84)
- the 8 agentic-UX questions (section 10B)
- 4 entity checks (including "Is designit.co.in the same company as Designit owned by Wipro?")
- one row for every `aiAnswerTargets` question the pages were built to answer

Each row names the Designit URL that should be cited.

Run monthly in ChatGPT search, Perplexity, Gemini, Google AI Mode / AI Overviews and Copilot. Record date, model or
engine, whether Designit is mentioned, whether a Designit URL is cited (and which), which competitors are mentioned
or cited, and the citation context. Keep one CSV per month (`06-ai-prompt-library-YYYY-MM.csv`) so changes are
visible. **Do not edit pages to chase a single answer**: treat a lost citation as a refresh trigger (section 79) and
check freshness, sources, completeness, entity clarity and direct answers first.

## 4. Weekly operating dashboard (section 104), every Monday

| Signal | Source | Definition |
|---|---|---|
| Top new keywords | GSC queries | Queries with impressions this week and none in the previous 4 weeks |
| Top lost keywords | GSC queries | Queries with impressions in the previous 4 weeks and none this week |
| Top ranking gains / losses | GSC queries | Largest position change, minimum 10 impressions |
| Pages entering top 10 / top 20 | GSC pages | Average position crossed 10 or 20 this week |
| High impression / low CTR | GSC queries | Top-quartile impressions with CTR below the site median for that position band |
| New commercial queries | GSC queries × `data/keywords.json` | New queries whose owner is a service, solution or industry page |
| New / lost AI visibility | GSC Generative AI report + prompt library | Pages gaining or losing AI-feature impressions; prompts gaining or losing a Designit citation |
| New / lost referring domains | Backlink tool (Ahrefs or similar; owner) | Not available from connected tools today |
| Technical issues | `quality_gate.py`, `validate-site.mjs`, GSC Pages report | Any failure, 404, soft 404 or canonical change |

## 5. Monthly executive dashboard (section 105)

| KPI | Why | Source |
|---|---|---|
| Organic clicks | Traffic | GSC |
| Non-brand clicks | True acquisition | GSC, brand filter |
| Commercial clicks | Revenue relevance | GSC pages that are service / solution / industry / location |
| Organic leads | Business output | Supabase `leads` where the lead's landing page or referrer is organic |
| Qualified leads | Quality | Owner qualification in CRM |
| Conversion rate | Efficiency | Leads ÷ organic sessions (events table, consented sessions only) |
| Top 10 / top 20 keywords | Visibility / pipeline | GSC |
| AI impressions / AI-visible pages | GEO visibility | GSC Generative AI report |
| Referring domains | Authority | Backlink tool |
| Organic revenue | Business impact | CRM won deals with organic first touch |

## 6. Core Web Vitals (section 96)

Targets: **LCP < 2.5 s, INP < 200 ms, CLS < 0.1**, judged on real-user data (Search Console Core Web Vitals / CrUX),
not a lab score. Lab check on staging, 2026-10-04: CLS swept on all 99 sitemap URLs at 390 px and 1440 px with web
fonts deliberately delayed 1.5 s; worst 0.03, none above 0.05. LCP and INP need field data once the site is live.

## 7. Supabase queries the owner can run

Column names other than those the site writes (`event_name`, `session_id`, `page_url`, `properties`; lead fields such as `project_type`, `source`, `anything_else`) are not visible from this repository. The queries assume Supabase's default `created_at` timestamp; adjust if the tables use another name.

```sql
-- Organic lead attribution (last 30 days)
select created_at, project_type, source, anything_else
from leads
where created_at > now() - interval '30 days'
  and (anything_else ilike '%Referrer: https://www.google.%' or anything_else ilike '%UTM: google / organic%')
order by created_at desc;

-- Start a Project funnel (consented sessions)
select event_name, count(distinct session_id)
from events
where event_name in ('start_project','form_start','form_step_complete','recommendation_shown','form_submit')
  and created_at > now() - interval '30 days'
group by 1 order by 2 desc;

-- Views by content cluster
select properties->>'content_cluster' as cluster, count(*)
from events where event_name = 'page_view' and created_at > now() - interval '30 days'
group by 1 order by 2 desc;
```
