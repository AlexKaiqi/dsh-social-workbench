# Adapter 架构

状态说明：本文保留各类 adapter port、失败语义和 conformance 原则；平台、能力、adapter、connector、route 与动态解析的最新分层以 [`CONNECTOR_EXPECTED_ARCHITECTURE.md`](./CONNECTOR_EXPECTED_ARCHITECTURE.md) 为准。本文早期示例中的 `effectiveCapabilities` 不应继续内嵌在 ConnectorInstance 中。

## 1. 为什么不能只有一个 Connector 接口

四个阶段面对的失败语义不同：

- Ingress 的核心问题是增量、游标、限流、重复、更新和删除。
- Knowledge Repo 的核心问题是事务、版本、索引投影和 retention。
- Knowledge Access 的核心问题是权限、召回、排序、证据范围和 as-of 查询。
- Tools 的核心问题是副作用、批准、幂等、部分成功和结果对账。

因此统一 catalog 可以共享 manifest 和生命周期，但运行时至少分成四个 port；媒体/内容变体建议再独立成第五类 transformation adapter。

## 2. 统一 Adapter Manifest

每个 adapter 包必须声明静态 manifest，运行时 Connector Instance 绑定账号、配置和 credential ref。

```text
AdapterDefinition (代码/包级)
  id, version, platforms, kind, runtime, license, configSchema
  routes[capability/version + mode + ports + mapping
         + execution/coupling + quality + maturity + evidence]

ConnectorInstance (用户配置级)
  scope + platform + adapterId/version + configRef
  accountBindingRef + credentialRefs + grantedScopes
  lifecycle + authorization + enabledRoutes

CapabilityResolution (动态投影)
  requirement + candidateRoutes + selectedRoute
  policy + health + limits + evidence + expiresAt
```

`AdapterDefinition` 说“这段代码理论上会什么”；`ConnectorInstance` 保存“本机配置和授权事实”；`CapabilityResolution` 才回答“这个目的下此刻实际能什么”。三者不能合并。

### 2.1 面向调用者的 Platform Connector

四类 port 仍然分别承担真实执行语义，但调用者不应绑定某个开源仓库。平台 Connector 是一层薄 facade：暴露稳定的细粒度 capability ID，并把同一能力路由到一个或多个 provider。

```text
discovery.search.videos
  ├── MediaCrawler（本地、零 API 费用、浏览器辅助）
  ├── official-openapi（获批时优先可靠性）
  └── delegated-api（需要广覆盖或低延迟时选用）
```

路由策略首版只有 `balanced / lowest-cost / lowest-latency / widest-coverage / highest-reliability`。成本、速度、覆盖和可靠性使用有序等级，不伪造精确 SLA。只读与本地写入可按候选链 fallback；任何 `platform-write` 必须进入既有 outbox/confirmation/reconciliation 状态机，generic connector 不执行、不自动 fallback、不盲目重试。

首个运行契约见 `spec/platform-connector.schema.json` 和 `runtime/src/platform-connector.mjs`。它不取代 AdapterDefinition、ConnectorInstance、健康 probe 或 capability evidence；只负责“用户想做什么”到“哪些 provider 可以做”的稳定映射。

## 3. Ingress Adapter

候选 port：

```text
discover(config) -> streams + schemas
check(instance) -> auth/rate-limit/capability evidence
read(stream, cursor, window, limit) -> observations + nextCursor
ack(batchRef) -> checkpoint
reconcile(since) -> updates + tombstones
```

强制语义：

- cursor 是 opaque 且带 adapter version；不能从时间戳猜增量状态。
- observation 至少包含 external ID、canonical URL、observedAt、content hash、visibility 和 acquisition mode。
- 每批先持久化 observation，再推进 checkpoint，保证 at-least-once；canonicalizer 负责幂等去重。
- 平台删除、撤权和可见性变化通过 tombstone 表达，不直接抹掉审计历史；内容保留按政策异步清理。
- Webhook 与 polling 产出相同 observation envelope。

参考：Singer 的 catalog/state、Airbyte CDK 的 streams/check/read、dlt 的 source/resource/incremental、NiFi provenance。

## 4. Knowledge Repo Adapter

候选 port：

```text
appendObservation(envelope) -> observationRef
upsertCanonical(sourceItem, expectedRevision) -> revisionRef
putBlob(content, rights, retention) -> blobRef
project(indexKind, revisionRef) -> projectionRef
tombstone(objectRef, reason, effectiveAt)
queryCanonical(ids/filter/asOf) -> immutable revisions
```

规则：

- Canonical Store 是唯一事实源；vector、全文、graph 和 analytics 都是 projection。
- 原始 blob 使用内容 hash 和 rights metadata；不能只存一个会过期的媒体 URL。
- embedding 必须绑定 source revision、chunker version、model route 和 vector dimension。
- projection 删除/重建不影响 canonical revision。
- repository adapter 不决定用户是否有权读取；但必须提供高效 policy filter 字段。

参考：PostgreSQL transaction/constraint、pgvector、Iceberg snapshot、OpenLineage facet。

## 5. Knowledge Access Adapter

候选 port：

```text
retrieve({principal, query, filters, asOf, purpose, budget})
  -> evidenceSpans + retrievalTrace
lookup({principal, objectRefs, asOf})
  -> authorized revisions
explain(retrievalTrace) -> stages, scores, filters, policy decisions
```

每个 `EvidenceSpan` 至少包含：

- `sourceItemRef` 和 revision；
- 精确字符/时间/页面范围；
- lexical/vector/reranker 等 score 及含义；
- canonical URL 与观察时间；
- policy decision ref；
- derived/quoted/paraphrased 标记。

权限过滤必须在召回过程中生效，而不是把无权内容取回后再要求模型忽略。Access adapter 不直接返回“最终答案”；回答/分析是上层可版本化 derivation。

参考：Haystack Retriever/Document Store、LlamaIndex retriever/query engine、OpenFGA relationship check、OPA context policy。

## 6. Transformation Adapter

它连接知识与内容，而不是外部平台：

```text
normalize(observation) -> SourceItem candidate
extractSignals(evidenceSet, derivationProfile) -> DemandSignal candidates
renderVariant(briefRevision, platformProfile) -> ChannelVariant
validateVariant(variant, effectiveCapability) -> findings
```

模型 route、prompt/template、schema 和输入 revision 都必须记录。平台 profile 包含字符、媒体、话题、链接和披露规则，但不含 credential。

## 7. Tool / Action Adapter

读取型工具与副作用工具分开。发布 adapter 不能只暴露一个 `publish(payload)`：

```text
discoverCapabilities(instance) -> effective capabilities
validate(planItem) -> blocking findings + normalized payload
preview(planItem) -> immutable preview + payloadHash
prepare(approvedPlanItem) -> executionIntent
execute(executionIntent, idempotencyKey) -> receipt
reconcile(receipt) -> final/processing/unknown state
cancel(receipt) -> result, when supported
```

强制状态机：

```text
draft -> validated -> previewed -> approved -> queued
      -> submitted -> processing -> published
                         ├-> needs-user-action
                         ├-> retryable-error
                         └-> terminal-error
```

批准绑定 `planHash + accountRef + adapterVersion + capabilityVersion + expiresAt`。任一内容、媒体、账号、可见性、时间、adapter 或 capability 变化都使批准失效。

`execute` 必须从 outbox worker 调用，而不是直接从模型 tool handler 调用。网络超时返回 `unknown` 时先 reconcile，不能盲目重发。

参考：Postiz integration schema/API、Activepieces action、Temporal Activity、Mastodon idempotency、DSH 当前确认边界。

## 8. Adapter Catalog 与质量等级

Adapter 的“可见”不等于“可信”。建议 catalog 记录：

| 等级 | 要求 |
| --- | --- |
| experimental | schema 可解析，有 mock test，不允许真实 effect |
| community | 有 maintainer、license、最小 live test 和最近验证日期 |
| verified | 官方 API 证据、contract test、sandbox/live probe、错误/撤权/限流测试 |
| production | 真实运行 SLO、回滚/降级、版本兼容、安全审计和 on-call owner |
| suspended | 官方 API sunset、严重安全问题、条款变化或维护失效 |

单个 adapter 可按 capability 分级：例如 `read=verified`、`publish=experimental`，不能只给整个平台一个绿色勾。

## 9. Conformance Test

所有 adapter 共用 L0 契约，按 kind 增加测试：

### Ingress

- cursor round-trip、重复 batch、分页中断恢复、429/5xx、token 撤销、更新和 tombstone。
- fixture 不包含真实 token；live probe 有费用/副作用提示。

### Repo

- optimistic concurrency、崩溃恢复、projection 重建、retention、权限 filter、备份恢复。

### Access

- tenant/source ACL 不泄漏、时间过滤、精确引用、空结果、poisoned content、retrieval golden set。

### Tool

- dry-run 无副作用、批准失效、重复 idempotency key、超时 unknown/reconcile、部分成功、撤权和 kill switch。

## 10. 适配器复用策略

1. 优先包裹外部框架，不让其对象渗入领域 schema。
2. 每个外部 connector 固定版本并保存上游 license/source/commit。
3. 外部框架自己的 secret store 不能成为 DSH 的第二凭据真相；只给 worker 短期凭据或隔离实例引用。
4. 适配器输出先进入 schema validation 和不可信内容隔离区。
5. 任何 adapter 都能被替换，而 SourceItem/Brief/PublicationPlan ID 不变。

候选 manifest schema 位于 [`spec/adapter-manifest.schema.json`](../spec/adapter-manifest.schema.json)。
