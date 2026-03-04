# Marketing Landing Page

Static promotional page for `X-knowledge`.

## Current Visual Direction

- Cinematic hero + bento feature matrix inspired by top open-source product pages.
- Motion system: ambient background drift, reveal-on-scroll, button shimmer, and interactive tilt panel.
- Live repo signals: GitHub stars/forks/updated date fetched at runtime.

## Local Preview

From repository root:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/marketing/`.

## Deploy Options

1. GitHub Pages (already wired in this repo):
   - Workflow: `.github/workflows/deploy-marketing-pages.yml`
   - Trigger: push to `main` with changes under `marketing/`
   - Strategy:
     - If Pages is already enabled: deploy via official Pages Actions.
     - If Pages is not enabled yet: auto-fallback to `gh-pages` branch deploy.
   - Expected URL after enabling Pages: `https://laplaceyoung.github.io/Xknowledge/`
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

- Add product screenshots/GIF demos
- Add bilingual copy switch (`EN` / `zh-CN`)
