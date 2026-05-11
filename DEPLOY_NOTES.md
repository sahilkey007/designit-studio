# Deploy Notes — Manual Vercel Actions Required

These steps **cannot be done from code** — they need to be done in the Vercel
dashboard or via the Vercel MCP/CLI with appropriate permission. They were
flagged in the latest audit and are tracked here so they don't get lost.

## 1. Attach `designit.co.in` as a production custom domain

The current `designit-studio` Vercel project has `live: false`, meaning no
custom domain is attached. Production traffic is served from the preview URL
`designit-studio.vercel.app`.

**Action:**
1. Go to **Vercel → designit-studio → Settings → Domains**.
2. Add `designit.co.in` and `www.designit.co.in`.
3. Update DNS at the registrar:
   - `A` record (or `ALIAS`) for the apex → `76.76.21.21`
   - `CNAME` for `www` → `cname.vercel-dns.com`
4. Wait for DNS propagation, confirm HTTPS issuance.
5. Set `www → apex` redirect in Vercel domain settings.

After attaching, `live` flips to `true` and the canonical URLs in `<link rel="canonical">`
and `og:url` (already pointing at `https://designit.co.in/`) will resolve correctly.

## 2. Clean up orphan Vercel projects

The team `sahilnsharma77-8299s-projects` currently has **3** projects:

| ID | Name | Created | Status |
|---|---|---|---|
| `prj_HWD9QSw7RPVbR01JVfv5Zd6SAxAg` | `designit-studio` | 2026-04-03 | **Keep — canonical** |
| `prj_9l5kLzcKF5zn7N85sztrKshfSsbk` | `designit-co-in` | 2026-03-29 | Delete after confirming no production domain |
| `prj_cMXWPqQa4Tmoei8teMRSYFN2PiqV` | `designit` | 2026-04-03 | Delete |

**Action:**
1. In each candidate project, **Vercel → Settings → Domains** — confirm no
   production domain is attached.
2. If clean, **Settings → General → Delete Project**.

## 3. After both are done

Re-run the audit:

```sh
# Quick check via Vercel MCP (or the dashboard):
# - list_projects for the team → should show 1 project
# - get_project designit-studio → live: true
# - domains contains designit.co.in
```

## Asset drop locations (for real screenshots)

The codebase now points to local SVG placeholders instead of Unsplash. Drop the
real files at these paths and they'll be picked up immediately:

- `/assets/founder/sahil-sharma.jpg`  — 400×400, square, founder portrait
- `/assets/projects/adda247.svg`      — replace with real hero/screenshot (or `.jpg`)
- `/assets/projects/rcentric.svg`     — same
- `/assets/projects/kelp-global.svg`  — same
- `/assets/projects/betacrew.svg`     — same
- `/assets/projects/tata-elxsi.svg`   — same
- `/assets/projects/omniyat.svg`      — same
- `/assets/projects/default.svg`      — generic fallback / about-page team shot
- `/assets/services/*.svg`            — service-card thumbnails (8 files)
- `/assets/blog/*.svg`                — blog thumbnails (21 files)

If you replace any `.svg` with a `.jpg` or `.png`, also update the `<img src="...">`
references in the relevant HTML files (or keep both extensions and switch the
referenced one).
