import assert from 'node:assert/strict'
import test from 'node:test'
import { registerWorkbenchRpc, RPC_CHANNEL } from '../dsh/rpc.js'

test('capability RPC is trusted-host, read-only, and versioned', async () => {
  let channel
  let handler
  let authority
  const service = {
    async capabilitySnapshot() { return { schemaVersion: 'social-workbench.capability-snapshot/v1' } },
    async loopDashboard() { return { schemaVersion: 'social-workbench.loop-dashboard/v1' } },
  }
  const ctx = { connection: { rpc: { handle(path, next, options) { channel = path; handler = next; authority = options.authority; return () => {} } } } }
  const dispose = registerWorkbenchRpc(ctx, service)
  assert.equal(channel, RPC_CHANNEL)
  assert.equal(authority, 'trusted-host')
  assert.equal((await handler('bootstrap', {})).value.schemaVersion, 'social-workbench.capability-snapshot/v1')
  assert.equal((await handler('refresh-health', {})).ok, true)
  assert.equal((await handler('loop-dashboard', {})).value.schemaVersion, 'social-workbench.loop-dashboard/v1')
  assert.equal((await handler('bootstrap', { publish: true })).ok, false)
  assert.equal((await handler('execute', {})).ok, false)
  dispose()
})
