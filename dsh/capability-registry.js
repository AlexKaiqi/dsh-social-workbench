const HEALTH_STATES = new Set(['ready', 'degraded', 'blocked', 'unknown', 'not-applicable'])
const LIFECYCLES = new Set(['available', 'partial', 'planned'])

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function assertDefinition(definition) {
  if (!definition || typeof definition !== 'object') throw new Error('capability definition is required')
  if (!/^[a-z][a-z0-9.-]*$/.test(definition.id || '')) throw new Error(`invalid capability id: ${definition.id}`)
  if (!LIFECYCLES.has(definition.lifecycle)) throw new Error(`invalid lifecycle for ${definition.id}`)
  if (!Array.isArray(definition.operations) || !Array.isArray(definition.dependencies)) {
    throw new Error(`capability ${definition.id} requires operations and dependencies`)
  }
}

function unknownHealth(error, observedAt) {
  return {
    state: 'unknown',
    summary: '健康探测未完成，不能据此判断能力可用。',
    observedAt,
    conditions: [{
      type: 'ProbeSucceeded',
      status: 'unknown',
      reason: 'ProbeFailed',
      message: error instanceof Error ? error.message : String(error),
      observedAt,
      evidenceRefs: [],
      remedy: '检查该能力的探测依赖后重新刷新。',
    }],
  }
}

function assertHealth(id, health) {
  if (!health || typeof health !== 'object' || !HEALTH_STATES.has(health.state)) {
    throw new Error(`invalid health result for ${id}`)
  }
  if (!Array.isArray(health.conditions)) throw new Error(`health conditions are required for ${id}`)
  return health
}

function aggregate(capabilities) {
  const active = capabilities.filter(item => item.lifecycle !== 'planned')
  if (active.some(item => item.critical && item.health.state === 'blocked')) return 'blocked'
  if (active.some(item => ['blocked', 'degraded'].includes(item.health.state))) return 'degraded'
  if (active.some(item => item.health.state === 'unknown')) return 'unknown'
  return 'ready'
}

export class CapabilityRegistry {
  constructor({ clock = () => new Date() } = {}) {
    this.clock = clock
    this.entries = new Map()
  }

  register(definition, probe) {
    assertDefinition(definition)
    if (this.entries.has(definition.id)) throw new Error(`duplicate capability id: ${definition.id}`)
    if (definition.lifecycle !== 'planned' && typeof probe !== 'function') {
      throw new Error(`capability ${definition.id} requires a probe`)
    }
    this.entries.set(definition.id, { definition: clone(definition), probe })
    return () => this.entries.delete(definition.id)
  }

  async snapshot({ activity = { mode: 'staging-only', counts: {} } } = {}) {
    const observedAt = this.clock().toISOString()
    const capabilities = await Promise.all([...this.entries.values()].map(async ({ definition, probe }) => {
      let health
      if (definition.lifecycle === 'planned') {
        health = {
          state: 'not-applicable',
          summary: '该能力尚未实现，不参与当前健康聚合。',
          observedAt: null,
          conditions: [],
        }
      } else {
        try {
          health = assertHealth(definition.id, await probe({ observedAt }))
        } catch (error) {
          health = unknownHealth(error, observedAt)
        }
      }
      return { ...clone(definition), health: clone(health) }
    }))
    const summary = { ready: 0, degraded: 0, blocked: 0, unknown: 0, planned: 0 }
    for (const capability of capabilities) {
      if (capability.lifecycle === 'planned') summary.planned += 1
      else summary[capability.health.state] += 1
    }
    return {
      schemaVersion: 'social-workbench.capability-snapshot/v1',
      generatedAt: observedAt,
      overall: aggregate(capabilities),
      summary,
      activity: clone(activity),
      capabilities,
    }
  }
}

export { aggregate as aggregateCapabilityHealth }
