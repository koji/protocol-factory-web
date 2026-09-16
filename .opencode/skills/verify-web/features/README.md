# protocol-visualizer-web verification map

This directory is the maintained source for verifying the user-facing behavior of the Protocol Visualizer landing page. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Serve the app at `http://127.0.0.1:5173` (or `$VERIFY_PORT`) via `scripts/verify.mjs`, which owns the server for the run.
- Run `scripts/doctor.mjs` against the URL and require `"ok": true` before driving.
- Each drive uses a fresh Chromium profile; `localStorage` starts empty and the color theme starts from the browser default.
- Never drive an instance that was not started by this verification run.

## Driving conventions

- Start every recipe from a fresh page load unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or DOM position.
- Treat every command as literal. Keep quoted names, URLs, and flags unchanged.
- Run browser actions through `scripts/drive.mjs --feature <id>`.
- The theme-toggle recipe restores the original theme. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes the rendered DOM, the accessibility tree, and a screenshot with the app identity visible.
- State-change proof (theme toggle) includes the before/after values plus the persisted value (`localStorage`).
- Mutation proof restores the prior state in-page (theme is clicked back).
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with drive.mjs` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Hero](./hero.md) covers headline, tagline, request-access CTAs, and the install-guide link.
- [Features grid](./features-grid.md) covers the six feature cards under "Everything you need to see your protocol run".
- [AI workflow](./ai-workflow.md) covers the protocol-fix-loop video, skill command, and repo links.
- [Theme toggle](./theme-toggle.md) covers dark/light switching and persistence.
- [Install guide](./install-guide.md) covers prerequisites, install methods, and header anchor navigation.
