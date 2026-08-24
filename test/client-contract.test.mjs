import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('browser client mounts one read-only capability workbench', async () => {
  const source = await readFile(new URL('../client/src/index.jsx', import.meta.url), 'utf8')
  const view = await readFile(new URL('../client/src/Workbench.jsx', import.meta.url), 'utf8')
  const bundle = await readFile(new URL('../client/client.js', import.meta.url), 'utf8')
  assert.equal(source.includes('settings.section'), true)
  assert.match(source, /\/dsh-social-workbench/)
  assert.match(source, /ctx\.connection\.rpc\.call/)
  assert.match(view, /refresh-health/)
  assert.match(view, /loop-dashboard/)
  assert.match(view, />发布</)
  assert.match(view, />反馈</)
  assert.doesNotMatch(`${source}\n${view}`, /publish\(|execute\(|confirm\(|fetch\(/)
  assert.match(bundle, /@dsh\/social-workbench/)
})
