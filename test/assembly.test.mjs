import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { apply, validateConfig } from '../dsh/index.js'

function harness() {
  const provided = []
  const sections = []
  const tools = []
  const effects = []
  const rpc = []
  const ctx = {
      provide(name, value) { provided.push({ name, value }); ctx[name] = value },
      systemPrompt: { section(value) { sections.push(value) } },
      tools: { register(value) { tools.push(value) } },
      connection: { rpc: { handle(channel, handler, options) { rpc.push({ channel, handler, options }); return () => {} } } },
      effect(factory, label) { effects.push({ factory, label }) },
  }
  return { provided, sections, tools, effects, rpc, ctx }
}

test('assembles one staging service, one prompt, and one bounded tool', async () => {
  const state = harness()
  apply(state.ctx, { enabled: true, root: mkdtempSync(path.join(tmpdir(), 'dsh-social-assembly-')) })
  assert.deepEqual(state.provided.map((row) => row.name), ['socialWorkbench'])
  assert.deepEqual(state.sections.map((row) => row.name), ['tool:social-workbench'])
  assert.deepEqual(state.tools.map((row) => row.name), ['social_workbench'])
  assert.deepEqual(state.tools[0].parameters.properties.action.enum, ['help', 'status', 'read', 'ingest', 'create_brief', 'build_package'])
  assert.deepEqual(state.effects.map(item => item.label), ['social workbench staging store', 'social workbench capability RPC'])
  const dispose = await state.effects[0].factory()
  assert.equal(typeof dispose, 'function')
  const rpcDispose = state.effects[1].factory()
  assert.equal(typeof rpcDispose, 'function')
  assert.equal(state.rpc[0].channel, '/dsh-social-workbench')
  assert.equal(state.rpc[0].options.authority, 'trusted-host')
})

test('disabled and invalid configurations register no capabilities', () => {
  const disabled = harness()
  apply(disabled.ctx, { enabled: false, root: '' })
  assert.equal(disabled.provided.length + disabled.sections.length + disabled.tools.length, 0)

  const invalid = harness()
  assert.throws(() => apply(invalid.ctx, { enabled: true, root: '' }), /root is required/)
  assert.equal(invalid.provided.length + invalid.sections.length + invalid.tools.length, 0)
  assert.throws(() => validateConfig(null), /config is required/)
  assert.throws(() => validateConfig({ enabled: true, root: '/tmp/state', sidecarRoot: '', xiaohongshuUrl: 'http://127.0.0.1:18060' }), /sidecarRoot is required/)
  assert.throws(() => validateConfig({ enabled: true, root: '/tmp/state', sidecarRoot: '/tmp/sidecars', xiaohongshuUrl: 'https://example.com' }), /loopback HTTP URL/)
})

test('tool execution returns status but cannot dispatch undeclared operations', async () => {
  const state = harness()
  apply(state.ctx, { enabled: true, root: mkdtempSync(path.join(tmpdir(), 'dsh-social-tool-')) })
  const tool = state.tools[0]
  const status = await tool.execute({ action: 'status' }, {})
  assert.equal(status.mode, 'staging-only')
  await assert.rejects(tool.execute({ action: 'publish' }, {}), /invalid arguments|unknown social_workbench action/)
})
