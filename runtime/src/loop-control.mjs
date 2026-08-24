import { assertSafeId, sha256, stableStringify } from './domain.mjs'

const PLAN_STATES = new Set(['ready', 'queued', 'manual-action-required', 'partially-published', 'published', 'failed', 'cancelled'])
const OUTBOX_STATES = new Set(['ready-for-confirmation', 'executing', 'published', 'manual-action-required', 'terminal-error'])
const RECONCILE_OUTCOMES = new Set(['published', 'not-found', 'manual-action-required'])
const FEEDBACK_KINDS = new Set(['comment', 'question', 'complaint', 'praise', 'manual-note'])
const REVIEW_VERDICTS = new Set(['supported', 'mixed', 'refuted', 'inconclusive'])

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`)
  return value.trim()
}

function optionalText(value, label) {
  if (value == null || value === '') return null
  if (typeof value !== 'string') throw new Error(`${label} must be a string`)
  return value.trim()
}

function stringList(value, label) {
  if (value == null) return []
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new Error(`${label} must be an array of non-empty strings`)
  }
  return [...new Set(value.map((item) => item.trim()))]
}

function timestamp(value, label) {
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be an ISO date-time`)
  return new Date(parsed).toISOString()
}

function digestId(prefix, payload) {
  return `${prefix}_${sha256(stableStringify(payload)).replace('sha256:', '')}`
}

function itemId(planId, platform) {
  return `item_${sha256(`${planId}:${platform}`).replace('sha256:', '')}`
}

function outboxId(planId, item) {
  return `outbox_${sha256(`${planId}:${item.itemId}:${item.idempotencyKey}`).replace('sha256:', '')}`
}

function planPayload(contentPackage, input = {}) {
  const schedule = input.schedule ?? {}
  const deliveryModes = input.deliveryModes ?? {}
  const items = ['xiaohongshu', 'douyin'].map((platform) => {
    const scheduledAt = schedule[platform] == null ? null : timestamp(schedule[platform], `schedule.${platform}`)
    const deliveryMode = deliveryModes[platform] ?? 'browser-assisted'
    if (!['official-api', 'delegated-service', 'browser-assisted', 'manual-handoff'].includes(deliveryMode)) {
      throw new Error(`unsupported delivery mode for ${platform}: ${deliveryMode}`)
    }
    return {
      platform,
      accountRef: contentPackage.accounts[platform],
      revisionHash: contentPackage.revisions[platform],
      deliveryMode,
      scheduledAt,
    }
  })
  return {
    schemaVersion: 'social-workbench.publication-plan/v1',
    packageId: contentPackage.packageId,
    briefRef: contentPackage.briefId,
    items,
  }
}

function derivePlanState(outboxItems) {
  if (outboxItems.length === 0) return 'ready'
  const states = outboxItems.map((item) => item.state)
  if (states.every((state) => state === 'published')) return 'published'
  if (states.some((state) => state === 'published')) return 'partially-published'
  if (states.some((state) => state === 'manual-action-required')) return 'manual-action-required'
  if (states.every((state) => state === 'terminal-error')) return 'failed'
  return 'queued'
}

export class SocialLoopControl {
  constructor({ store, publicationLoop, contentPipeline }) {
    this.store = store
    this.publicationLoop = publicationLoop
    this.contentPipeline = contentPipeline
  }

  async createPlan(input, { now = new Date() } = {}) {
    const packageId = requireText(input?.packageId, 'plan.packageId')
    const contentPackage = await this.store.read('packages', packageId)
    const payload = planPayload(contentPackage, input)
    const planHash = sha256(stableStringify(payload))
    const planId = digestId('plan', payload)
    const existing = await this.store.readOptional('plans', planId)
    if (existing) return existing
    const plan = {
      ...payload,
      planId,
      planHash,
      items: payload.items.map((item) => ({
        ...item,
        itemId: itemId(planId, item.platform),
        idempotencyKey: sha256(`${planHash}:${item.platform}:${item.revisionHash}`),
      })),
      approval: { state: 'pending' },
      status: 'ready',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
    await this.store.writeImmutable('plans', planId, plan)
    return plan
  }

  async approvePlan(planId, { approvedBy = 'local-user', ttlMs = 24 * 60 * 60_000, now = new Date() } = {}) {
    assertSafeId(planId, 'planId')
    if (!Number.isSafeInteger(ttlMs) || ttlMs < 1_000 || ttlMs > 30 * 24 * 60 * 60_000) {
      throw new Error('plan approval ttl must be between 1 second and 30 days')
    }
    requireText(approvedBy, 'approvedBy')
    return this.store.mutate('plans', planId, (plan) => {
      if (!PLAN_STATES.has(plan.status) || plan.status !== 'ready') throw new Error(`plan cannot be approved in state ${plan.status}`)
      return {
        ...plan,
        approval: {
          state: 'approved',
          approvedPlanHash: plan.planHash,
          approvedBy: approvedBy.trim(),
          approvedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
        },
        updatedAt: now.toISOString(),
      }
    })
  }

  async enqueuePlan(planId, { now = new Date() } = {}) {
    assertSafeId(planId, 'planId')
    const plan = await this.store.read('plans', planId)
    if (plan.approval?.state !== 'approved' || plan.approval.approvedPlanHash !== plan.planHash) {
      throw new Error('plan is not approved for its current hash')
    }
    if (Date.parse(plan.approval.expiresAt) <= now.getTime()) throw new Error('plan approval has expired')
    const records = []
    for (const item of plan.items) {
      const id = outboxId(plan.planId, item)
      const existing = await this.store.readOptional('outbox', id)
      if (existing) {
        records.push(existing)
        continue
      }
      const record = {
        schemaVersion: 'social-workbench.outbox/v1',
        outboxId: id,
        planId: plan.planId,
        itemId: item.itemId,
        platform: item.platform,
        accountRef: item.accountRef,
        revisionHash: item.revisionHash,
        deliveryMode: item.deliveryMode,
        scheduledAt: item.scheduledAt,
        idempotencyKey: item.idempotencyKey,
        state: 'ready-for-confirmation',
        attemptId: null,
        receiptId: null,
        reconciliationId: null,
        error: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
      records.push(await this.store.writeImmutable('outbox', id, record))
    }
    await this.refreshPlan(plan.planId, { now })
    return records
  }

  async refreshPlan(planId, { now = new Date() } = {}) {
    const items = (await this.store.list('outbox')).filter((item) => item.planId === planId)
    return this.store.mutate('plans', planId, (plan) => ({
      ...plan,
      status: derivePlanState(items),
      updatedAt: now.toISOString(),
    }))
  }

  async executeItem({ outboxId: id, confirmationId, confirmationToken }, { now = new Date() } = {}) {
    assertSafeId(id, 'outboxId')
    const current = await this.store.read('outbox', id)
    if (!OUTBOX_STATES.has(current.state)) throw new Error(`unknown outbox state: ${current.state}`)
    if (!['ready-for-confirmation', 'executing'].includes(current.state)) {
      if (current.receiptId) return this.store.read('receipts', current.receiptId)
      throw new Error(`outbox item cannot execute in state ${current.state}`)
    }
    if (current.scheduledAt && Date.parse(current.scheduledAt) > now.getTime()) {
      throw new Error(`outbox item is scheduled for ${current.scheduledAt}`)
    }
    await this.store.mutate('outbox', id, (item) => {
      if (!['ready-for-confirmation', 'executing'].includes(item.state)) return item
      return { ...item, state: 'executing', updatedAt: now.toISOString() }
    })
    let receipt
    try {
      receipt = await this.publicationLoop.execute({
        revisionHash: current.revisionHash,
        confirmationId,
        confirmationToken,
      })
    } catch (error) {
      const confirmation = await this.store.readOptional('confirmations', confirmationId)
      if (!confirmation?.consumedAt) {
        await this.store.mutate('outbox', id, (item) => ({
          ...item,
          state: 'ready-for-confirmation',
          error: { code: 'EXECUTION_NOT_STARTED', message: error instanceof Error ? error.message : String(error) },
          updatedAt: new Date().toISOString(),
        }))
      }
      throw error
    }
    const state = receipt.state === 'confirmed'
      ? 'published'
      : receipt.state === 'unknown'
        ? 'manual-action-required'
        : 'terminal-error'
    await this.store.mutate('outbox', id, (item) => ({
      ...item,
      state,
      attemptId: receipt.attemptId,
      receiptId: receipt.attemptId,
      error: receipt.error,
      updatedAt: new Date().toISOString(),
    }))
    await this.refreshPlan(current.planId)
    return receipt
  }

  async reconcile(input, { now = new Date() } = {}) {
    const id = requireText(input?.outboxId, 'reconciliation.outboxId')
    const item = await this.store.read('outbox', id)
    if (item.state !== 'manual-action-required') throw new Error('only an unknown/manual-action-required item can be reconciled')
    if (!RECONCILE_OUTCOMES.has(input.outcome)) throw new Error(`unsupported reconciliation outcome: ${input.outcome}`)
    const externalId = optionalText(input.externalId, 'reconciliation.externalId')
    const externalUrl = optionalText(input.externalUrl, 'reconciliation.externalUrl')
    const evidenceRefs = stringList(input.evidenceRefs, 'reconciliation.evidenceRefs')
    if (input.outcome === 'published' && !externalId && evidenceRefs.length === 0) {
      throw new Error('published reconciliation requires an externalId or evidenceRef')
    }
    const payload = {
      schemaVersion: 'social-workbench.reconciliation/v1',
      outboxId: item.outboxId,
      planId: item.planId,
      itemId: item.itemId,
      receiptId: item.receiptId,
      platform: item.platform,
      outcome: input.outcome,
      externalObject: externalId ? { id: externalId, ...(externalUrl ? { url: externalUrl } : {}) } : null,
      evidenceRefs,
      note: optionalText(input.note, 'reconciliation.note'),
      observedAt: timestamp(input.observedAt ?? now.toISOString(), 'reconciliation.observedAt'),
    }
    const reconciliationId = digestId('reconciliation', payload)
    const reconciliation = { ...payload, reconciliationId, recordedAt: now.toISOString() }
    await this.store.writeImmutable('reconciliations', reconciliationId, reconciliation)
    const state = input.outcome === 'published' ? 'published' : input.outcome === 'not-found' ? 'terminal-error' : 'manual-action-required'
    await this.store.mutate('outbox', item.outboxId, (current) => ({
      ...current,
      state,
      reconciliationId,
      error: input.outcome === 'not-found'
        ? { code: 'RECONCILED_NOT_FOUND', message: 'Platform-side evidence did not find the publication.' }
        : current.error,
      updatedAt: now.toISOString(),
    }))
    await this.refreshPlan(item.planId, { now })
    return reconciliation
  }

  async recordMetric(input, { now = new Date() } = {}) {
    const outbox = await this.store.read('outbox', requireText(input?.outboxId, 'metric.outboxId'))
    if (!outbox.receiptId && !outbox.reconciliationId) throw new Error('metric requires an executed or reconciled publication')
    if (!Array.isArray(input.metrics) || input.metrics.length === 0) throw new Error('metric.metrics must not be empty')
    const metrics = input.metrics.map((metric, index) => {
      const name = requireText(metric?.name, `metric.metrics[${index}].name`)
      if (typeof metric.value !== 'number' || !Number.isFinite(metric.value) || metric.value < 0) {
        throw new Error(`metric.metrics[${index}].value must be a non-negative number`)
      }
      return {
        name,
        value: metric.value,
        definition: requireText(metric.definition, `metric.metrics[${index}].definition`),
        ...(optionalText(metric.unit, `metric.metrics[${index}].unit`) ? { unit: metric.unit.trim() } : {}),
      }
    })
    const sourceKind = input.source?.kind ?? 'manual-entry'
    if (!['official-api', 'creator-dashboard', 'manual-export', 'manual-entry'].includes(sourceKind)) {
      throw new Error(`unsupported metric source kind: ${sourceKind}`)
    }
    const payload = {
      schemaVersion: 'social-workbench.metric-snapshot/v1',
      outboxId: outbox.outboxId,
      planId: outbox.planId,
      itemId: outbox.itemId,
      receiptId: outbox.receiptId,
      reconciliationId: outbox.reconciliationId,
      platform: outbox.platform,
      accountRef: outbox.accountRef,
      metrics,
      window: {
        start: timestamp(input.window?.start, 'metric.window.start'),
        end: timestamp(input.window?.end, 'metric.window.end'),
      },
      observedAt: timestamp(input.observedAt ?? now.toISOString(), 'metric.observedAt'),
      source: { kind: sourceKind, evidenceRefs: stringList(input.source?.evidenceRefs, 'metric.source.evidenceRefs') },
      mappingVersion: requireText(input.mappingVersion ?? 'raw/v1', 'metric.mappingVersion'),
    }
    if (Date.parse(payload.window.end) < Date.parse(payload.window.start)) throw new Error('metric window end precedes start')
    const snapshotId = digestId('metric', payload)
    const snapshot = { ...payload, snapshotId, recordedAt: now.toISOString() }
    await this.store.writeImmutable('metric-snapshots', snapshotId, snapshot)
    return snapshot
  }

  async recordFeedback(input, { now = new Date() } = {}) {
    const outbox = await this.store.read('outbox', requireText(input?.outboxId, 'feedback.outboxId'))
    if (!outbox.receiptId && !outbox.reconciliationId) throw new Error('feedback requires an executed or reconciled publication')
    if (!FEEDBACK_KINDS.has(input.kind)) throw new Error(`unsupported feedback kind: ${input.kind}`)
    const sourceKind = input.source?.kind ?? 'manual-entry'
    if (!['official-api', 'creator-dashboard', 'manual-export', 'manual-entry'].includes(sourceKind)) {
      throw new Error(`unsupported feedback source kind: ${sourceKind}`)
    }
    const payload = {
      schemaVersion: 'social-workbench.feedback-item/v1',
      outboxId: outbox.outboxId,
      planId: outbox.planId,
      itemId: outbox.itemId,
      receiptId: outbox.receiptId,
      platform: outbox.platform,
      kind: input.kind,
      body: requireText(input.body, 'feedback.body'),
      externalId: optionalText(input.externalId, 'feedback.externalId'),
      observedAt: timestamp(input.observedAt ?? now.toISOString(), 'feedback.observedAt'),
      source: { kind: sourceKind, evidenceRefs: stringList(input.source?.evidenceRefs, 'feedback.source.evidenceRefs') },
      privacy: 'platform-local-no-cross-platform-identity',
    }
    const feedbackId = digestId('feedback', payload)
    const feedback = { ...payload, feedbackId, recordedAt: now.toISOString() }
    await this.store.writeImmutable('feedback-items', feedbackId, feedback)
    return feedback
  }

  async createReview(input, { now = new Date() } = {}) {
    const plan = await this.store.read('plans', requireText(input?.planId, 'review.planId'))
    if (!REVIEW_VERDICTS.has(input.verdict)) throw new Error(`unsupported review verdict: ${input.verdict}`)
    const metricSnapshotIds = stringList(input.metricSnapshotIds, 'review.metricSnapshotIds')
    const feedbackIds = stringList(input.feedbackIds, 'review.feedbackIds')
    if (metricSnapshotIds.length + feedbackIds.length === 0) throw new Error('review requires metric or feedback evidence')
    for (const id of metricSnapshotIds) {
      const snapshot = await this.store.read('metric-snapshots', id)
      if (snapshot.planId !== plan.planId) throw new Error(`metric snapshot belongs to another plan: ${id}`)
    }
    for (const id of feedbackIds) {
      const feedback = await this.store.read('feedback-items', id)
      if (feedback.planId !== plan.planId) throw new Error(`feedback item belongs to another plan: ${id}`)
    }
    const nextBrief = input.nextBrief
    const payload = {
      schemaVersion: 'social-workbench.hypothesis-review/v1',
      planId: plan.planId,
      packageId: plan.packageId,
      briefId: plan.briefRef,
      hypothesis: requireText(input.hypothesis, 'review.hypothesis'),
      verdict: input.verdict,
      observations: requireText(input.observations, 'review.observations'),
      metricSnapshotIds,
      feedbackIds,
      nextBrief: {
        sourceIds: stringList(nextBrief?.sourceIds, 'review.nextBrief.sourceIds'),
        objective: requireText(nextBrief?.objective, 'review.nextBrief.objective'),
        audience: requireText(nextBrief?.audience, 'review.nextBrief.audience'),
        coreMessage: requireText(nextBrief?.coreMessage, 'review.nextBrief.coreMessage'),
        claims: nextBrief?.claims,
        callToAction: nextBrief?.callToAction ?? '',
        constraints: nextBrief?.constraints ?? [],
      },
    }
    if (payload.nextBrief.sourceIds.length === 0) throw new Error('review.nextBrief.sourceIds must not be empty')
    const reviewId = digestId('review', payload)
    const review = { ...payload, reviewId, createdAt: now.toISOString() }
    await this.store.writeImmutable('hypothesis-reviews', reviewId, review)
    return review
  }

  async createNextBrief(reviewId, options = {}) {
    const review = await this.store.read('hypothesis-reviews', requireText(reviewId, 'reviewId'))
    return this.contentPipeline.createBrief({
      ...review.nextBrief,
      feedbackReviewIds: [review.reviewId],
    }, options)
  }

  async collectFeedback(outboxIdValue, adapter, { limit = 50, now = new Date() } = {}) {
    const id = requireText(outboxIdValue, 'outboxId')
    const outbox = await this.store.read('outbox', id)
    if (outbox.platform !== 'xiaohongshu') throw new Error(`automatic feedback collection is not verified for ${outbox.platform}`)
    if (!adapter || typeof adapter.collectFeedback !== 'function') throw new Error('feedback adapter is unavailable')
    let receipt = null
    let reconciliation = null
    if (outbox.receiptId) receipt = await this.store.readOptional('receipts', outbox.receiptId)
    if (outbox.reconciliationId) reconciliation = await this.store.readOptional('reconciliations', outbox.reconciliationId)
    const platformObject = reconciliation?.externalObject ?? receipt?.platformObject
    if (outbox.state !== 'published' || !platformObject?.id) {
      throw new Error('feedback collection requires an evidence-backed published platform object')
    }
    const collected = await adapter.collectFeedback(platformObject, { limit, now })
    const evidenceRefs = stringList(collected.evidenceRefs, 'collector.evidenceRefs')
    let metricSnapshot = null
    if (collected.metrics?.length) {
      const start = receipt?.confirmedAt ?? receipt?.submittedAt ?? reconciliation?.observedAt ?? outbox.updatedAt
      metricSnapshot = await this.recordMetric({
        outboxId: outbox.outboxId,
        metrics: collected.metrics,
        window: { start, end: collected.observedAt },
        observedAt: collected.observedAt,
        source: { kind: 'creator-dashboard', evidenceRefs },
        mappingVersion: 'xiaohongshu-detail/v1',
      }, { now })
    }
    const feedbackItems = []
    for (const item of collected.feedback ?? []) {
      feedbackItems.push(await this.recordFeedback({
        outboxId: outbox.outboxId,
        kind: item.kind ?? 'comment',
        body: item.body,
        externalId: item.externalId,
        observedAt: item.observedAt ?? collected.observedAt,
        source: {
          kind: 'creator-dashboard',
          evidenceRefs: [...evidenceRefs, ...(item.externalId ? [`xiaohongshu://note/${platformObject.id}/comment/${item.externalId}`] : [])],
        },
      }, { now }))
    }
    return {
      schemaVersion: 'social-workbench.feedback-collection/v1',
      outboxId: outbox.outboxId,
      platform: outbox.platform,
      observedAt: collected.observedAt,
      metricSnapshotId: metricSnapshot?.snapshotId ?? null,
      feedbackIds: feedbackItems.map((item) => item.feedbackId),
    }
  }

  async dashboard() {
    const [plans, outbox, metrics, feedback, reviews] = await Promise.all([
      this.store.list('plans'),
      this.store.list('outbox'),
      this.store.list('metric-snapshots'),
      this.store.list('feedback-items'),
      this.store.list('hypothesis-reviews'),
    ])
    const recent = (items, field, limit = 6) => [...items]
      .sort((left, right) => String(right[field] ?? '').localeCompare(String(left[field] ?? '')))
      .slice(0, limit)
    return {
      schemaVersion: 'social-workbench.loop-dashboard/v1',
      counts: {
        plans: plans.length,
        queued: outbox.filter((item) => ['ready-for-confirmation', 'executing'].includes(item.state)).length,
        needsReconciliation: outbox.filter((item) => item.state === 'manual-action-required').length,
        published: outbox.filter((item) => item.state === 'published').length,
        metricSnapshots: metrics.length,
        feedbackItems: feedback.length,
        reviews: reviews.length,
      },
      recentPlans: recent(plans, 'updatedAt').map(({ planId, packageId, briefRef, status, approval, updatedAt }) => ({ planId, packageId, briefRef, status, approval: approval.state, updatedAt })),
      recentOutbox: recent(outbox, 'updatedAt').map(({ outboxId, planId, platform, state, scheduledAt, updatedAt }) => ({ outboxId, planId, platform, state, scheduledAt, updatedAt })),
      recentMetrics: recent(metrics, 'observedAt').map(({ snapshotId, planId, platform, metrics: values, observedAt }) => ({ snapshotId, planId, platform, metrics: values, observedAt })),
      recentFeedback: recent(feedback, 'observedAt').map(({ feedbackId, planId, platform, kind, observedAt }) => ({ feedbackId, planId, platform, kind, observedAt })),
      recentReviews: recent(reviews, 'createdAt').map(({ reviewId, planId, verdict, createdAt }) => ({ reviewId, planId, verdict, createdAt })),
      generatedAt: new Date().toISOString(),
    }
  }
}

export const LOOP_CONTROL_STATES = { PLAN_STATES, OUTBOX_STATES }
