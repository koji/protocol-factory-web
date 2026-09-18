# Protocol Visualizer VSCode Extension

A VSCode extension (prototype) for simulating Opentrons Python protocols directly in VSCode and visualizing and inspecting the state of the Deck (work surface) and liquid volume changes in real time through a Webview panel.

---

## 1. Prerequisites

The following are required to use the extension:

- **Python 3.8 or later** must be installed, and the `python3` command must be available in PATH
- The **`opentrons`** Python package must be installed

```bash
pip install opentrons
```

If you need to use this extension with an OT-2, you will need to install opentrons v9.0.0 or previous versions since v9.1.0+ does not support OT-2.

```bash
pip install opentrons==9.0.0
```

If you want to use this extension with Flex and OT-2, you will need to create a virtual environment and install opentrons packages separately. Then switch an environment on VSCode's Python Interpreter via `Command Palette`.

### Create a Virtual Environments

The following uses `python3` to create virtual environments because it does not require to install any packages or software. You can use any virtual environment manager you prefer such as `conda` or `uv`.

```bash
python3 -m venv .Flex
source .Flex/bin/activate
pip install opentrons
```

```bash
python3 -m venv .OT2
source .OT2/bin/activate
pip install opentrons
```

---

## 2. Usage

1. Open an Opentrons protocol `.py` file in VSCode.
2. Start Protocol Visualizer. Currently, there are 3 ways to start it:
3. From the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`), run **`Opentrons: Open Protocol Visualizer`**.
4. Click the **beaker** icon in the status bar.
5. Set a new shortcut via Command Pallets `Open Keyboard Shortcuts` and start it with your custom shortcut.
6. When the Visualizer panel opens on the right side of the screen, and `If your protocol uses Runtime parameters`, Protocol Visualizer will generate UI inputs for these parameters.

`Once the analysis is complete, you are ready to edit your protocol.`

### 2-1 Custom labware

This extension supports custom labware definitions. You need to place your custom labware definition files in the same directory as your protocol file.

### 2-2 Auto-analysis

Protocol Visualizer starts analysis automatically when you save changes to your protocol file.

### 2-3 Pop out button

This extension is using VSCode's Auxiliary Window, so you can pop out the Visualizer panel to a separate window. Also you can do the same thing with dragging the Protocol Visualizer tab to somewhere of your screen.

### 2-4 Runtime parameters

For Runtime parameters, you will need to click `Analyze` button to apply your changes to your protocol. `If you change a Runtime parameter, Protocol Visualizer will not change your protocol.`
Runtime parameters function creates a temporary protocol file that applyes your changes as a default parameter value for the analysis and it will be removed whne the visualization is done.

### 2-5 Step Jumper

The step jumper that is located under `Protocol Steps` allows you to jump to a specific step in your protocol. Input the step number and hit `Enter` to jump to that step.

---

## 3. Errors and bugs

If you encounter any errors or bugs, please report them to the #visualization-extension channel or Koji Kanao via DM/email.

---

## 4. License

MIT License © 2026 Koji Kanao


---

## 5. Contributing

This section is for contributing to this website. The [Prerequisites](#1-prerequisites) above are for using the extension and are not needed for website development.

### Propose a change

1. Check existing [issues](https://github.com/koji/protocol-visualizer-web/issues) and [pull requests](https://github.com/koji/protocol-visualizer-web/pulls) to see whether the change is already being discussed.
2. Open an issue describing the problem and the change you intend to make. For substantial changes, please discuss the approach in the issue before implementing it.

### Set up the project

The website is built with [Vite](https://vite.dev) and React. You need Node.js LTS and pnpm 10:

```bash
# from the repository root
pnpm install --frozen-lockfile
pnpm run dev
```

`pnpm run dev` starts a local dev server, by default at http://localhost:5173.

### Verify your change

Run these from the repository root before opening a pull request:

```bash
pnpm run lint
pnpm run format:check
pnpm run test
pnpm run build
```

`pnpm run build` also runs the TypeScript compiler. The same checks run in CI.

### Open a pull request

1. Create a focused branch, commit your change, and push the branch to your fork.
2. Open a pull request against the default branch, linking the issue that describes the change.
3. Include a short summary of the change and the verification results. For visual changes, include before/after screenshots.
4. A maintainer will review your pull request, so please respond to review feedback.

---
