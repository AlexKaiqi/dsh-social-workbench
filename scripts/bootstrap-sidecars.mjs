import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile, rm, symlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(path.join(repositoryRoot, 'third_party', 'sidecars.json'), 'utf8'))

function argument(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function run(command, args, { cwd, env = {}, allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0 && !allowFailure) {
        reject(new Error(`${command} ${args.join(' ')} failed (${code}): ${stderr || stdout}`))
      } else {
        resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() })
      }
    })
  })
}

async function exists(target) {
  try { await access(target); return true } catch { return false }
}

async function sha256File(target) {
  return createHash('sha256').update(await readFile(target)).digest('hex')
}

async function isExactPatchedCheckout(target, config) {
  if (!config.patchedFiles) return false
  const tracked = await run('git', ['diff', '--name-only', 'HEAD'], { cwd: target })
  const untracked = await run('git', ['ls-files', '--others', '--exclude-standard'], { cwd: target })
  const changed = `${tracked.stdout}\n${untracked.stdout}`.split('\n').filter(Boolean)
  const expected = Object.keys(config.patchedFiles).sort()
  if (JSON.stringify(changed.sort()) !== JSON.stringify(expected)) return false
  for (const [relative, hash] of Object.entries(config.patchedFiles)) {
    if (!(await exists(path.join(target, relative))) || await sha256File(path.join(target, relative)) !== hash) return false
  }
  return true
}

async function ensureCheckout(name, config, sourceRoot) {
  const target = path.join(sourceRoot, name)
  let created = false
  if (!(await exists(path.join(target, '.git')))) {
    await run('git', ['clone', '--filter=blob:none', '--no-checkout', config.repository, target])
    created = true
  }
  if (created) {
    await run('git', ['fetch', '--depth', '1', 'origin', config.commit], { cwd: target })
    await run('git', ['checkout', '--detach', config.commit], { cwd: target })
    return target
  }
  const current = await run('git', ['rev-parse', 'HEAD'], { cwd: target, allowFailure: true })
  const dirty = await run('git', ['status', '--porcelain'], { cwd: target })
  if (dirty.stdout && !(current.stdout === config.commit && await isExactPatchedCheckout(target, config))) {
    throw new Error(`${target} has changes outside the audited patch; refusing to replace them`)
  }
  if (current.stdout === config.commit) return target
  await run('git', ['fetch', '--depth', '1', 'origin', config.commit], { cwd: target })
  await run('git', ['checkout', '--detach', config.commit], { cwd: target })
  const actual = await run('git', ['rev-parse', 'HEAD'], { cwd: target })
  if (actual.stdout !== config.commit) throw new Error(`${name} resolved to unexpected commit ${actual.stdout}`)
  return target
}

async function applyPatch(checkout, relativePatch) {
  if (!relativePatch) return
  const patchFile = path.resolve(repositoryRoot, 'third_party', relativePatch)
  const forward = await run('git', ['apply', '--check', patchFile], { cwd: checkout, allowFailure: true })
  if (forward.code === 0) {
    await run('git', ['apply', patchFile], { cwd: checkout })
    return
  }
  const reverse = await run('git', ['apply', '--reverse', '--check', patchFile], { cwd: checkout, allowFailure: true })
  if (reverse.code !== 0) throw new Error(`patch neither applies nor is already applied: ${patchFile}`)
}

async function assertPatchedFiles(checkout, config) {
  if (!config.patchedFiles) return
  if (!(await isExactPatchedCheckout(checkout, config))) {
    throw new Error(`patched checkout does not match audited hashes: ${checkout}`)
  }
}

const defaultDshHome = process.env.DSH_HOME ? path.resolve(process.env.DSH_HOME) : path.join(os.homedir(), '.dsh')
const stateRoot = path.resolve(argument('--root') ?? path.join(defaultDshHome, 'social-workbench', 'sidecars'))
if (stateRoot === path.parse(stateRoot).root || stateRoot === os.homedir()) throw new Error('refusing broad sidecar root')

const sourceRoot = path.join(stateRoot, 'src')
const binRoot = path.join(stateRoot, 'bin')
await mkdir(sourceRoot, { recursive: true, mode: 0o700 })
await mkdir(binRoot, { recursive: true, mode: 0o700 })

const xhs = await ensureCheckout('xiaohongshu-mcp', manifest.sidecars.xiaohongshu, sourceRoot)
const douyin = await ensureCheckout('broadcast-kit', manifest.sidecars.douyin, sourceRoot)
await applyPatch(douyin, manifest.sidecars.douyin.patch)
await assertPatchedFiles(douyin, manifest.sidecars.douyin)

const xhsBinary = path.join(binRoot, 'xiaohongshu-mcp')
await run('go', ['build', '-trimpath', '-o', xhsBinary, '.'], { cwd: xhs })
const xhsLoginBinary = path.join(binRoot, 'xiaohongshu-login')
await run('go', ['build', '-trimpath', '-o', xhsLoginBinary, './cmd/login'], { cwd: xhs })

const python = argument('--python') ?? 'python3'
const venv = path.join(stateRoot, 'broadcast-kit-venv')
if (!(await exists(path.join(venv, 'bin', 'python')))) await run(python, ['-m', 'venv', venv])
const venvPython = path.join(venv, 'bin', 'python')
await run(venvPython, ['-m', 'pip', 'install', '--disable-pip-version-check', '-e', douyin, `imageio-ffmpeg==${manifest.tooling.imageioFfmpeg}`])
// The publishers launch a visible browser. Avoid downloading the separate
// headless-shell artifact, which is unused and can stall on some CDN routes.
await run(venvPython, ['-m', 'playwright', 'install', 'chromium', '--no-shell', '--no-progress'])

const ffmpegLookup = await run(venvPython, ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'])
const ffmpegLink = path.join(binRoot, 'ffmpeg')
await rm(ffmpegLink, { force: true })
await symlink(ffmpegLookup.stdout, ffmpegLink)

const result = {
  schemaVersion: 'social-workbench.bootstrap/v1',
  stateRoot,
  xiaohongshu: { commit: manifest.sidecars.xiaohongshu.commit, binary: xhsBinary, loginBinary: xhsLoginBinary },
  douyin: {
    commit: manifest.sidecars.douyin.commit,
    python: venvPython,
    source: douyin,
    ffmpeg: ffmpegLink,
    patch: manifest.sidecars.douyin.patch,
  },
  next: 'Run doctor; bootstrap never logs in or publishes.',
}
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
