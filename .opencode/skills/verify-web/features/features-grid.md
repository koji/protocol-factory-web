# Features grid

Features grid lists the seven capability cards under the heading `Everything you need to see your protocol run`, each with a title and a one-paragraph description.

## Sub-features

- `features-heading` names the section's promise.
- `features-cards` renders all seven cards with titles and descriptions.

## How to get to it (user POV)

- Scroll to `Everything you need to see your protocol run` on `/`.
- Choose `Features` in the header section navigation (jumps to `#features`).

## Driving it with drive.mjs

Preconditions:

- Doctor reports `"ok": true` at the run URL.
- Fresh page load; no prior interaction.

- **Region.** Find the section. Run `bun .opencode/skills/verify-web/scripts/drive.mjs --url http://127.0.0.1:5173/ --feature features-grid --out <dir>`. A `section#features` with accessible name `Features` exists.
- **Heading.** Read the section heading. The run asserts it equals `Everything you need to see your protocol run`.
- **Cards.** Count and name the cards. The run asserts exactly 7 `article` elements whose `h3` titles are `Real-time Deck Visualization`, `Auto-analysis on Save`, `Runtime Parameters UI`, `Custom Labware Support`, `Pop-out / Aux Window`, `Step Jumper + Search`, and `Multi-file Bundler`.
- **Proof.** Inspect the artifacts. `<dir>/screenshot.png` shows the grid, `<dir>/axtree.json` exposes the seven headings, `<dir>/result.json` records all three checks passing.

## Gotchas

- The grid collapses to 2 columns under 1024px and 1 column under 768px. Card count stays 7; assert count, not layout.
- Card hover lifts the card (`translateY`). Screenshots may differ on hover; capture without hovering.
- Titles are exact strings. `Runtime Parameters UI` and `Step Jumper + Search` are easy to mistype — copy them verbatim.
