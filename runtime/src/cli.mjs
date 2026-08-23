#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DouyinBroadcastKitAdapter } from './adapters/douyin-broadcast-kit.mjs'
import { XiaohongshuHttpAdapter } from './adapters/xhs-http.mjs'
import { PublicationLoop } from './orchestrator.mjs'
import { LoopStore } from './store.mjs'
import { ContentPipeline } from './content-pipeline.mjs'

const runtimeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectRoot = path.resolve(runtimeRoot, '..')

function option(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function requiredOption(name) {
  const value = option(name)
  if (!value) throw new Error(`${name} is required`)
  return value
}

function flag(name) {
  return process.argv.includes(name)
}

function defaultDshHome() {
  return process.env.DSH_HOME ? path.resolve(process.env.DSH_HOME) : path.join(os.homedir(), '.dsh')
}

function paths() {
  const workbenchRoot = path.resolve(option('--workbench-root') ?? path.join(defaultDshHome(), 'social-workbench'))
  return {
    runtimeState: path.resolve(option('--state-root') ?? path.join(workbenchRoot, 'runtime')),
    sidecars: path.resolve(option('--sidecar-root') ?? path.join(workbenchRoot, 'sidecars')),
  }
}

function xhsAdapter() {
  return new XiaohongshuHttpAdapter({
    baseUrl: option('--url') ?? 'http://127.0.0.1:18060',
    token: process.env.DSH_SOCIAL_XHS_TOKEN,
  })
}

function douyinAdapter(sidecars) {
  return new DouyinBroadcastKitAdapter({
    python: path.join(sidecars, 'broadcast-kit-venv', 'bin', 'python'),
    cwd: path.join(sidecars, 'src', 'broadcast-kit'),
    stateDir: path.join(sidecars, 'state'),
    binaryDir: path.join(sidecars, 'bin'),
    account: option('--account') ?? 'default',
    allowLivePrivate: true,
  })
}

async function main() {
  const command = process.argv[2]
  const platform = process.argv[3]
  const resolved = paths()
  const store = new LoopStore(resolved.runtimeState)
  const publicationLoop = new PublicationLoop({ store })
  const contentPipeline = new ContentPipeline({ store, publicationLoop })

  if (command === 'ingest') {
    const inputPath = path.resolve(requiredOption('--input'))
    const input = JSON.parse(await readFile(inputPath, 'utf8'))
    process.stdout.write(`${JSON.stringify(await contentPipeline.ingest(input, { baseDir: path.dirname(inputPath) }), null, 2)}\n`)
    return
  }

  if (command === 'brief') {
    const inputPath = path.resolve(requiredOption('--input'))
    const input = JSON.parse(await readFile(inputPath, 'utf8'))
    process.stdout.write(`${JSON.stringify(await contentPipeline.createBrief(input), null, 2)}\n`)
    return
  }

  if (command === 'package') {
    const inputPath = path.resolve(requiredOption('--input'))
    const input = JSON.parse(await readFile(inputPath, 'utf8'))
    process.stdout.write(`${JSON.stringify(await contentPipeline.buildPackage(input), null, 2)}\n`)
    return
  }

  if (command === 'prepare') {
    const inputPath = path.resolve(requiredOption('--input'))
    const input = JSON.parse(await readFile(inputPath, 'utf8'))
    const loop = new PublicationLoop({ store })
    process.stdout.write(`${JSON.stringify(await loop.prepare(input, { baseDir: path.dirname(inputPath) }), null, 2)}\n`)
    return
  }

  if (command === 'confirm') {
    const loop = new PublicationLoop({ store })
    const result = await loop.confirm(requiredOption('--revision'), {
      ttlMs: Number(option('--ttl-ms') ?? 10 * 60_000),
    })
    process.stdout.write(`${JSON.stringify({
      ...result,
      warning: 'The token is shown once. Put it in DSH_SOCIAL_CONFIRMATION_TOKEN; do not save it in Git or chat.',
    }, null, 2)}\n`)
    return
  }

  if (command === 'doctor') {
    if (platform === 'xiaohongshu') {
      process.stdout.write(`${JSON.stringify(await xhsAdapter().doctor({ liveLoginCheck: flag('--live-login-check') }), null, 2)}\n`)
      return
    }
    if (platform === 'douyin') {
      process.stdout.write(`${JSON.stringify(await douyinAdapter(resolved.sidecars).doctor({ liveLoginCheck: flag('--live-login-check') }), null, 2)}\n`)
      return
    }
    throw new Error('doctor requires platform xiaohongshu or douyin')
  }

  if (command === 'dry-run' && platform === 'douyin') {
    const revisionHash = requiredOption('--revision')
    const revision = await store.read('revisions', revisionHash.replace('sha256:', ''))
    if (revision.platform !== 'douyin') throw new Error('revision is not for douyin')
    const adapter = douyinAdapter(resolved.sidecars)
    const doctor = await adapter.doctor({ liveLoginCheck: true })
    if (!doctor.ready) throw new Error('Douyin sidecar is not ready or account is not logged in')
    const result = await adapter.submit(revision, { dryRun: true })
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  if (command === 'execute') {
    if (!['xiaohongshu', 'douyin'].includes(platform)) throw new Error('execute requires platform xiaohongshu or douyin')
    const token = process.env.DSH_SOCIAL_CONFIRMATION_TOKEN
    if (!token) throw new Error('DSH_SOCIAL_CONFIRMATION_TOKEN is required and is never accepted as a CLI argument')
    const adapters = {
      xiaohongshu: xhsAdapter(),
      douyin: douyinAdapter(resolved.sidecars),
    }
    const loop = new PublicationLoop({ store, adapters })
    const receipt = await loop.execute({
      revisionHash: requiredOption('--revision'),
      confirmationId: requiredOption('--confirmation-id'),
      confirmationToken: token,
    })
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`)
    if (receipt.state !== 'confirmed') process.exitCode = 2
    return
  }

  process.stdout.write(`DSH Social Workbench runtime\n\n`)
  process.stdout.write(`  social ingest --input <source.json>\n`)
  process.stdout.write(`  social brief --input <brief.json>\n`)
  process.stdout.write(`  social package --input <package.json>\n`)
  process.stdout.write(`  social prepare --input <revision.json>\n`)
  process.stdout.write(`  social confirm --revision <sha256:...>\n`)
  process.stdout.write(`  social doctor <xiaohongshu|douyin> [--live-login-check]\n`)
  process.stdout.write(`  social dry-run douyin --revision <sha256:...>\n`)
  process.stdout.write(`  social execute <xiaohongshu|douyin> --revision <sha256:...> --confirmation-id <id>\n`)
}

main().catch((error) => {
  process.stderr.write(`${JSON.stringify({ error: error.message, projectRoot }, null, 2)}\n`)
  process.exitCode = 1
})
