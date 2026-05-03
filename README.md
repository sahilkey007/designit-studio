# Designit — B2B SaaS & Product Design Agency

> Premium UI/UX design agency website for [designit.co.in](https://designit.co.in) — India's design partner for SaaS, Fintech, and Enterprise startups.

[![Live Site](https://img.shields.io/badge/Live-designit.co.in-black?style=flat-square)](https://designit.co.in)
[![GitHub repo](https://img.shields.io/badge/Repo-sahilkey007%2FDesignit.co.in-181717?style=flat-square&logo=github)](https://github.com/sahilkey007/Designit.co.in)

---

## 🖥️ Live Preview

**[https://designit.co.in](https://designit.co.in)**

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS (custom design system) |
| Scripting | Vanilla JavaScript (ES6+, IIFE pattern) |
| Fonts | Google Fonts — Inter, Playfair Display |
| Icons | Inline SVG |
| Data | JSON (`/data/blog.json`, `/data/projects.json`) |
| Deployment | Vercel / Netlify / GitHub Pages |

No framework, no build step, no npm install required.

---

## 📁 Folder Structure

```
designit.co.in/
│
├── index.html                  # Homepage
├── about.html                  # About page
├── projects.html               # Projects gallery
├── project-detail.html         # Dynamic project detail template
├── pricing.html                # Pricing page
├── contact.html                # Contact page
├── careers.html                # Careers page
├── 404.html                    # Custom 404
│
├── blog/                       # SEO blog (static HTML per post)
│   ├── index.html              # Blog listing
│   ├── sitemap.xml             # Blog sitemap
│   └── [slug]/
│       └── index.html          # Individual blog post
│
├── projects/                   # Project case study pages
│   ├── adda247.html
│   ├── rcentric.html
│   ├── kelp-global.html
│   ├── betacrew.html
│   ├── tata-elxsi.html
│   ├── adda247/                # Adda247 sub-project pages
│   ├── rcentric/               # R-Centric sub-project pages
│   ├── kelp-global/            # Kelp Global sub-project pages
│   ├── betacrew/
│   └── tata-elxsi/
│
├── data/
│   ├── blog.json               # Blog post metadata
│   └── projects.json           # Projects metadata
│
├── design-system.css           # Core design tokens + components (root/blog)
├── pages.css                   # Page-specific layout styles (root/blog)
├── style.css                   # Project detail page CSS
├── theme.css                   # Dark mode CSS tokens
├── intake-form.css             # Intake form overlay styles
│
├── main.js                     # Primary JS — nav, animations, TOC, filters
├── script.js                   # Project/sub-page JS (legacy, to merge)
├── theme.js                    # Dark/light mode toggle
├── i18n.js                     # Internationalisation utilities
├── intake-form.js              # Intake/contact form modal logic
├── generate-blog.js            # Node.js script — generates blog HTML from JSON
│
├── logo.svg                    # Brand mark (SVG)
│
├── vercel.json                 # Vercel deployment config
├── netlify.toml                # Netlify deployment config
├── robots.txt                  # SEO crawl directives
└── .gitignore
```

---

## ⚡ Quick Start (Local Development)

No build tool required. Serve the root as a static site:

```bash
# Option 1 — Python (built-in)
python3 -m http.server 3000

# Option 2 — Node.js
npx serve .

# Option 3 — VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open [http://localhost:3000](http://localhost:3000).

---

## 🚀 Deployment

### Vercel (recommended)

```bash
# 1. Install Vercel CLI (optional — can also use dashboard)
npm i -g vercel

# 2. Deploy from project root
cd Studio_Landing_Page
vercel
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) — Vercel will auto-detect the static site. No build command needed, publish directory is `.`.

### Netlify

```bash
# Via Netlify CLI
npm i -g netlify-cli
netlify deploy --dir . --prod
```

Or drag-and-drop the folder at [app.netlify.com/drop](https://app.netlify.com/drop). The `netlify.toml` handles redirects and cache headers automatically.

### GitHub Pages

1. Push to `main` branch
2. Go to **Settings → Pages → Source** → select `main` branch, `/ (root)`
3. Set custom domain to `designit.co.in` and enable HTTPS

> ⚠️ GitHub Pages note: ensure all asset paths are relative (e.g. `./main.js` not `/main.js`) for sub-path deployments.

---

## 📝 Adding a New Blog Post

1. Add post metadata to `data/blog.json`
2. Run the generator:
   ```bash
   node generate-blog.js
   ```
   This creates `blog/[slug]/index.html` with all styles and SEO tags pre-populated.
3. Update `blog/sitemap.xml` with the new URL.
4. Commit and push.

---

## 🎨 Design System

The site uses a bespoke CSS design system in `design-system.css`:

- **Tokens**: `--bg-page`, `--text-primary`, `--accent`, `--radius-*`, `--shadow-*`
- **Dark mode**: All tokens override under `[data-theme="dark"]` in `theme.css`
- **Components**: `.btn`, `.card`, `.navbar`, `.faq-item`, `.project-card`, `.review-card`, `.stat-card`
- **Typography scale**: defined via CSS custom properties, uses Inter (variable weight 400–900)

---

## ⚠️ Known Issues / Future Work

| Issue | Priority | Notes |
|---|---|---|
| `script.js` and `main.js` are parallel implementations | Medium | Merge into a single `main.js`; project pages still use `script.js` |
| Project images load from external CDN (`sahil-portfolio-fawn.vercel.app`) | High | Should be self-hosted or migrated to a CDN you control |
| Social media links are placeholder `#` | Low | Wire up real Twitter/LinkedIn/Dribbble/Behance URLs |
| `_next/` and `blog/__next*.txt` artifacts on disk | Low | Safe to delete manually — already excluded from git |
| No root `sitemap.xml` | Medium | Only `blog/sitemap.xml` exists; add root sitemap referencing all pages |

---

## 📄 License

Proprietary — © Designit. All rights reserved.
