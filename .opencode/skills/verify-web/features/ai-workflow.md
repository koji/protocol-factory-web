# AI workflow

AI workflow shows how `protocol-fix-loop` connects Protocol Factory to an LLM: an intro paragraph naming GitHub Copilot and Cursor, a demo video, and a four-step `How to use` list with the skill install command and the `/protocol-fix-loop` chat command.

## Sub-features

- `ai-intro` links `protocol-fix-loop` to the skill repo and names Copilot/Cursor.
- `ai-video` embeds the demo video with controls.
- `ai-howto` lists install-editor, install-skill, install-extension, run-command steps.
- `ai-links` cross-links the skill repo and the page's installation guide.

## How to get to it (user POV)

- Scroll to `Generate protocols with AI, verify with Protocol Factory` on `/` (between the features grid and the screenshot).
- Choose the `protocol-fix-loop` link to open `https://github.com/koji/protocol-fix-loop` in a new tab.
- Choose the `Installation guide` link in step 3 to jump to `#install`.

## Driving it with drive.mjs

Preconditions:

- Doctor reports `"ok": true` at the run URL.
- Fresh page load; no prior interaction.

- **Region.** Find the section. Run `bun .opencode/skills/verify-web/scripts/drive.mjs --url http://127.0.0.1:5173/ --feature ai-workflow --out <dir>`. A `section#ai-workflow` with accessible name `Generate protocols with AI` exists.
- **Heading.** Read the section heading. The run asserts it contains `Generate protocols with AI`.
- **Video.** Inspect the player. The run asserts a `video` whose `src` is exactly `https://github.com/user-attachments/assets/812fbcdf-a84a-49fd-b631-ae925b64dddf` with `controls`.
- **Commands.** Read the steps. The run asserts the text contains `npx skills add koji/protocol-fix-loop` and `/protocol-fix-loop`.
- **Links.** Follow the references. The run asserts at least one link to `https://github.com/koji/protocol-fix-loop` and one link to `#install`.
- **Proof.** Inspect the artifacts. `<dir>/screenshot.png` shows the video and steps, `<dir>/dom.html` contains both commands, `<dir>/result.json` records all seven checks passing.

## Gotchas

- The video is remote media; the file asserts the `src` attribute and `controls`, it does not play the stream. A missing network still passes as long as the markup is correct.
- `/protocol-fix-loop` is a substring of the install command context too. The steps list must contain both the `npx skills add ...` line and the standalone chat command.
- External repo links open in a new tab (`target="_blank"`). The drive does not follow them; it asserts `href` values only.
