# Marketing Landing Page

Static promotional page for `X-knowledge`.

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
   - Expected URL: `https://laplaceyoung.github.io/Xknowledge/`
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

- Replace static stats with live badges (GitHub stars, latest release)
- Add product screenshots/GIF demos
- Add bilingual copy switch (`EN` / `中文`)
