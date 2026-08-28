import { readdir, realpath } from 'node:fs/promises'
import path from 'node:path'
import { ContentPipeline } from '../runtime/src/content-pipeline.mjs'
import { PublicationLoop } from '../runtime/src/orchestrator.mjs'
import { SocialLoopControl } from '../runtime/src/loop-control.mjs'
import { LoopStore } from '../runtime/src/store.mjs'
import { createCapabilityRegistry } from './capabilities.js'

const READABLE_COLLECTIONS = new Set([
  'sources',
  'source-items',
  'research-runs',
  'video-transcripts',
  'briefs',
  'packages',
  'revisions',
  'plans',
  'outbox',
  'receipts',
  'reconciliations',
  'metric-snapshots',
  'feedback-items',
  'hypothesis-reviews',
])

function inside(root, candidate) {
  const relative = path.relative(root, candidate)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

export function resolveSocialWorkbenchRoot(value, env = process.env) {
  const dshHome = env.DSH_HOME || path.join(env.HOME || process.cwd(), '.dsh')
  const expanded = String(value || '$DSH_HOME/social-workbench')
    .replaceAll('$DSH_HOME', dshHome)
    .replaceAll('$HOME', env.HOME || process.cwd())
  return path.resolve(path.isAbsolute(expanded) ? expanded : path.join(process.cwd(), expanded))
}

export class SocialWorkbenchService {
  constructor(root, {
    sidecarRoot = path.resolve(root, '..', 'sidecars'),
    xiaohongshuUrl = 'http://127.0.0.1:18060',
    fetchImpl,
    clock,
  } = {}) {
    this.store = new LoopStore(root)
    this.publicationLoop = new PublicationLoop({ store: this.store })
    this.contentPipeline = new ContentPipeline({ store: this.store, publicationLoop: this.publicationLoop })
    this.loopControl = new SocialLoopControl({
      store: this.store,
      publicationLoop: this.publicationLoop,
      contentPipeline: this.contentPipeline,
    })
    this.capabilityRegistry = createCapabilityRegistry({ root, sidecarRoot, xiaohongshuUrl, fetchImpl, clock })
  }

  async init() {
    await this.store.init()
    return this.activity()
  }

  async activity() {
    const counts = {}
    for (const collection of READABLE_COLLECTIONS) {
      const directory = path.join(this.store.root, collection)
      try {
        counts[collection] = (await readdir(directory)).filter((name) => name.endsWith('.json')).length
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error
        counts[collection] = 0
      }
    }
    return { mode: 'staging-only', counts }
  }

  async capabilitySnapshot() {
    await this.store.init()
    return this.capabilityRegistry.snapshot({ activity: await this.activity() })
  }

  async loopDashboard() {
    await this.store.init()
    return this.loopControl.dashboard()
  }

  async status() {
    const snapshot = await this.capabilitySnapshot()
    return {
      schemaVersion: 'social-workbench.status/v2',
      mode: snapshot.activity.mode,
      counts: snapshot.activity.counts,
      overall: snapshot.overall,
      summary: snapshot.summary,
      capabilities: snapshot.capabilities,
      generatedAt: snapshot.generatedAt,
    }
  }

  async ingest(input, workspaceRoot) {
    if (!workspaceRoot) throw new Error('ingest requires an Agent Workspace')
    const canonicalWorkspace = await realpath(workspaceRoot)
    const attachments = []
    for (const item of input?.attachments ?? []) {
      const unresolved = path.isAbsolute(item.path) ? item.path : path.resolve(canonicalWorkspace, item.path)
      const canonical = await realpath(unresolved)
      if (!inside(canonicalWorkspace, canonical)) throw new Error(`media path escapes the current Workspace: ${item.path}`)
      attachments.push({ ...item, path: canonical })
    }
    return this.contentPipeline.ingest({ ...input, attachments }, { baseDir: canonicalWorkspace })
  }

  createBrief(input) {
    return this.contentPipeline.createBrief(input)
  }

  buildPackage(input) {
    return this.contentPipeline.buildPackage(input)
  }

  read(collection, id) {
    if (!READABLE_COLLECTIONS.has(collection)) throw new Error(`collection is not model-readable: ${collection}`)
    return this.store.read(collection, id)
  }
}
