export const VERSION = '0.1.0'

export const HELP = {
  version: VERSION,
  purpose: 'Stage authorized Workspace-local material into evidence-backed dual-platform content packages.',
  workflow: [
    'ingest: input={origin,title,text,rightsNote,attachments:[{kind,path}]}',
    'create_brief: input={sourceIds,objective,audience,coreMessage,claims:[{claim,evidenceRefs}],constraints}',
    'build_package: input={briefId,accounts,visibility,testMode,variants:{xiaohongshu,douyin}}',
    'read: collection=sources|briefs|packages|revisions|receipts and id=<stable id>',
  ],
  boundaries: [
    'Media paths must resolve inside the current Agent Workspace.',
    'Every claim needs an evidence reference to a source in the brief.',
    'This tool cannot login, confirm, publish, retry unknown submissions, or read credentials.',
    'Live execution remains a user-side CLI/UI action with a one-time token.',
  ],
}
