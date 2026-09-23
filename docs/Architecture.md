# Overall Architecture and Data Flow

This extension is designed to operate through the collaboration of three components: the **VSCode Extension Host (backend)**, **React Webview (frontend)**, and **Python Subprocess (simulation environment)**.

```
[ VSCode Editor ] ➔ (Click the "Reanalyze" button)
       │
       ▼
[ Extension Host (TypeScript) ]
       │ 1. Launch Python subprocess (spawn)
       ▼
[ Python Subprocess ] ──(stdout: JSON format)──┐
       │                                       │
       ▼                                       ▼
[ Extension Host ]                             │
       │ 2. Register analysis errors in        │
       │    the Problems panel                 │
       │ 3. Send analysis results to Webview   │
       ▼          (postMessage)                │
[ Webview Panel (React) ] <────────────────────┘
       │ 4. Render deck state and commands
       │    using the ProtocolVisualization
       │    component
       ▼
[ DeckView (UI) ] ➔ Display deck state and well liquid volumes
```

## Directory Structure and File Roles

```text
protocol-factory/
├── .vscode/                 # Configuration for launching and debugging VSCode
├── src/                     # Extension backend (TypeScript)
│   ├── extension.ts         # Extension entry point (command registration)
│   ├── panel.ts             # Webview panel management, Python invocation, and IPC communication
│   └── diagnostics.ts       # Management of displaying analysis errors in VSCode's Problems panel
├── webview/                 # Webview frontend (React + Vite)
│   ├── dist/                # Build output directory (a single HTML file is generated)
│   ├── index.html           # Webview HTML template
│   ├── vite.config.ts       # Vite build configuration (using vite-plugin-singlefile)
│   └── src/
│       ├── main.tsx         # React entry point (i18n initialization)
│       └── App.tsx          # Main UI component (message handling and state management)
├── python/                  # Python-side simulation support tools (for development)
│   ├── ast_injector.py      # Tool that analyzes Python code and dynamically injects line-number output processing
│   └── dummy_simulator.py   # Dummy simulator for verifying IPC connections
├── LICENSE                  # MIT License
├── package.json             # Configuration for the extension and its dependencies
└── tsconfig.json            # TypeScript compilation configuration
```
