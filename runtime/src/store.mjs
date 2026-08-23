import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { assertSafeId, stableStringify } from './domain.mjs'

const COLLECTIONS = new Set(['sources', 'briefs', 'packages', 'revisions', 'confirmations', 'attempts', 'receipts'])

function serialized(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

export class LoopStore {
  constructor(root) {
    if (!root) throw new Error('state root is required')
    this.root = path.resolve(root)
  }

  async init() {
    await Promise.all([...COLLECTIONS].map((name) => mkdir(path.join(this.root, name), { recursive: true, mode: 0o700 })))
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

  async writeImmutable(collection, id, value) {
    await this.init()
    const target = this.file(collection, id)
    try {
      const handle = await open(target, 'wx', 0o600)
      try { await handle.writeFile(serialized(value), 'utf8') } finally { await handle.close() }
      return value
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error
      const existing = await this.read(collection, id)
      if (stableStringify(existing) !== stableStringify(value)) throw new Error(`immutable ${collection}/${id} already exists with different content`)
      return existing
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
        handle = await open(lock, 'wx', 0o600)
      } catch (error) {
        if (error?.code !== 'EEXIST' || Date.now() >= deadline) throw new Error(`state lock unavailable: ${collection}/${id}`)
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
    }
    try {
      const current = await this.read(collection, id)
      const next = await mutator(current)
      const temporary = `${target}.${process.pid}.${Date.now()}.tmp`
      await writeFile(temporary, serialized(next), { encoding: 'utf8', mode: 0o600, flag: 'wx' })
      await rename(temporary, target)
      return next
    } finally {
      await handle.close()
      await unlink(lock).catch(() => {})
    }
  }
}
