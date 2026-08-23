import { createHash, randomBytes, randomUUID } from 'node:crypto'

export const PLATFORMS = new Set(['xiaohongshu', 'douyin'])
export const VISIBILITIES = new Set(['private', 'friends', 'public'])

const TRANSITIONS = new Map([
  ['confirmed_for_submit', new Set(['submitted', 'failed', 'cancelled'])],
  ['submitted', new Set(['confirmed', 'failed', 'unknown'])],
  ['confirmed', new Set()],
  ['cancelled', new Set()],
  ['failed', new Set()],
  ['unknown', new Set()],
])

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`
}

export function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

export function assertSafeId(value, label = 'id') {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$/.test(value)) {
    throw new Error(`${label} is missing or unsafe`)
  }
  return value
}

export function createRevision(input, { now = new Date() } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('revision input must be an object')
  if (!PLATFORMS.has(input.platform)) throw new Error(`unsupported platform: ${input.platform ?? '(missing)'}`)
  assertSafeId(input.accountRef, 'accountRef')
  if (!VISIBILITIES.has(input.visibility)) throw new Error(`unsupported visibility: ${input.visibility ?? '(missing)'}`)
  if (input.testMode === true && input.visibility !== 'private') {
    throw new Error('testMode requires private visibility')
  }
  if (!input.content || typeof input.content !== 'object' || Array.isArray(input.content)) {
    throw new Error('content must be an object')
  }
  if (typeof input.content.title !== 'string' || input.content.title.trim() === '') throw new Error('content.title is required')
  if (typeof input.content.body !== 'string') throw new Error('content.body must be a string')
  if (!Array.isArray(input.content.media) || input.content.media.length === 0) throw new Error('content.media must not be empty')

  const payload = {
    schemaVersion: 'social-workbench.revision/v1',
    platform: input.platform,
    accountRef: input.accountRef,
    visibility: input.visibility,
    testMode: input.testMode === true,
    content: input.content,
    execution: input.execution ?? {},
    sourceRefs: Array.isArray(input.sourceRefs) ? input.sourceRefs : [],
  }
  const revisionHash = sha256(stableStringify(payload))
  return { ...payload, revisionHash, preparedAt: now.toISOString() }
}

export function issueConfirmationRecord(revision, { ttlMs = 10 * 60_000, now = new Date() } = {}) {
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1_000 || ttlMs > 24 * 60 * 60_000) {
    throw new Error('confirmation ttl must be between 1 second and 24 hours')
  }
  const token = randomBytes(32).toString('base64url')
  const confirmationId = `confirmation_${randomUUID()}`
  return {
    token,
    record: {
      schemaVersion: 'social-workbench.confirmation/v1',
      confirmationId,
      revisionHash: revision.revisionHash,
      platform: revision.platform,
      accountRef: revision.accountRef,
      visibility: revision.visibility,
      tokenHash: sha256(token),
      issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
      consumedAt: null,
      consumedByAttemptId: null,
    },
  }
}

export function consumeConfirmationRecord(record, token, revision, attemptId, { now = new Date() } = {}) {
  assertSafeId(attemptId, 'attemptId')
  if (record.consumedAt) throw new Error('confirmation token has already been consumed')
  if (Date.parse(record.expiresAt) <= now.getTime()) throw new Error('confirmation token has expired')
  if (record.tokenHash !== sha256(token)) throw new Error('confirmation token is invalid')
  for (const key of ['revisionHash', 'platform', 'accountRef', 'visibility']) {
    if (record[key] !== revision[key]) throw new Error(`confirmation does not match revision ${key}`)
  }
  return { ...record, consumedAt: now.toISOString(), consumedByAttemptId: attemptId }
}

export function createAttempt(revision, confirmationId, { now = new Date(), attemptId = `attempt_${randomUUID()}` } = {}) {
  assertSafeId(attemptId, 'attemptId')
  return {
    schemaVersion: 'social-workbench.attempt/v1',
    attemptId,
    revisionHash: revision.revisionHash,
    platform: revision.platform,
    accountRef: revision.accountRef,
    visibility: revision.visibility,
    confirmationId,
    state: 'confirmed_for_submit',
    stateVersion: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    evidenceRefs: [],
    platformObject: null,
    error: null,
  }
}

export function transitionAttempt(attempt, nextState, patch = {}, { now = new Date() } = {}) {
  const allowed = TRANSITIONS.get(attempt.state)
  if (!allowed || !allowed.has(nextState)) throw new Error(`invalid attempt transition: ${attempt.state} -> ${nextState}`)
  if (nextState === 'confirmed') {
    const object = patch.platformObject
    const basis = patch.confirmationBasis
    const hasObjectId = object && typeof object.id === 'string' && object.id !== ''
    const hasPlatformEvidence = basis?.kind === 'creator_queue_match' && typeof basis.evidenceRef === 'string' && basis.evidenceRef !== ''
    if (!hasObjectId && !hasPlatformEvidence) {
      throw new Error('confirmed requires a platform object id or creator-queue evidence')
    }
  }
  return {
    ...attempt,
    ...patch,
    state: nextState,
    stateVersion: attempt.stateVersion + 1,
    updatedAt: now.toISOString(),
  }
}

export function createReceipt(attempt, checks = []) {
  return {
    schemaVersion: 'social-workbench.receipt/v1',
    attemptId: attempt.attemptId,
    platform: attempt.platform,
    operation: 'publish_creator_browser',
    accountRef: attempt.accountRef,
    revisionHash: attempt.revisionHash,
    visibility: attempt.visibility,
    state: attempt.state,
    submittedAt: attempt.submittedAt ?? null,
    confirmedAt: attempt.state === 'confirmed' ? attempt.updatedAt : null,
    platformObject: attempt.platformObject,
    confirmationBasis: attempt.confirmationBasis ?? null,
    checks,
    evidenceRefs: attempt.evidenceRefs,
    error: attempt.error,
  }
}
