# Staging copy of designit.co.in

`staging` is a full copy of the live site (`main`). Work on it freely; it never touches designit.co.in.

- **Preview URL:** https://designit-studio-git-staging-sahilnsharma77-8299s-projects.vercel.app
  (private: Vercel protects previews, so you must be logged in to Vercel to open it).
- **Deploys:** every push to `staging` builds a new preview. Only `main` goes to designit.co.in.
- **Search engines:** the preview is not public and is not indexed. Do NOT add noindex tags or robots blocks
  to files on this branch, because those files would reach the live site when merged.
- **Going live:** only after explicit owner approval, merge `staging` into `main`, push, then verify on
  https://designit.co.in (not the Vercel output).
- **Before asking to go live:** `node scripts/validate-site.mjs` and `node generate-sitemaps.js --check` must pass.
- **Keep in sync:** if `main` gets a hotfix, merge `main` into `staging` before continuing.
