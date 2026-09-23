# Protocol Visualizer Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page product landing site for the Protocol Visualizer VSCode extension with direct `.vsix` download.

**Architecture:** Static single-page React app, no router, no state library (theme state only). Sections are stacked components; theming uses CSS custom properties driven by `data-theme` on `<html>`.

**Tech Stack:** TypeScript (strict), React 19, Vite, CSS Modules, Vitest + React Testing Library + jsdom, ESLint 9 flat config, Prettier, npm on Node v24.17.0.

**Spec:** `docs/superpowers/specs/2026-08-25-protocol-visualizer-website-design.md`

## Global Constraints

- Components must stay under 300 lines; split by responsibility before that.
- Component return type is `ReactNode` unless there is a specific reason otherwise.
- React v19.
- Site copy is English only; use the exact approved copy in this plan.
- No router, no state management libraries, no web fonts, no animation libraries.
- Vite `base: './'`.
- Accent cyan/teal: dark `--color-accent: #22d3ee`, light `--color-accent: #0891b2`; text on accent keeps AA contrast.
- Container max-width 1120px; breakpoints 768px and 1024px; mobile-first CSS.
- VSIX lives at fixed path `public/downloads/protocol-visualizer.vsix` (overwritten per release, never renamed).
- CTA disabled + "Coming soon" until `site.download.available` flips to `true`.
- All color/spacing values come from CSS variables defined in `src/styles/tokens.css`.
- Every command below runs from the repo root `protocol-visualizer-website/`.

---

### Task 1: Scaffold project and tooling

**Files:**

- Create: `package.json` (overwrite existing stub)
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.gitignore`
- Create: `index.html`
- Create: `public/downloads/.gitkeep`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: runnable Vite app whose default export is `App` from `src/App.tsx` returning `ReactNode`; test scripts `npm run lint`, `npm run test`, `npm run build`. Later tasks replace `App.tsx` content but keep the default export shape.

- [ ] **Step 1: Write package.json**

```json
{
  "name": "protocol-visualizer-website",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "lint": "eslint .",
    "format": "prettier --write .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: Write vite.config.ts**

```ts
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
```

- [ ] **Step 4: Write eslint.config.js**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Sections export data constants next to components on purpose.
      'react-refresh/only-export-components': 'off',
    },
  },
)
```

- [ ] **Step 5: Write .prettierrc.json and .gitignore**

`.prettierrc.json`:

```json
{
  "singleQuote": true,
  "semi": false,
  "printWidth": 100,
  "trailingComma": "all"
}
```

`.gitignore`:

```
node_modules/
dist/
*.local
```

- [ ] **Step 6: Write index.html (basic version)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Protocol Visualizer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Also create an empty placeholder so the download directory exists: `public/downloads/.gitkeep` (empty file).

- [ ] **Step 7: Write src/main.tsx, src/App.tsx, src/App.test.tsx, src/test/setup.ts**

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx`:

```tsx
import type { ReactNode } from 'react'

export default function App(): ReactNode {
  return (
    <div id="top">
      <main>Protocol Visualizer</main>
    </div>
  )
}
```

`src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the product name', () => {
    render(<App />)
    expect(screen.getByText('Protocol Visualizer')).toBeInTheDocument()
  })
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 8: Install dependencies**

Run:

```bash
npm install react@^19 react-dom@^19
npm install -D vite @vitejs/plugin-react typescript@~5.9 eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals prettier vitest jsdom @testing-library/react @testing-library/jest-dom @types/react@^19 @types/react-dom@^19
```

Verify React major version is 19: `node -p "require('react/package.json').version"` → expect `19.x.x`.

- [ ] **Step 9: Verify lint, tests, build all pass**

Run: `npm run lint && npm run test && npm run build`
Expected: all three succeed. Test output shows 1 passing test.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React 19 + TypeScript + Vitest tooling"
```

---

### Task 2: Theme system (tokens, useTheme, ThemeToggle, FOUC script)

**Files:**

- Create: `src/styles/tokens.css`
- Create: `src/hooks/useTheme.ts`
- Test: `src/hooks/useTheme.test.ts`
- Create: `src/components/ThemeToggle/ThemeToggle.tsx`
- Create: `src/components/ThemeToggle/ThemeToggle.module.css`
- Test: `src/components/ThemeToggle/ThemeToggle.test.tsx`
- Modify: `src/main.tsx` (import tokens.css)
- Modify: `index.html` (inline theme-init script)
- Modify: `src/test/setup.ts` (matchMedia stub + reset)
- Modify: `src/App.tsx` (own theme state via useTheme)

**Interfaces:**

- Consumes: nothing new.
- Produces:
  - `export type Theme = 'dark' | 'light'` from `src/hooks/useTheme.ts`
  - `export function useTheme(): { theme: Theme; toggleTheme: () => void }`
  - `export function ThemeToggle(props: { theme: Theme; onToggleTheme: () => void }): ReactNode`
  - CSS variables `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-strong`, `--color-on-accent` available globally.

- [ ] **Step 1: Extend test setup with matchMedia stub and cleanup**

Replace contents of `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

function stubMatchMedia(scheme: 'light' | 'dark') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes(scheme),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

stubMatchMedia('dark')

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  stubMatchMedia('dark')
})
```

(Note: `setupFiles` run for side effects only — later test files define their own local copy of `stubMatchMedia`.)

- [ ] **Step 2: Write the failing useTheme test**

Create `src/hooks/useTheme.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from './useTheme'

function stubMatchMedia(scheme: 'light' | 'dark') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes(scheme),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  stubMatchMedia('dark')
})

describe('useTheme', () => {
  it('falls back to prefers-color-scheme when nothing is stored', () => {
    stubMatchMedia('light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('defaults to dark when OS prefers dark', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('prefers the stored value over the OS setting', () => {
    stubMatchMedia('light')
    window.localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('reflects the theme on documentElement', () => {
    stubMatchMedia('light')
    renderHook(() => useTheme())
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('toggleTheme flips the theme and persists it', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
    expect(window.localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- src/hooks/useTheme.test.ts`
Expected: FAIL — cannot resolve `./useTheme`.

- [ ] **Step 4: Implement useTheme**

Create `src/hooks/useTheme.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // localStorage unavailable (e.g. private mode) — fall through
  }
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches)
      return 'light'
  } catch {
    // matchMedia unavailable — default below
  }
  return 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // persistence failure is non-fatal
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- src/hooks/useTheme.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 6: Write the failing ThemeToggle test**

Create `src/components/ThemeToggle/ThemeToggle.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  it('offers switching to light when current theme is dark', () => {
    const onToggle = vi.fn()
    render(<ThemeToggle theme="dark" onToggleTheme={onToggle} />)
    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument()
  })

  it('offers switching to dark when current theme is light', () => {
    const onToggle = vi.fn()
    render(<ThemeToggle theme="light" onToggleTheme={onToggle} />)
    expect(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    ).toBeInTheDocument()
  })

  it('calls onToggleTheme when clicked', () => {
    const onToggle = vi.fn()
    render(<ThemeToggle theme="dark" onToggleTheme={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm run test -- src/components/ThemeToggle/ThemeToggle.test.tsx`
Expected: FAIL — cannot resolve `./ThemeToggle`.

- [ ] **Step 8: Implement ThemeToggle**

Create `src/components/ThemeToggle/ThemeToggle.tsx`:

```tsx
import type { ReactNode } from 'react'
import type { Theme } from '../../hooks/useTheme'
import styles from './ThemeToggle.module.css'

interface ThemeToggleProps {
  theme: Theme
  onToggleTheme: () => void
}

const LABELS: Record<Theme, string> = {
  dark: 'Switch to light theme',
  light: 'Switch to dark theme',
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

export function ThemeToggle({
  theme,
  onToggleTheme,
}: ThemeToggleProps): ReactNode {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggleTheme}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
```

Create `src/components/ThemeToggle/ThemeToggle.module.css`:

```css
.toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm run test -- src/components/ThemeToggle/ThemeToggle.test.tsx`
Expected: PASS — 3 tests.

- [ ] **Step 10: Write tokens.css and wire everything up**

Create `src/styles/tokens.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

:root {
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

:root,
[data-theme='dark'] {
  color-scheme: dark;
  --color-bg: #0b1220;
  --color-surface: #121b2e;
  --color-border: #263450;
  --color-text: #e6edf7;
  --color-text-muted: #9aa7bd;
  --color-accent: #22d3ee;
  --color-accent-strong: #7dd3fc;
  --color-on-accent: #05242c;
}

[data-theme='light'] {
  color-scheme: light;
  --color-bg: #f7fafc;
  --color-surface: #ffffff;
  --color-border: #d9e2ec;
  --color-text: #12263f;
  --color-text-muted: #51637a;
  --color-accent: #0891b2;
  --color-accent-strong: #0e7490;
  --color-on-accent: #ffffff;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

In `src/main.tsx`, add as first import:

```ts
import './styles/tokens.css'
```

In `index.html`, inside `<head>` before `<title>`:

```html
<script>
  ;(function () {
    var t
    try {
      t = localStorage.getItem('theme')
    } catch (e) {}
    if (t !== 'dark' && t !== 'light') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
    }
    document.documentElement.dataset.theme = t
  })()
</script>
```

Change `src/App.tsx` to own the theme state:

```tsx
import type { ReactNode } from 'react'
import { useTheme } from './hooks/useTheme'

export default function App(): ReactNode {
  const { theme, toggleTheme } = useTheme()

  return (
    <div id="top">
      <main>
        Protocol Visualizer
        <button type="button" onClick={toggleTheme}>
          toggle ({theme})
        </button>
      </main>
    </div>
  )
}
```

(The temporary button is replaced by Header in Task 3.)

- [ ] **Step 11: Verify full suite and commit**

Run: `npm run lint && npm run test && npm run build`
Expected: all pass (App smoke + 5 hook + 3 toggle tests).

```bash
git add -A
git commit -m "feat: add dark/light theme system with OS detection and persistence"
```

---

### Task 3: Site config, DownloadButton, BeakerLogo, Header

**Files:**

- Create: `src/config/site.ts`
- Create: `src/config/links.ts` (created now, consumed by Footer in Task 8)
- Create: `src/components/DownloadButton/DownloadButton.tsx`
- Create: `src/components/DownloadButton/DownloadButton.module.css`
- Test: `src/components/DownloadButton/DownloadButton.test.tsx`
- Test: `src/components/DownloadButton/DownloadButton.enabled.test.tsx`
- Create: `src/components/BeakerLogo/BeakerLogo.tsx`
- Test: `src/components/BeakerLogo/BeakerLogo.test.tsx`
- Create: `src/components/Header/Header.tsx`
- Create: `src/components/Header/Header.module.css`
- Test: `src/components/Header/Header.test.tsx`
- Modify: `src/App.tsx` (render Header)

**Interfaces:**

- Consumes: `useTheme` / `Theme` / `ThemeToggle` from Task 2.
- Produces:
  - `site.productName: string`, `site.tagline: string`, `site.download: { available: boolean; label: string; comingSoonLabel: string; href: string }` from `src/config/site.ts`
  - `export interface ExternalLink { label: string; url: string }`, `export const externalLinks: ExternalLink[]`, `export function activeLinks(links: ExternalLink[]): ExternalLink[]` from `src/config/links.ts`
  - `export function DownloadButton(props: { compact?: boolean }): ReactNode`
  - `export function BeakerLogo(props: { className?: string; label?: string }): ReactNode`
  - `export function Header(props: { theme: Theme; onToggleTheme: () => void }): ReactNode`

- [ ] **Step 1: Write config files**

Create `src/config/site.ts`:

```ts
export const site = {
  productName: 'Protocol Visualizer',
  tagline:
    'Simulate your Opentrons Python protocols and inspect deck layout and liquid volumes in real time — without leaving VSCode.',
  download: {
    available: false,
    label: 'Download .vsix',
    comingSoonLabel: 'Coming soon',
    href: './downloads/protocol-visualizer.vsix',
  },
} as const
```

Create `src/config/links.ts`:

```ts
export interface ExternalLink {
  label: string
  url: string
}

// An empty url means "not published yet" — activeLinks filters those out.
export const externalLinks: ExternalLink[] = [{ label: 'GitHub', url: '' }]

export function activeLinks(links: ExternalLink[]): ExternalLink[] {
  return links.filter((link) => link.url !== '')
}
```

- [ ] **Step 2: Write failing DownloadButton tests**

Create `src/components/DownloadButton/DownloadButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DownloadButton } from './DownloadButton'

describe('DownloadButton (VSIX not yet published)', () => {
  it('renders a disabled button with Coming soon badge', () => {
    render(<DownloadButton />)
    const button = screen.getByRole('button', { name: /Download \.vsix/i })
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Coming soon')
  })
})
```

Create `src/components/DownloadButton/DownloadButton.enabled.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DownloadButton } from './DownloadButton'

vi.mock('../../config/site', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../config/site')>()
  return {
    ...actual,
    site: {
      ...actual.site,
      download: { ...actual.site.download, available: true },
    },
  }
})

describe('DownloadButton (VSIX published)', () => {
  it('renders a download link to the fixed vsix path', () => {
    render(<DownloadButton />)
    const link = screen.getByRole('link', { name: /Download \.vsix/i })
    expect(link).toHaveAttribute('href', './downloads/protocol-visualizer.vsix')
    expect(link).toHaveAttribute('download')
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test -- src/components/DownloadButton`
Expected: FAIL — cannot resolve `./DownloadButton`.

- [ ] **Step 4: Implement DownloadButton**

Create `src/components/DownloadButton/DownloadButton.tsx`:

```tsx
import type { ReactNode } from 'react'
import { site } from '../../config/site'
import styles from './DownloadButton.module.css'

interface DownloadButtonProps {
  compact?: boolean
}

export function DownloadButton({
  compact = false,
}: DownloadButtonProps): ReactNode {
  const className = compact
    ? `${styles.button} ${styles.compact}`
    : styles.button

  if (!site.download.available) {
    return (
      <button type="button" className={className} disabled>
        {site.download.label}
        <span className={styles.badge}>{site.download.comingSoonLabel}</span>
      </button>
    )
  }

  return (
    <a className={className} href={site.download.href} download>
      {site.download.label}
    </a>
  )
}
```

Create `src/components/DownloadButton/DownloadButton.module.css`:

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.button:not(:disabled):hover {
  background: var(--color-accent-strong);
  transform: translateY(-1px);
}

.button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.compact {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.25);
  font-size: 0.75rem;
  font-weight: 500;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- src/components/DownloadButton`
Expected: PASS — 2 tests.

- [ ] **Step 6: Write failing BeakerLogo test**

Create `src/components/BeakerLogo/BeakerLogo.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BeakerLogo } from './BeakerLogo'

describe('BeakerLogo', () => {
  it('exposes an accessible name when a label is given', () => {
    const { getByRole } = render(<BeakerLogo label="Protocol Visualizer" />)
    expect(
      getByRole('img', { name: 'Protocol Visualizer' }),
    ).toBeInTheDocument()
  })

  it('is hidden from assistive tech when no label is given', () => {
    const { container } = render(<BeakerLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm run test -- src/components/BeakerLogo`
Expected: FAIL — cannot resolve `./BeakerLogo`.

- [ ] **Step 8: Implement BeakerLogo**

Create `src/components/BeakerLogo/BeakerLogo.tsx`:

```tsx
import type { ReactNode } from 'react'

interface BeakerLogoProps {
  className?: string
  /** Accessible name. Omit for decorative usage. */
  label?: string
}

export function BeakerLogo({ className, label }: BeakerLogoProps): ReactNode {
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true }

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      {label ? <title>{label}</title> : null}
      <path
        d="M11 4h10M12 4v9.2L6.9 23.3A2.4 2.4 0 0 0 9.06 26.8h13.88a2.4 2.4 0 0 0 2.16-3.5L20 13.2V4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.1 17.4h5.8l2.75 5.6H10.35l2.75-5.6Z"
        fill="currentColor"
        opacity="0.55"
      />
      <circle cx="14.6" cy="21.2" r="0.95" fill="currentColor" />
      <circle cx="18.1" cy="20.4" r="0.6" fill="currentColor" />
    </svg>
  )
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm run test -- src/components/BeakerLogo`
Expected: PASS — 2 tests.

- [ ] **Step 10: Write failing Header test**

Create `src/components/Header/Header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

const setup = (theme: 'dark' | 'light' = 'dark') =>
  render(<Header theme={theme} onToggleTheme={vi.fn()} />)

describe('Header', () => {
  it('links the brand back to top of page', () => {
    setup()
    const brand = screen.getByRole('link', { name: 'Protocol Visualizer' })
    expect(brand).toHaveAttribute('href', '#top')
  })

  it('has section anchors for Features and Install', () => {
    setup()
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute(
      'href',
      '#features',
    )
    expect(screen.getByRole('link', { name: 'Install' })).toHaveAttribute(
      'href',
      '#install',
    )
  })

  it('contains the download CTA in its disabled state', () => {
    setup()
    expect(
      screen.getByRole('button', { name: /Download \.vsix/i }),
    ).toBeDisabled()
  })

  it('contains the theme toggle', () => {
    setup()
    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 11: Run test to verify it fails**

Run: `npm run test -- src/components/Header`
Expected: FAIL — cannot resolve `./Header`.

- [ ] **Step 12: Implement Header**

Create `src/components/Header/Header.tsx`:

```tsx
import type { ReactNode } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { site } from '../../config/site'
import { BeakerLogo } from '../BeakerLogo/BeakerLogo'
import { DownloadButton } from '../DownloadButton/DownloadButton'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import styles from './Header.module.css'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
}

const NAV_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'Install', href: '#install' },
]

export function Header({ theme, onToggleTheme }: HeaderProps): ReactNode {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand}>
          <BeakerLogo className={styles.logo} label={site.productName} />
          <span>{site.productName}</span>
        </a>
        <nav className={styles.nav} aria-label="Section navigation">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <DownloadButton compact />
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
```

(The shared `container` utility class is introduced in Task 4; the Header centers itself via `.inner` here.)

Create `src/components/Header/Header.module.css`:

```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  backdrop-filter: blur(10px);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1120px;
  margin-inline: auto;
  padding-block: 12px;
  padding-inline: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.logo {
  width: 28px;
  height: 28px;
  color: var(--color-accent);
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.nav a:hover {
  color: var(--color-accent);
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 767px) {
  .nav {
    display: none;
  }
}
```

Update `src/App.tsx`:

```tsx
import type { ReactNode } from 'react'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header/Header'

export default function App(): ReactNode {
  const { theme, toggleTheme } = useTheme()

  return (
    <div id="top">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main>Protocol Visualizer</main>
    </div>
  )
}
```

- [ ] **Step 13: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all suites green.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: add header, beaker logo, download CTA and site config"
```

---

### Task 4: Hero section and shared container class

**Files:**

- Create: `src/components/Hero/Hero.tsx`
- Create: `src/components/Hero/Hero.module.css`
- Test: `src/components/Hero/Hero.test.tsx`
- Modify: `src/styles/tokens.css` (add `.container` utility)
- Modify: `src/App.tsx` (render Hero)

**Interfaces:**

- Consumes: `site.tagline` from Task 3; `DownloadButton`; `BeakerLogo`.
- Produces: `export function Hero(): ReactNode`; global `.container` utility class (max-width 1120px, centered).

- [ ] **Step 1: Add container utility to tokens.css**

Append to `src/styles/tokens.css`:

```css
.container {
  max-width: 1120px;
  margin-inline: auto;
  padding-inline: 20px;
}
```

- [ ] **Step 2: Write failing Hero test**

Create `src/components/Hero/Hero.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from './Hero'

describe('Hero', () => {
  it('renders the product headline', () => {
    render(<Hero />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Protocol Visualizer' }),
    ).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Hero />)
    expect(
      screen.getByText(/Simulate your Opentrons Python protocols/i),
    ).toBeInTheDocument()
  })

  it('contains the primary CTA in its disabled state', () => {
    render(<Hero />)
    expect(
      screen.getByRole('button', { name: /Download \.vsix/i }),
    ).toBeDisabled()
  })

  it('links down to the installation guide', () => {
    render(<Hero />)
    expect(
      screen.getByRole('link', { name: /Installation guide/i }),
    ).toHaveAttribute('href', '#install')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- src/components/Hero`
Expected: FAIL — cannot resolve `./Hero`.

- [ ] **Step 4: Implement Hero**

Create `src/components/Hero/Hero.tsx`:

```tsx
import type { ReactNode } from 'react'
import { site } from '../../config/site'
import { BeakerLogo } from '../BeakerLogo/BeakerLogo'
import { DownloadButton } from '../DownloadButton/DownloadButton'
import styles from './Hero.module.css'

export function Hero(): ReactNode {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 className={styles.title}>{site.productName}</h1>
          <p className={styles.tagline}>{site.tagline}</p>
          <div className={styles.ctaRow}>
            <DownloadButton />
            <a className={styles.guideLink} href="#install">
              Installation guide ↓
            </a>
          </div>
        </div>
        <div className={styles.visual} aria-hidden="true">
          <BeakerLogo className={styles.beaker} />
        </div>
      </div>
    </section>
  )
}
```

Create `src/components/Hero/Hero.module.css`:

```css
.hero {
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
  background:
    radial-gradient(
      60% 80% at 80% 10%,
      color-mix(in srgb, var(--color-accent) 12%, transparent),
      transparent
    ),
    var(--color-bg);
  animation: heroFade 0.6s ease both;
}

@keyframes heroFade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.inner {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  align-items: center;
  gap: 48px;
  padding-block: 96px 104px;
}

.title {
  margin: 0 0 16px;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.tagline {
  margin: 0 0 32px;
  max-width: 34em;
  color: var(--color-text-muted);
  font-size: 1.125rem;
}

.ctaRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.guideLink {
  color: var(--color-accent);
  font-weight: 600;
  text-decoration: none;
}

.guideLink:hover {
  text-decoration: underline;
}

.visual {
  display: flex;
  justify-content: center;
}

.beaker {
  width: clamp(160px, 22vw, 260px);
  height: auto;
  color: var(--color-accent);
  filter: drop-shadow(
    0 0 40px color-mix(in srgb, var(--color-accent) 30%, transparent)
  );
}

@media (max-width: 1023px) {
  .inner {
    grid-template-columns: 1fr;
    padding-block: 64px 72px;
  }

  .visual {
    order: -1;
  }

  .beaker {
    width: 140px;
  }
}
```

Update `src/App.tsx` main content:

```tsx
<main>
  <Hero />
</main>
```

with import `import { Hero } from './components/Hero/Hero'`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all suites green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add hero section"
```

---

### Task 5: Features section

**Files:**

- Create: `src/components/Features/Features.tsx`
- Create: `src/components/Features/Features.module.css`
- Test: `src/components/Features/Features.test.tsx`
- Modify: `src/App.tsx` (render Features under Hero)

**Interfaces:**

- Consumes: nothing outside styles/tokens.
- Produces: `export function Features(): ReactNode`; `export interface Feature { title: string; description: string }`; `export const FEATURES: Feature[]`.

- [ ] **Step 1: Write failing Features test**

Create `src/components/Features/Features.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FEATURES, Features } from './Features'

describe('Features', () => {
  it('renders six feature cards', () => {
    render(<Features />)
    expect(screen.getAllByRole('article')).toHaveLength(FEATURES.length)
    expect(FEATURES).toHaveLength(6)
  })

  it('renders each feature title', () => {
    render(<Features />)
    for (const feature of FEATURES) {
      expect(screen.getByText(feature.title)).toBeInTheDocument()
    }
  })

  it('labels the region for anchor navigation', () => {
    render(<Features />)
    const region = screen.getByLabelText('Features')
    expect(region).toHaveAttribute('id', 'features')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/Features`
Expected: FAIL — cannot resolve `./Features`.

- [ ] **Step 3: Implement Features**

Create `src/components/Features/Features.tsx`:

```tsx
import type { ReactNode } from 'react'
import styles from './Features.module.css'

export interface Feature {
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    title: 'Real-time Deck Visualization',
    description:
      'Watch pipette moves, labware states, and liquid volume changes render as your protocol runs.',
  },
  {
    title: 'Auto-analysis on Save',
    description:
      'Analysis reruns automatically every time you save your protocol file.',
  },
  {
    title: 'Runtime Parameters UI',
    description:
      'Input fields are generated for runtime parameters; hit Analyze to apply them.',
  },
  {
    title: 'Custom Labware Support',
    description:
      'Place custom labware JSON definitions next to your protocol file and they just work.',
  },
  {
    title: 'Pop-out Window',
    description:
      "Detach the visualizer to a separate window via VSCode's Auxiliary Window support.",
  },
  {
    title: 'Step Jumper',
    description:
      'Jump straight to any protocol step by number from the Protocol Steps panel.',
  },
]

export function Features(): ReactNode {
  return (
    <section id="features" className={styles.section} aria-label="Features">
      <div className="container">
        <h2 className={styles.heading}>
          Everything you need to see your protocol run
        </h2>
        <ul className={styles.grid}>
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardBody}>{feature.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

Create `src/components/Features/Features.module.css`:

```css
.section {
  padding-block: 88px;
}

.heading {
  margin: 0 0 40px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  letter-spacing: -0.01em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  height: 100%;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.cardTitle {
  margin: 0 0 8px;
  font-size: 1.05rem;
}

.cardBody {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

@media (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

Update `src/App.tsx` main content to stack sections:

```tsx
<main>
  <Hero />
  <Features />
</main>
```

with import `import { Features } from './components/Features/Features'`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all suites green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add features section"
```

---

### Task 6: Screenshot section

**Files:**

- Create: `src/components/Screenshot/Screenshot.tsx`
- Create: `src/components/Screenshot/Screenshot.module.css`
- Test: `src/components/Screenshot/Screenshot.test.tsx`
- Modify: `src/App.tsx` (render Screenshot after Features)

**Interfaces:**

- Consumes: nothing outside styles.
- Produces: `export function Screenshot(): ReactNode`.

- [ ] **Step 1: Write failing Screenshot test**

Create `src/components/Screenshot/Screenshot.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Screenshot } from './Screenshot'

describe('Screenshot', () => {
  it('shows a labelled placeholder figure', () => {
    render(<Screenshot />)
    expect(
      screen.getByRole('img', {
        name: /Protocol Visualizer screenshot placeholder/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Extension screenshot coming soon/i),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/Screenshot`
Expected: FAIL — cannot resolve `./Screenshot`.

- [ ] **Step 3: Implement Screenshot**

Create `src/components/Screenshot/Screenshot.tsx`:

```tsx
import type { ReactNode } from 'react'
import { BeakerLogo } from '../BeakerLogo/BeakerLogo'
import styles from './Screenshot.module.css'

export function Screenshot(): ReactNode {
  return (
    <section className={styles.section} aria-label="Screenshot">
      <div className="container">
        <figure className={styles.figure}>
          <div
            role="img"
            aria-label="Protocol Visualizer screenshot placeholder"
            className={styles.placeholder}
          >
            <BeakerLogo className={styles.beaker} />
          </div>
          <figcaption className={styles.caption}>
            Extension screenshot coming soon
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
```

Create `src/components/Screenshot/Screenshot.module.css`:

```css
.section {
  padding-block: 32px 88px;
}

.figure {
  margin: 0;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  border: 2px dashed var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
}

.beaker {
  width: 96px;
  height: auto;
  color: var(--color-border);
}

.caption {
  margin-top: 12px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: center;
}
```

Update `src/App.tsx` main content:

```tsx
<main>
  <Hero />
  <Features />
  <Screenshot />
</main>
```

with import `import { Screenshot } from './components/Screenshot/Screenshot'`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all suites green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add screenshot placeholder section"
```

---

### Task 7: Install section

**Files:**

- Create: `src/components/Install/Install.tsx`
- Create: `src/components/Install/Install.module.css`
- Test: `src/components/Install/Install.test.tsx`
- Modify: `src/App.tsx` (render Install after Screenshot)

**Interfaces:**

- Consumes: `DownloadButton`.
- Produces: `export function Install(): ReactNode`; section has `id="install"`.

- [ ] **Step 1: Write failing Install test**

Create `src/components/Install/Install.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Install } from './Install'

describe('Install', () => {
  it('anchors at id=install', () => {
    render(<Install />)
    expect(screen.getByLabelText('Installation guide')).toHaveAttribute(
      'id',
      'install',
    )
  })

  it('lists prerequisites including the OT-2 pin note', () => {
    render(<Install />)
    expect(screen.getByText('Python 3.8 or later')).toBeInTheDocument()
    expect(screen.getByText('pip install opentrons')).toBeInTheDocument()
    expect(screen.getByText('pip install opentrons==9.0.0')).toBeInTheDocument()
  })

  it('explains both install methods', () => {
    render(<Install />)
    const methodA = screen.getByLabelText('Method A: Command Palette')
    expect(
      within(methodA).getByText('Extensions: Install from VSIX...'),
    ).toBeInTheDocument()
    const methodB = screen.getByLabelText('Method B: Command line')
    expect(
      within(methodB).getByText(
        'code --install-extension protocol-visualizer.vsix',
      ),
    ).toBeInTheDocument()
  })

  it('repeats the download CTA', () => {
    render(<Install />)
    expect(
      screen.getAllByRole('button', { name: /Download \.vsix/i }).length,
    ).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/Install`
Expected: FAIL — cannot resolve `./Install`.

- [ ] **Step 3: Implement Install**

Create `src/components/Install/Install.tsx`:

```tsx
import type { ReactNode } from 'react'
import { DownloadButton } from '../DownloadButton/DownloadButton'
import styles from './Install.module.css'

export function Install(): ReactNode {
  return (
    <section
      id="install"
      className={styles.section}
      aria-label="Installation guide"
    >
      <div className="container">
        <h2 className={styles.heading}>Installation</h2>

        <div className={styles.columns}>
          <div className={styles.block}>
            <h3 className={styles.subHeading}>Prerequisites</h3>
            <ul className={styles.list}>
              <li>
                <strong>Python 3.8 or later</strong>, with <code>python3</code>{' '}
                available in PATH
              </li>
              <li>
                The <code>opentrons</code> Python package:{' '}
                <code className={styles.codeInline}>pip install opentrons</code>
              </li>
              <li>
                For OT-2 use{' '}
                <code className={styles.codeInline}>
                  pip install opentrons==9.0.0
                </code>{' '}
                (opentrons 9.1.0+ dropped OT-2 support)
              </li>
            </ul>
          </div>

          <div className={styles.block} aria-label="Method A: Command Palette">
            <h3 className={styles.subHeading}>Method A: Command Palette</h3>
            <ol className={styles.list}>
              <li>
                Open the Command Palette (<kbd>Cmd+Shift+P</kbd> /{' '}
                <kbd>Ctrl+Shift+P</kbd>)
              </li>
              <li>
                Select <code>Extensions: Install from VSIX...</code>
              </li>
              <li>
                Choose the downloaded <code>.vsix</code> file
              </li>
            </ol>
          </div>

          <div className={styles.block} aria-label="Method B: Command line">
            <h3 className={styles.subHeading}>Method B: Command line</h3>
            <pre className={styles.codeBlock}>
              <code>code --install-extension protocol-visualizer.vsix</code>
            </pre>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <DownloadButton />
        </div>
      </div>
    </section>
  )
}
```

Create `src/components/Install/Install.module.css`:

```css
.section {
  padding-block: 88px;
  border-top: 1px solid var(--color-border);
}

.heading {
  margin: 0 0 40px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  letter-spacing: -0.01em;
}

.columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.block {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
}

.subHeading {
  margin: 0 0 12px;
  font-size: 1.05rem;
}

.list {
  margin: 0;
  padding-left: 18px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.list li + li {
  margin-top: 8px;
}

.codeInline {
  padding: 2px 6px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent-strong);
  font-size: 0.85em;
}

.codeBlock {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent-strong);
  font-size: 0.9rem;
}

.ctaRow {
  margin-top: 32px;
}

@media (max-width: 1023px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
```

Update `src/App.tsx` main content:

```tsx
<main>
  <Hero />
  <Features />
  <Screenshot />
  <Install />
</main>
```

with import `import { Install } from './components/Install/Install'`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all suites green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add installation section with prerequisites and methods"
```

---

### Task 8: Footer section

**Files:**

- Create: `src/components/Footer/Footer.tsx`
- Create: `src/components/Footer/Footer.module.css`
- Test: `src/components/Footer/Footer.test.tsx`
- Test: `src/config/links.test.ts`
- Modify: `src/App.tsx` (render Footer after main)

**Interfaces:**

- Consumes: `externalLinks` / `activeLinks` from `src/config/links.ts` (Task 3).
- Produces: `export function Footer(): ReactNode`.

- [ ] **Step 1: Write failing links unit test**

Create `src/config/links.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { activeLinks, externalLinks } from './links'

describe('activeLinks', () => {
  it('filters out links without urls', () => {
    expect(activeLinks(externalLinks)).toEqual([])
  })

  it('keeps links that have urls', () => {
    const links = [
      { label: 'GitHub', url: 'https://github.com/example/repo' },
      { label: 'Docs', url: '' },
    ]
    expect(activeLinks(links)).toEqual([
      { label: 'GitHub', url: 'https://github.com/example/repo' },
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it passes (config already exists)**

Run: `npm run test -- src/config/links.test.ts`
Expected: PASS — 2 tests. If FAIL, fix `src/config/links.ts` against Task 3 definitions before continuing.

- [ ] **Step 3: Write failing Footer test**

Create `src/components/Footer/Footer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('shows the license line', () => {
    render(<Footer />)
    expect(
      screen.getByText('MIT License © 2026 Koji Kanao'),
    ).toBeInTheDocument()
  })

  it('hides GitHub while the repository URL is empty', () => {
    render(<Footer />)
    expect(
      screen.queryByRole('link', { name: 'GitHub' }),
    ).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test -- src/components/Footer`
Expected: FAIL — cannot resolve `./Footer`.

- [ ] **Step 5: Implement Footer**

Create `src/components/Footer/Footer.tsx`:

```tsx
import type { ReactNode } from 'react'
import { activeLinks, externalLinks } from '../../config/links'
import styles from './Footer.module.css'

export function Footer(): ReactNode {
  const links = activeLinks(externalLinks)

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <small>MIT License © 2026 Koji Kanao</small>
        {links.length > 0 ? (
          <nav className={styles.links} aria-label="External links">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  )
}
```

Create `src/components/Footer/Footer.module.css`:

```css
.footer {
  padding-block: 28px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.links {
  display: flex;
  gap: 20px;
}

.links a {
  color: var(--color-text-muted);
  text-decoration: none;
}

.links a:hover {
  color: var(--color-accent);
}
```

Update `src/App.tsx`:

```tsx
import type { ReactNode } from 'react'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header/Header'
import { Hero } from './components/Hero/Hero'
import { Features } from './components/Features/Features'
import { Screenshot } from './components/Screenshot/Screenshot'
import { Install } from './components/Install/Install'
import { Footer } from './components/Footer/Footer'

export default function App(): ReactNode {
  const { theme, toggleTheme } = useTheme()

  return (
    <div id="top">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <Screenshot />
        <Install />
      </main>
      <Footer />
    </div>
  )
}
```

(This is the final App shape.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all suites green.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add footer with config-driven external links"
```

---

### Task 9: Page metadata, favicon, final verification

**Files:**

- Modify: `index.html` (full meta + OG tags + favicon link)
- Create: `public/favicon.svg`
- Modify: `src/App.test.tsx` (integration assertions across all sections)

**Interfaces:**

- Consumes: everything built so far.
- Produces: complete deployable static site in `dist/`.

- [ ] **Step 1: Replace index.html with final version**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="A VSCode extension that simulates Opentrons Python protocols and visualizes deck state and liquid volumes in real time."
    />
    <meta
      property="og:title"
      content="Protocol Visualizer — Simulate Opentrons protocols in VSCode"
    />
    <meta
      property="og:description"
      content="Simulate your Opentrons Python protocols and inspect deck layout and liquid volumes in real time — without leaving VSCode."
    />
    <meta property="og:type" content="website" />
    <!-- og:image intentionally omitted until a real screenshot exists -->
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <title>Protocol Visualizer — Simulate Opentrons protocols in VSCode</title>
    <script>
      ;(function () {
        var t
        try {
          t = localStorage.getItem('theme')
        } catch (e) {}
        if (t !== 'dark' && t !== 'light') {
          t = window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'dark'
        }
        document.documentElement.dataset.theme = t
      })()
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create favicon**

Create `public/favicon.svg` (standalone beaker using a fixed accent color):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0b1220"/>
  <path d="M11 6.5h10M12 6.5v7.7l-4.6 9.3a2 2 0 0 0 1.8 2.9h13.6a2 2 0 0 0 1.8-2.9L20 14.2V6.5" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.1 17.4h5.8l2.55 5.2H10.55l2.55-5.2Z" fill="#22d3ee" opacity="0.55"/>
</svg>
```

- [ ] **Step 3: Update integration test**

Replace `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders every section of the landing page', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Protocol Visualizer' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Features')).toBeInTheDocument()
    expect(screen.getByLabelText('Screenshot')).toBeInTheDocument()
    expect(screen.getByLabelText('Installation guide')).toBeInTheDocument()
  })

  it('starts the download CTA in the disabled Coming soon state', () => {
    render(<App />)
    const cta = screen.getAllByRole('button', { name: /Download \.vsix/i })
    expect(cta.length).toBeGreaterThanOrEqual(2)
    for (const button of cta) {
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('Coming soon')
    }
  })
})
```

- [ ] **Step 4: Full verification**

Run: `npm run lint && npm run test && npm run build`
Expected: all pass. `dist/` contains `index.html` referencing relative assets (`./assets/...`) thanks to `base: './'`.

Smoke check the production build locally: `npm run preview` then open the shown localhost URL, confirm dark/light toggle works, anchors scroll, CTA shows "Coming soon". Stop the preview afterwards.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: finalize page metadata, favicon and integration checks"
```

---

## Release Checklist (when the real .vsix arrives)

1. Copy the extension build output to `public/downloads/protocol-visualizer.vsix` (fixed name, overwrite).
2. In `src/config/site.ts` set `download.available: true`.
3. Optionally drop a real screenshot into the Screenshot section (replace placeholder markup).
4. Add the public repo URL to `externalLinks` in `src/config/links.ts`.
5. `npm run build`, verify, commit, deploy.
