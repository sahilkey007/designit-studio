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
