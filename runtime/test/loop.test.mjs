import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { PublicationLoop } from '../src/orchestrator.mjs'
import { LoopStore } from '../src/store.mjs'

function revisionInput(mediaPath) {
  return {
    platform: 'xiaohongshu',
    accountRef: 'credential:test-account',
    visibility: 'private',
    testMode: true,
    content: {
      title: '私密测试',
      body: 'SWB-LOOP',
      verifyMarker: 'SWB-LOOP',
      media: [{ kind: 'image', path: mediaPath }],
    },
  }
}

test('loop persists a confirmed receipt without the confirmation secret', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'social-loop-test-'))
  const mediaPath = path.join(root, 'owned.png')
  await writeFile(mediaPath, 'owned test fixture')
  const adapter = {
    async doctor() { return { ready: true } },
    async baseline() { return { feedIds: ['old'] } },
    async submit(_revision, { baseline }) { return { submitted: true, baseline, evidenceRefs: ['evidence://submit'] } },
    async verify() {
      return {
        confirmed: true,
        platformObject: { id: 'note-001', url: 'https://example.invalid/note-001' },
        checks: [{ name: 'new_creator_record', result: 'pass' }],
      }
    },
  }
  const loop = new PublicationLoop({ store: new LoopStore(root), adapters: { xiaohongshu: adapter } })
  const revision = await loop.prepare(revisionInput(mediaPath))
  const confirmation = await loop.confirm(revision.revisionHash)
  const receipt = await loop.execute({
    revisionHash: revision.revisionHash,
    confirmationId: confirmation.confirmationId,
    confirmationToken: confirmation.token,
  })
  assert.equal(receipt.state, 'confirmed')
  const persisted = await readFile(path.join(root, 'receipts', `${receipt.attemptId}.json`), 'utf8')
  assert.equal(persisted.includes(confirmation.token), false)

  await assert.rejects(
    loop.execute({
      revisionHash: revision.revisionHash,
      confirmationId: confirmation.confirmationId,
      confirmationToken: confirmation.token,
    }),
    /already been consumed/,
  )
})

test('post-submit verification failure becomes unknown, never failed or confirmed', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'social-loop-test-'))
  const mediaPath = path.join(root, 'owned.png')
  await writeFile(mediaPath, 'owned test fixture')
  const adapter = {
    async doctor() { return { ready: true } },
    async baseline() { return {} },
    async submit() { return { submitted: true } },
    async verify() { throw new Error('creator page timed out') },
  }
  const loop = new PublicationLoop({ store: new LoopStore(root), adapters: { xiaohongshu: adapter } })
  const revision = await loop.prepare(revisionInput(mediaPath))
  const confirmation = await loop.confirm(revision.revisionHash)
  const receipt = await loop.execute({ revisionHash: revision.revisionHash, confirmationId: confirmation.confirmationId, confirmationToken: confirmation.token })
  assert.equal(receipt.state, 'unknown')
  assert.equal(receipt.error.code, 'VERIFICATION_FAILED')
})

test('media changes invalidate execution before consuming confirmation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'social-loop-test-'))
  const mediaPath = path.join(root, 'owned.png')
  await writeFile(mediaPath, 'first bytes')
  const store = new LoopStore(root)
  const loop = new PublicationLoop({ store, adapters: { xiaohongshu: {} } })
  const revision = await loop.prepare(revisionInput(mediaPath))
  const confirmation = await loop.confirm(revision.revisionHash)
  await writeFile(mediaPath, 'changed bytes')
  await assert.rejects(
    loop.execute({ revisionHash: revision.revisionHash, confirmationId: confirmation.confirmationId, confirmationToken: confirmation.token }),
    /media changed after revision/,
  )
  const record = await store.read('confirmations', confirmation.confirmationId)
  assert.equal(record.consumedAt, null)
})

test('execution manifest changes invalidate execution before consuming confirmation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'social-loop-test-'))
  const mediaPath = path.join(root, 'owned.mp4')
  const manifestPath = path.join(root, 'manifest.json')
  await writeFile(mediaPath, 'video bytes')
  await writeFile(manifestPath, '{"title":"first"}')
  const store = new LoopStore(root)
  const loop = new PublicationLoop({ store, adapters: { douyin: {} } })
  const revision = await loop.prepare({
    ...revisionInput(mediaPath),
    platform: 'douyin',
    accountRef: 'credential:douyin-test',
    content: { ...revisionInput(mediaPath).content, media: [{ kind: 'video', path: mediaPath }] },
    execution: { manifestPath },
  })
  const confirmation = await loop.confirm(revision.revisionHash)
  await writeFile(manifestPath, '{"title":"changed"}')
  await assert.rejects(
    loop.execute({ revisionHash: revision.revisionHash, confirmationId: confirmation.confirmationId, confirmationToken: confirmation.token }),
    /execution manifest changed after revision/,
  )
  const record = await store.read('confirmations', confirmation.confirmationId)
  assert.equal(record.consumedAt, null)
})
