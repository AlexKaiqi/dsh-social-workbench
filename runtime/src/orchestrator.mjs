import { randomUUID } from 'node:crypto'
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
    const attemptId = `attempt_${randomUUID()}`

    const consumed = await this.store.mutate('confirmations', confirmationId, (record) =>
      consumeConfirmationRecord(record, confirmationToken, revision, attemptId))
    let attempt = createAttempt(revision, consumed.confirmationId, { attemptId })
    await this.store.writeImmutable('attempts', attemptId, attempt)

    let checks = []
    try {
      const doctor = await adapter.doctor({ liveLoginCheck: true })
      if (!doctor.ready) throw new Error('adapter is not ready or account is not logged in')
      const baseline = await adapter.baseline(revision)
      const submission = await adapter.submit(revision, { baseline })
      if (!submission.submitted) throw new Error('adapter did not prove that submission occurred')
      attempt = transitionAttempt(attempt, 'submitted', {
        submittedAt: new Date().toISOString(),
        evidenceRefs: submission.evidenceRefs ?? [],
      })
      attempt = await this.store.mutate('attempts', attemptId, () => attempt)

      const verification = await adapter.verify(revision, submission)
      checks = verification.checks ?? []
      const nextState = verification.confirmed ? 'confirmed' : 'unknown'
      attempt = transitionAttempt(attempt, nextState, {
        platformObject: verification.platformObject ?? null,
        confirmationBasis: verification.confirmationBasis ?? null,
        evidenceRefs: [...new Set([...attempt.evidenceRefs, ...(verification.confirmationEvidence ?? [])])],
      })
      attempt = await this.store.mutate('attempts', attemptId, () => attempt)
    } catch (error) {
      if (attempt.state === 'confirmed_for_submit') {
        attempt = transitionAttempt(attempt, 'failed', { error: { code: 'EXECUTION_FAILED', message: error.message } })
        attempt = await this.store.mutate('attempts', attemptId, () => attempt)
      } else if (attempt.state === 'submitted') {
        attempt = transitionAttempt(attempt, 'unknown', { error: { code: 'VERIFICATION_FAILED', message: error.message } })
        attempt = await this.store.mutate('attempts', attemptId, () => attempt)
      }
    }

    const receipt = createReceipt(attempt, checks)
    await this.store.writeImmutable('receipts', attemptId, receipt)
    return receipt
  }
}
