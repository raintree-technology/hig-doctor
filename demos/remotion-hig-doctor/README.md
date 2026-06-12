# Remotion hig-doctor Showcase

A [Remotion](https://www.remotion.dev/) video that visualizes `hig-doctor audit` results — 348 pattern rules across 12 frameworks, animated category charts, detection breakdowns, and a framework coverage grid.

## Setup

Requires [Bun](https://bun.sh) (for the audit CLI) and Node.js.

```bash
bun install --frozen-lockfile
```

## Commands

```bash
# Generate fresh data by running the audit on this repo
bun run --cwd demos/remotion-hig-doctor generate-data

# Preview in Remotion Studio (opens browser)
bun run --cwd demos/remotion-hig-doctor preview

# Render to MP4
bun run --cwd demos/remotion-hig-doctor render
```

## Output

- Video: `out/hig-doctor-showcase.mp4`
- Resolution: 1920x1080 @ 30fps
- Duration: ~21 seconds (630 frames)

## Scenes

1. **Intro** — Audit overview with score badge, detection count, framework detection, and simulated terminal output showing the CLI in action
2. **Categories** — Animated bar chart of HIG category detections (Foundations, Layout, Controls, etc.), donut chart breaking down positives vs patterns vs concerns, score comparison timeline
3. **Frameworks** — Grid of all 12 supported frameworks with rule counts, plus a "What it checks" panel covering accessibility, color systems, typography, layout, motion, i18n, and forms
4. **Outro** — Final score, total rules, positives count, and framework count with a `bun run audit ./my-app` CTA

## Data Pipeline

`scripts/generate-data.mjs` runs the HIG audit CLI (`bun packages/hig-doctor/src-termcast/src/cli.ts <dir> --json`) on the repository root and outputs `src/data/report-data.json`.

The data includes:
- Project score, frameworks, file counts, and detection totals
- Per-category breakdown (name, detections, positives, concerns, patterns)
- Framework rule count table (12 frameworks)
- Score timeline for visual comparison

## Assets

Place these in `public/`:
- `orchard.png` — Background image
- `raintree-icon.png` — Brand icon for footer
