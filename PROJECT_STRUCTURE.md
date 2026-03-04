# Repository Structure

## Top-Level

- `.github/workflows/`: CI/CD and deployment workflows.
- `x-knowledge-extension/`: Chrome extension product source.
- `marketing/`: static marketing pages for GitHub Pages.

## Extension Module Layout (`x-knowledge-extension/`)

- `src/background/`: service worker and background tasks.
- `src/content/`: content scripts.
- `src/options/`: extension options page.
- `src/components/`: UI components.
- `src/utils/`: data, export, parser, and integration utilities.
- `public/`: static extension assets (icons/scripts).

## Repo Hygiene Boundaries

The following classes of files are intentionally excluded from tracking:
- internal strategy/operations docs
- local agent notes (`.claude/`)
- signing keys and packaged artifacts
- local build logs and temporary outputs

Refer to `.gitignore`, `x-knowledge-extension/.gitignore`, and `.github/workflows/repo-hygiene.yml` for enforced rules.
