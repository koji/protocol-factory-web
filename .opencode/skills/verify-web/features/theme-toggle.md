# Theme toggle

Theme toggle flips the site between dark and light themes from the header button and persists the choice in `localStorage`, so a reload keeps the selected theme.

## Sub-features

- `toggle-present` exposes a header button named `Switch to light theme` or `Switch to dark theme`.
- `toggle-flips-theme` changes `documentElement` theme and persists it.
- `toggle-restores` flips back, leaving the page as found.

## How to get to it (user POV)

- Choose the sun/moon button in the header (right side, next to `Request access`).

## Driving it with drive.mjs

Preconditions:

- Doctor reports `"ok": true` at the run URL.
- Fresh Chromium profile, so `localStorage` starts empty.

- **Presence.** Find the button. Run `bun .opencode/skills/verify-web/scripts/drive.mjs --url http://127.0.0.1:5173/ --feature theme-toggle --out <dir>`. A `button` whose accessible name starts with `Switch to` exists.
- **Flip.** Choose the toggle. The run clicks once, waits for React to flush the state update, and asserts `documentElement.dataset.theme` changed, is `dark` or `light`, and `localStorage.theme` equals the new value.
- **Restore.** Choose the toggle again. The run clicks a second time, waits, and asserts the theme flipped back (differs from the post-flip value), the persisted value matches, and the button label names the opposite theme — leaving the page as found.
- **Proof.** Inspect the artifacts. `<dir>/result.json` records the before/after/stored triple for the flip, `<dir>/screenshot.png` shows the restored page.

## Gotchas

- The toggle goes through React state, so the theme attribute updates asynchronously after the click. The drive waits ~400ms before reading; a synchronous read sees the stale theme and fails.
- The initial theme follows `prefers-color-scheme` (headless Chromium default), so never assert a specific starting theme — assert the flip and persistence instead.
- The button icon swaps (sun in dark mode, moon in light mode) but both are `aria-hidden` SVGs. Assert the button's accessible name, not the icon.
- `localStorage` persists per Chromium profile. Drives always use a fresh profile, so a stored value in `result.json` came from the clicks in that run.
