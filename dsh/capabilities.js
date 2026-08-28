import { CapabilityRegistry } from './capability-registry.js'
import { createDouyinProbe, createDouyinResearchProbe, createStaticProbe, createStoreProbe, createXiaohongshuProbe } from './health-probes.js'

const localized = (zh, en) => ({ zh, en })
const operation = (id, kind, status, authority) => ({ id, kind, status, authority })

export function createCapabilityRegistry({ root, sidecarRoot, xiaohongshuUrl, fetchImpl, clock } = {}) {
  const registry = new CapabilityRegistry({ clock })
  registry.register({
    id: 'ingress.authorized-source', version: '1.0.0', area: 'ingress',
    title: localized('已授权素材进入', 'Authorized source ingress'),
    summary: localized('保存来源、权利说明和附件指纹，并限制媒体路径在当前 Workspace 内。', 'Stores provenance, rights notes, and media fingerprints within the active Workspace boundary.'),
    lifecycle: 'available', critical: true,
    operations: [operation('ingest', 'write', 'available', 'agent')], dependencies: [],
  }, createStoreProbe(root))
  registry.register({
    id: 'repository.evidence-store', version: '1.0.0', area: 'repository',
    title: localized('证据化事实仓库', 'Evidence repository'),
    summary: localized('保存来源、brief、内容包、冻结 revision、发布账本与反馈 lineage；尚不是完整知识库。', 'Stores sources, briefs, packages, frozen revisions, publication ledgers, and feedback lineage; it is not yet a full knowledge base.'),
    lifecycle: 'partial', critical: true,
    operations: [operation('read-canonical-object', 'read', 'available', 'agent')], dependencies: ['ingress.authorized-source'],
  }, createStaticProbe({ state: 'degraded', summary: 'canonical 事实存储可用；检索、去重和知识整理尚未实现。', conditions: [{ type: 'CanonicalStoreReady', status: 'true', reason: 'StoreAvailable', message: '版本化 canonical objects 可读写。' }, { type: 'KnowledgeCurationReady', status: 'false', reason: 'NotImplemented', message: '检索、聚类和长期知识整理不在当前实现中。', remedy: '先用真实需求验证 repository/access 契约，再选择检索组件。' }] }))
  registry.register({
    id: 'access.demand-analysis', version: '0.1.0', area: 'access',
    title: localized('知识访问与需求分析', 'Knowledge access and demand analysis'),
    summary: localized('从证据仓库检索、聚类并形成带反证的需求信号。', 'Retrieves and clusters evidence into demand signals with counter-evidence.'),
    lifecycle: 'planned', critical: false,
    operations: [operation('analyze-demand', 'read', 'planned', 'agent')], dependencies: ['repository.evidence-store'],
  })
  registry.register({
    id: 'ingress.douyin-research', version: '0.2.0', area: 'ingress',
    title: localized('抖音公开内容研究', 'Douyin public-content research'),
    summary: localized('用户侧扫码后，以独立浏览器目录小批量采集公开视频文案和评论；可选下载单条视频并本地转写。', 'After user-side QR login, collects small batches of public captions and comments in a dedicated browser profile; selected videos may be downloaded and transcribed locally.'),
    lifecycle: 'partial', critical: false,
    operations: [
      operation('read-research-ledger', 'read', 'available', 'agent'),
      operation('session-inspect', 'read', 'restricted', 'user'),
      operation('session-login-qr', 'execute', 'restricted', 'user'),
      operation('discovery-search-videos', 'read', 'restricted', 'user'),
      operation('engagement-read-comments', 'read', 'restricted', 'user'),
      operation('engagement-read-comment-replies', 'read', 'restricted', 'user'),
      operation('media-download-video', 'write', 'restricted', 'user'),
      operation('media-transcribe-video', 'execute', 'restricted', 'user'),
    ],
    dependencies: ['repository.evidence-store'],
  }, createDouyinResearchProbe({ sidecarRoot }))
  registry.register({
    id: 'content.dual-platform-package', version: '1.0.0', area: 'content',
    title: localized('双平台内容包', 'Dual-platform content package'),
    summary: localized('从同一证据 brief 生成小红书与抖音各自的冻结版本。', 'Builds separate frozen XHS and Douyin variants from one evidence-backed brief.'),
    lifecycle: 'available', critical: true,
    operations: [operation('create-brief', 'write', 'available', 'agent'), operation('build-package', 'write', 'available', 'agent')], dependencies: ['repository.evidence-store'],
  }, createStaticProbe({ state: 'ready', summary: 'source → brief → package 契约和确定性 revision 已通过测试。', conditions: [{ type: 'ContractVerified', status: 'true', reason: 'TestsPassed', message: '双平台内容包契约、媒体指纹和确定性 hash 可用。', evidenceRefs: ['runtime/test/content-pipeline.test.mjs'] }] }))
  registry.register({
    id: 'publication.control-plane', version: '1.0.0', area: 'publication',
    title: localized('发布计划与 Outbox', 'Publication plans and outbox'),
    summary: localized('以 plan hash、幂等 outbox 和独立对账记录管理双平台发布；计划批准不替代逐 revision 确认。', 'Manages dual-platform release work with plan hashes, an idempotent outbox, and separate reconciliation records; plan approval never replaces per-revision confirmation.'),
    lifecycle: 'available', critical: true,
    operations: [operation('read-release-ledger', 'read', 'available', 'agent'), operation('approve-plan', 'decision', 'restricted', 'user'), operation('enqueue-plan', 'write', 'restricted', 'user'), operation('reconcile-unknown', 'decision', 'restricted', 'user')], dependencies: ['content.dual-platform-package', 'governance.confirmation-receipt'],
  }, createStaticProbe({ state: 'ready', summary: '计划、幂等入队、部分成功和 unknown 对账已由执行测试覆盖。', conditions: [{ type: 'OutboxVerified', status: 'true', reason: 'TestsPassed', message: '计划批准只进入本地 outbox，未知提交不会自动重发。', evidenceRefs: ['runtime/test/loop-control.test.mjs'] }] }))
  registry.register({
    id: 'publication.xiaohongshu', version: '0.1.0', area: 'publication',
    title: localized('小红书私密发布', 'Private XHS publishing'),
    summary: localized('通过固定本机 sidecar 发布，并用本人主页基线和详情反查确认。', 'Publishes through a pinned local sidecar and verifies against the creator baseline and feed detail.'),
    lifecycle: 'partial', critical: false,
    operations: [operation('check-login', 'read', 'restricted', 'user'), operation('publish-private', 'execute', 'restricted', 'user'), operation('collect-feedback', 'read', 'restricted', 'user')], dependencies: ['content.dual-platform-package', 'governance.confirmation-receipt'],
  }, createXiaohongshuProbe({ baseUrl: xiaohongshuUrl, fetchImpl }))
  registry.register({
    id: 'publication.douyin', version: '0.1.0', area: 'publication',
    title: localized('抖音私密发布', 'Private Douyin publishing'),
    summary: localized('通过固定 broadcast-kit 执行封面、私密可见性和创作者队列核验。', 'Uses pinned broadcast-kit with cover, private visibility, and creator queue verification.'),
    lifecycle: 'partial', critical: false,
    operations: [operation('check-login', 'read', 'restricted', 'user'), operation('dry-run', 'execute', 'restricted', 'user'), operation('publish-private', 'execute', 'restricted', 'user')], dependencies: ['content.dual-platform-package', 'governance.confirmation-receipt'],
  }, createDouyinProbe({ sidecarRoot }))
  registry.register({
    id: 'governance.confirmation-receipt', version: '1.0.0', area: 'governance',
    title: localized('一次性确认与真实回执', 'One-time confirmation and truthful receipts'),
    summary: localized('确认绑定冻结 revision；提交后核验不确定时保存 unknown，绝不自动重试。', 'Binds approval to a frozen revision and records unknown instead of retrying uncertain submissions.'),
    lifecycle: 'available', critical: true,
    operations: [operation('confirm-revision', 'decision', 'restricted', 'user'), operation('read-receipt', 'read', 'available', 'agent')], dependencies: [],
  }, createStaticProbe({ state: 'ready', summary: '一次性、过期、漂移和 unknown 状态已由执行测试覆盖。', conditions: [{ type: 'TruthGateVerified', status: 'true', reason: 'TestsPassed', message: '确认 token、attempt 与 receipt 状态机测试通过。', evidenceRefs: ['runtime/test/domain.test.mjs', 'runtime/test/loop.test.mjs'] }] }))
  registry.register({
    id: 'access.feedback-learning-loop', version: '1.0.0', area: 'access',
    title: localized('反馈与假设复盘', 'Feedback and hypothesis review'),
    summary: localized('追加保存平台原始指标与授权反馈，把复盘证据显式回流到下一轮 brief。', 'Append-only storage for raw platform metrics and authorized feedback, with explicit review lineage into the next brief.'),
    lifecycle: 'available', critical: false,
    operations: [operation('read-feedback-ledger', 'read', 'available', 'agent'), operation('record-metric', 'write', 'restricted', 'user'), operation('record-feedback', 'write', 'restricted', 'user'), operation('accept-review', 'decision', 'restricted', 'user')], dependencies: ['publication.control-plane', 'repository.evidence-store'],
  }, createStaticProbe({ state: 'ready', summary: '指标时间序列、反馈隐私边界、假设复盘和下一轮 brief lineage 已通过测试。', conditions: [{ type: 'LearningLoopVerified', status: 'true', reason: 'TestsPassed', message: '原始指标不覆盖、评论不拼接跨平台身份、review 可生成下一轮 brief。', evidenceRefs: ['runtime/test/loop-control.test.mjs'] }] }))
  registry.register({
    id: 'experience.capability-workbench', version: '1.0.0', area: 'experience',
    title: localized('能力工作台', 'Capability workbench'),
    summary: localized('以统一 snapshot 和只读账本显示能力、发布状态、反馈与下一步。', 'Shows capability health, release status, feedback, and next actions through a versioned snapshot and read-only ledger.'),
    lifecycle: 'available', critical: false,
    operations: [operation('inspect-health', 'read', 'available', 'user')], dependencies: [],
  }, createStaticProbe({ state: 'ready', summary: 'Host snapshot 与 Client 只读投影已装配。', conditions: [{ type: 'ReadOnlyProjection', status: 'true', reason: 'BoundaryEnforced', message: 'Client 不持有登录、确认或发布权限。' }] }))
  return registry
}
