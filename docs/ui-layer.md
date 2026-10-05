# UI interaction layer (staging, October 2026)

A site-wide layer that makes the site feel more premium without changing any copy, URL, title, H1, schema or
layout. Files: `ui.css`, `ui.js`, `assets/vendor/lenis/` (plus the logo marquee in `build_pages.py` / `page.css`).

## The one rule

`ui.css` loads asynchronously, so it is **paint-only**: colour, background, border colour, shadow, opacity,
transform, filter, and absolutely positioned decoration. Nothing in it may change an element's size or position in
the flow, or the page would shift when it lands (CLS). Layout for a new component goes into critical CSS or
`scripts/seo/components/page.css` (inlined into every generated page), never into `ui.css`.

## Components and where they came from

All free and open source, or re-implemented from scratch. No paid ("Pro") component was used; no React, Tailwind
or Three.js was added.

| Component | Pattern source (licence) | Where | Notes |
|---|---|---|---|
| Smooth scroll | Lenis 1.3.26, darkroom.engineering (MIT, file vendored with its licence) | Every page | Off for `prefers-reduced-motion`. Native scroll is kept inside the mobile menu, dialogs, wide tables and form fields. `main.js` routes in-page anchor links through it and moves focus to the target. |
| Shader gradient | Look of ShaderGradient (MIT); own ~1 KB fragment shader in `ui.js` | First hero (`.geo-hero`, `.page-hero`, `.blog-hero`) and every closing CTA (`.geo-cta-section`) | Brand hues (`--color-1…5`). Half resolution, ~30 fps, paused off-screen and in background tabs, one still frame under reduced motion, static CSS gradient if WebGL is missing. CTA glow rises from the bottom edge so the copy stays on near-black. |
| Grid pattern | Magic UI "Grid Pattern" (MIT) | `.geo-hero` | CSS only, radial mask. |
| Border beam | Magic UI "Border Beam" (MIT) | Top edge of the closing CTA | CSS `@property` animation. |
| Spotlight cards | Magic UI "Magic Card" (MIT), Unlumen "Hover Feature Cards" (free tier) | Cards, case-study cards, problem rows, stages, steps, quotes, clusters, blog cards | Fine pointers only (no effect on touch). One empty `aria-hidden` span per card. |
| Tilt card | Unlumen "Tilt Card" (free tier) | `.work-card` | Max ~2-2.5°; off under reduced motion. Image eases to 1.04 on hover. |
| Blur fade reveal | Magic UI "Blur Fade" (MIT) | Section headings, cards, FAQ rows below the fold | Never applied to anything on screen at load, so LCP and the hero are untouched. Classes are removed after the animation. |
| Active stage | Own | `.stage`, `.step` | The step in the middle of the screen gets a brighter border and gradient label. |
| Logo marquee | Magic UI "Marquee" (MIT) | Generated pages with a `logos` section | Duplicate list is `aria-hidden` with empty alts. Pause button (WCAG 2.2.2) is revealed by `ui.js`. Reduced motion: static, wrapped row. |
| Motion accordion | SmoothUI accordion (MIT) | `.faq-list` | Answer fades and slides in. `main.js` now sets `aria-expanded`. |
| Scroll progress | Magic UI "Scroll Progress" (MIT) | `/blog/*`, `/projects/*`, `/resources/*` | 2 px gradient bar above the nav. |
| Number ticker | Magic UI "Number Ticker" (MIT); uses the existing `main.js` `[data-count]` counter | About stats | Real figures only (evidence rules still apply). Off under reduced motion. |
| Nav underline | Own | Desktop nav | Grows on hover; marks the active section. |

**Considered and not used:** Unicorn Studio (needs an account; free plan adds their logo and caps publishes;
commercial licence is paid), ThreeUI (mostly Three.js scenes, mixed free/paid, no licence found), every Pro item on
Unlumen and Magic UI, and effects that do not suit a design studio (globe, confetti, meteors, cursor trails).
basement.studio is a studio site, not a library: only its restraint (dark, large type, numbered lists) informed the
direction.

## Accessibility and contrast

- Text over the moving gradient was measured at its brightest frame (24 animation frames, every pixel behind each
  text element). Small text inside a gradient hero (breadcrumbs, labels) is lifted to `#e6e6e6`; hero pills get a
  55% black glass backing. Probe: `scratchpad/shader-contrast.js` pattern, documented in the session notes.
- Every canvas and decoration is `aria-hidden`; nothing new is focusable except the marquee pause button.
- `prefers-reduced-motion: reduce` disables smooth scroll, reveal, tilt, marquee motion, the border beam and the
  counter, and renders the shader once.

## Applying and versioning

```
python3 scripts/seo/apply_ui.py      # adds/replaces the ui:css and ui:js blocks on every page and in shell.html
python3 scripts/seo/build_pages.py   # regenerates generated pages (picks up shell + page.css)
```

`ui.css` and `ui.js` are served `immutable`: after editing either, bump `UI_CSS` / `UI_JS` in `apply_ui.py` and
re-run both commands. Lenis is versioned by file name under `/assets/vendor/lenis/`.

## Designit Design System (Claude Design handoff, applied October 2026)

Source: `Landing page/Designit Design System-handoff.zip` (tokens, guideline cards, deck slides, Kelp and
learning-app UI kits). Only the brand layer applies to the website; the Kelp and learning-app product
components are client work and are not used on the site.

| Rule from the system | How the site follows it |
|---|---|
| Two grounds only, `#000` and `#fff` | Page ground is pure black. Generated pages alternate argument sections (cards, problems, quotes, steps) onto white, never two white in a row (`render_sections` in `build_pages.py`; force with `"ground": "light"/"dark"` in a spec). |
| Muted statement: Poppins Regular, lh 1.03, -0.05em, 60% white (30% black on light) | H1 and gradient-text headings. On white, 58% black instead of 30%, because 30% fails WCAG AA. |
| Inter body at -0.022em | Site-wide letter-spacing. |
| Spectrum lives in the logo dot and in grainy cover washes only | Rainbow buttons and glows removed. The hero/CTA shader is now a grainy blue/violet/magenta wash rising from the bottom edge. The floating "Book a Free Call" button is white, no longer violet. |
| Cards: 13px radius; dark = hairline, light = `#FAFAFA` tile with no border, no shadow | `ds-below.css`. |
| 1px hairlines; no shadows, no blur, no glassmorphism | Nav, mega menu, mobile menu and cookie banner are solid black with hairlines. Hover lifts, zooms and the tilt card are removed; the card spotlight is a hairline brightening only. |
| Hover darkens; nothing scales; motion 120/200ms near-linear | Buttons `#fff` → `#e3e3e3`; reveal is a short fade-rise with no blur. |
| Focus is a solid 4px ring | Buttons get `0 0 0 4px rgb(238,239,244)`; links keep a 2px white outline. |
| Sentence-case eyebrows | Kickers, labels, stage keys and footer titles are no longer upper-cased. |

Files: `scripts/seo/components/ds-critical.css` (first paint, inlined as `<style id="ds-critical">`),
`scripts/seo/components/ds-below.css` (appended to `design-system.css` between `/* ds:start */` and `/* ds:end */`),
`scripts/seo/apply_ds.py` (injects both, adds self-hosted Poppins 400/500/600 with a metric-matched fallback, bumps
`design-system.css` / `pages.css` versions), `scripts/seo/ds_covers.js` (regenerates blog covers into
`assets/blog/ds/` in the deck-cover style, Poppins embedded).

Not adopted, deliberately: Whyte/Archivo display face (the system uses it only at 140-190px on slides; Poppins
carries every statement), the 1920×1080 slide grid, and the Kelp red action colour (product UI, not brand).

Order after any change: `apply_ds.py` → `apply_ui.py` → `build_pages.py` → quality gate, link validator, axe, CLS.

## Pass 2: premium and conversion (October 2026, owner choices)

Owner decisions: glass on floating layers only; Claude drafts new copy from approved evidence and the owner reviews it on
staging; add a contact dock, a "how we compare" matrix, problem-first cards, an announcement bar and WhatsApp;
homepage and shared parts first, other templates in a second pass.

| Change | UX principle | Where |
|---|---|---|
| Glass on floating layers only (nav after scroll, mega menu, mobile menu, contact dock, cookie banner, case-study chip). 78% black so text keeps at least 4.5:1 over the white sections. Cards stay solid. | Apple-style depth without breaking the system | `ds-critical.css`, `ui.css`, `consent-banner.js` |
| Announcement bar → free 48-point checklist (dismiss remembered; hidden before paint) | Low-commitment entry point | `apply_ds.py` (markup), `ds-critical.css`, `main.js` |
| Contact dock: Start a project + WhatsApp + Book a call + Email; after the hero, hidden near the footer, under the cookie banner on phones, and on contact, start-a-project and tool pages | Hick's law (one primary), Fitts's law (thumb zone), Jakob's law (familiar icons) | `main.js`, `ui.css` |
| Homepage order: problems → services → work → why → compare → recommendations → CTA band → process | Proof before process; serial-position effect | `content/pages/home.json` |
| "How Designit compares" matrix (stacks to cards on phones) | Differentiation; von Restorff (the highlighted column) | `r_matrix`, `page.css` |
| Mid-page CTA band (Start a project / Book a call / free checklist) | Goal-gradient: an action at the point of conviction | `r_ctaband`, `page.css` |
| Problem cards: numbered, two columns, whole card clickable | Fitts's law; users self-identify by symptom | `r_problems`, `page.css` |
| Deck-style eyebrows, 112px section rhythm, h2 at 56px, intro at 19px | Apple-like hierarchy and whitespace | `head_block`, `page.css` |
| Card interactions: arrow travels 4px; case-study image dims and a glass "Read case study" chip floats in; press states darken | Doherty threshold (feedback <100ms); nothing scales, per the system | `ui.css` |
| Card grids balance by item count (6 → 3×2, 4 → 4 or 2×2) | Gestalt: no orphans | `page.css` |

New copy (owner to review): the comparison matrix, its intro and note, the CTA band, the eyebrows and the announcement.
Every Designit claim maps to an evidence record (EV-SITE-CASE-COUNT, EV-TESTIMONIALS, EV-DELIVERY-BOUNDARY, EV-FOUNDER,
EV-PROCESS-*); statements about freelancers, agencies and in-house hires are framed as general patterns, not facts.
