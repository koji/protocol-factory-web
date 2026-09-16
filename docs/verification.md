# Verification

This repo ships a scripted way to drive the real landing page and prove its behavior: the `verify-web` skill in `.opencode/skills/verify-web/`. It serves the site with `vite`, opens it in real headless Chromium over CDP, asserts DOM/accessibility state, and captures screenshots. No mocks, no test-only endpoints, no npm dependencies (bun built-ins only).

## Prerequisites

- `bun` on PATH.
- A Chromium/Chrome binary. Auto-detected in this order: `CHROME_PATH` env, Playwright-cached `chromium-1208`, system Chrome, Edge. Override with `CHROME_PATH` or `--chrome`.
- Ports free: app port (default `5173`) and CDP port (default `19222`).

## Quick start

Run from the repo root:

```powershell
bun .opencode/skills/verify-web/scripts/verify.mjs --feature all
```

This spawns its own `vite` server, runs the doctor check, drives every mapped feature, tears the server down, and leaves proof under `.opencode/skills/verify-web/artifacts/<run-id>/`. Exit 0 only if every check passes.

Verify a single feature:

```powershell
bun .opencode/skills/verify-web/scripts/verify.mjs --feature ai-workflow --port 5173
```

Feature IDs: `hero`, `features-grid`, `ai-workflow`, `theme-toggle`, `install-guide`. Recipes live in `.opencode/skills/verify-web/features/`.

## Individual steps

Health-check a running instance (read-only, never starts or stops anything):

```powershell
bun .opencode/skills/verify-web/scripts/doctor.mjs --url http://127.0.0.1:5173/
```

Drive an already-running instance and write evidence to `<dir>`:

```powershell
bun .opencode/skills/verify-web/scripts/drive.mjs --url http://127.0.0.1:5173/ --feature <id|all> --out <dir>
```

Manual server launch (only for interactive debugging — background processes do not survive across separate shell sessions, so prefer `verify.mjs`):

```powershell
$p = Start-Process bun -ArgumentList @('x','vite','--host','127.0.0.1','--port','5173','--strictPort') -PassThru
bun .opencode/skills/verify-web/scripts/doctor.mjs --url http://127.0.0.1:5173/
Stop-Process -Id $p.Id -Force
```

## Environment variables

| Variable          | Default     | Purpose                                                                   |
| ----------------- | ----------- | ------------------------------------------------------------------------- |
| `VERIFY_PORT`     | `5173`      | App server port (also `--port`)                                           |
| `VERIFY_CDP_PORT` | `19222`     | Chrome remote-debugging port (also `--cdp-port`); change per parallel run |
| `VERIFY_RUN_ID`   | timestamp   | Artifact directory name (also `--run-id`)                                 |
| `CHROME_PATH`     | auto-detect | Browser binary (also `--chrome` for `drive.mjs`)                          |

## Evidence

Per feature, `<artifacts>/<run-id>/<feature>/` contains `screenshot.png` (rendered page showing the feature), `dom.html` (post-hydration DOM), `axtree.json` (full accessibility tree), and `result.json` (per-check pass/fail with observed values). Plus `vite-server.log` at the run root. Cleanup never deletes evidence.

## Gotchas

- Never drive a URL you did not start. If the port is taken, pick another `--port` instead of reusing someone's dev server.
- Each drive uses a fresh Chromium profile, so `localStorage` starts empty and the theme starts from the browser default. Never assert a specific starting theme — assert the flip and persistence.
- The demo video is asserted by `src` attribute and `controls`, not by playing the remote stream.
- The hero fades in over 0.6s; the drive waits for the steady state before capturing.
- `result.json` with a failing check names the check id and the observed value — start there when a run goes red.

## Maintenance

The `features/` map is the maintained verification source. When the page changes, update the matching feature file first, then the checks in `scripts/drive.mjs`. See `/maintain-verification-skill` for the periodic audit loop.
