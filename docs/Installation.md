# Setup Protocol Factory

## 1. Prerequisites

The following are required to use the extension:

- **Python 3.8 or later** must be installed, and the `python3` command must be available in PATH
- The **`opentrons`** Python package must be installed

```bash
pip install opentrons
```

**Note:**
If you need to use Protocol Factory with an OT-2, you will need to use opentrons==9.0.0 package since opentrons 9.1.0+ is not compatible with OT-2.

```bash
pip install opentrons==9.0.0
```

## 2. Installation (from `.vsix`)

Download `protocol-factory-0.2.9-alpha.vsix` from GitHub Releases or another source, then install it in VSCode using one of the following methods.

**Method A: From the Command Palette**

1. Open VSCode and launch the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Select `Extensions: Install from VSIX...`.
3. Select the downloaded `.vsix` file.

**Method B: From the CLI**

```bash
code --install-extension protocol-factory-0.2.9-alpha.vsix
```
