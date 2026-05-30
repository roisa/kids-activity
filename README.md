# Kids Activity Generator

> **📦 This project has moved to Baby Mo.**
> The generator now lives natively at
> **<https://babymo.id/id/apps/kids-activity/>** (no more iframe).
> GitHub Pages here publishes a static redirect to that URL so there is one
> canonical copy and SEO isn't split across two sites. The app source below is
> kept for archival/history. To restore the standalone deploy, revert
> `.github/workflows/deploy.yml` to build and publish `dist`.

Generate printable educational worksheets for kids — mazes, tracing pages,
coloring prompts, matching activities, and simple cut-and-paste puzzles —
right in the browser. No backend, no sign-up, no telemetry.

Themes: Dinosaurs · Space · Animals · Princess · Vehicles · Alphabet ·
Ramadan · Ocean. Age ranges: 3–4, 5–6, 7–8.

## Tech stack

- [Vite](https://vitejs.dev/) + Vanilla JavaScript (ES modules)
- HTML / CSS (custom design tokens, no framework)
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF export
- GitHub Pages compatible

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (defaults to `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview   # serve the built bundle locally
```

## Deploy to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and publishes to Pages on
every push to `main`. The workflow sets `VITE_BASE` to `/<repo-name>/` so
the app works at `https://<user>.github.io/<repo-name>/`.

**One-time setup:** in the repo settings, set **Pages → Source** to
"GitHub Actions".

To build for a different base path manually:

```bash
VITE_BASE=/my-repo/ npm run build
```

## File structure

```
src/
  main.js                # Entry point, app state + wiring
  styles/global.css      # Design system + layout
  components/            # InputPanel, PreviewArea, WorksheetCard, Header, Toast
  generators/            # maze, tracing, coloring, matching, puzzle, + dispatcher
  templates/worksheet.js # Shared printable A4 SVG frame
  data/                  # themes, ageRanges, activityTypes catalogs
  export/pdf.js          # SVG → PDF (rasterized) + SVG download
  utils/random.js        # Seeded PRNG for reproducible worksheets
```

## Adding a new theme

Append an entry to `src/data/themes.js`. Provide `words`, `items`
(`{ name, emoji }`), `coloringPrompts`, and a 4-color `palette`. The new theme
automatically appears across all activity types.

## Adding a new activity type

1. Create `src/generators/myActivity.js` exporting `generate({ theme, age, seed })`
   that returns `{ title, instructions, body, accent }` where `body` is raw SVG
   markup positioned inside the rect from `getActivityRect()`.
2. Register it in `src/generators/index.js` and `src/data/activityTypes.js`.
