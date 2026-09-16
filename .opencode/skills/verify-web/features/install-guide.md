# Install guide

Install guide documents prerequisites (Python, `opentrons` package, OT-2 pin, interpreter selection) and the two extension install methods (Command Palette, `code --install-extension`). The header section navigation jumps to it and to the features grid.

## Sub-features

- `install-prereqs` lists the Python/opentrons prerequisites.
- `install-cli-method` shows the `code --install-extension` command.
- `header-nav` links `Features` and `Install` to their anchors.
- `anchor-navigation` scrolls to the install section on nav click.

## How to get to it (user POV)

- Scroll to `Installation` on `/`.
- Choose `Install` in the header section navigation (jumps to `#install`).
- Choose `Installation guide ↓` in the hero or `Installation guide` in the AI workflow steps.

## Driving it with drive.mjs

Preconditions:

- Doctor reports `"ok": true` at the run URL.
- Fresh page load; no prior interaction.

- **Region.** Find the section. Run `bun .opencode/skills/verify-web/scripts/drive.mjs --url http://127.0.0.1:5173/ --feature install-guide --out <dir>`. A `section#install` with accessible name `Installation guide` exists.
- **Prerequisites.** Read the block. The run asserts the text contains `Python 3.8 or later`, `pip install opentrons`, and `Python: Select Interpreter`.
- **CLI method.** Read the second method. The run asserts the text contains `code --install-extension protocol-visualizer.vsix`.
- **Nav links.** Inspect the header. The run asserts `Section navigation` contains `Features` → `#features` and `Install` → `#install`.
- **Anchor jump.** Choose `Install` in the header nav. The run clicks it and asserts `location.hash` becomes `#install` with the install section inside the viewport.
- **Proof.** Inspect the artifacts. `<dir>/screenshot.png` shows the page after the anchor jump, `<dir>/dom.html` contains the prerequisite texts, `<dir>/result.json` records all five checks passing.

## Gotchas

- Anchor navigation is the only in-page routing; there is no router and no other URL. Do not expect `/install` to exist.
- The OT-2 note pins `opentrons==9.0.0`. Asserting bare `pip install opentrons` as an exact string fails — the recipe asserts containment, not equality.
- The anchor click changes `location.hash` in the driven page only. Later recipes start from a fresh load, so no cleanup is needed.
