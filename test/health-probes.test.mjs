import assert from 'node:assert/strict'
import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createDouyinProbe, createXiaohongshuProbe } from '../dsh/health-probes.js'

const context = { observedAt: '2026-08-23T00:00:00.000Z' }
const response = (status, body) => ({ ok: status >= 200 && status < 300, status, async json() { return body } })

test('XHS probe distinguishes reachable, login-valid, and headed-only conditions', async () => {
  const calls = []
  const probe = createXiaohongshuProbe({ fetchImpl: async url => {
    calls.push(String(url))
    return String(url).endsWith('/health') ? response(200, { success: true }) : response(200, { data: { is_logged_in: true, username: 'must-not-leak' } })
  } })
  const result = await probe(context)
  assert.equal(result.state, 'degraded')
  assert.deepEqual(result.conditions.map(item => item.type), ['SidecarReachable', 'LoginValid', 'HeadlessCompatible'])
  assert.equal(JSON.stringify(result).includes('must-not-leak'), false)
  assert.equal(calls.length, 2)
})

test('XHS probe reports a stopped sidecar as blocked', async () => {
  const probe = createXiaohongshuProbe({ fetchImpl: async () => { throw new Error('connection refused') } })
  const result = await probe(context)
  assert.equal(result.state, 'blocked')
  assert.equal(result.conditions[0].status, 'false')
})

test('Douyin passive probe never treats an auth file as a valid login', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'social-sidecars-'))
  const python = path.join(root, 'broadcast-kit-venv', 'bin', 'python')
  const source = path.join(root, 'src', 'broadcast-kit', 'broadcast_kit', 'publishers', 'douyin', 'cli.py')
  const auth = path.join(root, 'state', 'douyin', 'default', 'auth.json')
  await mkdir(path.dirname(python), { recursive: true })
  await mkdir(path.dirname(source), { recursive: true })
  await mkdir(path.dirname(auth), { recursive: true })
  await writeFile(python, '#!/bin/sh\n')
  await chmod(python, 0o755)
  await writeFile(source, '# fixture\n')
  await writeFile(auth, '{}')
  const result = await createDouyinProbe({ sidecarRoot: root })(context)
  assert.equal(result.state, 'unknown')
  assert.equal(result.conditions.find(item => item.type === 'LoginValid').status, 'unknown')
})
