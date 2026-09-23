---
name: verify-web
description: Drive and prove the protocol-factory-web landing page (Vite + React static marketing site) in real headless Chromium. Use when verifying any user-facing behavior of the site — hero, feature cards, AI workflow section, theme toggle, install guide — or after changing components under src/.
---

# Verify protocol-factory-web

This skill drives the real landing page the way a user sees it: a local `vite`
dev server plus headless Chromium over CDP. No mocks, no test-only endpoints —
the page is rendered with JavaScript and asserted through DOM state,
accessibility tree, and screenshots.

Facts established from the repo (do not re-derive unless the repo changed):

- **Surface:** single static marketing page (`src/App.tsx` renders `Header`,
  `Hero`, `Features`, `AiWorkflow`, `Screenshot`, `TryCta`, `Install`,
  `Disclaimer`, `Footer`). No backend, no auth, no database, no router.
- **Run:** `bun x vite --host 127.0.0.1 --port <port> --strictPort` from the repo
  root. Ready means HTTP 200 plus `<div id="root">` in the shell.
  Default verify port is `5173` (`VERIFY_PORT` overrides).
- **Drive:** `scripts/drive.mjs` launches headless Chromium (Playwright-cached
  build or system Chrome, resolved automatically) with a disposable profile,
  navigates over CDP, evaluates DOM assertions, and captures evidence.
  Zero npm dependencies — bun built-ins only.
- **Isolate:** stateless static page. Parallel runs isolate by app port
  (`VERIFY_PORT`) and CDP port (`VERIFY_CDP_PORT`, default `19222`).
  Each drive uses a fresh Chromium profile, so `localStorage` never leaks
  between runs. Never drive a URL you did not start (e.g. someone's
  `npm run dev`); refuse and start your own.
- **Shell lifetime:** background processes do not survive across separate tool
  calls in this environment. Prefer the one-shot `verify.mjs` below, which
  owns the server as its own child for the whole run.

## Launch

Recommended one-shot (launch + doctor + drive + cleanup in one command).
Run from the repo root:

```powershell
bun .opencode/skills/verify-web/scripts/verify.mjs --feature <id|all> --port 5173
```

`<id>` is one of `hero`, `features-grid`, `ai-workflow`, `theme-toggle`,
`install-guide` (see `features/`). The run directory is
`.opencode/skills/verify-web/artifacts/<run-id>/` (`VERIFY_RUN_ID` overrides).

Manual launch (only for interactive debugging; must stay in the same shell
session for subsequent steps):

```powershell
$p = Start-Process bun -ArgumentList @('x','vite','--host','127.0.0.1','--port','5173','--strictPort') -PassThru
# ... run doctor/drive against http://127.0.0.1:5173/ ...
Stop-Process -Id $p.Id -Force
```

Ready signal: `Vite ready` in the log AND `doctor.mjs` exit 0.

## Doctor

Read-only check. Run first whenever anything looks off:

```powershell
bun .opencode/skills/verify-web/scripts/doctor.mjs --url http://127.0.0.1:5173/
```

Exit 0 with `{"ok": true, ...}` means worth driving. It asserts HTTP 200,
`<div id="root">`, and a dev (`/src/main.tsx`) or built (`/assets/`) client.
It never starts, stops, or mutates anything.

## Drive

```powershell
bun .opencode/skills/verify-web/scripts/drive.mjs --url http://127.0.0.1:5173/ --feature <id|all> --out <dir>
```

Optional: `--chrome <path>` (or `CHROME_PATH` env) pins the browser binary;
`--cdp-port <n>` (or `VERIFY_CDP_PORT`) isolates parallel runs.

Recipe per run: launch Chromium with a fresh profile → open CDP →
`Page.navigate` → wait for `#root h1` → evaluate the feature's checks from
`features/<id>.md` → `Page.captureScreenshot` → dump `outerHTML` →
`Accessibility.getFullAXTree` → write `result.json` (exit 0 only if every
check passes). The theme-toggle recipe clicks twice so the page is left in
its original theme.

Conventions: prefer the ARIA/semantic handles named in the feature files
(`aria-label`, roles, heading text) over CSS position. Treat every command
as literal.

## Evidence

Per feature, `<out>/<feature>/` (or `<out>/` for a single feature) contains:

- `screenshot.png` — rendered page (1280×900) with app identity visible
- `dom.html` — rendered DOM after React hydration (proves content, not shell)
- `axtree.json` — full accessibility tree (proves ARIA handles)
- `result.json` — each check id, pass/fail, observed value

Proof standards: exercise the real user path (navigate, read, click — never
vitest/jsdom or internal setters); capture the action and the resulting state
(a green check alone is not proof — the screenshot and DOM must show the
state); verify side effects (theme-toggle asserts `documentElement` theme AND
`localStorage`); mocks nowhere — there is no network boundary in this app
other than the two external demo URLs, which are asserted as attributes, not
fetched. Report unreachable paths with the command and unmet precondition;
never report a skipped entry point as verified through another path.

## Cleanup

`verify.mjs` always kills the vite child it started and deletes the Chromium
profile, then confirms the artifacts still exist — a cleanup that eats the
proof fails the run. For manual launches: `Stop-Process` what you started
(PID, never by process name). Cleanup removes instances and scratch state
only; proof artifacts under
`.opencode/skills/verify-web/artifacts/<run-id>/` are retained.

## Helpers

All helpers are dependency-free `bun` scripts; invocations are shown above:

- `scripts/verify.mjs` — full run: spawn server, doctor, drive, teardown.
- `scripts/doctor.mjs` — read-only health check of a running instance.
- `scripts/drive.mjs` — CDP drive + evidence capture for `--feature`.

Feature recipes live in `features/`; read `features/README.md` first, then
the matching feature file, before driving.
