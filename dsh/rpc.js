export const RPC_CHANNEL = '/dsh-social-workbench'

function ok(value) {
  return { ok: true, value }
}

function fail(message) {
  return { ok: false, error: { code: 'bad-request', message } }
}

function emptyObject(payload) {
  return payload && typeof payload === 'object' && !Array.isArray(payload) && Object.keys(payload).length === 0
}

export function registerWorkbenchRpc(ctx, service) {
  return ctx.connection.rpc.handle(RPC_CHANNEL, async (endpoint, payload = {}) => {
    if (!emptyObject(payload)) return fail(`${endpoint} payload must be an empty object`)
    try {
      if (endpoint === 'bootstrap' || endpoint === 'refresh-health') return ok(await service.capabilitySnapshot())
      if (endpoint === 'loop-dashboard') return ok(await service.loopDashboard())
      return fail(`unknown endpoint ${JSON.stringify(endpoint)}`)
    } catch (error) {
      return fail(error instanceof Error ? error.message : String(error))
    }
  }, { authority: 'trusted-host' })
}
