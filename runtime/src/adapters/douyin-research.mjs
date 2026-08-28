import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { access, mkdir, readFile, readdir, realpath, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { assertSafeId, sha256, stableStringify } from '../domain.mjs'

export const MEDIACRAWLER_COMMIT = 'd6f7c5bb906b6dac40ddf343ef9e26438a3de092'

function run(command, args, { cwd, env, timeoutMs = 30 * 60_000, interactive = true } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: interactive ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    if (!interactive) {
      child.stdout.on('data', chunk => { stdout += chunk })
      child.stderr.on('data', chunk => { stderr += chunk })
    }
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`Douyin research sidecar timed out after ${timeoutMs}ms`))
    }, timeoutMs)
    child.on('error', error => { clearTimeout(timer); reject(error) })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      resolve({ code, signal, stdout, stderr })
    })
  })
}

function mappedContainerPath(value, mappings) {
  if (typeof value !== 'string') return value
  for (const [hostRoot, containerRoot] of mappings) {
    const relative = path.relative(hostRoot, value)
    if (relative === '') return containerRoot
    if (!relative.startsWith('..') && !path.isAbsolute(relative)) return path.posix.join(containerRoot, ...relative.split(path.sep))
  }
  return value
}

export function createDockerResearchRuntime({
  containerName = 'dsh-social-douyin-research',
  hostArtifactsRoot,
  hostStateRoot,
  containerArtifactsRoot = '/artifacts',
  containerStateRoot = '/state',
  runImpl = run,
} = {}) {
  const mappings = [
    [path.resolve(hostArtifactsRoot), containerArtifactsRoot],
    [path.resolve(hostStateRoot), containerStateRoot],
  ]
  const dockerRun = async (command, args, options = {}) => {
    const dockerArgs = ['exec']
    for (const [key, value] of Object.entries(options.env ?? {})) {
      dockerArgs.push('-e', `${key}=${mappedContainerPath(value, mappings)}`)
    }
    dockerArgs.push(containerName, command, ...args.map(value => mappedContainerPath(value, mappings)))
    return runImpl('docker', dockerArgs, {
      timeoutMs: options.timeoutMs,
      interactive: options.interactive,
    })
  }
  const doctor = async () => {
    const inspect = await runImpl('docker', ['inspect', '--format', '{{.State.Running}} {{if .State.Health}}{{.State.Health.Status}}{{end}}', containerName], { interactive: false, timeoutMs: 15_000 })
    const state = inspect.code === 0 ? inspect.stdout.trim().split(/\s+/) : []
    const running = state[0] === 'true'
    const healthy = state[1] === 'healthy'
    let runtimeReady = false
    let localAsr = false
    if (running) {
      const runtime = await runImpl('docker', ['exec', containerName, 'sh', '-lc', 'test -x /opt/MediaCrawler/.venv/bin/python && test -f /opt/MediaCrawler/main.py && test -f /opt/dsh/mediacrawler-entry.py'], { interactive: false, timeoutMs: 15_000 })
      runtimeReady = runtime.code === 0
      const asr = await runImpl('docker', ['exec', containerName, '/opt/MediaCrawler/.venv/bin/python', '-c', 'import faster_whisper'], { interactive: false, timeoutMs: 30_000 })
      localAsr = asr.code === 0
    }
    return {
      ready: running && healthy && runtimeReady,
      checks: { containerRunning: running, containerHealthy: healthy, runtime: runtimeReady },
      localAsr: localAsr ? 'installed' : 'missing-optional',
      runtime: 'docker',
      containerName,
      noVncUrl: 'http://127.0.0.1:7900/vnc.html?autoconnect=1&resize=scale',
    }
  }
  return { runImpl: dockerRun, doctorImpl: doctor }
}

async function exists(target) {
  try { await access(target); return true } catch { return false }
}

async function pythonPackagePresent(venvRoot, packageName) {
  const lib = path.join(venvRoot, 'lib')
  if (!(await exists(lib))) return false
  const versions = await readdir(lib)
  for (const version of versions) {
    if (await exists(path.join(lib, version, 'site-packages', packageName))) return true
  }
  return false
}

function safeAccount(value) {
  return assertSafeId(value ?? 'default', 'account')
}

function integer(value, { name, min, max }) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`)
  }
  return parsed
}

function cleanKeywords(values) {
  const keywords = (Array.isArray(values) ? values : [values])
    .map(value => String(value ?? '').trim())
    .filter(Boolean)
  if (keywords.length < 1 || keywords.length > 5) throw new Error('keywords must contain 1 to 5 values')
  for (const keyword of keywords) {
    if (keyword.length > 80 || /[\r\n,]/.test(keyword)) {
      throw new Error('each keyword must be at most 80 characters and contain no comma or newline')
    }
  }
  return [...new Set(keywords)]
}

function isoFromEpoch(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return null
  const millis = number > 10_000_000_000 ? number : number * 1000
  const date = new Date(millis)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function metric(name, value, definition) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? { name, value: number, definition } : null
}

async function jsonlItems(directory, itemType) {
  if (!(await exists(directory))) return []
  const names = (await readdir(directory)).filter(name => name.includes(`_${itemType}_`) && name.endsWith('.jsonl')).sort()
  const output = []
  for (const name of names) {
    const lines = (await readFile(path.join(directory, name), 'utf8')).split('\n')
    for (const line of lines) {
      if (line.trim()) output.push(JSON.parse(line))
    }
  }
  return output
}

async function sha256File(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return `sha256:${hash.digest('hex')}`
}

function sourceItemId(value) {
  return `sourceitem_${sha256(stableStringify(value)).slice('sha256:'.length)}`
}

function redactPlatformMentions(value) {
  return String(value ?? '')
    .replace(/@[^\s#，。！？,;；:：\][()（）]+/gu, '[提及已脱敏]')
    .trim()
}

function normalizeVideo(raw, { runId, observedAt, mediaArtifactId = null }) {
  const externalId = String(raw.aweme_id ?? '').trim()
  if (!/^\d{5,40}$/.test(externalId)) return null
  const canonicalUrl = `https://www.douyin.com/video/${encodeURIComponent(externalId)}`
  const publishedAt = isoFromEpoch(raw.create_time)
  const text = redactPlatformMentions(raw.desc ?? raw.title ?? '')
  const core = {
    schemaVersion: 'social-workbench.source-item/v1',
    runId,
    kind: 'video',
    source: { platform: 'douyin', connectorId: 'mediacrawler-douyin-research' },
    externalId,
    parentExternalId: null,
    canonicalUrl,
    publishedAt,
    observedAt,
    visibility: 'public',
    content: {
      text,
      textKind: 'platform-caption',
      media: [{ type: 'video', url: canonicalUrl }],
    },
    metrics: [
      metric('likedCount', raw.liked_count, '抖音采集时作品页返回的点赞计数'),
      metric('collectedCount', raw.collected_count, '抖音采集时作品页返回的收藏计数'),
      metric('commentCount', raw.comment_count, '抖音采集时作品页返回的评论计数'),
      metric('shareCount', raw.share_count, '抖音采集时作品页返回的分享计数'),
    ].filter(Boolean),
    mediaArtifactId,
    provenance: {
      accessMode: 'authenticated-browser-private-api',
      collector: 'NanmiCoder/MediaCrawler',
      collectorCommit: MEDIACRAWLER_COMMIT,
      contentHash: sha256(stableStringify({ externalId, publishedAt, text })),
      termsBasis: 'public-content; user-initiated local non-commercial research; upstream restricted license',
    },
    privacy: 'no-platform-user-identity-retained',
  }
  return { ...core, id: sourceItemId(core) }
}

function normalizeComment(raw, { runId, observedAt }) {
  const externalId = String(raw.comment_id ?? '').trim()
  const videoId = String(raw.aweme_id ?? '').trim()
  const text = redactPlatformMentions(raw.content)
  if (!/^\d{5,40}$/.test(externalId) || !/^\d{5,40}$/.test(videoId) || !text) return null
  const publishedAt = isoFromEpoch(raw.create_time)
  const core = {
    schemaVersion: 'social-workbench.source-item/v1',
    runId,
    kind: 'comment',
    source: { platform: 'douyin', connectorId: 'mediacrawler-douyin-research' },
    externalId,
    parentExternalId: videoId,
    canonicalUrl: `https://www.douyin.com/video/${encodeURIComponent(videoId)}`,
    publishedAt,
    observedAt,
    visibility: 'public',
    content: { text, textKind: 'comment', media: [] },
    metrics: [metric('likeCount', raw.like_count, '抖音采集时评论接口返回的点赞计数')].filter(Boolean),
    mediaArtifactId: null,
    provenance: {
      accessMode: 'authenticated-browser-private-api',
      collector: 'NanmiCoder/MediaCrawler',
      collectorCommit: MEDIACRAWLER_COMMIT,
      contentHash: sha256(stableStringify({ externalId, parentExternalId: videoId, publishedAt, text })),
      termsBasis: 'public-content; user-initiated local non-commercial research; upstream restricted license',
    },
    privacy: 'no-platform-user-identity-retained',
  }
  return { ...core, id: sourceItemId(core) }
}

export class DouyinResearchAdapter {
  constructor({ python, cwd, wrapper, stateRoot, artifactsRoot, store, account = 'default', runImpl = run, doctorImpl = null, clock = () => new Date(), maxMediaBytes = 512 * 1024 * 1024 } = {}) {
    this.python = python
    this.cwd = cwd
    this.wrapper = wrapper
    this.stateRoot = stateRoot
    this.artifactsRoot = artifactsRoot
    this.store = store
    this.account = safeAccount(account)
    this.runImpl = runImpl
    this.doctorImpl = doctorImpl
    this.clock = clock
    this.maxMediaBytes = maxMediaBytes
  }

  profileRoot() {
    return path.resolve(this.stateRoot, 'browser-profiles', this.account)
  }

  async doctor() {
    if (this.doctorImpl) {
      const runtime = await this.doctorImpl()
      const profilePresent = await exists(path.join(this.profileRoot(), 'dy_user_data_dir'))
      return {
        ...runtime,
        account: this.account,
        loginState: profilePresent ? 'persisted-unverified' : 'missing',
        browserIsolation: 'docker-dedicated-profile-standard-playwright',
        collector: { repository: 'https://github.com/NanmiCoder/MediaCrawler', commit: MEDIACRAWLER_COMMIT, license: 'NON-COMMERCIAL LEARNING LICENSE 1.1' },
      }
    }
    const checks = {
      python: Boolean(this.python && await exists(this.python)),
      checkout: Boolean(this.cwd && await exists(path.join(this.cwd, 'main.py'))),
      wrapper: Boolean(this.wrapper && await exists(this.wrapper)),
    }
    const profilePresent = await exists(path.join(this.profileRoot(), 'dy_user_data_dir'))
    const localAsr = await pythonPackagePresent(path.join(this.cwd, '.venv'), 'faster_whisper')
    return {
      ready: Object.values(checks).every(Boolean),
      checks,
      account: this.account,
      loginState: profilePresent ? 'persisted-unverified' : 'missing',
      localAsr: localAsr ? 'installed' : 'missing-optional',
      browserIsolation: 'dedicated-profile-standard-playwright',
      collector: { repository: 'https://github.com/NanmiCoder/MediaCrawler', commit: MEDIACRAWLER_COMMIT, license: 'NON-COMMERCIAL LEARNING LICENSE 1.1' },
    }
  }

  assertLicense(accepted) {
    if (accepted !== true) {
      throw new Error('MediaCrawler has a restricted non-commercial learning license; pass explicit license acceptance for each login/search command')
    }
  }

  async invoke(args, { enableMedia = false, loginOnly = false, searchLimit, timeoutMs } = {}) {
    const report = await this.doctor()
    if (!report.ready) throw new Error('Douyin research sidecar is not installed; run the explicit douyin-research bootstrap first')
    await mkdir(this.profileRoot(), { recursive: true, mode: 0o700 })
    const result = await this.runImpl(this.python, [this.wrapper, ...args], {
      cwd: this.cwd,
      timeoutMs,
      interactive: true,
      env: {
        DSH_SOCIAL_BROWSER_PROFILE_ROOT: this.profileRoot(),
        DSH_SOCIAL_MEDIACRAWLER_ROOT: this.cwd,
        DSH_SOCIAL_ENABLE_MEDIA: enableMedia ? '1' : '0',
        DSH_SOCIAL_LOGIN_ONLY: loginOnly ? '1' : '0',
        DSH_SOCIAL_SEARCH_LIMIT: searchLimit == null ? '' : String(searchLimit),
      },
    })
    if (result.code !== 0) throw new Error(`Douyin research sidecar exited with code ${result.code}`)
    return result
  }

  async login({ licenseAccepted = false } = {}) {
    this.assertLicense(licenseAccepted)
    await this.invoke([
      '--platform', 'dy', '--lt', 'qrcode', '--type', 'detail',
      '--headless', 'false', '--save_data_option', 'jsonl',
      '--get_comment', 'false', '--max_concurrency_num', '1', '--enable_ip_proxy', 'false',
    ], { loginOnly: true, timeoutMs: 10 * 60_000 })
    const profilePresent = await exists(path.join(this.profileRoot(), 'dy_user_data_dir'))
    return {
      account: this.account,
      loginState: profilePresent ? 'persisted-unverified' : 'unknown',
      note: 'The next search validates the session; an expired session opens QR login again. Cookies stay inside the dedicated browser profile.',
    }
  }

  async search({ keywords, maxVideos = 10, maxComments = 10, includeSubComments = false, licenseAccepted = false } = {}) {
    this.assertLicense(licenseAccepted)
    const clean = cleanKeywords(keywords)
    const videos = integer(maxVideos, { name: 'maxVideos', min: 10, max: 50 })
    const comments = integer(maxComments, { name: 'maxComments', min: 1, max: 50 })
    const startedAt = this.clock()
    const runId = `research_${randomUUID()}`
    const runDirectory = path.resolve(this.artifactsRoot, runId)
    await mkdir(this.artifactsRoot, { recursive: true, mode: 0o700 })
    await mkdir(runDirectory, { recursive: false, mode: 0o700 })
    try {
      await this.invoke([
        '--platform', 'dy', '--lt', 'qrcode', '--type', 'search',
        '--keywords', clean.join(','), '--headless', 'false',
        '--save_data_option', 'jsonl', '--save_data_path', runDirectory,
        '--get_comment', 'true', '--get_sub_comment', includeSubComments ? 'true' : 'false',
        '--crawler_max_notes_count', String(videos),
        '--max_comments_count_singlenotes', String(comments),
        '--max_concurrency_num', '1', '--enable_ip_proxy', 'false',
      ], { enableMedia: false, searchLimit: videos, timeoutMs: 45 * 60_000 })

      const observedAt = this.clock().toISOString()
      const jsonlDirectory = path.join(runDirectory, 'douyin', 'jsonl')
      const rawVideos = await jsonlItems(jsonlDirectory, 'contents')
      const rawComments = await jsonlItems(jsonlDirectory, 'comments')
      const sourceItems = []

      for (const raw of rawVideos) {
        const item = normalizeVideo(raw, { runId, observedAt })
        if (item) sourceItems.push(item)
      }
      for (const raw of rawComments) {
        const item = normalizeComment(raw, { runId, observedAt })
        if (item) sourceItems.push(item)
      }

      await rm(runDirectory, { recursive: true, force: true })
      for (const item of sourceItems) await this.store.writeImmutable('source-items', item.id, item)
      const run = {
        schemaVersion: 'social-workbench.research-run/v1',
        runId,
        platform: 'douyin',
        operation: 'keyword-search',
        queries: clean,
        limits: { maxVideos: videos, maxCommentsPerVideo: comments, includeSubComments: includeSubComments === true },
        collector: { name: 'NanmiCoder/MediaCrawler', commit: MEDIACRAWLER_COMMIT, accessMode: 'authenticated-browser-private-api' },
        sourceItemIds: sourceItems.map(item => item.id),
        mediaArtifactIds: [],
        startedAt: startedAt.toISOString(),
        finishedAt: observedAt,
        rawArtifactsRetained: false,
        privacy: 'no-platform-user-identity-retained',
      }
      await this.store.writeImmutable('research-runs', runId, run)
      return run
    } catch (error) {
      await rm(runDirectory, { recursive: true, force: true }).catch(() => {})
      throw error
    }
  }

  async downloadVideo(sourceItemIdValue, { licenseAccepted = false } = {}) {
    this.assertLicense(licenseAccepted)
    const sourceItem = await this.store.read('source-items', assertSafeId(sourceItemIdValue, 'sourceItemId'))
    if (sourceItem.kind !== 'video' || sourceItem.source?.platform !== 'douyin') throw new Error('source item is not a Douyin video')
    const artifactRunId = `media_${randomUUID()}`
    const runDirectory = path.resolve(this.artifactsRoot, artifactRunId)
    await mkdir(this.artifactsRoot, { recursive: true, mode: 0o700 })
    await mkdir(runDirectory, { recursive: false, mode: 0o700 })
    try {
      await this.invoke([
        '--platform', 'dy', '--lt', 'qrcode', '--type', 'detail',
        '--specified_id', sourceItem.canonicalUrl, '--headless', 'false',
        '--save_data_option', 'jsonl', '--save_data_path', runDirectory,
        '--get_comment', 'false', '--max_concurrency_num', '1', '--enable_ip_proxy', 'false',
      ], { enableMedia: true, timeoutMs: 20 * 60_000 })
      const mediaPath = path.join(runDirectory, 'douyin', 'videos', sourceItem.externalId, 'video.mp4')
      const metadata = await stat(mediaPath)
      if (!metadata.isFile() || metadata.size < 1) throw new Error('sidecar did not produce a regular video file')
      if (metadata.size > this.maxMediaBytes) throw new Error(`downloaded video exceeds ${this.maxMediaBytes} bytes`)
      const mediaHash = await sha256File(mediaPath)
      const mediaArtifactId = `media_${sha256(`${sourceItem.id}:${mediaHash}:${artifactRunId}`).slice('sha256:'.length)}`
      const artifact = {
        schemaVersion: 'social-workbench.research-media/v1',
        mediaArtifactId,
        sourceItemId: sourceItem.id,
        platform: 'douyin',
        externalId: sourceItem.externalId,
        path: mediaPath,
        sha256: mediaHash,
        size: metadata.size,
        recordedAt: this.clock().toISOString(),
      }
      await rm(path.join(runDirectory, 'douyin', 'jsonl'), { recursive: true, force: true })
      await this.store.writeImmutable('research-media', mediaArtifactId, artifact)
      return { mediaArtifactId, sourceItemId: sourceItem.id, mediaSha256: mediaHash, size: metadata.size, retained: true }
    } catch (error) {
      await rm(runDirectory, { recursive: true, force: true }).catch(() => {})
      throw error
    }
  }
}

export class LocalWhisperAdapter {
  constructor({ python, helper, store, artifactsRoot, runImpl = run, clock = () => new Date() } = {}) {
    this.python = python
    this.helper = helper
    this.store = store
    this.artifactsRoot = path.resolve(artifactsRoot)
    this.runImpl = runImpl
    this.clock = clock
  }

  async transcribe(sourceItemIdValue, { model = 'small', language = 'zh' } = {}) {
    const sourceItemIdValueSafe = assertSafeId(sourceItemIdValue, 'sourceItemId')
    if (!/^[a-zA-Z0-9._-]{1,80}$/.test(model)) throw new Error('model is unsafe')
    if (!/^[a-zA-Z-]{2,16}$/.test(language)) throw new Error('language is unsafe')
    const sourceItem = await this.store.read('source-items', sourceItemIdValueSafe)
    if (sourceItem.kind !== 'video') throw new Error('source item is not a video')
    const candidates = (await this.store.list('research-media'))
      .filter(item => item.sourceItemId === sourceItem.id)
      .sort((left, right) => String(left.recordedAt ?? '').localeCompare(String(right.recordedAt ?? '')))
    const artifact = candidates.at(-1)
    if (!artifact) throw new Error('source item has no downloaded video artifact')
    const mediaPath = await realpath(artifact.path)
    const canonicalArtifactsRoot = await realpath(this.artifactsRoot)
    const relative = path.relative(canonicalArtifactsRoot, mediaPath)
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('media artifact escapes the research artifact root')
    const metadata = await stat(mediaPath)
    if (!metadata.isFile()) throw new Error('media artifact is not a file')
    if (await sha256File(mediaPath) !== artifact.sha256) throw new Error('media artifact changed after registration')
    const outputDirectory = path.join(this.artifactsRoot, `.transcript-${randomUUID()}`)
    const output = path.join(outputDirectory, 'transcript.json')
    await mkdir(outputDirectory, { recursive: false, mode: 0o700 })
    try {
      const result = await this.runImpl(this.python, [this.helper, '--input', mediaPath, '--output', output, '--model', model, '--language', language], {
        timeoutMs: 60 * 60_000,
        interactive: true,
      })
      if (result.code !== 0) throw new Error(`local transcription exited with code ${result.code}`)
      const parsed = JSON.parse(await readFile(output, 'utf8'))
      const createdAt = this.clock().toISOString()
      const core = {
        schemaVersion: 'social-workbench.video-transcript/v1',
        sourceItemId: sourceItem.id,
        mediaSha256: artifact.sha256,
        engine: 'faster-whisper',
        model,
        language: parsed.language ?? language,
        languageProbability: parsed.languageProbability ?? null,
        text: String(parsed.text ?? '').trim(),
        segments: (parsed.segments ?? []).map(segment => ({ start: Number(segment.start), end: Number(segment.end), text: String(segment.text).trim() })),
        createdAt,
      }
      const transcriptId = `transcript_${sha256(stableStringify(core)).slice('sha256:'.length)}`
      const transcript = { ...core, transcriptId }
      await this.store.writeImmutable('video-transcripts', transcriptId, transcript)
      return transcript
    } finally {
      await rm(outputDirectory, { recursive: true, force: true }).catch(() => {})
    }
  }
}
