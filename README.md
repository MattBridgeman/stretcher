# Stretcher

A Web Audio emulation of the Akai S950 sampler's cyclic time-stretch algorithm, inspired by the [Akaizer](https://the-akaizer-project.blogspot.com/) VST plugin.

**Live app: [mattbridgeman.github.io/stretcher](https://mattbridgeman.github.io/stretcher/)**

Drop in an audio file, dial in `STRETCH %`, `D-TIME`, `MODE`, and `TRANSPOSE` using the same parameter names and ranges as the original S950 hardware, then preview or export the result as a WAV file. Installable as a PWA — works offline after the first load.

---

## Tech stack

- TypeScript + Vite, no runtime dependencies — pure Web Audio API for the DSP
- Vanilla HTML/CSS + Canvas 2D for the UI and waveform rendering
- Service worker + manifest for offline/installable PWA support
- Deployed to GitHub Pages via GitHub Actions on every push to `main`

See [docs/PLAN.md](docs/PLAN.md) for the project plan and [docs/ALGORITHM.md](docs/ALGORITHM.md) for the time-stretch algorithm reference.

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
```

Requires Node 24+.

## Project structure

```
stretcher/
├── index.html
├── public/                  # Copied verbatim by Vite (manifest, service worker, icons)
├── src/
│   ├── main.ts               # Bootstrap, SW registration, install prompt
│   ├── algorithm/s950.ts      # Core time-stretch algorithm
│   ├── audio/                 # File → AudioBuffer decoding, WAV export
│   └── ui/                    # Dropzone, waveform renderer, control bindings
└── .github/workflows/deploy.yml
```
