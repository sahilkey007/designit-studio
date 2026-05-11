# Deploy Notes

## Status (2026-05-11)

| Task | Status |
|---|---|
| `designit.co.in` + `www.designit.co.in` attached to `designit-studio` | ✅ Done |
| Orphan project `designit-co-in` deleted | ✅ Done |
| Orphan project `designit` deleted | ✅ Done |
| DNS A record updated at registrar | ⏳ **Your action required** |
| `live: true` confirmed on Vercel | ⏳ Pending DNS propagation |

---

## 1. DNS update — only remaining action

`designit.co.in` and `www.designit.co.in` are now attached to Vercel project
`designit-studio` and verified at the domain level. Vercel will flip
`live: true` automatically once your registrar's DNS resolves correctly.

**Action — at your registrar (currently GoDaddy / `ns55.domaincontrol.com`):**

| Type | Host | Value |
|---|---|---|
| `A` | `@` (apex) | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

DNS propagation typically takes 10–60 minutes. After it resolves, HTTPS will
be issued automatically and `https://designit.co.in/` will serve the site.

The `www → apex` redirect (308 Permanent) is already configured in Vercel.

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
