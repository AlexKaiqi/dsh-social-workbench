import { CapabilityRegistry } from './capability-registry.js'
import { createDouyinProbe, createStaticProbe, createStoreProbe, createXiaohongshuProbe } from './health-probes.js'

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
    summary: localized('保存来源、brief、内容包、冻结 revision 与发布回执；尚不是完整知识库。', 'Stores sources, briefs, packages, frozen revisions, and receipts; it is not yet a full knowledge base.'),
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
    id: 'content.dual-platform-package', version: '1.0.0', area: 'content',
    title: localized('双平台内容包', 'Dual-platform content package'),
    summary: localized('从同一证据 brief 生成小红书与抖音各自的冻结版本。', 'Builds separate frozen XHS and Douyin variants from one evidence-backed brief.'),
    lifecycle: 'available', critical: true,
    operations: [operation('create-brief', 'write', 'available', 'agent'), operation('build-package', 'write', 'available', 'agent')], dependencies: ['repository.evidence-store'],
  }, createStaticProbe({ state: 'ready', summary: 'source → brief → package 契约和确定性 revision 已通过测试。', conditions: [{ type: 'ContractVerified', status: 'true', reason: 'TestsPassed', message: '双平台内容包契约、媒体指纹和确定性 hash 可用。', evidenceRefs: ['runtime/test/content-pipeline.test.mjs'] }] }))
  registry.register({
    id: 'publication.xiaohongshu', version: '0.1.0', area: 'publication',
    title: localized('小红书私密发布', 'Private XHS publishing'),
    summary: localized('通过固定本机 sidecar 发布，并用本人主页基线和详情反查确认。', 'Publishes through a pinned local sidecar and verifies against the creator baseline and feed detail.'),
    lifecycle: 'partial', critical: false,
    operations: [operation('check-login', 'read', 'restricted', 'user'), operation('publish-private', 'execute', 'restricted', 'user')], dependencies: ['content.dual-platform-package', 'governance.confirmation-receipt'],
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
    id: 'experience.capability-workbench', version: '1.0.0', area: 'experience',
    title: localized('能力工作台', 'Capability workbench'),
    summary: localized('以统一 snapshot 显示能力、健康条件、阻塞原因和下一步。', 'Shows capabilities, health conditions, blockers, and next actions from one versioned snapshot.'),
    lifecycle: 'available', critical: false,
    operations: [operation('inspect-health', 'read', 'available', 'user')], dependencies: [],
  }, createStaticProbe({ state: 'ready', summary: 'Host snapshot 与 Client 只读投影已装配。', conditions: [{ type: 'ReadOnlyProjection', status: 'true', reason: 'BoundaryEnforced', message: 'Client 不持有登录、确认或发布权限。' }] }))
  return registry
}
