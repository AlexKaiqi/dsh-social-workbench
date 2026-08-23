import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { HELP, VERSION } from './help.js'
import { PROMPT } from './model/prompt.js'
import { SOCIAL_WORKBENCH_OUTPUT, SOCIAL_WORKBENCH_TOOL } from './model/tool-surface.js'
import { registerWorkbenchRpc, RPC_CHANNEL } from './rpc.js'
import { resolveSocialWorkbenchRoot, resolveSocialWorkbenchSidecarRoot, SocialWorkbenchService } from './service.js'

export const name = 'social-workbench'
export const inject = ['tools', 'systemPrompt', 'connection']

export const Config = z.object({
  enabled: z.boolean().default(true),
  root: z.string().default('$DSH_HOME/social-workbench/runtime'),
  sidecarRoot: z.string().default('$DSH_HOME/social-workbench/sidecars'),
  xiaohongshuUrl: z.string().default('http://127.0.0.1:18060'),
})

export function validateConfig(config) {
  if (!config || typeof config !== 'object') throw new Error('Social Workbench config is required')
  if (config.enabled === false) return
  if (typeof config.root !== 'string' || !config.root.trim()) throw new Error('Social Workbench root is required')
  if (typeof config.sidecarRoot !== 'string' || !config.sidecarRoot.trim()) throw new Error('Social Workbench sidecarRoot is required')
  let parsed
  try { parsed = new URL(config.xiaohongshuUrl) } catch { throw new Error('Social Workbench xiaohongshuUrl must be a URL') }
  if (parsed.protocol !== 'http:' || !['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname)) {
    throw new Error('Social Workbench xiaohongshuUrl must be a loopback HTTP URL')
  }
}

function json(value) {
  return JSON.parse(JSON.stringify(value))
}

function registerTool(ctx) {
  ctx.tools.register(defineTool({
    ...SOCIAL_WORKBENCH_TOOL,
    output: {
      schema: SOCIAL_WORKBENCH_OUTPUT,
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(args, exec) {
      const action = String(args.action || '')
      switch (action) {
        case 'help': return HELP
        case 'status': return json(await ctx.socialWorkbench.status())
        case 'read': return json(await ctx.socialWorkbench.read(args.collection, args.id))
        case 'ingest': {
          const cwd = String(exec?.agent?.session?.header?.cwd || '')
          return json(await ctx.socialWorkbench.ingest(args.input, cwd))
        }
        case 'create_brief': return json(await ctx.socialWorkbench.createBrief(args.input))
        case 'build_package': return json(await ctx.socialWorkbench.buildPackage(args.input))
        default: throw new Error(`unknown social_workbench action: ${action}`)
      }
    },
  }))
}

export function apply(ctx, config) {
  const resolvedConfig = {
    enabled: true,
    root: '$DSH_HOME/social-workbench/runtime',
    sidecarRoot: '$DSH_HOME/social-workbench/sidecars',
    xiaohongshuUrl: 'http://127.0.0.1:18060',
    ...config,
  }
  validateConfig(resolvedConfig)
  if (resolvedConfig.enabled === false) return
  const service = new SocialWorkbenchService(resolveSocialWorkbenchRoot(resolvedConfig.root), {
    sidecarRoot: resolveSocialWorkbenchSidecarRoot(resolvedConfig.sidecarRoot),
    xiaohongshuUrl: resolvedConfig.xiaohongshuUrl,
  })
  ctx.provide('socialWorkbench', service)
  ctx.systemPrompt.section({ name: 'tool:social-workbench', order: 89, text: PROMPT })
  registerTool(ctx)
  ctx.effect?.(async () => {
    await service.init()
    return () => {}
  }, 'social workbench staging store')
  ctx.effect?.(() => registerWorkbenchRpc(ctx, service), 'social workbench capability RPC')
}

export {
  HELP,
  PROMPT,
  SOCIAL_WORKBENCH_OUTPUT,
  SOCIAL_WORKBENCH_TOOL,
  SocialWorkbenchService,
  VERSION,
  RPC_CHANNEL,
  resolveSocialWorkbenchRoot,
  resolveSocialWorkbenchSidecarRoot,
}
