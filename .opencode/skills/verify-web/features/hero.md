# Hero

Hero is the first screen: the `Protocol Factory` headline with `Preview` badge, the Opentrons tagline, `Request access` buttons, and a link down to the installation guide.

## Sub-features

- `hero-headline` shows the product name and status badge.
- `hero-tagline` states the Opentrons simulation value proposition.
- `hero-request-access` offers the access form link in hero, header, and try-CTA band.
- `hero-install-link` jumps to the installation guide.

## How to get to it (user POV)

- Load `/` and look at the top of the page.
- Choose the `Request access` link in the hero copy, the header, or the `Want to try the extension?` band.
- Choose the `Installation guide ↓` link under the tagline.

## Driving it with drive.mjs

Preconditions:

- Doctor reports `"ok": true` at the run URL.
- Fresh page load; no prior interaction.

- **Headline.** Load the page. Run `bun .opencode/skills/verify-web/scripts/drive.mjs --url http://127.0.0.1:5173/ --feature hero --out <dir>`. The `h1` reads `Protocol Factory`.
- **Tagline.** Read the hero paragraph. The same run asserts it contains `Simulate your Opentrons`.
- **Request access.** Count the access links. The run asserts at least 3 links named `Request access` and every one targets `docs.google.com/forms`.
- **Install jump.** Follow `Installation guide ↓`. The run asserts one of the `#install` links (header nav also uses that href) reads `Installation guide`.
- **Proof.** Inspect the artifacts. `<dir>/screenshot.png` shows the headline and CTAs, `<dir>/dom.html` contains the tagline, `<dir>/result.json` records all four checks passing.

## Gotchas

- `Request access` appears 3+ times (header compact, hero, try-CTA). Asserting exactly one will fail; assert at least 3 with identical form hrefs.
- The install link text includes a `↓` arrow. Match by `href="#install"`, not exact text.
- The hero beaker visual is `aria-hidden`. Do not assert on it; it is decorative.
