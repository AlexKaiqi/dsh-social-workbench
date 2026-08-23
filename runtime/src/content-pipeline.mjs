import { mkdir, open, readFile } from 'node:fs/promises'
import path from 'node:path'
import { sha256, stableStringify } from './domain.mjs'
import { assertMediaUnchanged, fingerprintMedia } from './media.mjs'

function digestId(prefix, payload) {
  return `${prefix}_${sha256(stableStringify(payload)).replace('sha256:', '')}`
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`)
  return value.trim()
}

function optionalText(value, label) {
  if (value == null || value === '') return ''
  if (typeof value !== 'string') throw new Error(`${label} must be a string`)
  return value.trim()
}

function stringList(value, label) {
  if (value == null) return []
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} must be an array of strings`)
  }
  return value.map((item) => item.trim()).filter(Boolean)
}

function immutablePayload(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

async function writeImmutableFile(target, value) {
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 })
  const payload = immutablePayload(value)
  try {
    const handle = await open(target, 'wx', 0o600)
    try { await handle.writeFile(payload, 'utf8') } finally { await handle.close() }
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    if (await readFile(target, 'utf8') !== payload) throw new Error(`immutable artifact already differs: ${target}`)
  }
  return target
}

function evidenceSourceId(ref) {
  return typeof ref === 'string' ? ref.split('#', 1)[0] : ''
}

function validateVariant(platform, variant) {
  requireText(variant?.title, `${platform}.title`)
  requireText(variant?.body, `${platform}.body`)
  if (platform === 'xiaohongshu' && [...variant.title].length > 20) throw new Error('xiaohongshu.title exceeds 20 characters')
  if (platform === 'xiaohongshu' && [...variant.body].length > 1000) throw new Error('xiaohongshu.body exceeds 1000 characters')
  if (!Array.isArray(variant.mediaRefs) || variant.mediaRefs.length === 0) throw new Error(`${platform}.mediaRefs must not be empty`)
  if (variant.mediaRefs.some((item) => typeof item !== 'string' || item.trim() === '')) throw new Error(`${platform}.mediaRefs must contain strings`)
  stringList(variant.topics, `${platform}.topics`)
  if (platform === 'douyin' && variant.mediaRefs.length !== 1) throw new Error('douyin requires exactly one video mediaRef')
}

function canonicalVariant(variant, platform) {
  return {
    title: requireText(variant.title, `${platform}.title`),
    body: requireText(variant.body, `${platform}.body`),
    topics: stringList(variant.topics, `${platform}.topics`),
    mediaRefs: variant.mediaRefs.map((item) => item.trim()),
  }
}

export class ContentPipeline {
  constructor({ store, publicationLoop }) {
    this.store = store
    this.publicationLoop = publicationLoop
  }

  async ingest(input, { baseDir, now = new Date() } = {}) {
    const origin = input?.origin ?? { kind: 'manual' }
    if (!['manual', 'file', 'authorized-account'].includes(origin.kind)) throw new Error(`unsupported origin kind: ${origin.kind}`)
    if (origin.ref != null && typeof origin.ref !== 'string') throw new Error('source.origin.ref must be a string')
    const attachments = Array.isArray(input?.attachments)
      ? input.attachments.map((item) => ({ kind: item?.kind, path: item?.path }))
      : input?.attachments
    const payload = {
      schemaVersion: 'social-workbench.source/v1',
      origin: { kind: origin.kind, ...(origin.ref ? { ref: origin.ref.trim() } : {}) },
      title: requireText(input?.title, 'source.title'),
      text: requireText(input?.text, 'source.text'),
      attachments: await fingerprintMedia(attachments, { baseDir }),
      rightsNote: requireText(input?.rightsNote, 'source.rightsNote'),
    }
    const sourceId = digestId('source', payload)
    const existing = await this.store.readOptional('sources', sourceId)
    if (existing) return existing
    const source = { ...payload, sourceId, observedAt: now.toISOString() }
    await this.store.writeImmutable('sources', sourceId, source)
    return source
  }

  async createBrief(input, { now = new Date() } = {}) {
    if (!Array.isArray(input?.sourceIds) || input.sourceIds.length === 0) throw new Error('brief.sourceIds must not be empty')
    const sources = new Map()
    for (const sourceId of input.sourceIds) sources.set(sourceId, await this.store.read('sources', sourceId))
    if (!Array.isArray(input.claims) || input.claims.length === 0) throw new Error('brief.claims must not be empty')
    const claims = []
    for (const [index, claim] of input.claims.entries()) {
      requireText(claim?.claim, `brief.claims[${index}].claim`)
      if (!Array.isArray(claim.evidenceRefs) || claim.evidenceRefs.length === 0) {
        throw new Error(`brief.claims[${index}].evidenceRefs must not be empty`)
      }
      for (const ref of claim.evidenceRefs) {
        requireText(ref, `brief.claims[${index}].evidenceRefs`)
        if (!sources.has(evidenceSourceId(ref))) throw new Error(`claim evidence does not reference a brief source: ${ref}`)
      }
      claims.push({
        claim: requireText(claim.claim, `brief.claims[${index}].claim`),
        evidenceRefs: claim.evidenceRefs.map((ref) => ref.trim()),
      })
    }
    const payload = {
      schemaVersion: 'social-workbench.brief/v1',
      sourceIds: [...new Set(input.sourceIds)],
      objective: requireText(input.objective, 'brief.objective'),
      audience: requireText(input.audience, 'brief.audience'),
      coreMessage: requireText(input.coreMessage, 'brief.coreMessage'),
      claims,
      callToAction: optionalText(input.callToAction, 'brief.callToAction'),
      constraints: stringList(input.constraints, 'brief.constraints'),
    }
    const briefId = digestId('brief', payload)
    const existing = await this.store.readOptional('briefs', briefId)
    if (existing) return existing
    const brief = { ...payload, briefId, createdAt: now.toISOString() }
    await this.store.writeImmutable('briefs', briefId, brief)
    return brief
  }

  async buildPackage(input, { now = new Date() } = {}) {
    const brief = await this.store.read('briefs', requireText(input?.briefId, 'package.briefId'))
    const sources = []
    for (const sourceId of brief.sourceIds) {
      const source = await this.store.read('sources', sourceId)
      await assertMediaUnchanged({ content: { media: source.attachments } })
      sources.push(source)
    }
    for (const platform of ['xiaohongshu', 'douyin']) validateVariant(platform, input?.variants?.[platform])
    if (input.visibility !== 'private' && input.testMode === true) throw new Error('testMode package requires private visibility')
    const accounts = input.accounts ?? {}
    requireText(accounts.xiaohongshu, 'package.accounts.xiaohongshu')
    requireText(accounts.douyin, 'package.accounts.douyin')

    const variants = {
      xiaohongshu: canonicalVariant(input.variants.xiaohongshu, 'xiaohongshu'),
      douyin: canonicalVariant(input.variants.douyin, 'douyin'),
    }
    const packagePayload = {
      schemaVersion: 'social-workbench.content-package/v1',
      briefId: brief.briefId,
      sourceIds: brief.sourceIds,
      accounts: { xiaohongshu: accounts.xiaohongshu.trim(), douyin: accounts.douyin.trim() },
      visibility: input.visibility,
      testMode: input.testMode === true,
      variants,
    }
    const packageId = digestId('package', packagePayload)
    const existingPackage = await this.store.readOptional('packages', packageId)
    if (existingPackage) return existingPackage
    const marker = `SWB-${packageId.slice(-12).toUpperCase()}`

    const attachmentMap = new Map()
    for (const source of sources) {
      source.attachments.forEach((attachment, index) => attachmentMap.set(`${source.sourceId}#attachment:${index}`, attachment))
    }
    const resolveMedia = (refs, platform) => refs.map((ref) => {
      const media = attachmentMap.get(ref)
      if (!media) throw new Error(`${platform} mediaRef not found: ${ref}`)
      return media
    })

    const xhsVariant = variants.xiaohongshu
    const xhsMedia = resolveMedia(xhsVariant.mediaRefs, 'xiaohongshu')
    if (xhsMedia.some((item) => item.kind === 'video') && xhsMedia.length !== 1) throw new Error('xiaohongshu video package requires exactly one media item')
    const xhsRevision = await this.publicationLoop.prepare({
      platform: 'xiaohongshu',
      accountRef: accounts.xiaohongshu,
      visibility: input.visibility,
      testMode: input.testMode === true,
      sourceRefs: brief.sourceIds,
      content: {
        title: xhsVariant.title,
        body: `${xhsVariant.body}\n\n${marker}`,
        verifyMarker: marker,
        topics: xhsVariant.topics ?? [],
        media: xhsMedia,
      },
    }, { now })

    const douyinVariant = variants.douyin
    const douyinMedia = resolveMedia(douyinVariant.mediaRefs, 'douyin')
    if (douyinMedia[0].kind !== 'video') throw new Error('douyin mediaRef must point to a video')
    const artifactRoot = path.join(this.store.root, 'artifacts', packageId)
    const douyinManifest = {
      id: packageId,
      platform: 'douyin',
      title: douyinVariant.title,
      caption: `${douyinVariant.body}\n\n${marker}`,
      publish_mode: 'manual',
      video_file: douyinMedia[0].path,
      topics: douyinVariant.topics ?? [],
      status: 'pending',
      publish_enabled: true,
      visibility: input.visibility,
    }
    const manifestPath = await writeImmutableFile(path.join(artifactRoot, 'douyin-manifest.json'), douyinManifest)
    const douyinRevision = await this.publicationLoop.prepare({
      platform: 'douyin',
      accountRef: accounts.douyin,
      visibility: input.visibility,
      testMode: input.testMode === true,
      sourceRefs: brief.sourceIds,
      content: {
        title: douyinVariant.title,
        body: douyinManifest.caption,
        verifyMarker: marker,
        topics: douyinVariant.topics ?? [],
        media: douyinMedia,
      },
      execution: {
        manifestPath,
        ...(input.schedulePublishAt ? { schedulePublishAt: input.schedulePublishAt } : {}),
      },
    }, { now })

    const contentPackage = {
      ...packagePayload,
      packageId,
      marker,
      revisions: {
        xiaohongshu: xhsRevision.revisionHash,
        douyin: douyinRevision.revisionHash,
      },
      artifacts: { douyinManifest: manifestPath },
      createdAt: now.toISOString(),
    }
    await this.store.writeImmutable('packages', packageId, contentPackage)
    return contentPackage
  }
}
