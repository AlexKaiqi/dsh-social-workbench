import { randomUUID } from 'node:crypto'
import { link, mkdir, open, readFile, readdir, rename, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import { assertSafeId, stableStringify } from './domain.mjs'

export const COLLECTIONS = new Set([
  'sources',
  'source-items',
  'research-runs',
  'research-media',
  'video-transcripts',
  'briefs',
  'packages',
  'revisions',
  'plans',
  'outbox',
  'confirmations',
  'attempts',
  'receipts',
  'reconciliations',
  'metric-snapshots',
  'feedback-items',
  'hypothesis-reviews',
])

function serialized(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

async function syncDirectory(directory) {
  const handle = await open(directory, 'r')
  try {
    await handle.sync()
  } finally {
    await handle.close()
  }
}

async function writeDurable(file, value) {
  const handle = await open(file, 'wx', 0o600)
  try {
    await handle.writeFile(serialized(value), 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
}

export class LoopStore {
  constructor(root, {
    staleLockMs = 30_000,
    artifactRetentionMs = 7 * 24 * 60 * 60_000,
    clock = () => Date.now(),
  } = {}) {
    if (!root) throw new Error('state root is required')
    if (!Number.isSafeInteger(staleLockMs) || staleLockMs < 1) throw new Error('staleLockMs must be a positive integer')
    if (!Number.isSafeInteger(artifactRetentionMs) || artifactRetentionMs < staleLockMs) {
      throw new Error('artifactRetentionMs must be an integer greater than or equal to staleLockMs')
    }
    this.root = path.resolve(root)
    this.staleLockMs = staleLockMs
    this.artifactRetentionMs = artifactRetentionMs
    this.clock = clock
    this.initializing = null
  }

  async init() {
    if (!this.initializing) {
      this.initializing = this.initialize().catch((error) => {
        this.initializing = null
        throw error
      })
    }
    await this.initializing
  }

  async initialize() {
    await Promise.all([...COLLECTIONS].map((name) => mkdir(path.join(this.root, name), { recursive: true, mode: 0o700 })))
    await Promise.all([...COLLECTIONS].map((name) => this.cleanupCollection(path.join(this.root, name))))
  }

  async cleanupCollection(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    await Promise.all(entries.map(async (entry) => {
      if (!entry.isFile()) return
      const isLock = entry.name.endsWith('.json.lock')
      const isArtifact = /\.json\..+\.(?:tmp|corrupt|stale)$/.test(entry.name)
      if (!isLock && !isArtifact) return
      const file = path.join(directory, entry.name)
      let metadata
      try {
        metadata = await stat(file)
      } catch (error) {
        if (error?.code === 'ENOENT') return
        throw error
      }
      const age = this.clock() - metadata.mtimeMs
      const retention = isLock ? this.staleLockMs : this.artifactRetentionMs
      if (age >= retention) await unlink(file).catch((error) => {
        if (error?.code !== 'ENOENT') throw error
      })
    }))
  }

  file(collection, id) {
    if (!COLLECTIONS.has(collection)) throw new Error(`unknown collection: ${collection}`)
    assertSafeId(id)
    const target = path.resolve(this.root, collection, `${id}.json`)
    const expected = `${path.resolve(this.root, collection)}${path.sep}`
    if (!target.startsWith(expected)) throw new Error('state path escapes collection')
    return target
  }

  async read(collection, id) {
    return JSON.parse(await readFile(this.file(collection, id), 'utf8'))
  }

  async readOptional(collection, id) {
    try { return await this.read(collection, id) } catch (error) {
      if (error?.code === 'ENOENT') return null
      throw error
    }
  }

  async list(collection) {
    await this.init()
    if (!COLLECTIONS.has(collection)) throw new Error(`unknown collection: ${collection}`)
    const directory = path.join(this.root, collection)
    const names = (await readdir(directory))
      .filter((name) => name.endsWith('.json'))
      .sort()
    return Promise.all(names.map((name) => this.read(collection, name.slice(0, -5))))
  }

  async writeImmutable(collection, id, value) {
    await this.init()
    const target = this.file(collection, id)
    const temporary = `${target}.${randomUUID()}.tmp`
    await writeDurable(temporary, value)
    try {
      for (;;) {
        try {
          await link(temporary, target)
          await syncDirectory(path.dirname(target))
          return value
        } catch (error) {
          if (error?.code !== 'EEXIST') throw error
          try {
            const existing = await this.read(collection, id)
            if (stableStringify(existing) !== stableStringify(value)) {
              throw new Error(`immutable ${collection}/${id} already exists with different content`)
            }
            return existing
          } catch (readError) {
            if (!(readError instanceof SyntaxError)) throw readError
            const corrupt = `${target}.${randomUUID()}.corrupt`
            try {
              await rename(target, corrupt)
              await syncDirectory(path.dirname(target))
            } catch (renameError) {
              if (renameError?.code !== 'ENOENT') throw renameError
            }
          }
        }
      }
    } finally {
      await unlink(temporary).catch((error) => {
        if (error?.code !== 'ENOENT') throw error
      })
    }
  }

  async recoverStaleLock(lock) {
    let metadata
    try {
      metadata = await stat(lock)
    } catch (error) {
      if (error?.code === 'ENOENT') return true
      throw error
    }
    if (this.clock() - metadata.mtimeMs < this.staleLockMs) return false
    const stale = `${lock}.${randomUUID()}.stale`
    try {
      await rename(lock, stale)
      await unlink(stale)
      return true
    } catch (error) {
      if (error?.code === 'ENOENT') return true
      throw error
    }
  }

  async mutate(collection, id, mutator, { waitMs = 2_000 } = {}) {
    await this.init()
    const target = this.file(collection, id)
    const lock = `${target}.lock`
    const deadline = Date.now() + waitMs
    let handle
    while (!handle) {
      try {
        const candidate = await open(lock, 'wx', 0o600)
        try {
          await candidate.writeFile(`${JSON.stringify({ pid: process.pid, createdAt: new Date(this.clock()).toISOString() })}\n`, 'utf8')
          await candidate.sync()
          handle = candidate
        } catch (error) {
          await candidate.close().catch(() => {})
          await unlink(lock).catch(() => {})
          throw error
        }
      } catch (error) {
        if (error?.code !== 'EEXIST') throw error
        if (await this.recoverStaleLock(lock)) continue
        if (Date.now() >= deadline) throw new Error(`state lock unavailable: ${collection}/${id}`)
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
    }
    try {
      const current = await this.read(collection, id)
      const next = await mutator(current)
      const temporary = `${target}.${randomUUID()}.tmp`
      await writeDurable(temporary, next)
      try {
        await rename(temporary, target)
        await syncDirectory(path.dirname(target))
      } finally {
        await unlink(temporary).catch((error) => {
          if (error?.code !== 'ENOENT') throw error
        })
      }
      return next
    } finally {
      await handle.close()
      await unlink(lock).catch(() => {})
    }
  }
}
