import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { ContentPipeline } from '../src/content-pipeline.mjs'
import { SocialLoopControl } from '../src/loop-control.mjs'
import { PublicationLoop } from '../src/orchestrator.mjs'
import { LoopStore } from '../src/store.mjs'

async function fixture({ verification = { confirmed: true, platformObject: { id: 'note-1' } } } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'social-control-test-'))
  const mediaPath = path.join(root, 'owned.png')
  await writeFile(mediaPath, 'owned fixture')
  const store = new LoopStore(root)
  let submitCalls = 0
  const publicationLoop = new PublicationLoop({
    store,
    adapters: {
      xiaohongshu: {
        async doctor() { return { ready: true } },
        async baseline() { return {} },
        async submit() { submitCalls += 1; return { submitted: true, evidenceRefs: ['local://submit'] } },
        async verify() { return verification },
      },
    },
  })
  const contentPipeline = new ContentPipeline({ store, publicationLoop })
  const source = await contentPipeline.ingest({
    origin: { kind: 'manual' },
    title: '合成来源',
    text: '用于反馈闭环的合成证据',
    rightsNote: '测试素材由测试拥有',
    attachments: [{ kind: 'image', path: mediaPath }],
  })
  const brief = await contentPipeline.createBrief({
    sourceIds: [source.sourceId],
    objective: '验证闭环',
    audience: '测试受众',
    coreMessage: '闭环可追踪',
    claims: [{ claim: '这是合成证据', evidenceRefs: [`${source.sourceId}#text`] }],
  })
  const revision = await publicationLoop.prepare({
    platform: 'xiaohongshu',
    accountRef: 'account:xhs-test',
    visibility: 'private',
    testMode: true,
    sourceRefs: [source.sourceId],
    content: { title: '闭环测试', body: '仅供测试', media: [{ kind: 'image', path: mediaPath }] },
  })
  const packageId = `package_${'a'.repeat(64)}`
  await store.writeImmutable('packages', packageId, {
    packageId,
    briefId: brief.briefId,
    accounts: { xiaohongshu: 'account:xhs-test', douyin: 'account:douyin-test' },
    revisions: { xiaohongshu: revision.revisionHash, douyin: `sha256:${'b'.repeat(64)}` },
  })
  const control = new SocialLoopControl({ store, publicationLoop, contentPipeline })
  return { root, store, publicationLoop, contentPipeline, control, source, brief, revision, packageId, submitCalls: () => submitCalls }
}

test('plan approval only creates an idempotent local outbox', async () => {
  const { control, store, packageId } = await fixture()
  const plan = await control.createPlan({ packageId })
  assert.equal(plan.approval.state, 'pending')
  await assert.rejects(control.enqueuePlan(plan.planId), /not approved/)
  const approved = await control.approvePlan(plan.planId, { approvedBy: 'test-user' })
  assert.equal(approved.approval.approvedPlanHash, approved.planHash)
  const first = await control.enqueuePlan(plan.planId)
  const replay = await control.enqueuePlan(plan.planId)
  assert.deepEqual(replay, first)
  assert.equal(first.length, 2)
  assert.equal(first.every((item) => item.state === 'ready-for-confirmation'), true)
  assert.equal((await store.list('confirmations')).length, 0)
  assert.equal((await store.read('plans', plan.planId)).status, 'queued')
})

test('scheduled outbox items cannot execute before their planned time', async () => {
  const { control, store, packageId } = await fixture()
  const plan = await control.createPlan({ packageId, schedule: { xiaohongshu: '2099-01-01T00:00:00.000Z' } })
  await control.approvePlan(plan.planId)
  const [item] = await control.enqueuePlan(plan.planId)
  await assert.rejects(control.executeItem({
    outboxId: item.outboxId,
    confirmationId: 'confirmation_unused',
    confirmationToken: 'unused',
  }), /scheduled for/)
  assert.equal((await store.read('outbox', item.outboxId)).state, 'ready-for-confirmation')
})

test('unknown submission reconciles without resubmitting', async () => {
  const { control, publicationLoop, store, revision, packageId, submitCalls } = await fixture({ verification: { confirmed: false, checks: [{ name: 'creator-record', result: 'unknown' }] } })
  const plan = await control.createPlan({ packageId })
  await control.approvePlan(plan.planId)
  const [item] = await control.enqueuePlan(plan.planId)
  const confirmation = await publicationLoop.confirm(revision.revisionHash)
  const receipt = await control.executeItem({ outboxId: item.outboxId, confirmationId: confirmation.confirmationId, confirmationToken: confirmation.token })
  assert.equal(receipt.state, 'unknown')
  assert.equal((await store.read('outbox', item.outboxId)).state, 'manual-action-required')
  const reconciliation = await control.reconcile({
    outboxId: item.outboxId,
    outcome: 'published',
    externalId: 'note-platform-1',
    evidenceRefs: ['local://creator-dashboard/note-platform-1'],
  })
  assert.equal(reconciliation.outcome, 'published')
  assert.equal((await store.read('outbox', item.outboxId)).state, 'published')
  assert.equal((await control.executeItem({ outboxId: item.outboxId, confirmationId: confirmation.confirmationId, confirmationToken: confirmation.token })).state, 'unknown')
  assert.equal(submitCalls(), 1)
})

test('append-only metrics and feedback produce a traceable next brief', async () => {
  const { control, contentPipeline, store, source, packageId } = await fixture()
  const plan = await control.createPlan({ packageId })
  await control.approvePlan(plan.planId)
  const [item] = await control.enqueuePlan(plan.planId)
  await store.mutate('outbox', item.outboxId, (current) => ({ ...current, state: 'published', receiptId: 'attempt_fixture' }))

  const metricInput = {
    outboxId: item.outboxId,
    metrics: [{ name: '点赞', value: 7, definition: '平台详情页显示的点赞总数', unit: 'count' }],
    window: { start: '2026-08-23T00:00:00.000Z', end: '2026-08-24T00:00:00.000Z' },
    observedAt: '2026-08-24T00:05:00.000Z',
    source: { kind: 'creator-dashboard', evidenceRefs: ['local://snapshot/1'] },
  }
  const firstMetric = await control.recordMetric(metricInput)
  const secondMetric = await control.recordMetric({
    ...metricInput,
    metrics: [{ ...metricInput.metrics[0], value: 9 }],
    observedAt: '2026-08-24T01:05:00.000Z',
  })
  assert.notEqual(firstMetric.snapshotId, secondMetric.snapshotId)
  assert.equal((await store.list('metric-snapshots')).length, 2)

  const feedback = await control.recordFeedback({
    outboxId: item.outboxId,
    kind: 'question',
    body: '是否可以补充操作步骤？',
    observedAt: '2026-08-24T01:10:00.000Z',
    source: { kind: 'creator-dashboard', evidenceRefs: ['local://comment/1'] },
  })
  const review = await control.createReview({
    planId: plan.planId,
    hypothesis: '受众需要更具体的操作步骤',
    verdict: 'supported',
    observations: '评论明确请求补充步骤，点赞继续增长。',
    metricSnapshotIds: [firstMetric.snapshotId, secondMetric.snapshotId],
    feedbackIds: [feedback.feedbackId],
    nextBrief: {
      sourceIds: [source.sourceId],
      objective: '验证步骤型内容是否更有帮助',
      audience: '需要直接操作指导的用户',
      coreMessage: '给出三步可执行方法',
      claims: [{ claim: '来源为合成闭环测试', evidenceRefs: [`${source.sourceId}#text`] }],
      constraints: ['不把相关性宣称为因果'],
    },
  })
  const nextBrief = await control.createNextBrief(review.reviewId)
  assert.deepEqual(nextBrief.feedbackReviewIds, [review.reviewId])
  assert.deepEqual(await contentPipeline.createBrief(review.nextBrief), await contentPipeline.createBrief(review.nextBrief))
  assert.equal((await control.dashboard()).counts.reviews, 1)
})

test('authorized XHS collection maps adapter observations into the feedback ledger', async () => {
  const { control, store, packageId } = await fixture()
  const plan = await control.createPlan({ packageId })
  await control.approvePlan(plan.planId)
  const [item] = await control.enqueuePlan(plan.planId)
  await store.writeImmutable('receipts', 'attempt_collector', {
    attemptId: 'attempt_collector',
    confirmedAt: '2026-08-23T10:00:00.000Z',
    platformObject: { id: 'note-collector' },
  })
  await store.mutate('outbox', item.outboxId, (current) => ({ ...current, state: 'published', receiptId: 'attempt_collector' }))
  const adapter = {
    async collectFeedback() {
      return {
        observedAt: '2026-08-23T11:00:00.000Z',
        metrics: [{ name: 'commentCount', value: 1, definition: '平台详情页评论总数', unit: 'count' }],
        feedback: [{ externalId: 'comment-collector', body: '希望看到下一篇', kind: 'comment', observedAt: '2026-08-23T10:30:00.000Z' }],
        evidenceRefs: ['xiaohongshu://note/note-collector/detail@2026-08-23T11:00:00.000Z'],
      }
    },
  }
  const result = await control.collectFeedback(item.outboxId, adapter, { now: new Date('2026-08-23T11:00:00.000Z') })
  assert.match(result.metricSnapshotId, /^metric_/)
  assert.equal(result.feedbackIds.length, 1)
  assert.equal((await store.list('metric-snapshots')).length, 1)
  assert.equal((await store.list('feedback-items')).length, 1)
})
