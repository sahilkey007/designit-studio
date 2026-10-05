# Competitor notes, do-not-copy list and gap-analysis procedure

> Blueprint sections 7–13, 82 and 83. These notes record the blueprint's *patterns* only. No competitor wording,
> claims, statistics, testimonials, awards or case-study metrics were copied into the site, and the competitor sites
> were not re-crawled for this document.

## 1. What each competitor teaches, and what staging took from it

| Competitor | Strategic pattern (section 83) | Lesson (sections 7–12) | Implemented on staging as |
|---|---|---|---|
| **TheFinch** (thefinch.design) | Problem + acquisition + process | **A. Problem-based services**: expose what buyers look for (discovery, MVP, full product design, SaaS dashboard, websites, apps, e-commerce) and ask about symptoms. **B. Qualification mechanism**: a Designit "Project Scope & Fit Assessment", not an instant price estimate; never expose invented price ranges. **C. Case-study storytelling**: problem, context, research, decisions, before, after, validation, outcome, lesson | Homepage "What we help teams solve": seven problems, each routed to an engagement (launching something new → MVP design; hard-to-use product → UX audit; activation and conversion → conversion optimization; legacy UX → legacy modernization; scaling a SaaS product → SaaS product design; design system → design systems; AI experiences → AI product design). `/start-a-project/`: 10 steps, recommends UX Audit / Discovery / MVP / Redesign / SaaS / AI / Design System / Website / Branding, budget optional, no prices. Case studies rebuilt on the section 29 template |
| **Lollypop** (lollypop.design) | Scale + industries + research + content + locations | **A. Research as a first-class capability** (UX research, heuristic evaluation, usability testing, discovery, competitor research, IA). **B. Whitepaper / research layer** (`/resources/`; reports such as a SaaS UX benchmark or design-system maturity model). **C. Locations only where genuinely relevant**: USA, UK, UAE, India; no 50-city doorway pages | Mega-menu column "Research & Strategy" (UX Research, UX Audit, Product Discovery, Product Strategy). `/resources/` hub (reports planned, not faked). `/locations/` hub over the existing USA, UK and Dubai pages, with India covered on the hub. No city pages |
| **NetBramha** (netbramha.com) | Research + strategy taxonomy + industry depth + proof | Methodological identity: **Discover → Define → Design → Validate → Scale** | Homepage "How we work": Research → Strategy → Experience design → Validation → Systems → Evolution (section 17). Service pages state their method |
| **Onething** (onething.design) | Global positioning + AI + branding + projects + resources | **A. AI as a real service/category** (AI product design, AI UX, interface design, agent experiences, conversational UX, human-AI interaction, AI discovery, AI design systems). **B. Agentic experiences need a knowledge base** (agent state, approval, autonomy, failure, recovery, uncertainty, handoff, permissions). Do not copy their "Human-led. AI-accelerated." positioning | `/services/ai-product-design/` and `/industries/ai/`, covering uncertainty, approval, autonomy, recovery, trust and agentic patterns in Designit's own words. The agent questions are in the AI cluster backlog and the prompt library |
| **DD.NYC** (dd.nyc) | Web lifecycle + implementation + trust | Explain the full lifecycle and make the **delivery boundary explicit**: strategy, UX, UI, prototype, design system, handoff, design QA, launch support. Include development only if Designit provides it. **Trust stack only with verified evidence** | Website-design and mobile-app pages state that Designit designs, specifies and supports build through design QA and launch support, with development by the client's team or partner (`EV-DELIVERY-BOUNDARY`, **owner to confirm**). Trust stack limited to named clients, published case studies, verbatim recommendations, founder bio and "(career)"-labelled figures |
| **UX Studio** (uxstudioteam.com) | B2B SaaS specialisation + research + advisory | **Write by buyer situation**: you need to launch → discovery + MVP; fix adoption → UX audit + redesign; hard to maintain → design system + governance; need senior capacity → embedded product design; users struggling → research + usability testing; SaaS too complex → SaaS redesign | The five `/solutions/` pages are organised by buyer situation. Hubs route "I have this problem" to the right engagement |

**Designit synthesis (section 83):** senior-led + research-led + B2B SaaS / technology depth + product design + UX
audit + design systems + AI product design + evidence-led case studies + business outcomes. This is the entity
description in `data/entities.json` and the homepage H1/subtitle.

## 2. Do-not-copy list (section 13)

Never reproduce from any competitor: their wording · page structure line-for-line · claims · brand promises ·
testimonials · statistics · case-study metrics · awards claims · team scale · "best agency" positioning · AI
positioning language.

Also never: manufacture a client count, revenue impact, NPS or user number because a competitor shows one
(section 11); expose invented price ranges to imitate an estimator (section 7B); build city doorway pages (section 8C).

The quality gate's banned-claims list (`scripts/seo/quality_gate.py`, `BANNED`) blocks known fabricated or
unverifiable claims from reappearing. Extend it whenever an owner decision removes a claim.

## 3. Content gap system (section 82), to run when exports are available

**Status: not run.** The blueprint notes that the connected Ahrefs workspace could not export competitor organic
keywords, and no competitor keyword export was available in this session. Nothing here is estimated.

**Competitors to export:** thefinch.design, lollypop.design, netbramha.com, onething.design and
uxstudioteam.com as direct competitors. dd.nyc counts as a *search* competitor for website and web-design intent,
not a positioning peer. The 100X system's split applies: direct competitors, search competitors, authority competitors.

**Procedure**

1. Export each domain's organic keywords (Ahrefs Content Gap or SE Ranking) for India, US, UK and UAE, and export
   Designit's own from GSC.
2. Build one table: keyword · competitor A rank · B · C · … · Designit rank · Designit URL.
3. Classify every row:

| Gap type | Definition | Action |
|---|---|---|
| 1 | Several competitors rank; Designit does not | New page only if no owner exists in `data/keywords.json`; otherwise expand the owner |
| 2 | Designit ranks on page 2 | Refresh / expand the owning page (section 79) |
| 3 | Designit ranks on page 1 with low CTR | Rewrite title and description; check the SERP features |
| 4 | A competitor ranks with a weak page | Build the better answer on the owning page |
| 5 | No competitor has a strong answer | Original asset (guide, framework, tool) |
| 6 | New or emerging query | Watch list; add to the prompt library |

4. Remove the noise pool (dated 2017/2018 trend queries, unrelated terms) before classifying.
5. Feed accepted rows into the matrix (`scripts/seo/build_matrix.py` `PLANNED`) and the content backlog with a
   section 108 task card.

Re-run quarterly (section 79 cadence), or when a competitor launches a major section.
