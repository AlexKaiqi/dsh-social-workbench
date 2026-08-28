import { spawn } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(path.join(projectRoot, 'third_party', 'sidecars.json'), 'utf8'))

function option(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function flag(name) {
  return process.argv.includes(name)
}

function run(command, args, { cwd, env = {} } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)))
  })
}

if (!flag('--accept-mediacrawler-license')) {
  throw new Error('MediaCrawler is restricted to non-commercial learning/research; --accept-mediacrawler-license is required')
}

const defaultDshHome = process.env.DSH_HOME ? path.resolve(process.env.DSH_HOME) : path.join(os.homedir(), '.dsh')
const workbenchRoot = path.resolve(option('--workbench-root') ?? path.join(defaultDshHome, 'social-workbench'))
if (workbenchRoot === path.parse(workbenchRoot).root || workbenchRoot === os.homedir()) throw new Error('refusing broad workbench root')
const state = path.join(workbenchRoot, 'sidecars', 'state', 'douyin-research')
const artifacts = path.join(workbenchRoot, 'research-artifacts')
await mkdir(state, { recursive: true, mode: 0o700 })
await mkdir(artifacts, { recursive: true, mode: 0o700 })

const compose = path.join(projectRoot, 'docker', 'douyin-research', 'compose.yaml')
const port = option('--port') ?? '7900'
await run('docker', ['compose', '-f', compose, 'up', '-d', '--build'], {
  cwd: projectRoot,
  env: {
    DSH_SOCIAL_DOUYIN_RESEARCH_STATE: state,
    DSH_SOCIAL_DOUYIN_RESEARCH_ARTIFACTS: artifacts,
    DSH_SOCIAL_DOUYIN_RESEARCH_PORT: port,
    DSH_SOCIAL_MEDIACRAWLER_COMMIT: manifest.sidecars.douyinResearch.commit,
    DSH_SOCIAL_UV_VERSION: manifest.tooling.uv,
    DSH_SOCIAL_FASTER_WHISPER_VERSION: manifest.tooling.fasterWhisper,
  },
})

process.stdout.write(`${JSON.stringify({
  schemaVersion: 'social-workbench.douyin-research-docker/v1',
  container: 'dsh-social-douyin-research',
  image: 'dsh-social-douyin-research:0.3.0',
  commit: manifest.sidecars.douyinResearch.commit,
  state,
  artifacts,
  noVncUrl: `http://127.0.0.1:${port}/vnc.html?autoconnect=1&resize=scale`,
  next: 'Open noVNC, then run research douyin login --docker and scan the QR code.',
}, null, 2)}\n`)
