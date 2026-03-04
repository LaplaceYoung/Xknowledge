# Marketing Landing Page

Static promotional site for `X-knowledge` with launch-grade visual design and growth-ready structure.

## Current Build

- Premium hero with real product screenshot reel (`marketing/assets/demo-*.png`).
- Motion system: ambient drift, reveal-on-scroll, CTA shimmer, interactive tilt.
- SEO long-tail guides:
  - `guides/x-bookmarks-to-obsidian.html`
  - `guides/x-bookmarks-to-notion.html`
  - `guides/search-twitter-bookmarks-ai.html`
- Growth instrumentation:
  - UTM auto-append for outbound CTA links (`utm_source/github_pages`, etc.)
  - `robots.txt` and `sitemap.xml`

## Local Preview

From repository root:

```bash
python -m http.server 8080
```

Open:

- `http://localhost:8080/marketing/`
- `http://localhost:8080/marketing/guides/x-bookmarks-to-obsidian.html`

## Deploy Options

1. GitHub Pages (already wired in this repo):
   - Workflow: `.github/workflows/deploy-marketing-pages.yml`
   - Trigger: push to `main` with changes under `marketing/`
   - Strategy:
     - If Pages is configured with `build_type=workflow`: deploy via official Pages Actions.
     - Otherwise: auto-fallback to `gh-pages` branch deploy.
   - URL: `https://laplaceyoung.github.io/Xknowledge/`
2. Cloudflare Pages:
   - Root directory: repository root
   - Build command: none
   - Output directory: `marketing`
3. Netlify:
   - Publish directory: `marketing`
4. Vercel:
   - Framework preset: `Other`
   - Output directory: `marketing`

## Next Iteration

- Add bilingual copy switch (`EN` / `zh-CN`)
- Replace screenshot reel with compressed product GIF/WebM for faster first paint
- Add Chrome Web Store CTA after store listing is live
