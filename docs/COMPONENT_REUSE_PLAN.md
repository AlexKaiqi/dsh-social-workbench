# 组件复用策略与候选清单

核验日期：2026-08-23。本文件回答的不是“哪些项目值得看”，而是“具体复用哪一部分、以什么方式接入、哪部分仍由 Social Workbench 自己持有”。源码和本地 DSH 服务的真实契约优先于 README 中的能力宣传。

## 1. 结论：只自建领域薄层

Social Workbench 应自己持有的代码尽量限制为五类：

1. 领域 ID、Schema 和状态机：Observation、SourceItem、DemandSignal、ContentBrief、PublicationPlan、Receipt。
2. Adapter Manifest、四类 Port、capability 评级和 conformance suite。
3. 跨层控制规则：证据引用、批准绑定、幂等键、outbox 状态、撤权和审计关联。
4. 外部框架到领域对象的 anti-corruption mapping。
5. DSH 装配、工作台 UI 和用户可理解的失败/人工交接体验。

HTTP、OAuth、分页、增量同步、文档解析、Markdown AST、媒体探测、向量索引、任务队列、RAG pipeline、MCP transport、平台发布和可观测性都优先复用现有组件。复用不等于把核心状态交给框架：外部对象进入领域层前必须映射，外部执行结束后必须生成 receipt。

## 2. 六种复用方式

| 级别 | 含义 | 适用条件 | 示例 |
| --- | --- | --- | --- |
| `host-reuse` | 注入现有 DSH Service，不建立第二份服务 | 已有契约正好拥有该事实 | Credentials、Settings、ModelCatalog、Attachment、Locale |
| `library` | 作为锁版本的进程内依赖调用 | 许可证兼容、运行时相同、对象可被边界封装 | pgvector、pg-boss、remark、Sharp、MCP SDK |
| `protocol` | 采用稳定消息/Schema 协议，不引入整个产品 | 协议开放，执行器可替换 | Singer messages、S3 API、OpenTelemetry、MCP |
| `delegate` | 通过 HTTP/CLI/stdio 调用隔离服务或进程 | 运行时不同、部署较重、AGPL/ELv2 或需要独立升级 | dlt worker、Meltano tap、RSSHub、Docling、Postiz |
| `reference` | 学习其状态机、测试或 UI，不复制代码 | 许可证/耦合/成熟度不适合复用 | NiFi provenance、国内 Playwright publisher |
| `reject` | 不进入运行面 | 私有接口、明文 Cookie、绕风控、无法对账 | 逆向签名和无人值守登录态自动化 |

选择顺序是 `host-reuse -> library/protocol -> delegate -> reference -> 自建最小桥接`。但不能为了“复用率”引入一个比问题更大的平台。

## 3. 优先复用已有 DSH 能力

本轮直接检查了同一工作区的实现和包契约。以下能力不应在新插件中重新实现。

| 已有组件 | 可复用单位 | Social Workbench 中的角色 | 明确边界 | 状态 |
| --- | --- | --- | --- | --- |
| Cordis / DSH Host | Service、`ctx.inject`、effect/disposer、事件和 Remote 生命周期 | 所有 adapter、worker、route 和 Client 资源的装配/回收 | 不自行建立全局 service locator 或不可回收监听器 | `host-reuse`，实现阶段强制 |
| DSH Credentials | credential ref、Host 侧 resolve | 平台 OAuth/API key、Postiz/外部服务凭据 | 不建立第二个明文 secret store；浏览器和模型不见明文 | `host-reuse`，实现阶段强制 |
| DSH Settings | namespace 和 live/non-live 配置 | connector registry 设置、保留策略、feature flag | 高体量 observation、receipt 和内容版本不放普通 Settings | `host-reuse`，实现阶段强制 |
| `dsh-multi-model-provider` | `ctx.modelCatalog`、`TaskModelRuntime`、模型画像和 route 状态 | 选择抽取、embedding、rerank、生成和媒体任务模型 | 不解析它的 Settings；不再维护模型 key、路由或可用性真相 | `host-reuse`，本地契约已核验 |
| DSH Attachment | Host 管理的附件 ID/metadata | 原始文件、生成图片、音视频和发布媒体引用 | PublicationPlan 只保存 attachment ref，不接受任意 Host 路径 | `host-reuse`，需在实现前核验具体 API |
| `@pf-worksurface/core` / `@pf-worksurface/dsh` | immutable Surface revision、Block、Projection、WorkGraph、编排和 Web DAG | 研究、内容 brief、主稿、平台变体与人工评审的文件原生工作区 | 高体量 SourceItem、索引、账号和发布 outbox 不放 WorkSurface；WorkSurface revision 引用领域 ID | `host-reuse`；优先组合现有插件，不 fork core |
| `dsh-block-to-file` | WorkSurface 已组合的原子 Git 落盘 | 模型生成/修改内容稿件 | Social Workbench 不直接复制 fenced-block parser 或 Git CAS | `host-reuse`，经 WorkSurface 间接获得 |
| `dsh-personal-knowledge-base` | `ctx.personalKnowledge` 的有界 context、稳定偏好、proposal/confirm | 读取用户已确认的长期偏好和当前工作摘要 | 社交 observation、舆情库和分析结果不能写入个人知识库；长期写入仍走 proposal | `host-reuse`，只作为用户上下文输入 |
| `dsh-persona-studio` | 已确认的 Persona profile、公开/知识/私有/policy 分区、release | 可选的品牌/创作者语气与公开身份来源 | 不读取其私有文件；需要先定义只读 consumer contract，未确认 profile 不参与发布 | `host-reuse` 候选，当前需补消费者 API |
| `dsh-client-locale` | locale namespace、BCP 47、fallback、RTL | 工作台 UI 的中英文和后续 locale | 不再实现全局语言状态 | `host-reuse`，实现阶段强制 |
| `dsh-plugin-develop` | checker、L0/L1 testkit、facts 规则 | 插件结构、模型 surface 和装配验证 | checker 不替代 L2 真执行和 L3 eval | `host-reuse`，实现阶段开发依赖 |
| DSH Session / Session Query | 原始交互历史和有界历史读取 | 研究/批准的对话证据、任务恢复 | 不复制 transcript 到社交知识库 | `host-reuse`，逻辑引用而非数据复制 |

### 3.1 WorkSurface 与 Knowledge Repo 的分工

这是最容易重复建设的边界：

```text
PostgreSQL canonical repo                 WorkSurface
────────────────────────                 ───────────
Observation / SourceItem                 研究提纲
去重键、删除状态、ACL                    Evidence ref 列表
DemandSignal 结构化 revision             ContentBrief 人类可读稿
PublicationPlan / Receipt                主稿与平台变体
高体量索引和指标                          人工评审、版本和协作 DAG
```

两侧通过不可变引用连接，例如 `source-item:<id>@<revision>`、`brief:<id>@<revision>`、`worksurface:<surface>@<revision>`。不能让 Markdown 文件名或数据库时间戳隐式承担关系。

### 3.2 Personal Knowledge 与 Social Knowledge 的分工

- Personal Knowledge 回答“用户长期偏好、当前工作和过去 Session 中什么相关”。
- Social Knowledge 回答“外部公开/授权来源观察到了什么、依据是什么、何时失效”。
- 只有用户明确要求长期记住的稳定工作方法才从 Social Workbench 提案进入 Personal Knowledge；采集内容和模型推断永远不会自动写入。

## 4. Ingress：复用到什么粒度

| 组件 | 直接复用部分 | 集成方式 | 不采用部分 | 决策 |
| --- | --- | --- | --- | --- |
| [dlt REST API source](https://dlthub.com/docs/dlt-ecosystem/verified-sources/rest_api) | `RESTClient` 的认证/分页、declarative resource、`Incremental` cursor、primary-key dedupe、pipeline state | 隔离 Python worker；输出 Observation envelope + opaque checkpoint；短期凭据由 Host 注入 | dlt table/schema 不成为领域模型；dlt secret/config 文件不成为长期凭据源 | 首个官方 REST ingress spike 的首选 |
| [Singer spec](https://hub.meltano.com/singer/spec/) | `SCHEMA`、`RECORD`、`STATE` 消息及 tap catalog | 先实现 stdio bridge，随后可运行 Meltano/Singer tap；保存 tap/variant/version | 不复制整个 Hub；不信任未审计 community tap；Singer state 只是 adapter checkpoint | 长尾来源出现后采用 `protocol + delegate` |
| [Meltano Hub](https://hub.meltano.com/singer/docs/) | variant、maintainer、maintenance status、Hub JSON API | catalog importer 只同步 metadata，不自动启用 adapter | Meltano project、schedule、secret store 不成为 DSH 事实源 | Catalog 与 tap runtime 复用，MVP 不部署完整 Meltano UI |
| [Airbyte CDK](https://airbytehq.github.io/airbyte-python-cdk/airbyte_cdk.html) | declarative manifest/CDK 的连接器设计、source schema 与 state 模型 | 需要其长尾 connector 时对接独立 Airbyte API/runtime | ELv2 代码不嵌入插件；不复制 connector catalog；不把 Airbyte UI 暴露成工作台 | `delegate`，在 dlt/Meltano 证明不足后再引入 |
| [RSSHub](https://github.com/DIYgod/RSSHub) | 已有 route 和统一 feed 输出 | 独立 HTTP 服务，route/version/原 URL 写入 provenance | 不复制 AGPL route 代码；不使用需要登录 Cookie 的 route 作为默认输入 | 第一批公开 ingress 的 `delegate` |
| [Crawlee](https://github.com/apify/crawlee) | request queue、HTTP/Cheerio/Playwright crawler、session 生命周期 | Node worker 内包一层白名单 Web adapter | 反阻断、代理和 browser session 不被解释为授权 | 仅允许抓取的公开网页 `library` |
| [Docling](https://docling.org/) | `DoclingDocument` JSON、布局/OCR/表格/阅读顺序、插件机制 | Python service/CLI；原文件先入 Attachment/Blob，再保存解析 revision | 不让 Docling chunk/index 成为 canonical repo；模型/插件版本必须记录 | 富文档解析首选 `delegate` |

### dlt 与 Singer 不需要二选一

- dlt 更适合新写的、少量官方 REST adapter：复用其 REST client、分页和 incremental。
- Singer 更适合复用已有 tap：工作台只实现一次消息桥。
- 当同一来源已有维护良好的 Singer tap 时，不应为了统一技术栈重新用 dlt 编写。
- 当社区 tap 过期而官方 API 简单时，也不应为了“600+ catalog”被迫修复整套 Meltano 工程。

## 5. Knowledge Repo 与执行基础设施

| 组件 | 直接复用部分 | 集成方式 | 所有权边界 | 决策 |
| --- | --- | --- | --- | --- |
| PostgreSQL | transaction、constraint、JSONB、全文检索、row/filter index、PITR | 领域 repository adapter | Social Workbench 持有表和 migration；不暴露 ORM object 为协议 | canonical store 默认 |
| [pgvector](https://github.com/pgvector/pgvector) | vector type、exact/HNSW/IVFFlat、filter、与 PostgreSQL 全文组合 | PostgreSQL extension | embedding/chunk 是可重建 projection；ACL 仍以 canonical row 过滤 | MVP 直接复用，不自建向量索引 |
| S3 API | object key、metadata、range、retention/lifecycle 协议 | AWS SDK 或兼容对象存储 client，backend 可替换 | 数据库保存 content hash、rights、retention 和 object ref | 原始 payload/媒体超过 DB 舒适区后采用 `protocol` |
| [pg-boss](https://pgboss.io/) | PostgreSQL `SKIP LOCKED` worker、transactional enqueue、retry、DLQ、cron、concurrency | Node library；与领域状态在同一 DB transaction 入队 | queue job 不是 PublicationPlan/Receipt 真相；外部 effect 仍必须幂等和 reconcile | outbox worker 首选 spike |
| [Graphile Worker](https://worker.graphile.org/) | PostgreSQL job queue、task identifier、cron、低延迟 worker | 与 pg-boss 做小型对照 | 同上 | 备选；不同时引入两个队列 |
| [OpenLineage](https://github.com/OpenLineage/OpenLineage) | run/job/dataset event schema | 多执行引擎出现后映射本项目 lineage | 不替代 Observation provenance 和业务 audit | 后期 `protocol` |

pg-boss 的“exactly-once job processing”不等于外部平台 effect 恰好一次。worker 可能因 retry 或提交边界再次调用平台，因此 `idempotencyKey + receipt + reconcile` 仍由 Tool Port 强制。

## 6. Knowledge Access 与信息处理

| 组件 | 可复用部分 | 集成方式 | 不采用部分 | 决策 |
| --- | --- | --- | --- | --- |
| PostgreSQL FTS + pgvector | lexical/vector candidates、metadata/ACL filter、RRF 或 rerank 输入 | repository/access adapter 直接查询 | 不直接生成最终回答 | 首版 baseline；先证明需求再引入 RAG 框架 |
| [Haystack](https://docs.haystack.deepset.ai/) | 明确输入/输出的 component、index/query pipeline、Document Store/Retriever/Joiner 和 integrations | 隔离 Python retrieval service；用同一 golden set 与 SQL baseline 对照 | Haystack Document、pipeline YAML 和 Document Store 不成为 canonical truth | 需要复杂 hybrid/rerank pipeline 时的首选 spike |
| [LlamaIndex.TS](https://next.ts.llamaindex.ai/docs/llamaindex/getting_started/installation/typescript) | TypeScript reader、node parser、retriever、query workflow 与 vector store adapter | 可进程内做短期实验，外层仍返回 EvidenceSpan | `StorageContext` 本地持久化不作为 Knowledge Repo；不让框架对象穿透 tool schema | 想避免 Python sidecar时的备选 spike |
| [Ragas](https://github.com/vibrantlabsai/ragas) | retrieval/faithfulness 等评测组件 | 离线 eval worker | LLM judge 不作为唯一验收 | 评测组件候选 |
| [Promptfoo RAG eval](https://www.promptfoo.dev/docs/guides/evaluate-rag/) | dataset、assertion、provider/plugin、CI regression | dev/eval CLI | 不进入在线请求路径 | L0/L3 之外的检索/生成回归工具 |
| [OpenFGA](https://openfga.dev/docs/concepts) / [OPA](https://www.openpolicyagent.org/docs) | relation authorization / context policy engine | 权限关系复杂后作为独立服务 | MVP 不为少量规则增加两套策略系统 | 后期 `delegate`，先保持显式代码 |

### 必须保留的 anti-corruption mapping

```text
Haystack Document / LlamaIndex Node
  -> sourceItemRef + revision + exact span
  -> scoreKind + score + retrievalStage
  -> policyDecisionRef + observedAt + canonicalUrl
  -> EvidenceSpan
```

如果框架只能返回一段无定位文本，就不能直接支持有证据的内容主张；需要补定位映射或放弃该 pipeline。

## 7. 内容与媒体转换

| 组件 | 直接复用部分 | 集成方式 | 注意事项 | 决策 |
| --- | --- | --- | --- | --- |
| [unified/remark/rehype](https://github.com/remarkjs/remark) | Markdown AST、GFM/frontmatter、lint、Markdown↔HTML plugin pipeline | TypeScript `library`，输入/输出都保留 AST 与 source position | 平台变体规则做小型自有 plugin；不要用正则重写 Markdown | 文本/长文变体基础组件 |
| [Sharp](https://sharp.pixelplumbing.com/) | 基于 libvips 的 resize/crop/format/metadata | Node `library`，只处理 Attachment 派生物 | 记录源 attachment、变换参数、输出 hash；不覆盖原图 | 图片规格转换首选 |
| [FFmpeg/ffprobe](https://www.ffmpeg.org/documentation.html) | 媒体探测、转码、裁切、封装、滤镜 | 受控 subprocess，固定 binary/build 信息 | FFmpeg 默认 LGPL，但启用 GPL codec 会改变发行义务；参数白名单、防路径越界 | 音视频验证与转换首选 |
| DSH model catalog/runtime | 摘要、信号抽取、内容生成、embedding/rerank、图片任务 route | `host-reuse` | prompt/schema/revision 可追踪；模型输出不是事实源 | 所有模型调用的唯一入口 |

平台长度、标题、话题、媒体比例和必填字段由 `PlatformProfile`/effective capability 驱动；remark、Sharp 和 FFmpeg 负责确定性转换，模型只处理需要语义判断的部分。

## 8. Tools、发布和通用自动化

| 组件 | 直接复用部分 | 集成方式 | 不采用部分 | 决策 |
| --- | --- | --- | --- | --- |
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | tools/resources/prompts、stdio/Streamable HTTP、auth helpers | DSH 对外/外部 Agent 边界的 `library` | MCP 不承担批准、幂等、队列和审计；当前生产应锁 v1.x，v2 仍是 pre-alpha | 协议实现直接复用，不自写 transport |
| [Postiz Public API](https://docs.postiz.com/public-api/introduction) | integrations、动态 settings、媒体/帖子创建、平台 provider | 隔离自托管服务或用户已有实例；DSH 保存 integration ref 和 receipt | 不 fork Postiz UI/账号库；Postiz draft/scheduled/published 状态必须映射到自己的状态机 | 国际委托发布首选 `delegate` |
| [Activepieces Pieces](https://www.activepieces.com/docs/admin-guide/guides/manage-pieces) | 现有 piece、trigger/action、flow、人工步骤和 MCP exposure | 优先对接独立实例；必要时编写一个 Social Workbench piece 调回 DSH API | 不直接复制 757 个 piece；[`@activepieces/pieces-framework` npm metadata](https://www.npmjs.com/package/%40activepieces/pieces-framework) 当前未声明 license，嵌入前需文件级审计 | 长尾 SaaS action 的 `delegate`，不是核心发布引擎 |
| [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) | 从官方 OpenAPI 生成低层 client/model | 构建期工具，生成物经人工 review | 生成 client 不替代领域 adapter、OAuth、错误分类和对账 | 有官方 spec 时优先 codegen，不手抄 request/response model |
| pg-boss | scheduled job、retry/backoff、concurrency 和 DLQ | Tool outbox worker | 不能让模型直接 enqueue 未批准 effect | 首版 durable execution 候选 |
| [Temporal](https://temporal.io/) | durable workflow、activity、signal/timer 和长期恢复 | 真正出现跨天等待/补偿复杂度后独立部署 | MVP 不同时维护 DB outbox 和 Temporal 两套编排真相 | 后期升级路径 |

### Postiz 的映射边界

```text
Postiz integration list/settings
  -> ConnectorInstance.effectiveCapabilities

PublicationPlanItem + immutable preview + approval
  -> Postiz create/schedule request
  -> external post/integration IDs
  -> PublicationReceipt
  -> reconcile until terminal state
```

Postiz API 文档说明“创建并存储”不必然等于“已经调度或发布”，所以不能把 create 请求成功直接映射为 `published`。

## 9. 横切组件

| 问题 | 复用组件 | 采用方式 |
| --- | --- | --- |
| Trace/metrics | [OpenTelemetry JS](https://opentelemetry.io/docs/languages/js/) | Node SDK；trace ID 贯穿 connector run、retrieval、model derivation、outbox 和 receipt。JS traces/metrics 稳定，logs 当前仍应谨慎封装 |
| Schema validation | JSON Schema 2020-12 + AJV | 复用 `dsh-plugin-develop` 已使用的 AJV；领域 schema 只维护一份 |
| 内容寻址/原子写 | Node crypto + DSH atomic-write / WorkSurface core | 不另造 hash、CAS 和 crash-safe file helper |
| 国际化 | `dsh-client-locale` | 插件只注册 namespace 和中英文 dictionary |
| 插件验证 | `dsh-plugin-develop` | L0 schema/tool surface + L1 装配；另补真实 L2/L3 |

## 10. Build / Wrap / Delegate / Reference / Reject 总表

| 类别 | 当前清单 |
| --- | --- |
| **Build：只自建薄层** | 领域 schema/ID、Port、manifest、capability registry、anti-corruption mapper、approval/outbox 领域状态、DSH UI |
| **Wrap：直接组件复用** | DSH services、PostgreSQL/pgvector、pg-boss、remark/rehype、Sharp、MCP SDK、OpenTelemetry、官方 API client/codegen |
| **Delegate：隔离服务复用** | dlt、Meltano/Singer taps、RSSHub、Docling、Postiz、Activepieces；未来可能 Haystack/OPA/OpenFGA/Temporal |
| **Reference：只借鉴** | Airbyte/NiFi provenance、RAGFlow/DataHub 产品交互、国内 Playwright publisher 的字段/流程/失败样本 |
| **Reject：不接入** | 私有 API、Cookie 交给 Agent、签名逆向、验证码/风控规避、没有对账的自动重发 |

`tubban1/leadgen` 明确归入 **Reference**：只吸收阶段化漏斗、配置驱动多租户 renderer 和默认生成邮件草稿三个设计信号。它的 Google Maps Playwright 采集、Serper 启发式、CRM schema、`.env` 凭据、明文 admin password、Vercel/GoDaddy/GitHub effect wrappers 和自动 scheduler 均不复用。完整证据见[专项审计](candidates/tubban1-leadgen.md)。

## 11. 防止“复用”变成另一种锁定

每个外部组件必须满足：

1. 领域 schema 中不出现框架专有 class 或数据库内部 ID。
2. Adapter 输出在边界完成 JSON Schema validation。
3. 保存 package/image/version、source URL、license、配置 hash 和最近 contract/live probe。
4. fixture 能在没有上游服务时运行；conformance suite 能替换实现后重复执行。
5. 外部 state 只以 opaque checkpoint/receipt 引用存在，不成为无法迁移的唯一真相。
6. Credentials 仍由 DSH 授权；外部服务只得到限定账号和最小 scope。
7. 任何 delegated service 都有 health、timeout、circuit breaker、撤权和人工降级。
8. 许可证在“本地自用、分发插件、提供网络服务、使用用户凭据”四种场景分别判断。

## 12. 组件采用门

候选组件不能因为 stars、connector 数量或 demo 成功直接进入 runtime：

```text
发现候选
  -> 固定 tag/commit/image digest
  -> LICENSE + 依赖 + 产品使用场景审查
  -> API/模块边界代码审查
  -> fixture contract test
  -> sandbox/live probe
  -> failure/revoke/reconcile test
  -> ADR 接受
```

建议首批只做四个复用验证：

1. `@pf-worksurface/core` 是否能直接承载 Brief/Variant 人工工作区，而无需新增内容版本系统。
2. dlt worker 是否能把官方 REST cursor/state 干净映射成 Ingress checkpoint。
3. PostgreSQL + pgvector + pg-boss 是否能用一个事务完成 canonical change + outbox enqueue。
4. Postiz 是否能动态发现 schema，并把 create/schedule/publish/reconcile 完整映射为 PublicationReceipt。

任何 spike 的结论都要回写本文件和 ADR；不允许成功后直接把实验依赖变成隐式架构。
