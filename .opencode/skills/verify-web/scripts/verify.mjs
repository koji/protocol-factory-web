#!/usr/bin/env bun
// verify.mjs — one-shot end-to-end verification for protocol-factory-web.
// Spawns its own `vite` server as a child process (same process tree, so no
// cross-shell lifetime issues), runs doctor, drives the requested features in
// real Chromium, then always tears the server down. Proof artifacts survive.
//
// Usage (run from the repo root):
//   bun .opencode/skills/verify-web/scripts/verify.mjs --feature <id|all> [--port 5173] [--run-id <id>]
//
// Env overrides: VERIFY_PORT, VERIFY_CDP_PORT, VERIFY_RUN_ID, CHROME_PATH.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const ROOT = path.dirname(path.dirname(path.dirname(SKILL_DIR)))

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

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
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

const args = parseArgs(process.argv.slice(2))
const feature = args.feature ?? 'all'
const port = Number(args.port ?? process.env.VERIFY_PORT ?? 5173)
const runId =
  args['run-id'] ??
  process.env.VERIFY_RUN_ID ??
  new Date().toISOString().replace(/[:.]/g, '-')
const artifacts = path.join(SKILL_DIR, 'artifacts', runId)
const serverLog = path.join(artifacts, 'vite-server.log')

fs.mkdirSync(artifacts, { recursive: true })
const url = `http://127.0.0.1:${port}/`

console.log(`launch: bun x vite --host 127.0.0.1 --port ${port} --strictPort`)
const server = Bun.spawn(
  [
    process.execPath,
    'x',
    'vite',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  {
    cwd: ROOT,
    stdout: 'pipe',
    stderr: 'pipe',
  },
)
const logFile = fs.createWriteStream(serverLog)
server.stdout.pipeTo(new WritableStream({ write: (c) => logFile.write(c) }))
server.stderr.pipeTo(new WritableStream({ write: (c) => logFile.write(c) }))

let exitCode = 1
try {
  // Wait for readiness: log line + HTTP 200.
  let ready = false
  const start = Date.now()
  while (Date.now() - start < 30000) {
    if (server.exitCode !== null && server.exitCode !== undefined) {
      throw new Error(
        `vite exited early (code ${server.exitCode}); see ${serverLog}`,
      )
    }
    try {
      const res = await fetch(url)
      if (res.ok) {
        ready = true
        break
      }
    } catch {}
    await sleep(300)
  }
  if (!ready)
    throw new Error(`vite never became ready at ${url}; see ${serverLog}`)
  console.log(`launch: ready at ${url}`)

  // Doctor (official read-only check, as a separate step).
  console.log('doctor:')
  const doctor = Bun.spawn(
    ['bun', path.join(SKILL_DIR, 'scripts', 'doctor.mjs'), '--url', url],
    {
      cwd: ROOT,
      stdout: 'inherit',
      stderr: 'inherit',
    },
  )
  const doctorCode = await doctor.exited
  if (doctorCode !== 0)
    throw new Error('doctor reported the instance is not worth driving')

  // Drive.
  console.log('drive:')
  const drive = Bun.spawn(
    [
      'bun',
      path.join(SKILL_DIR, 'scripts', 'drive.mjs'),
      '--url',
      url,
      '--feature',
      feature,
      '--out',
      artifacts,
    ],
    { cwd: ROOT, stdout: 'inherit', stderr: 'inherit' },
  )
  const driveCode = await drive.exited
  exitCode = driveCode

  // Cleanup never eats the proof: confirm artifacts still exist after teardown.
  const walked = []
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else walked.push(p)
    }
  }
  walk(artifacts)
  const hasShot = walked.some((p) => p.endsWith('screenshot.png'))
  const hasResult = walked.some((p) => p.endsWith('result.json'))
  console.log(`artifacts: ${artifacts} (${walked.length} files)`)
  if (!hasShot || !hasResult)
    throw new Error(
      'evidence missing after run (screenshot.png + result.json required)',
    )
} catch (e) {
  console.error(`verify failed: ${e?.message ?? e}`)
  exitCode = 1
} finally {
  killTree(server)
  await server.exited.catch(() => {})
  try {
    logFile.end()
  } catch {}
  // Prove the teardown: the port must refuse connections afterwards.
  let portFree = false
  for (let i = 0; i < 20; i++) {
    try {
      await fetch(url)
      await sleep(250)
    } catch {
      portFree = true
      break
    }
  }
  console.log(
    `cleanup: vite server stopped (port free: ${portFree}; artifacts retained).`,
  )
  if (!portFree) {
    console.error(`cleanup: port ${port} is still owned after teardown`)
    exitCode = 1
  }
}
process.exit(exitCode)
