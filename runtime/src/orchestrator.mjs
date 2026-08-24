import {
  consumeConfirmationRecord,
  createAttempt,
  createReceipt,
  createRevision,
  issueConfirmationRecord,
  transitionAttempt,
} from './domain.mjs'
import { assertExecutionArtifactsUnchanged, assertMediaUnchanged, fingerprintFile, fingerprintMedia } from './media.mjs'

function idFromHash(hash) {
  return hash.replace('sha256:', '')
}

const SUBMISSION_LEASE_MS = 5 * 60_000

function submissionMayBeActive(attempt) {
  const startedAt = Date.parse(attempt.submitStartedAt)
  return Number.isFinite(startedAt) && Date.now() - startedAt < SUBMISSION_LEASE_MS
}

export function attemptIdForConfirmation(confirmationId) {
  if (typeof confirmationId !== 'string' || !confirmationId.startsWith('confirmation_')) {
    throw new Error('confirmationId is missing or invalid')
  }
  return `attempt_${confirmationId.slice('confirmation_'.length)}`
}

export class PublicationLoop {
  constructor({ store, adapters = {} }) {
    this.store = store
    this.adapters = adapters
  }

  async prepare(input, options = {}) {
    const content = {
      ...input.content,
      media: await fingerprintMedia(input.content?.media, { baseDir: options.baseDir }),
    }
    const execution = { ...(input.execution ?? {}) }
    if (execution.manifestPath) {
      execution.manifest = await fingerprintFile(execution.manifestPath, { baseDir: options.baseDir })
      delete execution.manifestPath
    }
    const revision = createRevision({ ...input, content, execution }, options)
    const revisionId = idFromHash(revision.revisionHash)
    const existing = await this.store.readOptional('revisions', revisionId)
    if (existing) return existing
    await this.store.writeImmutable('revisions', revisionId, revision)
    return revision
  }

  async confirm(revisionHash, options) {
    const revision = await this.store.read('revisions', idFromHash(revisionHash))
    const issued = issueConfirmationRecord(revision, options)
    await this.store.writeImmutable('confirmations', issued.record.confirmationId, issued.record)
    return { confirmationId: issued.record.confirmationId, token: issued.token, expiresAt: issued.record.expiresAt }
  }

  async execute({ revisionHash, confirmationId, confirmationToken }) {
    const revision = await this.store.read('revisions', idFromHash(revisionHash))
    const adapter = this.adapters[revision.platform]
    if (!adapter) throw new Error(`no adapter configured for ${revision.platform}`)
    await assertMediaUnchanged(revision)
    await assertExecutionArtifactsUnchanged(revision)
    const attemptId = attemptIdForConfirmation(confirmationId)

    const consumed = await this.store.mutate('confirmations', confirmationId, (record) =>
      consumeConfirmationRecord(record, confirmationToken, revision, attemptId))
    let attempt = await this.store.readOptional('attempts', attemptId)
    if (!attempt) {
      attempt = createAttempt(revision, consumed.confirmationId, { attemptId })
      attempt = await this.store.writeImmutable('attempts', attemptId, attempt)
    }

    const existingReceipt = await this.store.readOptional('receipts', attemptId)
    if (existingReceipt) return existingReceipt

    if (attempt.state === 'confirmed_for_submit' && Date.parse(consumed.expiresAt) <= Date.now()) {
      attempt = await this.store.mutate('attempts', attemptId, (current) =>
        transitionAttempt(current, 'failed', {
          error: {
            code: 'CONFIRMATION_RECOVERY_EXPIRED',
            message: 'The confirmation expired before the interrupted execution could safely resume; issue a new confirmation.',
          },
        }))
    }

    if (attempt.state === 'submitting' && submissionMayBeActive(attempt)) {
      throw new Error('publication attempt is already submitting')
    }

    if (attempt.state === 'submitting' || attempt.state === 'submitted') {
      const interruptedState = attempt.state
      attempt = await this.store.mutate('attempts', attemptId, (current) => {
        if (current.state !== interruptedState) return current
        return transitionAttempt(current, 'unknown', {
          error: {
            code: 'INTERRUPTED_AFTER_SUBMIT_STARTED',
            message: 'A previous execution stopped after submission could have started; reconcile on the platform before retrying.',
          },
        })
      })
    }

    if (attempt.state !== 'confirmed_for_submit') {
      const receipt = createReceipt(attempt)
      await this.store.writeImmutable('receipts', attemptId, receipt)
      return receipt
    }

    let checks = []
    let submissionClaimed = false
    try {
      const doctor = await adapter.doctor({ liveLoginCheck: true })
      if (!doctor.ready) throw new Error('adapter is not ready or account is not logged in')
      const baseline = await adapter.baseline(revision)
      attempt = await this.store.mutate('attempts', attemptId, (current) =>
        transitionAttempt(current, 'submitting', { submitStartedAt: new Date().toISOString() }))
      submissionClaimed = true
      const submission = await adapter.submit(revision, { baseline })
      if (!submission.submitted) throw new Error('adapter did not prove that submission occurred')
      attempt = await this.store.mutate('attempts', attemptId, (current) =>
        transitionAttempt(current, 'submitted', {
          submittedAt: new Date().toISOString(),
          evidenceRefs: submission.evidenceRefs ?? [],
        }))

      const verification = await adapter.verify(revision, submission)
      checks = verification.checks ?? []
      const nextState = verification.confirmed ? 'confirmed' : 'unknown'
      attempt = await this.store.mutate('attempts', attemptId, (current) =>
        transitionAttempt(current, nextState, {
          platformObject: verification.platformObject ?? null,
          confirmationBasis: verification.confirmationBasis ?? null,
          evidenceRefs: [...new Set([...current.evidenceRefs, ...(verification.confirmationEvidence ?? [])])],
        }))
    } catch (error) {
      attempt = await this.store.read('attempts', attemptId)
      if (attempt.state === 'submitting' && !submissionClaimed && submissionMayBeActive(attempt)) throw error
      if (attempt.state === 'confirmed_for_submit') {
        attempt = await this.store.mutate('attempts', attemptId, (current) =>
          transitionAttempt(current, 'failed', { error: { code: 'EXECUTION_FAILED', message: error.message } }))
      } else if (attempt.state === 'submitting' || attempt.state === 'submitted') {
        const code = attempt.state === 'submitted' ? 'VERIFICATION_FAILED' : 'SUBMISSION_OUTCOME_UNKNOWN'
        attempt = await this.store.mutate('attempts', attemptId, (current) =>
          transitionAttempt(current, 'unknown', { error: { code, message: error.message } }))
      }
    }

    const receipt = createReceipt(attempt, checks)
    await this.store.writeImmutable('receipts', attemptId, receipt)
    return receipt
  }
}
