# Marketing Landing Page

Static promotional page for `X-knowledge`.

## Local Preview

From repository root:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/marketing/`.

## Deploy Options

1. Cloudflare Pages:
   - Root directory: repository root
   - Build command: none
   - Output directory: `marketing`
2. Netlify:
   - Publish directory: `marketing`
3. Vercel:
   - Framework preset: `Other`
   - Output directory: `marketing`

## Next Iteration

- Replace static stats with live badges (GitHub stars, latest release)
- Add product screenshots/GIF demos
- Add bilingual copy switch (`EN` / `中文`)
