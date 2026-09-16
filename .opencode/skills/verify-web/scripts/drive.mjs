#!/usr/bin/env bun
// drive.mjs — drive the real protocol-visualizer-web landing page in headless
// Chromium over CDP (no npm dependencies; uses bun built-ins only).
//
// Usage:
//   bun scripts/drive.mjs --url http://127.0.0.1:5173 --feature <id|all> --out <dir>
//     [--chrome <path-to-chrome.exe>] [--cdp-port 19222]
//
// Exits 0 when every check passes, 1 otherwise. Always writes per-feature
// artifacts (screenshot.png, dom.html, axtree.json, result.json) into --out
// (or --out/<feature> when --feature all).

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const FEATURES = ['hero', 'features-grid', 'ai-workflow', 'theme-toggle', 'install-guide']

const EXPECTED_FEATURE_TITLES = [
  'Real-time Deck Visualization',
  'Auto-analysis on Save',
  'Runtime Parameters UI',
  'Custom Labware Support',
  'Pop-out Window',
  'Step Jumper',
]

const AI_VIDEO =
  'https://github.com/user-attachments/assets/812fbcdf-a84a-49fd-b631-ae925b64dddf'
const SKILL_REPO = 'https://github.com/koji/protocol-fix-loop'

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const next = argv[i + 1]
      out[key] = next && !next.startsWith('--') ? argv[++i] : 'true'
    }
  }
  return out
}

// Kill a spawned process AND its children. `bun x <tool>` wraps the real
// server in a child process, so a bare kill() can orphan the listener.
function killTree(proc) {
  try {
    if (process.platform === 'win32') {
      Bun.spawnSync(['taskkill', '/PID', String(proc.pid), '/T', '/F'], {
        stdout: 'ignore',
        stderr: 'ignore',
      })
    } else {
      proc.kill()
    }
  } catch {}
}

function findChrome(explicit) {  const candidates = [
    explicit,
    process.env.CHROME_PATH,
    `${process.env.LOCALAPPDATA}\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe`,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean)
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c
    } catch {}
  }
  return null
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function createCdp(ws) {
  let nextId = 1
  const pending = new Map()
  const waiters = new Map() // method name -> [resolve]
  ws.onmessage = (event) => {
    let msg
    try {
      msg = JSON.parse(String(event.data))
    } catch {
      return
    }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(`CDP error: ${JSON.stringify(msg.error)}`))
      else resolve(msg.result)
    } else if (msg.method) {
      const list = waiters.get(msg.method)
      if (list) {
        waiters.delete(msg.method)
        for (const r of list) r(msg.params)
      }
    }
  }
  function send(method, params = {}, timeoutMs = 20000) {
    const id = nextId++
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id)
          reject(new Error(`CDP timeout: ${method}`))
        }
      }, timeoutMs)
    })
  }
  function waitForEvent(method, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      if (!waiters.has(method)) waiters.set(method, [])
      waiters.get(method).push(resolve)
      setTimeout(() => {
        const list = waiters.get(method) ?? []
        const idx = list.indexOf(resolve)
        if (idx >= 0) {
          list.splice(idx, 1)
          reject(new Error(`CDP event timeout: ${method}`))
        }
      }, timeoutMs)
    })
  }
  return { send, waitForEvent }
}

async function evaluate(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (res.exceptionDetails) {
    throw new Error(`evaluate threw: ${JSON.stringify(res.exceptionDetails).slice(0, 500)}`)
  }
  return res.result?.value
}

async function waitForReady(cdp, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const h1 = await evaluate(cdp, `document.querySelector('#root h1')?.textContent ?? null`)
    if (h1) return h1
    await sleep(250)
  }
  throw new Error('timed out waiting for #root h1 to render')
}

// Each check returns { id, pass, detail }. Expressions run in the page.
const CHECKS = {
  hero: [
    {
      id: 'hero-headline',
      expr: `document.querySelector('#root h1')?.textContent ?? null`,
      want: 'Protocol Visualizer',
    },
    {
      id: 'hero-tagline',
      expr: `document.querySelector('#root section p')?.textContent ?? null`,
      contains: 'Simulate your Opentrons',
    },
    {
      id: 'hero-request-access-links',
      expr: `(() => { const a = [...document.querySelectorAll('#root a')].filter(e => e.textContent.trim() === 'Request access'); return { count: a.length, hrefs: a.map(e => e.href) }; })()`,
      check: (v) => v.count >= 3 && v.hrefs.every((h) => h.includes('docs.google.com/forms')),
    },
    {
      id: 'hero-install-link',
      expr: `[...document.querySelectorAll('#root a[href="#install"]')].map(a => a.textContent.trim())`,
      check: (v) => Array.isArray(v) && v.some((t) => t.includes('Installation guide')),
    },
  ],
  'features-grid': [
    {
      id: 'features-region',
      expr: `document.querySelector('section#features[aria-label="Features"]') !== null`,
      want: true,
    },
    {
      id: 'features-heading',
      expr: `document.querySelector('section#features h2')?.textContent ?? null`,
      want: 'Everything you need to see your protocol run',
    },
    {
      id: 'features-cards',
      expr: `[...document.querySelectorAll('section#features article')].map(a => a.querySelector('h3')?.textContent ?? '')`,
      check: (v) =>
        Array.isArray(v) &&
        v.length === 6 &&
        EXPECTED_FEATURE_TITLES.every((t) => v.includes(t)),
    },
  ],
  'ai-workflow': [
    {
      id: 'ai-region',
      expr: `document.querySelector('section#ai-workflow[aria-label="Generate protocols with AI"]') !== null`,
      want: true,
    },
    {
      id: 'ai-heading',
      expr: `document.querySelector('section#ai-workflow h2')?.textContent ?? null`,
      contains: 'Generate protocols with AI',
    },
    {
      id: 'ai-video',
      expr: `(() => { const v = document.querySelector('section#ai-workflow video'); return v ? { src: v.getAttribute('src'), controls: v.hasAttribute('controls') } : null; })()`,
      check: (v) => v !== null && v.src === AI_VIDEO && v.controls === true,
    },
    {
      id: 'ai-skill-command',
      expr: `document.querySelector('section#ai-workflow')?.textContent.includes('npx skills add koji/protocol-fix-loop') ?? false`,
      want: true,
    },
    {
      id: 'ai-slash-command',
      expr: `document.querySelector('section#ai-workflow')?.textContent.includes('/protocol-fix-loop') ?? false`,
      want: true,
    },
    {
      id: 'ai-skill-links',
      expr: `[...document.querySelectorAll('section#ai-workflow a[href="${SKILL_REPO}"]')].length`,
      check: (v) => typeof v === 'number' && v >= 1,
    },
    {
      id: 'ai-install-link',
      expr: `document.querySelector('section#ai-workflow a[href="#install"]') !== null`,
      want: true,
    },
  ],
  'theme-toggle': [
    {
      id: 'toggle-present',
      expr: `document.querySelector('button[aria-label^="Switch to"]')?.getAttribute('aria-label') ?? null`,
      check: (v) => v === 'Switch to light theme' || v === 'Switch to dark theme',
    },
    {
      id: 'toggle-flips-theme',
      expr: `(async () => { const b = document.querySelector('button[aria-label^="Switch to"]'); if (!b) return null; const before = document.documentElement.dataset.theme; b.click(); await new Promise(r => setTimeout(r, 400)); const after = document.documentElement.dataset.theme; const stored = localStorage.getItem('theme'); window.__verifyThemeFlipped = after; return { before, after, stored }; })()`,
      check: (v) =>
        v !== null && v.before !== v.after && (v.after === 'dark' || v.after === 'light') && v.stored === v.after,
    },
    {
      id: 'toggle-restores',
      expr: `(async () => { const b = document.querySelector('button[aria-label^="Switch to"]'); if (!b) return null; b.click(); await new Promise(r => setTimeout(r, 400)); return { theme: document.documentElement.dataset.theme, stored: localStorage.getItem('theme'), label: b.getAttribute('aria-label'), flipped: window.__verifyThemeFlipped ?? null }; })()`,
      check: (v) =>
        v !== null &&
        (v.theme === 'dark' || v.theme === 'light') &&
        v.stored === v.theme &&
        v.theme !== v.flipped &&
        v.label === (v.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'),
    },
  ],
  'install-guide': [
    {
      id: 'install-region',
      expr: `document.querySelector('section#install[aria-label="Installation guide"]') !== null`,
      want: true,
    },
    {
      id: 'install-prereqs',
      expr: `document.querySelector('section#install')?.textContent ?? ''`,
      check: (v) =>
        typeof v === 'string' &&
        v.includes('Python 3.8 or later') &&
        v.includes('pip install opentrons') &&
        v.includes('Python: Select Interpreter'),
    },
    {
      id: 'install-cli-method',
      expr: `document.querySelector('section#install')?.textContent.includes('code --install-extension protocol-visualizer.vsix') ?? false`,
      want: true,
    },
    {
      id: 'header-nav',
      expr: `[...document.querySelectorAll('header nav[aria-label="Section navigation"] a')].map(a => [a.textContent.trim(), a.getAttribute('href')])`,
      check: (v) =>
        Array.isArray(v) &&
        v.some(([t, h]) => t === 'Features' && h === '#features') &&
        v.some(([t, h]) => t === 'Install' && h === '#install'),
    },
    {
      id: 'anchor-navigation',
      expr: `(() => { const link = document.querySelector('header nav a[href="#install"]'); if (!link) return null; link.click(); const sec = document.querySelector('section#install'); const r = sec.getBoundingClientRect(); return { hash: location.hash, top: Math.round(r.top), vh: window.innerHeight }; })()`,
      check: (v) => v !== null && v.hash === '#install' && v.top < v.vh,
    },
  ],
}

function judge(check, value) {
  if (check.check) {
    try {
      return check.check(value) === true
    } catch {
      return false
    }
  }
  if (check.want !== undefined) return JSON.stringify(value) === JSON.stringify(check.want)
  if (check.contains !== undefined) return typeof value === 'string' && value.includes(check.contains)
  return false
}

async function driveFeature(cdp, pageUrl, feature, outDir) {
  fs.mkdirSync(outDir, { recursive: true })

  await cdp.send('Page.navigate', { url: pageUrl })
  await cdp.waitForEvent('Page.loadEventFired').catch(() => {})
  await waitForReady(cdp)
  // Let entrance animations (e.g. hero 0.6s fade-in) finish so the
  // screenshot shows the steady visual state.
  await sleep(900)

  const results = []
  for (const check of CHECKS[feature]) {
    let value = null
    let pass = false
    let error = null
    try {
      value = await evaluate(cdp, check.expr)
      pass = judge(check, value)
    } catch (e) {
      error = String(e).slice(0, 300)
    }
    results.push({ id: check.id, pass, value, error })
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${check.id}${pass ? '' : ` — saw ${JSON.stringify(value)?.slice(0, 200)}${error ? ` (${error})` : ''}`}`)
  }

  const shot = await (async () => {
    // Show the driven feature in the screenshot, not just the page top.
    const targets = {
      hero: null, // top of page
      'features-grid': 'section#features',
      'ai-workflow': 'section#ai-workflow',
      'theme-toggle': null, // header, at top of page
      'install-guide': 'section#install',
    }
    const sel = targets[feature]
    if (sel) {
      await evaluate(cdp, `document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -72)`)
    } else {
      await evaluate(cdp, `window.scrollTo(0, 0)`)
    }
    await sleep(500)
    return cdp.send('Page.captureScreenshot', { format: 'png' })
  })()
  fs.writeFileSync(path.join(outDir, 'screenshot.png'), Buffer.from(shot.data, 'base64'))
  const dom = await evaluate(cdp, `document.documentElement.outerHTML`)
  fs.writeFileSync(path.join(outDir, 'dom.html'), String(dom ?? ''))
  let ax = null
  try {
    await cdp.send('Accessibility.enable', {}).catch(() => {})
    const tree = await cdp.send('Accessibility.getFullAXTree', {})
    ax = tree.nodes
    fs.writeFileSync(path.join(outDir, 'axtree.json'), JSON.stringify(ax, null, 1))
  } catch (e) {
    fs.writeFileSync(path.join(outDir, 'axtree.json'), JSON.stringify({ error: String(e).slice(0, 300) }))
  }
  const passed = results.filter((r) => r.pass).length
  const result = {
    feature,
    url: pageUrl,
    passed,
    total: results.length,
    ok: passed === results.length,
    checks: results,
    finishedAt: new Date().toISOString(),
  }
  fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(result, null, 1))
  return result
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const pageUrl = args.url ?? 'http://127.0.0.1:5173/'
  const featureArg = args.feature ?? 'all'
  const outBase = args.out ?? 'artifacts'
  const cdpPort = Number(args['cdp-port'] ?? process.env.VERIFY_CDP_PORT ?? 19222)
  const features = featureArg === 'all' ? FEATURES : [featureArg]
  for (const f of features) {
    if (!CHECKS[f]) {
      console.error(`unknown feature: ${f} (known: ${FEATURES.join(', ')})`)
      process.exit(2)
    }
  }

  const chrome = findChrome(args.chrome)
  if (!chrome) {
    console.error('no Chromium/Chrome binary found. Set CHROME_PATH or install Chrome.')
    process.exit(2)
  }
  console.log(`chrome: ${chrome}`)

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-web-profile-'))
  const proc = Bun.spawn(
    [
      chrome,
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1280,900',
      '--force-device-scale-factor=1',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${cdpPort}`,
      'about:blank',
    ],
    { stdout: 'ignore', stderr: 'ignore' },
  )

  const cleanup = () => {
    killTree(proc)
    try {
      fs.rmSync(profile, { recursive: true, force: true })
    } catch {}
  }
  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })

  try {
    let targets = null
    const start = Date.now()
    while (Date.now() - start < 15000) {
      try {
        const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`)
        const list = await res.json()
        const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
        if (page) {
          targets = page
          break
        }
      } catch {}
      await sleep(250)
    }
    if (!targets) throw new Error('timed out waiting for Chrome remote debugging')

    const ws = new WebSocket(targets.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('websocket connect timeout')), 10000)
      ws.onopen = () => {
        clearTimeout(t)
        resolve()
      }
      ws.onerror = (e) => {
        clearTimeout(t)
        reject(new Error(`websocket error: ${e?.message ?? 'unknown'}`))
      }
    })
    const cdp = createCdp(ws)
    await cdp.send('Page.enable', {})
    await cdp.send('Runtime.enable', {})

    // Doctor-style precheck: the app must serve its shell before driving.
    const probe = await fetch(pageUrl)
    if (!probe.ok) throw new Error(`app probe failed: HTTP ${probe.status} at ${pageUrl}`)

    let allOk = true
    for (const f of features) {
      const outDir = featureArg === 'all' ? path.join(outBase, f) : outBase
      console.log(`feature: ${f}`)
      const result = await driveFeature(cdp, pageUrl, f, outDir)
      console.log(`  -> ${result.passed}/${result.total} passed — ${path.join(outDir, 'screenshot.png')}`)
      if (!result.ok) allOk = false
    }
    ws.close()
    try {
      await cdp.send('Browser.close', {}).catch(() => {})
    } catch {}
    cleanup()
    process.exit(allOk ? 0 : 1)
  } catch (e) {
    console.error(`drive failed: ${e?.message ?? e}`)
    cleanup()
    process.exit(1)
  }
}

await main()
