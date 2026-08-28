import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { DouyinBroadcastKitAdapter, parseDouyinReport } from '../src/adapters/douyin-broadcast-kit.mjs'
import { createDockerResearchRuntime, DouyinResearchAdapter, LocalWhisperAdapter, MEDIACRAWLER_COMMIT } from '../src/adapters/douyin-research.mjs'
import { XiaohongshuHttpAdapter } from '../src/adapters/xhs-http.mjs'
import { LoopStore } from '../src/store.mjs'

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

async function researchFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'douyin-research-adapter-'))
  const cwd = path.join(root, 'MediaCrawler')
  const python = path.join(cwd, '.venv', 'bin', 'python')
  const wrapper = path.join(root, 'mediacrawler-entry.py')
  const stateRoot = path.join(root, 'sidecar-state')
  const artifactsRoot = path.join(root, 'artifacts')
  const store = new LoopStore(path.join(root, 'store'))
  await mkdir(path.dirname(python), { recursive: true })
  await writeFile(python, '#!/bin/sh\n')
  await chmod(python, 0o755)
  await writeFile(path.join(cwd, 'main.py'), '# fixture\n')
  await writeFile(wrapper, '# fixture\n')
  return { root, cwd, python, wrapper, stateRoot, artifactsRoot, store }
}

test('Docker research runtime maps only state and artifact paths into the container', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'douyin-docker-runtime-'))
  const artifacts = path.join(root, 'artifacts')
  const state = path.join(root, 'state')
  const calls = []
  const lowLevelRun = async (command, args, options) => {
    calls.push({ command, args, options })
    return { code: 0, stdout: '', stderr: '' }
  }
  const runtime = createDockerResearchRuntime({
    containerName: 'fixture-container',
    hostArtifactsRoot: artifacts,
    hostStateRoot: state,
    runImpl: lowLevelRun,
  })
  await runtime.runImpl('/opt/python', ['/opt/entry.py', '--save_data_path', path.join(artifacts, 'run-1')], {
    env: { DSH_SOCIAL_BROWSER_PROFILE_ROOT: path.join(state, 'browser-profiles', 'default') },
    interactive: true,
  })
  assert.equal(calls[0].command, 'docker')
  assert.deepEqual(calls[0].args, [
    'exec', '-e', 'DSH_SOCIAL_BROWSER_PROFILE_ROOT=/state/browser-profiles/default',
    'fixture-container', '/opt/python', '/opt/entry.py', '--save_data_path', '/artifacts/run-1',
  ])
})

test('Douyin research login uses QR plus a dedicated persistent profile and requires license acceptance', async () => {
  const fixture = await researchFixture()
  const calls = []
  const runImpl = async (command, args, options) => {
    calls.push({ command, args, options })
    await mkdir(path.join(options.env.DSH_SOCIAL_BROWSER_PROFILE_ROOT, 'dy_user_data_dir'), { recursive: true })
    return { code: 0 }
  }
  const adapter = new DouyinResearchAdapter({ ...fixture, account: 'research', runImpl })
  await assert.rejects(adapter.login(), /restricted non-commercial/i)
  const result = await adapter.login({ licenseAccepted: true })
  assert.equal(result.loginState, 'persisted-unverified')
  assert.equal(calls[0].args.includes('qrcode'), true)
  assert.equal(calls[0].args.includes('detail'), true)
  assert.equal(calls[0].args.includes('--cookies'), false)
  assert.equal(calls[0].options.env.DSH_SOCIAL_LOGIN_ONLY, '1')
  assert.match(calls[0].options.env.DSH_SOCIAL_BROWSER_PROFILE_ROOT, /browser-profiles\/research$/)
})

test('Douyin research search imports captions and comments without platform user identity', async () => {
  const fixture = await researchFixture()
  const calls = []
  const runImpl = async (_command, args, options) => {
    calls.push({ args, options })
    const output = args[args.indexOf('--save_data_path') + 1]
    const jsonl = path.join(output, 'douyin', 'jsonl')
    await mkdir(jsonl, { recursive: true })
    await mkdir(path.join(options.env.DSH_SOCIAL_BROWSER_PROFILE_ROOT, 'dy_user_data_dir'), { recursive: true })
    await writeFile(path.join(jsonl, 'search_contents_2026-08-25.jsonl'), `${JSON.stringify({
      aweme_id: '1234567890123456789', desc: '拼豆如何防止散落', create_time: 1787623200,
      liked_count: '12', collected_count: '3', comment_count: '1', share_count: '2',
      creator_hash: 'must-not-retain', nickname: '匿***名', video_download_url: 'https://ephemeral.example/video',
    })}\n`)
    await writeFile(path.join(jsonl, 'search_comments_2026-08-25.jsonl'), `${JSON.stringify({
      comment_id: '9876543210987654321', aweme_id: '1234567890123456789', content: '@用***户 能不能按我现有颜色推荐？',
      create_time: 1787623260, like_count: 7, creator_hash: 'must-not-retain', nickname: '用***户',
    })}\n`)
    return { code: 0 }
  }
  const now = new Date('2026-08-25T10:00:00.000Z')
  const adapter = new DouyinResearchAdapter({ ...fixture, runImpl, clock: () => now })
  const run = await adapter.search({ keywords: ['拼豆'], licenseAccepted: true })
  assert.equal(run.collector.commit, MEDIACRAWLER_COMMIT)
  assert.equal(run.sourceItemIds.length, 2)
  assert.equal(run.rawArtifactsRetained, false)
  assert.equal(calls[0].options.env.DSH_SOCIAL_SEARCH_LIMIT, '10')
  const items = await fixture.store.list('source-items')
  assert.deepEqual(items.map(item => item.kind).sort(), ['comment', 'video'])
  assert.equal(items.find(item => item.kind === 'video').content.text, '拼豆如何防止散落')
  assert.equal(items.find(item => item.kind === 'comment').content.text, '[提及已脱敏] 能不能按我现有颜色推荐？')
  const serialized = JSON.stringify(items)
  assert.equal(serialized.includes('must-not-retain'), false)
  assert.equal(serialized.includes('nickname'), false)
  assert.equal(serialized.includes('video_download_url'), false)
  assert.equal(serialized.includes('@用***户'), false)
  assert.deepEqual(await fixture.store.read('research-runs', run.runId), run)
})

test('Douyin research downloads only one selected registered video', async () => {
  const fixture = await researchFixture()
  const sourceItemId = `sourceitem_${'d'.repeat(64)}`
  await fixture.store.writeImmutable('source-items', sourceItemId, {
    id: sourceItemId,
    kind: 'video',
    source: { platform: 'douyin' },
    externalId: '1234567890123456789',
    canonicalUrl: 'https://www.douyin.com/video/1234567890123456789',
  })
  const calls = []
  const runImpl = async (_command, args) => {
    calls.push(args)
    const output = args[args.indexOf('--save_data_path') + 1]
    const mediaDirectory = path.join(output, 'douyin', 'videos', '1234567890123456789')
    await mkdir(mediaDirectory, { recursive: true })
    await writeFile(path.join(mediaDirectory, 'video.mp4'), 'one selected video')
    return { code: 0 }
  }
  const adapter = new DouyinResearchAdapter({ ...fixture, runImpl })
  const result = await adapter.downloadVideo(sourceItemId, { licenseAccepted: true })
  assert.equal(result.sourceItemId, sourceItemId)
  assert.equal(calls[0].includes('detail'), true)
  assert.equal(calls[0].includes('false'), true)
  const artifacts = await fixture.store.list('research-media')
  assert.equal(artifacts.length, 1)
  assert.equal(artifacts[0].sourceItemId, sourceItemId)
})

test('local transcript only reads a registered media artifact under the research root', async () => {
  const fixture = await researchFixture()
  const mediaDirectory = path.join(fixture.artifactsRoot, 'research-fixture', 'douyin', 'videos', '1234567890')
  const mediaPath = path.join(mediaDirectory, 'video.mp4')
  await mkdir(mediaDirectory, { recursive: true })
  await writeFile(mediaPath, 'synthetic video')
  const sourceItemId = `sourceitem_${'a'.repeat(64)}`
  const mediaArtifactId = `media_${'b'.repeat(64)}`
  await fixture.store.writeImmutable('source-items', sourceItemId, { id: sourceItemId, kind: 'video', mediaArtifactId })
  const mediaSha256 = `sha256:${createHash('sha256').update('synthetic video').digest('hex')}`
  await fixture.store.writeImmutable('research-media', mediaArtifactId, { mediaArtifactId, sourceItemId, path: mediaPath, sha256: mediaSha256 })
  const runImpl = async (_command, args) => {
    const output = args[args.indexOf('--output') + 1]
    await writeFile(output, JSON.stringify({ language: 'zh', languageProbability: 0.99, text: '先分类，再拼。', segments: [{ start: 0, end: 1.2, text: '先分类，再拼。' }] }))
    return { code: 0 }
  }
  const adapter = new LocalWhisperAdapter({
    python: fixture.python,
    helper: fixture.wrapper,
    store: fixture.store,
    artifactsRoot: fixture.artifactsRoot,
    runImpl,
    clock: () => new Date('2026-08-25T10:00:00.000Z'),
  })
  const transcript = await adapter.transcribe(sourceItemId)
  assert.equal(transcript.text, '先分类，再拼。')
  assert.match(transcript.transcriptId, /^transcript_[a-f0-9]{64}$/)
  assert.deepEqual(await fixture.store.read('video-transcripts', transcript.transcriptId), transcript)
})
