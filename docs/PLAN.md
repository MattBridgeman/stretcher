# Stretcher — Project Plan

A Web Audio emulation of the Akai S950 sampler's cyclic time-stretch algorithm, inspired by the [Akaizer](https://the-akaizer-project.blogspot.com/) VST plugin.

---

## Goals

- Authentic recreation of the S950 time-stretch sound in the browser
- Authentic S950 parameter names and ranges (see [ALGORITHM.md](./ALGORITHM.md))
- Installable PWA — works offline after first load
- No runtime dependencies — vanilla TypeScript + Web Audio API only
- Deployed automatically to GitHub Pages via GitHub Actions

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety, zero runtime cost |
| Build | Vite | Single dev-dep, outputs plain HTML/JS/CSS |
| DSP | Web Audio API (`OfflineAudioContext` + `AudioBuffer`) | Native browser, no libs needed |
| UI | Vanilla HTML/CSS + Canvas 2D | Zero framework overhead |
| PWA | `manifest.json` + `sw.js` | Native browser support |
| Deploy | GitHub Actions → `gh-pages` branch | Free, HTTPS automatic |

**Runtime npm packages: zero.**  
Dev dependencies only: `vite`, `typescript`.

---

## File Structure

```
stretcher/
├── index.html
├── public/                        # Copied verbatim by Vite (unhashed)
│   ├── manifest.json
│   ├── sw.js                      # Service worker (cache-first)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.ts                    # Bootstrap, SW registration
│   ├── algorithm/
│   │   └── s950.ts                # Core time-stretch algorithm
│   ├── audio/
│   │   ├── loader.ts              # File → AudioBuffer decoding
│   │   └── exporter.ts            # AudioBuffer → WAV download
│   └── ui/
│       ├── dropzone.ts            # Drag-and-drop / file picker
│       ├── waveform.ts            # Canvas waveform renderer
│       └── controls.ts            # Control bindings
├── docs/
│   ├── PLAN.md                    # This file
│   └── ALGORITHM.md               # S950 algorithm detail
├── vite.config.ts
├── tsconfig.json
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  STRETCHER                [Install ⬇]   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │   Drop audio here or click      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Input  ████████████████████████████   │
│  Output ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                         │
│  STRETCH %  [  200  ──●──────────── ]  │
│  D-TIME     [ 1000  ──●──────────── ]  │
│  TRANSPOSE  [   0   ──────●───────  ]  │
│                                         │
│  MODE  [ MONO ]  [ POLY ]              │
│  AUTO-D  [ ON ]  [ OFF ]               │
│                                         │
│      [▶ Preview]    [⬇ Export WAV]     │
└─────────────────────────────────────────┘
```

---

## PWA

- `manifest.json`: `display: standalone`, themed icons, `start_url`
- `sw.js`: cache-first strategy for all app shell assets — works fully offline
- GitHub Pages provides HTTPS (required for service worker + PWA install)

---

## GitHub Actions (`deploy.yml`)

```
Trigger: push to main
Steps:
  1. actions/checkout@v4
  2. actions/setup-node@v4  (Node 20)
  3. npm ci
  4. npm run build          → /dist
  5. actions/deploy-pages   → gh-pages branch
```

---

## Build Order

1. **Scaffold** — `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json`
2. **Algorithm** — `s950.ts` (pure function, no side effects)
3. **Audio layer** — `loader.ts` + `exporter.ts`
4. **UI** — dropzone → waveform → controls → wire in `main.ts`
5. **PWA** — `manifest.json`, `sw.js`, install prompt
6. **CI/CD** — `deploy.yml` + GitHub Pages settings
