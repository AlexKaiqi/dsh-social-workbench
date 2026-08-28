import assert from 'node:assert/strict'
import test from 'node:test'
import { PlatformConnector, createDouyinConnector } from '../src/platform-connector.mjs'

const readCapability = (run, quality = {}) => ({
  summary: 'read', effect: 'none',
  quality: { cost: 'free', latency: 'fast', coverage: 'search', reliability: 'community', ...quality },
  run,
})

test('connector exposes fine-grained Douyin capabilities without exposing direct platform writes', () => {
  const connector = createDouyinConnector({
    research: { doctor() {}, login() {}, search() {}, downloadVideo() {} },
    transcriber: { transcribe() {} },
    publisher: {},
    clock: () => new Date('2026-08-25T00:00:00.000Z'),
  })
  const snapshot = connector.snapshot()
  assert.equal(snapshot.schemaVersion, 'social-workbench.platform-connector/v1')
  assert.equal(snapshot.capabilities.some(item => item.id === 'discovery.search.videos'), true)
  assert.equal(snapshot.capabilities.some(item => item.id === 'engagement.read.comment-replies'), true)
  assert.equal(snapshot.capabilities.some(item => item.id === 'media.transcribe.video'), true)
  assert.equal(snapshot.capabilities.find(item => item.id === 'live.read.events').state, 'planned')
  assert.equal(snapshot.capabilities.find(item => item.id === 'account.comment.create').effect, 'platform-write')
  const publish = snapshot.capabilities.find(item => item.id === 'account.publish.video.private')
  assert.equal(publish.effect, 'platform-write')
  assert.equal(publish.providers[0].execution, 'outbox-only')
})

test('routing strategy selects cost, speed, coverage, or reliability without hard-coding a provider', () => {
  const connector = new PlatformConnector({ id: 'douyin', platform: 'douyin' })
  connector.register({ id: 'local', mode: 'browser-assisted', capabilities: {
    'discovery.search.videos': readCapability(() => 'local', { cost: 'free', latency: 'batch', coverage: 'search', reliability: 'community' }),
  } })
  connector.register({ id: 'managed', mode: 'delegated-service', capabilities: {
    'discovery.search.videos': readCapability(() => 'managed', { cost: 'medium', latency: 'fast', coverage: 'public-platform', reliability: 'managed' }),
  } })
  assert.equal(connector.plan('discovery.search.videos', { strategy: 'lowest-cost' }).candidates[0].providerId, 'local')
  assert.equal(connector.plan('discovery.search.videos', { strategy: 'lowest-latency' }).candidates[0].providerId, 'managed')
  assert.equal(connector.plan('discovery.search.videos', { strategy: 'widest-coverage' }).candidates[0].providerId, 'managed')
  assert.equal(connector.plan('discovery.search.videos', { strategy: 'highest-reliability' }).candidates[0].providerId, 'managed')
})

test('read execution falls back while platform writes are always rejected by generic execution', async () => {
  const connector = new PlatformConnector({ id: 'douyin', platform: 'douyin' })
  connector.register({ id: 'first', mode: 'http', capabilities: {
    'content.read.video': readCapability(async () => { throw new Error('rate limited') }, { reliability: 'live-verified' }),
  } })
  connector.register({ id: 'second', mode: 'browser-assisted', capabilities: {
    'content.read.video': readCapability(async input => ({ id: input.id }), { reliability: 'community' }),
  } })
  connector.register({ id: 'publisher', mode: 'browser-assisted', capabilities: {
    'account.publish.video.private': { effect: 'platform-write', execution: 'outbox-only', quality: { cost: 'free', latency: 'interactive', coverage: 'account', reliability: 'community' } },
  } })
  const result = await connector.execute('content.read.video', { id: '123' })
  assert.equal(result.providerId, 'second')
  assert.equal(result.fallbacksAttempted[0].providerId, 'first')
  await assert.rejects(connector.execute('account.publish.video.private', {}), /no runnable provider|outbox-only/)
})

test('a provider cannot downgrade a declared platform write into a read operation', () => {
  const connector = new PlatformConnector({
    id: 'douyin', platform: 'douyin',
    definitions: [{ id: 'account.comment.create', effect: 'platform-write' }],
  })
  assert.throws(() => connector.register({ id: 'unsafe', capabilities: {
    'account.comment.create': { effect: 'none', run() {} },
  } }), /cannot downgrade/)
})
