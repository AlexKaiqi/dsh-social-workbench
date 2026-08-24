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
import { SocialLoopControl } from './loop-control.mjs'

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

async function readInput() {
  const inputPath = path.resolve(requiredOption('--input'))
  return { input: JSON.parse(await readFile(inputPath, 'utf8')), inputPath }
}

function adapters(resolved) {
  return {
    xiaohongshu: xhsAdapter(),
    douyin: douyinAdapter(resolved.sidecars),
  }
}

async function main() {
  const command = process.argv[2]
  const platform = process.argv[3]
  const resolved = paths()
  const store = new LoopStore(resolved.runtimeState)
  const publicationLoop = new PublicationLoop({ store })
  const contentPipeline = new ContentPipeline({ store, publicationLoop })
  const loopControl = new SocialLoopControl({ store, publicationLoop, contentPipeline })

  if (command === 'ingest') {
    const { input, inputPath } = await readInput()
    process.stdout.write(`${JSON.stringify(await contentPipeline.ingest(input, { baseDir: path.dirname(inputPath) }), null, 2)}\n`)
    return
  }

  if (command === 'brief') {
    const { input } = await readInput()
    process.stdout.write(`${JSON.stringify(await contentPipeline.createBrief(input), null, 2)}\n`)
    return
  }

  if (command === 'package') {
    const { input } = await readInput()
    process.stdout.write(`${JSON.stringify(await contentPipeline.buildPackage(input), null, 2)}\n`)
    return
  }

  if (command === 'prepare') {
    const { input, inputPath } = await readInput()
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

  if (command === 'plan') {
    const { input } = await readInput()
    process.stdout.write(`${JSON.stringify(await loopControl.createPlan(input), null, 2)}\n`)
    return
  }

  if (command === 'approve-plan') {
    const result = await loopControl.approvePlan(requiredOption('--plan'), {
      approvedBy: option('--approved-by') ?? 'local-user',
      ttlMs: Number(option('--ttl-ms') ?? 24 * 60 * 60_000),
    })
    process.stdout.write(`${JSON.stringify({
      ...result,
      warning: 'This approval only permits local outbox staging. Each revision still requires its own one-time confirmation before execution.',
    }, null, 2)}\n`)
    return
  }

  if (command === 'enqueue-plan') {
    process.stdout.write(`${JSON.stringify(await loopControl.enqueuePlan(requiredOption('--plan')), null, 2)}\n`)
    return
  }

  if (command === 'execute-item') {
    const token = process.env.DSH_SOCIAL_CONFIRMATION_TOKEN
    if (!token) throw new Error('DSH_SOCIAL_CONFIRMATION_TOKEN is required and is never accepted as a CLI argument')
    const executingLoop = new PublicationLoop({ store, adapters: adapters(resolved) })
    const executingControl = new SocialLoopControl({ store, publicationLoop: executingLoop, contentPipeline })
    const receipt = await executingControl.executeItem({
      outboxId: requiredOption('--outbox'),
      confirmationId: requiredOption('--confirmation-id'),
      confirmationToken: token,
    })
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`)
    if (receipt.state !== 'confirmed') process.exitCode = 2
    return
  }

  if (command === 'reconcile') {
    const { input } = await readInput()
    process.stdout.write(`${JSON.stringify(await loopControl.reconcile(input), null, 2)}\n`)
    return
  }

  if (command === 'metric') {
    const { input } = await readInput()
    process.stdout.write(`${JSON.stringify(await loopControl.recordMetric(input), null, 2)}\n`)
    return
  }

  if (command === 'feedback') {
    const { input } = await readInput()
    process.stdout.write(`${JSON.stringify(await loopControl.recordFeedback(input), null, 2)}\n`)
    return
  }

  if (command === 'collect') {
    if (platform !== 'xiaohongshu') throw new Error('automatic feedback collection is currently verified only for xiaohongshu')
    const collector = xhsAdapter()
    const doctor = await collector.doctor({ liveLoginCheck: true })
    if (!doctor.ready) throw new Error('Xiaohongshu sidecar is not ready or the user is not logged in')
    process.stdout.write(`${JSON.stringify(await loopControl.collectFeedback(
      requiredOption('--outbox'),
      collector,
      { limit: Number(option('--limit') ?? 50) },
    ), null, 2)}\n`)
    return
  }

  if (command === 'review') {
    const { input } = await readInput()
    process.stdout.write(`${JSON.stringify(await loopControl.createReview(input), null, 2)}\n`)
    return
  }

  if (command === 'next-brief') {
    process.stdout.write(`${JSON.stringify(await loopControl.createNextBrief(requiredOption('--review')), null, 2)}\n`)
    return
  }

  if (command === 'dashboard') {
    process.stdout.write(`${JSON.stringify(await loopControl.dashboard(), null, 2)}\n`)
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
    const loop = new PublicationLoop({ store, adapters: adapters(resolved) })
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
  process.stdout.write(`  social plan --input <plan.json>\n`)
  process.stdout.write(`  social approve-plan --plan <plan_id> [--ttl-ms <ms>]\n`)
  process.stdout.write(`  social enqueue-plan --plan <plan_id>\n`)
  process.stdout.write(`  social execute-item --outbox <outbox_id> --confirmation-id <id>\n`)
  process.stdout.write(`  social reconcile --input <reconciliation.json>\n`)
  process.stdout.write(`  social metric --input <metric-snapshot.json>\n`)
  process.stdout.write(`  social feedback --input <feedback.json>\n`)
  process.stdout.write(`  social collect xiaohongshu --outbox <outbox_id> [--limit <1-200>]\n`)
  process.stdout.write(`  social review --input <hypothesis-review.json>\n`)
  process.stdout.write(`  social next-brief --review <review_id>\n`)
  process.stdout.write(`  social dashboard\n`)
  process.stdout.write(`  social doctor <xiaohongshu|douyin> [--live-login-check]\n`)
  process.stdout.write(`  social dry-run douyin --revision <sha256:...>\n`)
  process.stdout.write(`  social execute <xiaohongshu|douyin> --revision <sha256:...> --confirmation-id <id>\n`)
}

main().catch((error) => {
  process.stderr.write(`${JSON.stringify({ error: error.message, projectRoot }, null, 2)}\n`)
  process.exitCode = 1
})
