# Protocol Visualizer Website — Design Document

Date: 2026-08-25
Status: Approved

## Overview

A single-page product landing website introducing the **Protocol Visualizer** VSCode extension — a prototype extension that simulates Opentrons Python protocols in VSCode and visualizes deck state and liquid volume changes in real time via a Webview panel.

The primary goal is to convince Opentrons protocol authors to install the extension by downloading the `.vsix` directly from this site.

## Decisions

| Topic            | Decision                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Purpose          | Product landing page (single page, no router)                                                            |
| Audience         | Opentrons protocol authors (lab researchers using Python + VSCode)                                       |
| Language         | English only                                                                                             |
| Tech stack       | TypeScript, React 19, Vite, CSS Modules                                                                  |
| Theme            | Dark & light with toggle; initial = OS `prefers-color-scheme`, manual choice persisted in `localStorage` |
| Accent color     | Cyan / teal family (dark: ~`#22d3ee`, light: ~`#0e7490`), AA contrast on both themes                     |
| Download CTA     | Direct download of `.vsix` hosted on this site (`public/downloads/protocol-visualizer.vsix`)             |
| Until VSIX ready | Button disabled with "Coming soon" label, driven by a single config flag                                 |
| VSIX naming      | Fixed filename, overwritten each release; no site edits needed per release                               |
| Deployment       | Undecided → build with `base: './'` so output works anywhere                                             |
| Product name     | "Protocol Visualizer"                                                                                    |
| GitHub links     | Repository will be public in the future; link config hides empty URLs                                    |
| Logo / favicon   | Original simple beaker SVG using `currentColor`; doubles as favicon                                      |
| Animation        | Subtle CSS transitions only (hover, hero fade); no animation libraries                                   |
| Testing          | Light: Vitest + React Testing Library smoke tests + theme/CTA logic tests                                |

Erratum (2026-08-25): light accent adjusted from #0891b2 to #0e7490 — original pair measured 3.68:1/3.51:1, below WCAG AA; spec's AA requirement is binding over example hexes.

## Hard Rules

1. No component over 300 lines; split by responsibility before that.
2. Component return type is `ReactNode` unless there is a specific reason otherwise.
3. React v19.

## Page Structure (top to bottom)

1. **Header** (sticky) — beaker SVG logo + `Features` / `Install` anchor links + Download button + theme toggle. Anchors hidden on mobile.
2. **Hero** — headline "Protocol Visualizer", tagline, primary CTA (`Download .vsix` / disabled: `Coming soon`), secondary anchor link to Installation guide, beaker SVG graphic.
3. **Features** — 6 cards:
   - Real-time Deck Visualization
   - Auto-analysis on Save
   - Runtime Parameters UI
   - Custom Labware Support
   - Pop-out Window (VSCode Auxiliary Window)
   - Step Jumper
4. **Screenshot** — placeholder region for extension UI capture (16:9), structured for easy replacement.
5. **Install** — prerequisites (Python 3.8+, `pip install opentrons`, note `opentrons==9.0.0` for OT-2), two install methods (Command Palette `Extensions: Install from VSIX...` / CLI `code --install-extension protocol-visualizer.vsix`), repeated download button.
6. **Footer** — `MIT License © 2026 Koji Kanao` + config-driven links (hidden while URL empty).

## Copy

- `<title>`: `Protocol Visualizer — Simulate Opentrons protocols in VSCode`
- meta description: `A VSCode extension that simulates Opentrons Python protocols and visualizes deck state and liquid volumes in real time.`
- Hero tagline: `Simulate your Opentrons Python protocols and inspect deck layout and liquid volumes in real time — without leaving VSCode.`
- Feature card copy (title + description):
  1. **Real-time Deck Visualization** — Watch pipette moves, labware states, and liquid volume changes render as your protocol runs.
  2. **Auto-analysis on Save** — Analysis reruns automatically every time you save your protocol file.
  3. **Runtime Parameters UI** — Input fields are generated for runtime parameters; hit Analyze to apply them.
  4. **Custom Labware Support** — Place custom labware JSON definitions next to your protocol file and they just work.
  5. **Pop-out Window** — Detach the visualizer to a separate window via VSCode's Auxiliary Window support.
  6. **Step Jumper** — Jump straight to any protocol step by number from the Protocol Steps panel.
- Install copy follows `docs/Instllation.md` content adapted for web.

## Architecture

```
protocol-visualizer-website/
├── index.html              # meta tags (OG included), favicon, pre-React theme script
├── vite.config.ts          # base: './'
├── public/
│   └── downloads/
│       └── protocol-visualizer.vsix   # fixed name; not present until ready
└── src/
    ├── main.tsx            # entry
    ├── App.tsx             # stacks sections + theme state
    ├── config/
    │   ├── site.ts         # downloadAvailable flag, product strings
    │   └── links.ts        # GitHub etc.; empty URL = link hidden
    ├── hooks/useTheme.ts   # localStorage -> prefers-color-scheme -> toggle persists
    ├── styles/tokens.css   # CSS custom properties for both themes (+ minimal reset)
    └── components/         # one folder per section: Header, Hero, Features,
                            # Screenshot, Install, Footer (each .tsx + .module.css)
```

- No router, no state management library. Only theme state.
- Tooling: TypeScript strict, ESLint (typescript-eslint + react-hooks), Prettier, Vitest + RTL + jsdom. Node v24.17.0, npm 11.13.0.
- Build output is fully static (`dist/`).

## Theme System

- `<html data-theme="dark|light">`; all colors are CSS variables in `src/styles/tokens.css`.
- `useTheme`: initial value = stored `localStorage` entry → fallback `prefers-color-scheme`; toggle updates the DOM attribute and persists. Access guarded with try/catch (private mode).
- FOUC prevention: tiny inline script in `index.html` sets `data-theme` before React boots.
- Fonts: system font stack, no web fonts.
- Layout tokens: container max-width 1120px, shared section spacing tokens.
- Responsive mobile-first; breakpoints 768px / 1024px (Features: 3 → 2 → 1 columns).

## Testing & Verification

- Rendering smoke tests per section component (headings, CTA presence).
- `useTheme`: storage priority, OS fallback, toggle persistence.
- CTA state: `downloadAvailable: false` renders disabled button with "Coming soon".
- Definition of done: `npm run lint`, `npm run test`, `npm run build` all pass.

## Error Handling

- Static site; runtime error handling limited to guarded `localStorage`.
- Disabled CTA eliminates 404 risk while the `.vsix` is absent. Enabling the download requires placing the file at `public/downloads/protocol-visualizer.vsix` and flipping the flag (release checklist).

## Out of Scope

- Routing / multi-page docs, i18n, analytics, animation libraries, E2E tests, deployment CI (until target decided), Marketplace listing assets.
