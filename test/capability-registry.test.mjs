import assert from 'node:assert/strict'
import test from 'node:test'
import { CapabilityRegistry } from '../dsh/capability-registry.js'

const definition = (id, lifecycle = 'available', critical = false) => ({
  id, version: '1.0.0', area: 'content',
  title: { zh: id, en: id }, summary: { zh: id, en: id },
  lifecycle, critical, operations: [], dependencies: [],
})
const health = state => ({ state, summary: state, observedAt: '2026-08-23T00:00:00.000Z', conditions: [] })

test('capability registry separates lifecycle from runtime health and ignores planned health', async () => {
  const registry = new CapabilityRegistry({ clock: () => new Date('2026-08-23T00:00:00.000Z') })
  registry.register(definition('content.ready'), async () => health('ready'))
  registry.register(definition('publication.partial', 'partial'), async () => health('blocked'))
  registry.register(definition('access.planned', 'planned'))
  const snapshot = await registry.snapshot({ activity: { mode: 'staging-only', counts: { sources: 1 } } })
  assert.equal(snapshot.overall, 'degraded')
  assert.deepEqual(snapshot.summary, { ready: 1, degraded: 0, blocked: 1, unknown: 0, planned: 1 })
  assert.equal(snapshot.capabilities.at(-1).health.state, 'not-applicable')
})

test('one failed probe becomes unknown without hiding other capabilities', async () => {
  const registry = new CapabilityRegistry({ clock: () => new Date('2026-08-23T00:00:00.000Z') })
  registry.register(definition('content.good'), async () => health('ready'))
  registry.register(definition('content.uncertain'), async () => { throw new Error('probe unavailable') })
  const snapshot = await registry.snapshot()
  assert.equal(snapshot.overall, 'unknown')
  assert.equal(snapshot.capabilities[0].health.state, 'ready')
  assert.equal(snapshot.capabilities[1].health.conditions[0].reason, 'ProbeFailed')
  assert.throws(() => registry.register(definition('content.good'), async () => health('ready')), /duplicate/)
})

test('critical blocked capability blocks the aggregate', async () => {
  const registry = new CapabilityRegistry()
  registry.register(definition('repository.store', 'available', true), async () => health('blocked'))
  assert.equal((await registry.snapshot()).overall, 'blocked')
})
