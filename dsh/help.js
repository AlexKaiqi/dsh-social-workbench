export const VERSION = '0.3.0'

export const HELP = {
  version: VERSION,
  purpose: 'Read user-collected Douyin research evidence and stage authorized Workspace-local material into evidence-backed dual-platform content packages.',
  workflow: [
    'help: show the complete staging workflow and safety boundaries',
    'status: show canonical object counts and current capability health',
    'ingest: input={origin,title,text,rightsNote,attachments:[{kind,path}]}',
    'create_brief: input={sourceIds,objective,audience,coreMessage,claims:[{claim,evidenceRefs}],constraints}',
    'build_package: input={briefId,accounts,visibility,testMode,variants:{xiaohongshu,douyin}}',
    'read: inspect immutable evidence/content objects and user-managed publication/feedback ledger objects by stable id',
    'read source-items/research-runs/video-transcripts: inspect de-identified Douyin evidence collected by the separate user-side CLI',
  ],
  boundaries: [
    'Media paths must resolve inside the current Agent Workspace.',
    'Every claim needs an evidence reference to a source in the brief.',
    'This tool cannot login, confirm, publish, retry unknown submissions, or read credentials.',
    'Platform search, comment collection, media download, and transcription are user-side CLI actions; authenticated-browser collection is unofficial and sample-limited.',
    'Plan approval only stages work in the local outbox; it never replaces per-revision publication confirmation.',
    'Live execution, reconciliation, feedback recording, and review acceptance remain user-side CLI/UI actions.',
  ],
}
