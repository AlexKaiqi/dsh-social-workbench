import assert from 'node:assert/strict'
import { mkdtemp, readFile, realpath, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { ContentPipeline } from '../src/content-pipeline.mjs'
import { PublicationLoop } from '../src/orchestrator.mjs'
import { LoopStore } from '../src/store.mjs'

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'social-content-test-'))
  const image = path.join(root, 'card.png')
  const video = path.join(root, 'clip.mp4')
  await writeFile(image, 'owned image bytes')
  await writeFile(video, 'owned video bytes')
  const store = new LoopStore(path.join(root, 'state'))
  const publicationLoop = new PublicationLoop({ store })
  const pipeline = new ContentPipeline({ store, publicationLoop })
  return { root, image, video, store, pipeline }
}

async function sourceAndBrief(pipeline, image, video) {
  const source = await pipeline.ingest({
    origin: { kind: 'manual', ref: 'user-provided' },
    title: '自制蓝色卡片',
    text: '一张自制卡片和一段自制视频，可用于私密发布验证。',
    rightsNote: '由用户提供并确认拥有发布权利',
    attachments: [
      { kind: 'image', path: image },
      { kind: 'video', path: video },
    ],
  })
  const brief = await pipeline.createBrief({
    sourceIds: [source.sourceId],
    objective: '验证双平台私密发布闭环',
    audience: '工作台维护者',
    coreMessage: '同一份自有素材可以生成两个平台的可追溯内容包',
    claims: [{
      claim: '素材由用户提供并拥有发布权利',
      evidenceRefs: [`${source.sourceId}#rightsNote`],
    }],
    constraints: ['仅自己可见', '逐次确认'],
  })
  return { source, brief }
}

test('ingress -> brief -> dual-platform package produces two frozen revisions', async () => {
  const { image, video, store, pipeline } = await fixture()
  const { source, brief } = await sourceAndBrief(pipeline, image, video)
  const contentPackage = await pipeline.buildPackage({
    briefId: brief.briefId,
    accounts: {
      xiaohongshu: 'credential:xhs-default',
      douyin: 'credential:douyin-default',
    },
    visibility: 'private',
    testMode: true,
    variants: {
      xiaohongshu: {
        title: '蓝色卡片的一次记录',
        body: '这是一张自己制作的竖图。',
        topics: [],
        mediaRefs: [`${source.sourceId}#attachment:0`],
      },
      douyin: {
        title: '蓝色卡片的一次记录',
        body: '记录一段自己制作的竖屏画面。',
        topics: [],
        mediaRefs: [`${source.sourceId}#attachment:1`],
      },
    },
  })

  assert.match(contentPackage.packageId, /^package_[a-f0-9]{64}$/)
  assert.match(contentPackage.marker, /^SWB-[A-F0-9]{12}$/)
  assert.match(contentPackage.revisions.xiaohongshu, /^sha256:/)
  assert.match(contentPackage.revisions.douyin, /^sha256:/)

  const xhs = await store.read('revisions', contentPackage.revisions.xiaohongshu.replace('sha256:', ''))
  const douyin = await store.read('revisions', contentPackage.revisions.douyin.replace('sha256:', ''))
  assert.deepEqual(xhs.sourceRefs, [source.sourceId])
  assert.equal(xhs.content.media[0].path, await realpath(image))
  assert.equal(douyin.content.media[0].path, await realpath(video))
  assert.match(douyin.execution.manifest.contentHash, /^sha256:/)
  const manifest = JSON.parse(await readFile(contentPackage.artifacts.douyinManifest, 'utf8'))
  assert.equal(manifest.visibility, 'private')
  assert.ok(manifest.caption.includes(contentPackage.marker))

  const repeated = await pipeline.buildPackage({
    briefId: brief.briefId,
    accounts: {
      xiaohongshu: 'credential:xhs-default',
      douyin: 'credential:douyin-default',
    },
    visibility: 'private',
    testMode: true,
    variants: {
      xiaohongshu: {
        title: '蓝色卡片的一次记录',
        body: '这是一张自己制作的竖图。',
        topics: [],
        mediaRefs: [`${source.sourceId}#attachment:0`],
      },
      douyin: {
        title: '蓝色卡片的一次记录',
        body: '记录一段自己制作的竖屏画面。',
        topics: [],
        mediaRefs: [`${source.sourceId}#attachment:1`],
      },
    },
  })
  assert.deepEqual(repeated, contentPackage)
})

test('brief rejects claims whose evidence is outside its source set', async () => {
  const { image, video, pipeline } = await fixture()
  const source = await pipeline.ingest({
    origin: { kind: 'manual' },
    title: '素材',
    text: '正文',
    rightsNote: '自有',
    attachments: [{ kind: 'image', path: image }, { kind: 'video', path: video }],
  })
  await assert.rejects(
    pipeline.createBrief({
      sourceIds: [source.sourceId],
      objective: '目标',
      audience: '受众',
      coreMessage: '核心信息',
      claims: [{ claim: '无来源主张', evidenceRefs: ['source_unknown#text'] }],
    }),
    /claim evidence does not reference a brief source/,
  )
})

test('canonical objects discard undeclared nested fields instead of persisting them', async () => {
  const { image, video, pipeline } = await fixture()
  const source = await pipeline.ingest({
    origin: { kind: 'manual', ref: 'user', cookie: 'must-not-persist' },
    title: '素材',
    text: '正文',
    rightsNote: '自有',
    attachments: [
      { kind: 'image', path: image, token: 'must-not-persist' },
      { kind: 'video', path: video, token: 'must-not-persist' },
    ],
  })
  assert.deepEqual(source.origin, { kind: 'manual', ref: 'user' })
  assert.equal('token' in source.attachments[0], false)

  const brief = await pipeline.createBrief({
    sourceIds: [source.sourceId],
    objective: '目标',
    audience: '受众',
    coreMessage: '核心信息',
    claims: [{ claim: '有来源主张', evidenceRefs: [`${source.sourceId}#text`], hidden: 'drop' }],
    extra: 'drop',
  })
  assert.deepEqual(brief.claims, [{ claim: '有来源主张', evidenceRefs: [`${source.sourceId}#text`] }])

  const contentPackage = await pipeline.buildPackage({
    briefId: brief.briefId,
    accounts: { xiaohongshu: 'credential:xhs', douyin: 'credential:dy', cookie: 'drop' },
    visibility: 'private',
    testMode: true,
    variants: {
      xiaohongshu: { title: '标题', body: '正文', mediaRefs: [`${source.sourceId}#attachment:0`], secret: 'drop' },
      douyin: { title: '标题', body: '正文', mediaRefs: [`${source.sourceId}#attachment:1`], secret: 'drop' },
    },
  })
  assert.deepEqual(contentPackage.accounts, { xiaohongshu: 'credential:xhs', douyin: 'credential:dy' })
  assert.equal('secret' in contentPackage.variants.xiaohongshu, false)
})

test('canonical objects reject non-string constraints and topics', async () => {
  const { image, video, pipeline } = await fixture()
  const { source, brief } = await sourceAndBrief(pipeline, image, video)
  await assert.rejects(pipeline.createBrief({
    sourceIds: [source.sourceId], objective: '目标', audience: '受众', coreMessage: '核心',
    claims: [{ claim: '主张', evidenceRefs: [`${source.sourceId}#text`] }], constraints: [42],
  }), /constraints must be an array of strings/)
  await assert.rejects(pipeline.buildPackage({
    briefId: brief.briefId,
    accounts: { xiaohongshu: 'credential:xhs', douyin: 'credential:dy' },
    visibility: 'private', testMode: true,
    variants: {
      xiaohongshu: { title: '标题', body: '正文', topics: [42], mediaRefs: [`${source.sourceId}#attachment:0`] },
      douyin: { title: '标题', body: '正文', mediaRefs: [`${source.sourceId}#attachment:1`] },
    },
  }), /topics must be an array of strings/)
})

test('package creation refuses source media changed after ingress', async () => {
  const { image, video, pipeline } = await fixture()
  const { source, brief } = await sourceAndBrief(pipeline, image, video)
  await writeFile(video, 'mutated video bytes')
  await assert.rejects(
    pipeline.buildPackage({
      briefId: brief.briefId,
      accounts: { xiaohongshu: 'credential:xhs', douyin: 'credential:dy' },
      visibility: 'private',
      testMode: true,
      variants: {
        xiaohongshu: { title: '标题', body: '正文', mediaRefs: [`${source.sourceId}#attachment:0`] },
        douyin: { title: '标题', body: '正文', mediaRefs: [`${source.sourceId}#attachment:1`] },
      },
    }),
    /media changed after revision/,
  )
})
