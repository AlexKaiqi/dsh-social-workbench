import assert from 'node:assert/strict'
import test from 'node:test'
import { DouyinBroadcastKitAdapter, parseDouyinReport } from '../src/adapters/douyin-broadcast-kit.mjs'
import { XiaohongshuHttpAdapter } from '../src/adapters/xhs-http.mjs'

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
}

test('Douyin parser requires the full truth triple', async () => {
  const report = parseDouyinReport(`
JUDGEMENT: success
COVER_VERIFY: True
QUEUE_VERIFY: partial
VISIBILITY_VERIFY: True
- queue 文本: file:///tmp/queue.txt
`)
  assert.deepEqual(report, {
    judgement: 'success',
    coverVerified: true,
    queueVerified: false,
    visibilityVerified: true,
    evidenceRefs: ['file:///tmp/queue.txt'],
  })
  const adapter = new DouyinBroadcastKitAdapter()
  const verification = await adapter.verify({}, { commandExitCode: 0, report })
  assert.equal(verification.confirmed, false)
})

test('Douyin adapter blocks live publication until private visibility is proven', async () => {
  const adapter = new DouyinBroadcastKitAdapter({ allowLivePrivate: false })
  await assert.rejects(
    adapter.submit({
      visibility: 'private',
      execution: { manifestPath: '/tmp/post.json', schedulePublishAt: '2026-01-01T08:00:00+08:00' },
    }),
    /blocked until.*private visibility/i,
  )
})

test('Douyin doctor does not confuse process exit zero with publish readiness', async () => {
  const runImpl = async () => ({
    code: 0,
    stderr: '',
    stdout: JSON.stringify({
      summary: { ok_for_douyin_existing_media: false, douyin_blockers: ['ffmpeg'] },
      state: { douyin_login: { ok: false } },
    }),
  })
  const adapter = new DouyinBroadcastKitAdapter({ runImpl })
  const result = await adapter.doctor({ liveLoginCheck: true })
  assert.equal(result.ready, false)
  assert.equal(result.capabilityReady, false)
  assert.equal(result.loginReady, false)
})

test('XHS adapter forces private visibility and confirms only a new exact feed', async () => {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init })
    const pathname = new URL(url).pathname
    if (pathname === '/api/v1/user/me' && calls.filter((item) => new URL(item.url).pathname === pathname).length === 1) {
      return jsonResponse({ success: true, data: { data: { feeds: [{ id: 'old', xsecToken: 'old-token', noteCard: { displayTitle: '旧笔记' } }] } } })
    }
    if (pathname === '/api/v1/publish') return jsonResponse({ success: true, data: { status: 'success' } })
    if (pathname === '/api/v1/user/me') {
      return jsonResponse({ success: true, data: { data: { feeds: [
        { id: 'new-note', xsecToken: 'new-token', noteCard: { displayTitle: '闭环测试 001' } },
        { id: 'old', xsecToken: 'old-token', noteCard: { displayTitle: '旧笔记' } },
      ] } } })
    }
    if (pathname === '/api/v1/feeds/detail') {
      return jsonResponse({ success: true, data: { data: { note: { desc: '正文 SWB-001', imageList: [{}, {}] } } } })
    }
    throw new Error(`unexpected request: ${url}`)
  }
  const adapter = new XiaohongshuHttpAdapter({ fetchImpl })
  const revision = {
    visibility: 'private',
    content: {
      title: '闭环测试 001',
      body: '正文 SWB-001',
      verifyMarker: 'SWB-001',
      topics: ['测试'],
      media: [
        { kind: 'image', path: '/tmp/one.png' },
        { kind: 'image', path: '/tmp/two.png' },
      ],
    },
  }
  const baseline = await adapter.baseline()
  const submission = await adapter.submit(revision, { baseline })
  const publishCall = calls.find((item) => new URL(item.url).pathname === '/api/v1/publish')
  assert.equal(JSON.parse(publishCall.init.body).visibility, '仅自己可见')
  const verification = await adapter.verify(revision, submission, { timeoutMs: 100, pollMs: 1 })
  assert.equal(verification.confirmed, true)
  assert.equal(verification.platformObject.id, 'new-note')
  assert.equal(verification.platformObject.url.includes('xsec_token'), false)
})

test('XHS adapter reports unknown instead of success when no new feed appears', async () => {
  const fetchImpl = async () => jsonResponse({ success: true, data: { data: { feeds: [] } } })
  const adapter = new XiaohongshuHttpAdapter({ fetchImpl })
  const result = await adapter.verify(
    { content: { title: 'missing', media: [{ kind: 'image' }] } },
    { baseline: { feedIds: [] } },
    { timeoutMs: 5, pollMs: 1 },
  )
  assert.equal(result.confirmed, false)
  assert.equal(result.checks[0].result, 'unknown')
})

test('XHS feedback collector preserves raw metric definitions and omits user identity', async () => {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init })
    const pathname = new URL(url).pathname
    if (pathname === '/api/v1/user/me') {
      return jsonResponse({ success: true, data: { feeds: [{ id: 'note-feedback', xsecToken: 'ephemeral-token' }] } })
    }
    if (pathname === '/api/v1/feeds/detail') {
      return jsonResponse({ success: true, data: {
        note: { interactInfo: { likedCount: '1.2万', collectedCount: '86', commentCount: '2', sharedCount: '3' } },
        comments: { list: [{ id: 'comment-1', content: '请补充步骤', createTime: 1787443200, userInfo: { userId: 'must-not-leak' }, subComments: [{ id: 'reply-1', content: '同问', createTime: 1787443260000 }] }] },
      } })
    }
    throw new Error(`unexpected request: ${url}`)
  }
  const adapter = new XiaohongshuHttpAdapter({ fetchImpl })
  const collected = await adapter.collectFeedback(
    { id: 'note-feedback' },
    { limit: 25, now: new Date('2026-08-23T12:00:00.000Z') },
  )
  assert.equal(collected.metrics.find((item) => item.name === 'likedCount').value, 12_000)
  assert.equal(collected.feedback.length, 2)
  assert.equal(JSON.stringify(collected).includes('must-not-leak'), false)
  assert.equal(JSON.stringify(collected).includes('ephemeral-token'), false)
  const detailBody = JSON.parse(calls.find((item) => new URL(item.url).pathname === '/api/v1/feeds/detail').init.body)
  assert.deepEqual(detailBody.comment_config, { max_comment_items: 25, click_more_replies: false, scroll_speed: 'normal' })
})
