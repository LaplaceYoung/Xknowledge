#!/usr/bin/env python3
"""Generate a practical optimization task queue for iterative repo improvement."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def detect_stack(repo: Path) -> list[str]:
    markers = {
        "package.json": "node",
        "pnpm-lock.yaml": "pnpm",
        "yarn.lock": "yarn",
        "package-lock.json": "npm",
        "pyproject.toml": "python",
        "requirements.txt": "python",
        "Cargo.toml": "rust",
        "go.mod": "go",
        "tauri.conf.json": "tauri",
        "vite.config.ts": "vite",
        "next.config.js": "nextjs",
    }
    found = [name for filename, name in markers.items() if (repo / filename).exists()]
    return sorted(set(found))


def make_tasks(stack: list[str]) -> list[dict]:
    tasks = [
        {
            "id": "quality-gates",
            "title": "Stabilize lint/test/build gates",
            "impact": 5,
            "effort": 3,
            "risk": 2,
            "category": "engineering",
            "why": "Fast feedback loops reduce regressions in all future cycles.",
        },
        {
            "id": "landing-cta",
            "title": "Optimize landing page CTA and hero message clarity",
            "impact": 5,
            "effort": 2,
            "risk": 2,
            "category": "growth",
            "why": "Clear value proposition and CTA hierarchy improve conversion.",
        },
        {
            "id": "referral-loop",
            "title": "Add referral and sharing mechanics",
            "impact": 4,
            "effort": 4,
            "risk": 3,
            "category": "product",
            "why": "Built-in sharing loop can compound acquisition.",
        },
        {
            "id": "retention-hooks",
            "title": "Add re-engagement and retention hooks",
            "impact": 4,
            "effort": 3,
            "risk": 2,
            "category": "product",
            "why": "Lifecycle nudges improve repeated usage and reduce churn.",
        },
    ]

    if "tauri" in stack:
        tasks.append(
            {
                "id": "desktop-polish",
                "title": "Polish desktop-specific UX flows (window/titlebar/file dialogs)",
                "impact": 4,
                "effort": 3,
                "risk": 2,
                "category": "product",
                "why": "Desktop interaction quality strongly affects perceived reliability.",
            }
        )

    if "node" in stack:
        tasks.append(
            {
                "id": "bundle-perf",
                "title": "Reduce frontend bundle and startup cost",
                "impact": 4,
                "effort": 3,
                "risk": 2,
                "category": "engineering",
                "why": "Faster startup improves first impression and engagement.",
            }
        )

    return tasks


def priority(task: dict) -> int:
    return task["impact"] * 3 - task["effort"] - task["risk"]


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate optimization queue for Ralph Loop skill")
    parser.add_argument("--repo", default=".", help="Repository path")
    parser.add_argument("--out", default="ralph-loop-tasks.json", help="Output json path")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    stack = detect_stack(repo)
    tasks = make_tasks(stack)

    for task in tasks:
        task["priority_score"] = priority(task)

    tasks.sort(key=lambda item: item["priority_score"], reverse=True)

    result = {
        "repo": str(repo),
        "stack": stack,
        "tasks": tasks,
        "next_cycle": [task["id"] for task in tasks[:3]],
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=True, indent=2), encoding="utf-8")
    print(f"Wrote {out_path} with {len(tasks)} tasks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
