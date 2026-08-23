import assert from 'node:assert/strict'
import test from 'node:test'
import {
  consumeConfirmationRecord,
  createAttempt,
  createRevision,
  issueConfirmationRecord,
  transitionAttempt,
} from '../src/domain.mjs'

function input(overrides = {}) {
  return {
    platform: 'xiaohongshu',
    accountRef: 'credential:xhs-test',
    visibility: 'private',
    testMode: true,
    content: {
      title: '闭环测试 001',
      body: '仅用于私密闭环测试 SWB-001',
      verifyMarker: 'SWB-001',
      media: [{ kind: 'image', path: '/tmp/owned-image.png' }],
    },
    ...overrides,
  }
}

test('revision hash excludes preparedAt and is deterministic', () => {
  const first = createRevision(input(), { now: new Date('2026-01-01T00:00:00Z') })
  const second = createRevision(input(), { now: new Date('2026-01-02T00:00:00Z') })
  assert.equal(first.revisionHash, second.revisionHash)
  assert.notEqual(first.preparedAt, second.preparedAt)
})

test('test mode cannot silently become public', () => {
  assert.throws(() => createRevision(input({ visibility: 'public' })), /requires private visibility/)
})

test('confirmation is bound to revision and is one-time', () => {
  const now = new Date('2026-01-01T00:00:00Z')
  const revision = createRevision(input(), { now })
  const { token, record } = issueConfirmationRecord(revision, { now, ttlMs: 60_000 })
  const consumed = consumeConfirmationRecord(record, token, revision, 'attempt_one', { now })
  assert.equal(consumed.consumedByAttemptId, 'attempt_one')
  assert.throws(() => consumeConfirmationRecord(consumed, token, revision, 'attempt_two', { now }), /already been consumed/)
})

test('confirmation rejects revision drift and expiry', () => {
  const now = new Date('2026-01-01T00:00:00Z')
  const revision = createRevision(input(), { now })
  const changed = createRevision(input({ content: { ...input().content, title: '已修改标题' } }), { now })
  const { token, record } = issueConfirmationRecord(revision, { now, ttlMs: 1_000 })
  assert.throws(() => consumeConfirmationRecord(record, token, changed, 'attempt_one', { now }), /does not match revision/)
  assert.throws(
    () => consumeConfirmationRecord(record, token, revision, 'attempt_one', { now: new Date(now.getTime() + 1_001) }),
    /expired/,
  )
})

test('confirmed needs a real object id or platform queue evidence', () => {
  const revision = createRevision(input())
  const attempt = transitionAttempt(createAttempt(revision, 'confirmation_one'), 'submitted')
  assert.throws(() => transitionAttempt(attempt, 'confirmed'), /platform object id or creator-queue evidence/)
  assert.equal(
    transitionAttempt(attempt, 'confirmed', { platformObject: { id: 'note-123' } }).state,
    'confirmed',
  )
  assert.equal(
    transitionAttempt(attempt, 'confirmed', {
      confirmationBasis: { kind: 'creator_queue_match', evidenceRef: 'file:///tmp/queue.txt' },
    }).state,
    'confirmed',
  )
})
