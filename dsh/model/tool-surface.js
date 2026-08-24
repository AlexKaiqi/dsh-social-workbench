export const SOCIAL_WORKBENCH_TOOL = {
  name: 'social_workbench',
  description: 'Stage authorized local material into evidence-backed briefs and approval-ready Xiaohongshu/Douyin content packages. This tool cannot confirm or publish. Call action=help for the exact workflow.',
  parameters: {
    action: {
      type: 'string',
      required: true,
      enum: ['help', 'status', 'read', 'ingest', 'create_brief', 'build_package'],
    },
    input: {
      type: 'json',
      description: 'Action-specific structured input. Media paths for ingest are resolved inside the current Workspace only.',
    },
    collection: {
      type: 'string',
      enum: ['sources', 'briefs', 'packages', 'revisions', 'plans', 'outbox', 'receipts', 'reconciliations', 'metric-snapshots', 'feedback-items', 'hypothesis-reviews'],
      description: 'Immutable collection for action=read.',
    },
    id: { type: 'string', description: 'Stable object id for action=read.' },
  },
}

export const SOCIAL_WORKBENCH_OUTPUT = { type: 'json' }
