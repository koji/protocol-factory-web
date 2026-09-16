#!/usr/bin/env bun
// doctor.mjs — read-only health check for a running verification instance.
// Answers: "is this instance worth driving?"
//
// Usage:
//   bun scripts/doctor.mjs --url http://127.0.0.1:5173
//
// Exits 0 when healthy, 1 otherwise. Never starts, stops, or mutates anything.

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

const args = parseArgs(process.argv.slice(2))
const url = args.url ?? 'http://127.0.0.1:5173/'

try {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  const res = await fetch(url, { signal: controller.signal })
  clearTimeout(timer)
  const body = await res.text()
  const hasRoot = body.includes('<div id="root">')
  const isDev = body.includes('/src/main.tsx')
  const isBuild = body.includes('/assets/')
  const report = {
    ok: res.ok && hasRoot && (isDev || isBuild),
    url,
    status: res.status,
    hasRoot,
    mode: isDev ? 'dev' : isBuild ? 'preview/build' : 'unknown',
  }
  console.log(JSON.stringify(report, null, 1))
  if (!report.ok) {
    console.error(
      'doctor: instance is NOT worth driving (expected HTTP 200 + <div id="root"> + vite client or built assets).',
    )
    process.exit(1)
  }
  console.log('doctor: instance is healthy.')
} catch (e) {
  console.error(`doctor: unreachable at ${url} — ${e?.message ?? e}`)
  process.exit(1)
}
