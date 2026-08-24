import assert from 'node:assert/strict'
import { access, mkdtemp, readdir, utimes, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { LoopStore } from '../src/store.mjs'

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'social-store-test-'))
  const store = new LoopStore(root, { staleLockMs: 20, artifactRetentionMs: 1_000 })
  await store.init()
  return { root, store }
}

test('immutable writes recover a crash-partial target without overwriting valid data', async () => {
  const { root, store } = await fixture()
  const id = 'revision_partial'
  await writeFile(store.file('revisions', id), '{"incomplete"', { mode: 0o600 })

  const value = { schemaVersion: 'test/v1', revisionHash: 'sha256:fixture' }
  assert.deepEqual(await store.writeImmutable('revisions', id, value), value)
  assert.deepEqual(await store.read('revisions', id), value)

  const artifacts = await readdir(path.join(root, 'revisions'))
  assert.equal(artifacts.some((name) => name.startsWith(`${id}.json.`) && name.endsWith('.corrupt')), true)
})

test('mutations recover an expired lock left by a crashed process', async () => {
  const { store } = await fixture()
  const id = 'revision_locked'
  await store.writeImmutable('revisions', id, { stateVersion: 1 })
  const lock = `${store.file('revisions', id)}.lock`
  await writeFile(lock, 'crashed owner', { mode: 0o600 })
  const old = new Date(Date.now() - 60_000)
  await utimes(lock, old, old)

  const next = await store.mutate('revisions', id, (current) => ({ ...current, stateVersion: 2 }), { waitMs: 200 })
  assert.equal(next.stateVersion, 2)
  assert.equal((await store.read('revisions', id)).stateVersion, 2)
  await assert.rejects(access(lock), { code: 'ENOENT' })
})

test('concurrent immutable writers preserve exactly one valid value', async () => {
  const { store } = await fixture()
  const writes = await Promise.allSettled([
    store.writeImmutable('revisions', 'revision_race', { winner: 'left' }),
    store.writeImmutable('revisions', 'revision_race', { winner: 'right' }),
  ])
  assert.equal(writes.filter((item) => item.status === 'fulfilled').length, 1)
  assert.equal(writes.filter((item) => item.status === 'rejected').length, 1)
  assert.equal(['left', 'right'].includes((await store.read('revisions', 'revision_race')).winner), true)
})
