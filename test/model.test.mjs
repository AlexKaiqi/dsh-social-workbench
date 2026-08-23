import assert from 'node:assert/strict'
import test from 'node:test'
import { HELP } from '../dsh/help.js'
import { PROMPT } from '../dsh/model/prompt.js'
import { SOCIAL_WORKBENCH_OUTPUT, SOCIAL_WORKBENCH_TOOL } from '../dsh/model/tool-surface.js'

test('model surface exposes staging but never account or publish authority', () => {
  assert.equal(SOCIAL_WORKBENCH_TOOL.name, 'social_workbench')
  assert.match(SOCIAL_WORKBENCH_TOOL.description, /cannot confirm or publish/i)
  assert.deepEqual(SOCIAL_WORKBENCH_OUTPUT, { type: 'json' })
  assert.deepEqual(SOCIAL_WORKBENCH_TOOL.parameters.action.enum, [
    'help', 'status', 'read', 'ingest', 'create_brief', 'build_package',
  ])
  const modelSurface = JSON.stringify({ PROMPT, HELP, SOCIAL_WORKBENCH_TOOL })
  assert.match(modelSurface, /one-time confirmation/i)
  assert.match(modelSurface, /platform-side verifier/i)
  for (const forbidden of ['login', 'confirm', 'publish', 'execute', 'retry']) {
    assert.equal(SOCIAL_WORKBENCH_TOOL.parameters.action.enum.includes(forbidden), false)
  }
})

test('help makes evidence, workspace, and approval boundaries explicit', () => {
  assert.match(JSON.stringify(HELP), /Workspace-local/)
  assert.match(JSON.stringify(HELP), /evidence reference/i)
  assert.match(JSON.stringify(HELP), /user-side CLI\/UI/)
  assert.match(PROMPT, /never describe it as posted, published, scheduled, or confirmed/i)
})
