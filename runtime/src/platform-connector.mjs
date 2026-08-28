const STRATEGIES = new Set(['balanced', 'lowest-cost', 'lowest-latency', 'widest-coverage', 'highest-reliability'])
const STATES = new Set(['available', 'degraded', 'planned', 'unavailable'])
const EFFECTS = new Set(['none', 'local-write', 'platform-write'])
const EXECUTION_MODES = new Set(['direct', 'coupled', 'outbox-only', 'not-implemented'])

const COST = { free: 0, low: 1, medium: 2, high: 3, unknown: 4 }
const LATENCY = { fast: 0, interactive: 1, batch: 2, unknown: 3 }
const COVERAGE = { selected: 0, account: 1, search: 2, 'public-platform': 3, live: 2, unknown: -1 }
const RELIABILITY = { experimental: 0, community: 1, 'live-verified': 2, official: 3, managed: 3, unknown: -1 }
const STATE = { available: 0, degraded: 1, planned: 2, unavailable: 3 }
const EFFECT = { none: 0, 'local-write': 1, 'platform-write': 2 }

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function assertIdentifier(value, label) {
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(String(value ?? ''))) throw new Error(`${label} is invalid`)
  return value
}

function normalizeOperation(provider, capabilityId, operation) {
  const effect = operation.effect ?? 'none'
  const execution = operation.execution ?? (typeof operation.run === 'function' ? 'direct' : 'not-implemented')
  const state = operation.state ?? 'available'
  if (!EFFECTS.has(effect)) throw new Error(`${provider.id}:${capabilityId} has invalid effect`)
  if (!EXECUTION_MODES.has(execution)) throw new Error(`${provider.id}:${capabilityId} has invalid execution mode`)
  if (!STATES.has(state)) throw new Error(`${provider.id}:${capabilityId} has invalid state`)
  if (effect === 'platform-write' && execution === 'coupled') throw new Error(`${provider.id}:${capabilityId} cannot couple a platform write`)
  return {
    id: capabilityId,
    domain: operation.domain ?? capabilityId.split('.')[0],
    summary: operation.summary ?? capabilityId,
    effect,
    authorization: operation.authorization ?? (effect === 'platform-write' ? 'one-time-confirmation' : 'user-session'),
    execution,
    state,
    quality: {
      cost: operation.quality?.cost ?? 'unknown',
      latency: operation.quality?.latency ?? 'unknown',
      coverage: operation.quality?.coverage ?? 'unknown',
      reliability: operation.quality?.reliability ?? 'unknown',
    },
    coupledCapabilities: [...new Set(operation.coupledCapabilities ?? [])],
    run: operation.run,
  }
}

function score(operation, strategy) {
  const base = [STATE[operation.state] ?? 9]
  if (strategy === 'lowest-cost') return [...base, COST[operation.quality.cost] ?? 9, LATENCY[operation.quality.latency] ?? 9, -(RELIABILITY[operation.quality.reliability] ?? -1)]
  if (strategy === 'lowest-latency') return [...base, LATENCY[operation.quality.latency] ?? 9, COST[operation.quality.cost] ?? 9, -(RELIABILITY[operation.quality.reliability] ?? -1)]
  if (strategy === 'widest-coverage') return [...base, -(COVERAGE[operation.quality.coverage] ?? -1), COST[operation.quality.cost] ?? 9, LATENCY[operation.quality.latency] ?? 9]
  if (strategy === 'highest-reliability') return [...base, -(RELIABILITY[operation.quality.reliability] ?? -1), COST[operation.quality.cost] ?? 9, LATENCY[operation.quality.latency] ?? 9]
  return [...base, -(RELIABILITY[operation.quality.reliability] ?? -1), COST[operation.quality.cost] ?? 9, LATENCY[operation.quality.latency] ?? 9, -(COVERAGE[operation.quality.coverage] ?? -1)]
}

function compareTuple(left, right) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] ?? 0) !== (right[index] ?? 0)) return (left[index] ?? 0) - (right[index] ?? 0)
  }
  return 0
}

export class PlatformConnector {
  constructor({ id, platform, definitions = [], providers = [], defaultStrategy = 'balanced', clock = () => new Date() } = {}) {
    this.id = assertIdentifier(id, 'connector id')
    this.platform = assertIdentifier(platform, 'platform')
    if (!STRATEGIES.has(defaultStrategy)) throw new Error('default strategy is invalid')
    this.defaultStrategy = defaultStrategy
    this.clock = clock
    this.definitions = new Map()
    this.providers = []
    for (const definition of definitions) this.declare(definition)
    for (const provider of providers) this.register(provider)
  }

  declare(definition) {
    const id = assertIdentifier(definition?.id, 'capability id')
    if (this.definitions.has(id)) throw new Error(`duplicate capability definition: ${id}`)
    const effect = definition.effect ?? 'none'
    if (!EFFECTS.has(effect)) throw new Error(`${id} has invalid effect`)
    this.definitions.set(id, {
      id,
      domain: definition.domain ?? id.split('.')[0],
      summary: definition.summary ?? id,
      effect,
      authorization: definition.authorization ?? (effect === 'platform-write' ? 'one-time-confirmation' : 'user-session'),
    })
    return this
  }

  register(provider) {
    const id = assertIdentifier(provider?.id, 'provider id')
    if (this.providers.some(item => item.id === id)) throw new Error(`duplicate provider: ${id}`)
    const capabilities = {}
    for (const [capabilityId, operation] of Object.entries(provider.capabilities ?? {})) {
      assertIdentifier(capabilityId, 'capability id')
      capabilities[capabilityId] = normalizeOperation(provider, capabilityId, operation)
      if (this.definitions.get(capabilityId)?.effect === 'platform-write' && capabilities[capabilityId].effect !== 'platform-write') {
        throw new Error(`${provider.id}:${capabilityId} cannot downgrade a platform-write capability`)
      }
      if (!this.definitions.has(capabilityId)) {
        this.declare({
          id: capabilityId,
          domain: capabilities[capabilityId].domain,
          summary: capabilities[capabilityId].summary,
          effect: capabilities[capabilityId].effect,
          authorization: capabilities[capabilityId].authorization,
        })
      }
    }
    if (Object.keys(capabilities).length === 0) throw new Error(`${id} must declare capabilities`)
    this.providers.push({
      id,
      version: String(provider.version ?? 'unknown'),
      mode: String(provider.mode ?? 'unknown'),
      source: provider.source ?? null,
      capabilities,
    })
    return this
  }

  plan(capabilityId, { strategy = this.defaultStrategy, allowModes } = {}) {
    assertIdentifier(capabilityId, 'capability id')
    if (!STRATEGIES.has(strategy)) throw new Error('strategy is invalid')
    const allowed = allowModes ? new Set(allowModes) : null
    const candidates = this.providers
      .filter(provider => !allowed || allowed.has(provider.mode))
      .flatMap(provider => {
        const operation = provider.capabilities[capabilityId]
        return operation ? [{ provider, operation }] : []
      })
      .sort((left, right) => compareTuple(score(left.operation, strategy), score(right.operation, strategy)) || left.provider.id.localeCompare(right.provider.id))
    const declaredEffect = this.definitions.get(capabilityId)?.effect ?? 'none'
    const candidateEffect = candidates[0]?.operation.effect ?? 'none'
    const effect = EFFECT[declaredEffect] >= EFFECT[candidateEffect] ? declaredEffect : candidateEffect
    return {
      connectorId: this.id,
      platform: this.platform,
      capabilityId,
      strategy,
      effect,
      candidates: candidates.map(({ provider, operation }) => ({
        providerId: provider.id,
        providerVersion: provider.version,
        mode: provider.mode,
        state: operation.state,
        execution: operation.execution,
        authorization: operation.authorization,
        quality: clone(operation.quality),
        coupledCapabilities: [...operation.coupledCapabilities],
      })),
    }
  }

  async execute(capabilityId, input, { strategy = this.defaultStrategy, authorization = {}, allowModes } = {}) {
    const plan = this.plan(capabilityId, { strategy, allowModes })
    if (plan.effect === 'platform-write') {
      throw new Error(`${capabilityId} is outbox-only; platform writes cannot execute or fall back through the generic connector`)
    }
    const runnable = plan.candidates.filter(candidate => ['available', 'degraded'].includes(candidate.state) && ['direct', 'coupled'].includes(candidate.execution))
    if (runnable.length === 0) throw new Error(`no runnable provider for ${capabilityId}`)
    const failures = []
    for (const candidate of runnable) {
      const provider = this.providers.find(item => item.id === candidate.providerId)
      const operation = provider.capabilities[capabilityId]
      if (typeof operation.run !== 'function') continue
      try {
        const output = await operation.run(input, authorization)
        return {
          connectorId: this.id,
          platform: this.platform,
          capabilityId,
          providerId: provider.id,
          providerVersion: provider.version,
          execution: operation.execution,
          coupledCapabilities: [...operation.coupledCapabilities],
          output,
          fallbacksAttempted: failures,
        }
      } catch (error) {
        failures.push({ providerId: provider.id, error: String(error?.message ?? error) })
      }
    }
    throw new AggregateError(failures.map(item => new Error(`${item.providerId}: ${item.error}`)), `all providers failed for ${capabilityId}`)
  }

  snapshot({ strategy = this.defaultStrategy } = {}) {
    if (!STRATEGIES.has(strategy)) throw new Error('strategy is invalid')
    const capabilityIds = [...this.definitions.keys()].sort()
    return {
      schemaVersion: 'social-workbench.platform-connector/v1',
      connectorId: this.id,
      platform: this.platform,
      generatedAt: this.clock().toISOString(),
      defaultStrategy: this.defaultStrategy,
      strategies: [...STRATEGIES],
      providers: this.providers.map(provider => ({
        id: provider.id,
        version: provider.version,
        mode: provider.mode,
        source: provider.source,
      })),
      capabilities: capabilityIds.map(capabilityId => {
        const plan = this.plan(capabilityId, { strategy })
        const first = plan.candidates[0]
        const definition = this.definitions.get(capabilityId)
        return {
          id: capabilityId,
          domain: definition.domain,
          summary: definition.summary,
          effect: plan.effect,
          state: first?.state ?? 'planned',
          preferredProviderId: first?.providerId ?? null,
          providers: plan.candidates,
        }
      }),
    }
  }
}

export const DOUYIN_CAPABILITIES = Object.freeze([
  { id: 'session.inspect', domain: 'session', summary: '检查运行时和登录态是否可用' },
  { id: 'session.login.qr', domain: 'session', summary: '扫码登录并持久化隔离登录态', effect: 'local-write', authorization: 'user-present' },
  { id: 'discovery.search.videos', domain: 'discovery', summary: '按关键词搜索公开视频' },
  { id: 'discovery.search.users', domain: 'discovery', summary: '按关键词搜索公开账号' },
  { id: 'discovery.search.topics', domain: 'discovery', summary: '搜索话题、趋势和相关词' },
  { id: 'discovery.search.live', domain: 'discovery', summary: '搜索正在直播的公开房间' },
  { id: 'content.read.video', domain: 'content', summary: '读取指定公开视频详情' },
  { id: 'content.read.creator-profile', domain: 'content', summary: '读取指定公开创作者资料' },
  { id: 'content.read.creator-posts', domain: 'content', summary: '读取指定公开创作者作品列表' },
  { id: 'engagement.read.comments', domain: 'engagement', summary: '读取公开视频一级评论' },
  { id: 'engagement.read.comment-replies', domain: 'engagement', summary: '读取公开视频二级评论' },
  { id: 'analytics.read.content-metrics', domain: 'analytics', summary: '读取授权范围内的视频互动指标' },
  { id: 'media.download.video', domain: 'media', summary: '下载选定公开视频到本地证据目录', effect: 'local-write' },
  { id: 'media.transcribe.video', domain: 'media', summary: '从选定视频提取带时间段的语音文本', effect: 'local-write' },
  { id: 'live.read.stream', domain: 'live', summary: '解析并读取公开直播流' },
  { id: 'live.read.events', domain: 'live', summary: '读取直播弹幕、礼物和房间事件' },
  { id: 'account.publish.video.private', domain: 'account', summary: '私密发布冻结的视频 revision', effect: 'platform-write' },
  { id: 'account.publish.image-text.private', domain: 'account', summary: '私密发布冻结的图文 revision', effect: 'platform-write' },
  { id: 'account.comment.create', domain: 'account', summary: '用本人账号发布评论', effect: 'platform-write' },
  { id: 'account.comment.reply', domain: 'account', summary: '用本人账号回复评论', effect: 'platform-write' },
  { id: 'account.reaction.like', domain: 'account', summary: '用本人账号执行点赞', effect: 'platform-write' },
  { id: 'account.relationship.follow', domain: 'account', summary: '用本人账号执行关注', effect: 'platform-write' },
])

export function createDouyinConnector({ research, transcriber, publisher, extraProviders = [], clock } = {}) {
  const providers = []
  if (research) providers.push({
    id: 'mediacrawler', version: 'd6f7c5bb906b', mode: 'browser-assisted', source: 'https://github.com/NanmiCoder/MediaCrawler',
    capabilities: {
      'session.inspect': { domain: 'session', summary: '检查 Docker、浏览器目录和本地转写运行时', quality: { cost: 'free', latency: 'fast', coverage: 'account', reliability: 'live-verified' }, run: () => research.doctor() },
      'session.login.qr': { domain: 'session', summary: '扫码登录并持久化独立浏览器登录态', effect: 'local-write', authorization: 'user-present', quality: { cost: 'free', latency: 'interactive', coverage: 'account', reliability: 'live-verified' }, run: (input, authorization) => research.login({ ...input, licenseAccepted: authorization.licenseAccepted === true }) },
      'discovery.search.videos': { domain: 'discovery', summary: '按关键词搜索公开视频并保存标准化证据', effect: 'local-write', execution: 'coupled', coupledCapabilities: ['engagement.read.comments'], quality: { cost: 'free', latency: 'batch', coverage: 'public-platform', reliability: 'live-verified' }, run: (input, authorization) => research.search({ ...input, licenseAccepted: authorization.licenseAccepted === true }) },
      'engagement.read.comments': { domain: 'engagement', summary: '采集搜索结果视频的公开评论', effect: 'local-write', execution: 'coupled', coupledCapabilities: ['discovery.search.videos'], quality: { cost: 'free', latency: 'batch', coverage: 'search', reliability: 'live-verified' }, run: (input, authorization) => research.search({ ...input, licenseAccepted: authorization.licenseAccepted === true }) },
      'engagement.read.comment-replies': { domain: 'engagement', summary: '采集公开视频的二级评论', effect: 'local-write', execution: 'coupled', coupledCapabilities: ['discovery.search.videos', 'engagement.read.comments'], quality: { cost: 'free', latency: 'batch', coverage: 'search', reliability: 'community' }, run: (input, authorization) => research.search({ ...input, includeSubComments: true, licenseAccepted: authorization.licenseAccepted === true }) },
      'media.download.video': { domain: 'media', summary: '下载选定公开视频到本地证据目录', effect: 'local-write', quality: { cost: 'free', latency: 'batch', coverage: 'selected', reliability: 'live-verified' }, run: (input, authorization) => research.downloadVideo(input.sourceItemId, { licenseAccepted: authorization.licenseAccepted === true }) },
    },
  })
  if (transcriber) providers.push({
    id: 'faster-whisper-local', version: '1', mode: 'local-compute', source: 'https://github.com/SYSTRAN/faster-whisper',
    capabilities: {
      'media.transcribe.video': { domain: 'media', summary: '把已下载视频的语音转成带时间段文本', effect: 'local-write', authorization: 'user-session', quality: { cost: 'free', latency: 'batch', coverage: 'selected', reliability: 'live-verified' }, run: input => transcriber.transcribe(input.sourceItemId, input) },
    },
  })
  if (publisher) providers.push({
    id: 'broadcast-kit', version: '94cf038f7ed6', mode: 'browser-assisted', source: 'https://github.com/ChronoAIProject/broadcast-kit',
    capabilities: {
      'account.publish.video.private': { domain: 'account', summary: '经冻结 revision、一次性确认和 outbox 私密发布视频', effect: 'platform-write', authorization: 'one-time-confirmation', execution: 'outbox-only', quality: { cost: 'free', latency: 'interactive', coverage: 'account', reliability: 'community' } },
    },
  })
  providers.push(...extraProviders)
  return new PlatformConnector({ id: 'douyin', platform: 'douyin', definitions: DOUYIN_CAPABILITIES, providers, clock })
}
