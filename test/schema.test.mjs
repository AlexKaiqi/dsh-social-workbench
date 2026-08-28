import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { createDouyinConnector } from '../runtime/src/platform-connector.mjs'

test('every executable closed-loop contract compiles as Draft 2020-12 with a unique id', async () => {
  const directory = new URL('../spec/', import.meta.url)
  const files = [
    'source-bundle.schema.json',
    'source-item.schema.json',
    'research-run.schema.json',
    'video-transcript.schema.json',
    'evidence-brief.schema.json',
    'content-package.schema.json',
    'publication-revision.schema.json',
    'publication-confirmation.schema.json',
    'publication-receipt.schema.json',
    'publication-plan.schema.json',
    'publication-outbox.schema.json',
    'reconciliation.schema.json',
    'metric-snapshot.schema.json',
    'feedback-item.schema.json',
    'hypothesis-review.schema.json',
    'loop-dashboard.schema.json',
    'capability-snapshot.schema.json',
    'platform-connector.schema.json',
  ]
  const ids = new Set()
  for (const file of files) {
    const schema = JSON.parse(await readFile(new URL(file, directory), 'utf8'))
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema', file)
    assert.equal(typeof schema.$id, 'string', file)
    assert.equal(ids.has(schema.$id), false, `duplicate schema id: ${schema.$id}`)
    ids.add(schema.$id)
    const ajv = new Ajv2020({ allErrors: true })
    addFormats(ajv)
    assert.doesNotThrow(() => ajv.compile(schema), file)
  }
})

test('Douyin connector snapshot conforms to the versioned platform connector contract', async () => {
  const schema = JSON.parse(await readFile(new URL('../spec/platform-connector.schema.json', import.meta.url), 'utf8'))
  const ajv = new Ajv2020({ allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const snapshot = createDouyinConnector({
    research: { doctor() {}, login() {}, search() {}, downloadVideo() {} },
    transcriber: { transcribe() {} },
    publisher: {},
    clock: () => new Date('2026-08-25T00:00:00.000Z'),
  }).snapshot()
  assert.equal(validate(snapshot), true, JSON.stringify(validate.errors))
})
