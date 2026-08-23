import assert from 'node:assert/strict'
import { readFile, mkdtemp, mkdir, realpath, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { SocialWorkbenchService, resolveSocialWorkbenchRoot } from '../dsh/service.js'

const ajv = new Ajv2020({ allErrors: true })
addFormats(ajv)

async function validator(name) {
  const schema = JSON.parse(await readFile(new URL(`../spec/${name}.schema.json`, import.meta.url), 'utf8'))
  return ajv.compile(schema)
}

function assertSchema(validate, value) {
  assert.equal(validate(value), true, JSON.stringify(validate.errors, null, 2))
}

async function fixture() {
  const workspace = await mkdtemp(path.join(tmpdir(), 'dsh-social-workspace-'))
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'dsh-social-state-'))
  const media = path.join(workspace, 'media')
  await mkdir(media)
  await writeFile(path.join(media, 'image.png'), Buffer.from('synthetic-image'))
  await writeFile(path.join(media, 'video.mp4'), Buffer.from('synthetic-video'))
  const service = new SocialWorkbenchService(stateRoot)
  await service.init()
  return { service, stateRoot, workspace }
}

function sourceInput() {
  return {
    origin: { kind: 'manual' },
    title: '授权测试素材',
    text: '这是仅用于本地闭环测试的合成素材。',
    rightsNote: '用户声明拥有这些合成素材。',
    attachments: [
      { kind: 'image', path: 'media/image.png' },
      { kind: 'video', path: 'media/video.mp4' },
    ],
  }
}

test('stages one complete source-to-dual-platform package through the service', async () => {
  const { service, workspace } = await fixture()
  const source = await service.ingest(sourceInput(), workspace)
  assertSchema(await validator('source-bundle'), source)
  const canonicalWorkspace = await realpath(workspace)
  assert.equal(source.attachments.length, 2)
  assert.equal(source.attachments.every((item) => item.path.startsWith(canonicalWorkspace)), true)

  const brief = await service.createBrief({
    sourceIds: [source.sourceId],
    objective: '验证闭环',
    audience: '测试账号关注者',
    coreMessage: '闭环可以在私密可见性下验证',
    claims: [{ claim: '素材为合成测试素材', evidenceRefs: [`${source.sourceId}#text`] }],
    constraints: ['仅自己可见'],
  })
  assertSchema(await validator('evidence-brief'), brief)
  const imageRef = `${source.sourceId}#attachment:0`
  const videoRef = `${source.sourceId}#attachment:1`
  const contentPackage = await service.buildPackage({
    briefId: brief.briefId,
    accounts: { xiaohongshu: 'account:xhs-test', douyin: 'account:douyin-test' },
    visibility: 'private',
    testMode: true,
    variants: {
      xiaohongshu: { title: '私密闭环测试', body: '合成素材测试', mediaRefs: [imageRef], topics: ['测试'] },
      douyin: { title: '私密闭环测试', body: '合成素材测试', mediaRefs: [videoRef], topics: ['测试'] },
    },
  })
  assertSchema(await validator('content-package'), contentPackage)
  assert.match(contentPackage.revisions.xiaohongshu, /^sha256:/)
  assert.match(contentPackage.revisions.douyin, /^sha256:/)
  assert.match(contentPackage.marker, /^SWB-/)

  const status = await service.status()
  assert.deepEqual(status.counts, { sources: 1, briefs: 1, packages: 1, revisions: 2, receipts: 0 })
  const snapshot = await service.capabilitySnapshot()
  assertSchema(await validator('capability-snapshot'), snapshot)
  assert.equal(snapshot.capabilities.some(item => item.id === 'content.dual-platform-package' && item.health.state === 'ready'), true)
  assert.deepEqual(await service.read('packages', contentPackage.packageId), contentPackage)
  assert.throws(() => service.read('confirmations', 'anything'), /not model-readable/)
})

test('rejects missing Workspace, traversal, absolute paths, and escaping symlinks', async () => {
  const { service, workspace } = await fixture()
  await assert.rejects(service.ingest(sourceInput(), ''), /requires an Agent Workspace/)

  const outside = await mkdtemp(path.join(tmpdir(), 'dsh-social-outside-'))
  const secret = path.join(outside, 'secret.png')
  await writeFile(secret, Buffer.from('secret'))
  await symlink(secret, path.join(workspace, 'media', 'escape.png'))
  for (const candidate of ['../outside.png', secret, 'media/escape.png']) {
    const input = sourceInput()
    input.attachments = [{ kind: 'image', path: candidate }]
    await assert.rejects(service.ingest(input, workspace), /ENOENT|escapes the current Workspace/)
  }
})

test('resolves only explicit DSH and home variables', () => {
  const root = resolveSocialWorkbenchRoot('$DSH_HOME/social', { DSH_HOME: '/var/dsh-test', HOME: '/home/test' })
  assert.equal(root, '/var/dsh-test/social')
  assert.equal(resolveSocialWorkbenchRoot('$HOME/social', { HOME: '/home/test' }), '/home/test/social')
})
