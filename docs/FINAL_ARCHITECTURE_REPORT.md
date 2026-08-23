# Social Workbench 最终架构与组件调研报告

- 报告日期：2026-08-23
- 状态：研究结论已收敛；Host staging 插件与双平台 walking skeleton 已实现，真实账号验收待用户授权
- 目标：跨平台获取公开/授权信息，挖掘需求，形成有证据内容，经批准发布，并让反馈回到下一轮判断

## 2026-08-23：MVP 收敛说明

本报告中的完整架构是长期边界图，不是当前 build list。当前以[抖音 + 小红书最小可运行闭环](MVP_DOUYIN_XIAOHONGSHU.md)为执行入口：先用已授权或合成素材生成两个平台版本，由用户核对冻结 revision 并签发一次性确认，再通过固定版本的本机 sidecar 执行，只有平台侧反查成立才保存 confirmed receipt。官方 API/Share SDK 可用后作为独立 adapter 替换执行边缘。

在两次真实运行出现重复实现之前，不冻结完整领域模型，不实现通用 adapter runtime、事件总线或微服务。本文后续关于完整 Port、控制面和仓库的内容只用于防止未来走入死胡同。

## 1. 执行结论

### 应该怎么做

建设一个 **evidence-first、adapter-driven、approval-gated** 的 DSH 工作台，而不是万能爬虫、通用 RAG 产品或全自动社媒机器人。

工作台自己拥有：

1. 领域对象与版本：Observation、SourceItem、EvidenceSpan、DemandSignal、ContentBrief、Claim、Variant、PublicationPlan、Approval、Receipt、MetricSnapshot。
2. 四类稳定 Port：Ingress、Knowledge Repository、Knowledge Access、Tool/Publisher。
3. 横切控制面：Connector Registry、Credentials、capability evidence、policy、批准、幂等、outbox、审计、telemetry、lineage。
4. DSH Host/Client 装配和用户工作台。

其余能力优先组件复用：

- API 采集：dlt；社区长尾：Singer/Meltano；公开 feed：RSS/RSSHub；富文档：Docling。
- 事实仓库：PostgreSQL；第一版 hybrid retrieval：PostgreSQL FTS + pgvector；大对象：S3 API。
- 检索实验：Haystack；topic 候选：BERTopic；评测：Promptfoo/Ragas。
- 内容协作：WorkSurface；文本变换：remark；图片：Sharp；视频/音频：FFmpeg。
- 国际发布：Postiz delegate；透明平台可直连官方 API；长尾 SaaS action：Activepieces；无官方能力：manual-package。
- Durable jobs：PostgreSQL outbox + pg-boss/Graphile Worker；复杂跨天流程出现后再考虑 Temporal。
- 可观测性：OpenTelemetry；权限关系复杂后再引入 OpenFGA/OPA。

### 不应该怎么做

- 不选择一个框架包办采集、仓库、RAG、生成和发布。
- 不以平台名称代替 capability，不把“能抓/能填表”描述成官方 API。
- 不把 vector database、RAG Document、workflow job 或 WorkSurface 文件变成领域事实源。
- 不使用 Cookie/private API/签名逆向/验证码绕过来扩大平台数量。
- 不允许模型直接发布；批准必须绑定不可变 plan hash、账号、范围和到期时间。
- 不把讨论热度当需求，也不把模型生成的公司、价格、评价等内容当事实。

## 2. 第一性原理推导

### Literal request

需要一个工作台，从多个平台获取信息，挖掘需求、分析、生产内容并发布；先调研成熟框架和 adapter，能复用则不自建。

### Deeper goal

长期目标不是“今天能自动操作几个 App”，而是让信息和内容工作形成可扩展、可替换、可审计的闭环：平台变化后不丢知识，模型变化后不丢证据，执行失败后不重复发布。

### Success standard

一条最小闭环可证明：

```text
公开/授权来源
  -> immutable evidence
  -> evidence-backed demand signal
  -> brief + supported claims
  -> two platform variants
  -> immutable preview + one-time approval
  -> replaceable platform execution adapters
  -> platform-side verification or explicit unknown
  -> receipt + metric snapshot + hypothesis review
```

同时，任何一步都能回答“输入 revision、组件版本、政策决定、输出 revision 和失败状态是什么”。

### Boundaries

- 只处理公开、自己控制或明确授权的数据。
- 不做相亲/社交 App 私密档案批量筛选和跨平台身份画像。
- 凭据只在 Host Credentials；模型、Client、聊天、普通设置和 Git 中不出现明文。
- 真实发布默认逐条批准；破坏性动作需要更强确认。
- 当前仍是研究/规格项目，不能用计划能力创建虚假 plugin facts。

## 3. 总体架构

```text
┌────────────────────── Workbench Client ──────────────────────┐
│ Inbox │ Evidence │ Signals │ Studio │ Approval │ Results    │
│ Connector Health │ Calendar/Outbox │ Policy Explanations    │
└────────────────────────────┬──────────────────────────────────┘
                             │ versioned Host protocol
┌────────────────────────────▼──────────────────────────────────┐
│ DSH Social Workbench Host                                    │
│                                                              │
│ Connector Registry ─► Ingress Port ─► Normalizer/Dedup       │
│          │                   │                 │               │
│   Credentials/Policy     Observation     Knowledge Repo       │
│                                                │             │
│                         Knowledge Access ─► Signal Miner      │
│                                                │             │
│ WorkSurface/Studio ◄─ Brief/Claim/Variant Planner            │
│           │                                                    │
│ Approval Gate ─► Transactional Outbox ─► Tool/Publisher Port │
│                                                 │            │
│                     Reconciler ◄─ Receipt/Analytics Ingress   │
│                                                              │
│ Audit + OpenTelemetry + Lineage + Retention + Kill Switch    │
└──────────────────────────────────────────────────────────────┘
       │                │                │                │
   dlt/Singer       PostgreSQL       Postiz/API      RSSHub/Docling
```

### 为什么必须有 Control Plane

用户提出的 Ingress、Knowledge Repo、Knowledge Access、Tools 是正确主轴，但四层本身不能回答：某账号当前是否有权、凭据是否已撤销、某次发布是否获批、超时是否应重试、平台 schema 是否过期。Connector Registry、Credentials、Policy、Approval、Outbox、Audit 和 Telemetry 必须横跨全链路。

## 4. 独立研究问题与结论

| 研究轨道 | 结论 | 详细报告 |
| --- | --- | --- |
| 采集与适配器 | 新写官方 REST adapter 用 dlt；已有长尾 tap 用 Singer；公开 feed 用 RSSHub；所有输出统一 Observation | [01](research/01-acquisition-and-adapters.md) |
| 知识仓库 | PostgreSQL 是 canonical truth；pgvector/search 是 projection；原始媒体走 S3 seam | [02](research/02-knowledge-repository.md) |
| 知识访问与需求分析 | 先 FTS/vector baseline 和 golden set；需求信号强制 evidence + counter-evidence；Haystack/BERTopic 只做可替换 pipeline | [03](research/03-access-and-demand-analysis.md) |
| 内容生产 | WorkSurface 管协作 revision；Claim Ledger 管事实；remark/Sharp/FFmpeg 管确定性变换 | [04](research/04-content-production.md) |
| 发布执行 | immutable plan + approval + outbox + receipt + reconcile；Postiz/官方 API/manual-package 并存 | [05](research/05-publishing-and-execution.md) |
| 反馈评估 | 平台原指标与 normalized outcome 分开；业务反馈和系统 eval 分开 | [06](research/06-feedback-and-evaluation.md) |
| 控制面治理 | DSH Credentials、JSON Schema/AJV、显式 policy、批准、kill switch、OTel；OpenFGA/OPA 后置 | [07](research/07-control-plane-and-governance.md) |
| DSH 集成 | 复用现有 Host services、WorkSurface、ModelCatalog、Attachment、Locale、checker；不重复建事实源 | [08](research/08-dsh-workbench-integration.md) |

## 5. 组件蓝图：怎么做、参考什么

### 5.1 核心领域组件

| 组件 | 怎么做 | 复用方式 | 主要参考 |
| --- | --- | --- | --- |
| Domain Schema/IDs | JSON Schema 2020-12；稳定 ID + immutable revision；所有 Port 边界验证 | **Build thin** | [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)、现有 `spec/` |
| Connector Registry | manifest、instance、capability、mode、account type、scope、health、evidence TTL | **Build thin** | Airbyte catalog、Meltano variant、Postiz `integrationSchema`；[本项目 Adapter 架构](ADAPTER_ARCHITECTURE.md) |
| Observation/Normalizer | 原始 envelope 不可变；mapper 产生 SourceItem revision；checkpoint 事务后推进 | **Build mapper** | Singer `RECORD/STATE`、dlt incremental、NiFi provenance |
| Revision/Lineage | input refs + process/version/config hash → output revision；删除使用 tombstone | **Build thin** | OpenLineage run cycle、WorkSurface immutable revision |
| Claim Ledger | supported/proposed/disputed/unknown；事实必须带 evidence ref 和使用限制 | **Build** | 由 `tubban1/leadgen` 的事实生成失败模式反推；[专项审计](candidates/tubban1-leadgen.md) |
| Approval | 绑定 plan hash、账号、scope、批准人、到期时间；任何修改使其失效 | **Build** | 安全发布不变量；Activepieces approval 只作交互参考 |
| Publication Receipt | attempt、external ID、provider/account、raw result ref、状态和 reconcile history | **Build mapper** | Postiz post/analytics API、各平台官方 API |

### 5.2 Ingress 组件

| 组件 | 怎么做 | 决策 | 参考 |
| --- | --- | --- | --- |
| Feed adapter | ETag/Last-Modified、GUID/canonical URL、content hash、更新/删除策略 | 首个实现 | RSS/Atom/JSON Feed、RSSHub |
| Official REST adapter | declarative endpoint/pagination/incremental；credential ref 注入 worker；结果映射 Observation | dlt spike | [dlt REST API source](https://dlthub.com/docs/dlt-ecosystem/verified-sources/rest_api/basic) |
| Community tap bridge | stdio 读取 `SCHEMA/RECORD/STATE`；state opaque；每 tap 固定 variant/version | 长尾采用 | [Singer spec](https://hub.meltano.com/singer/spec/)、Meltano Hub |
| Web adapter | 白名单、robots/terms/rights、rate limit、raw hash；无登录态默认 | 限定采用 | Crawlee、Crawl4AI；RSSHub route |
| Document parser | 原文件先入 Attachment/S3；Docling JSON 作为 versioned projection | spike | [Docling](https://docling.org/)、Apache Tika fallback |
| Platform adapters | 每个平台拆 read/search/analytics/publish profile，官方文档 + live probe 才 callable | 按需 | [平台矩阵](PLATFORM_MATRIX.md) |

### 5.3 Knowledge Repo / Access

| 组件 | 怎么做 | 决策 | 参考 |
| --- | --- | --- | --- |
| Canonical DB | PostgreSQL transaction、FK/unique/check constraint、JSONB、RLS seam、PITR | 首版采用 | PostgreSQL 官方文档 |
| Vector projection | embedding model/version/source revision；先 exact，小规模后 HNSW；ACL metadata filter | 首版采用 | [pgvector](https://github.com/pgvector/pgvector) |
| Blob store | content-addressed object key；DB 保存 hash/rights/retention/ref | seam 先定义 | S3 API |
| Hybrid retrieval | FTS + vector candidates + filter + RRF/rerank；统一 EvidenceSpan 输出 | 自建 baseline | PostgreSQL FTS + pgvector |
| Retrieval pipeline | 复杂 join/rerank/index-query 分离后才引入 | Haystack spike | [Haystack](https://docs.haystack.deepset.ai/) |
| Topic candidate | 离线 BERTopic，记录 corpus/model/parameter/reps；人工确认主题 | research/spike | [BERTopic algorithm](https://maartengr.github.io/BERTopic/algorithm/algorithm.html) |
| RAG/eval | retrieval 与 generation 分别评测；权限泄漏/citation 为确定性门 | dev tooling | [Promptfoo RAG eval](https://www.promptfoo.dev/docs/guides/evaluate-rag/)、Ragas |

### 5.4 Content / Media

| 组件 | 怎么做 | 决策 | 参考 |
| --- | --- | --- | --- |
| Human workspace | Brief/Master/Variant 为 WorkSurface revision；领域 DB 保存 ref | host reuse | `@pf-worksurface/core` / dsh-progressive-formulation-worksurface |
| Text AST | Markdown→mdast→平台 plugin→lint/HTML；保留 source position | library | [remark](https://github.com/remarkjs/remark) |
| Image derivative | attachment ref + Sharp transform params → new hash/ref | library | [Sharp](https://sharp.pixelplumbing.com/) |
| AV derivative | ffprobe validation；FFmpeg 白名单参数；记录 build/codec | controlled subprocess | [FFmpeg docs](https://ffmpeg.org/documentation.html) |
| Semantic generation | DSH model route + versioned prompt/schema；只输出 proposal/variant | host reuse | dsh-multi-model-provider |
| Platform profile | 动态/证据化 schema + account-specific settings；不硬编码在 prompt | build thin | Postiz provider settings、各官方 API schema |

### 5.5 Publishing / Execution

| 组件 | 怎么做 | 决策 | 参考 |
| --- | --- | --- | --- |
| Outbox | canonical change 与 enqueue 同事务；lease/retry/DLQ；per-account concurrency | pg-boss spike | [pg-boss docs](https://github.com/kinker5/pg-boss/blob/master/docs/readme.md) |
| Publisher contract | discover/validate/preview/execute/reconcile/delete；mode 显式 | build thin | 本项目 Tool Port、Postiz API |
| International delegate | list integration → fetch schema → upload → create/draft/schedule → reconcile | 首选 spike | [Postiz Public API](https://docs.postiz.com/public-api/introduction)、[MCP](https://docs.postiz.com/mcp/introduction) |
| Official direct adapter | OpenAPI client + domain mapper + OAuth lifecycle + receipt | 按平台 | 官方平台文档、OpenAPI Generator |
| Long-tail SaaS action | PublicationPlan 仍在 DSH；Activepieces 只执行限定 action | delegate | [Activepieces pieces](https://www.activepieces.com/pieces/) |
| Manual package | 文案、媒体、字段、检查表、deep/share link；用户回填 receipt | 正式支持 | 小红书 share SDK/无 API 平台的稳定降级路径 |
| Long durable workflow | 只有跨天 signal/timer/compensation 超出 outbox 后引入 | 后期 | [Temporal](https://docs.temporal.io/) |

### 5.6 Control / Feedback / UI

| 组件 | 怎么做 | 决策 | 参考 |
| --- | --- | --- | --- |
| Credentials | Host 只解析 credential ref；最小 scope；rotation/revoke | host reuse | DSH Credentials |
| Policy | visibility/rights/purpose/risk 显式 decision；保存 decision ref | 自建接口 | OPA 后期 delegate |
| Relationship ACL | canonical object 权限继承到 chunk/vector | 后期 | [OpenFGA concepts](https://openfga.dev/docs/concepts) |
| Telemetry | trace ID 贯穿 run/retrieval/model/outbox/receipt；metrics 稳定 | library | [OpenTelemetry JS](https://opentelemetry.io/docs/languages/js/) |
| Metric snapshots | 保存平台原指标+定义+窗口；normalized 是 projection | build mapper | 平台 analytics/Postiz analytics |
| Workbench UI | Inbox/Evidence/Signals/Studio/Approval/Outbox/Results/Connectors | build client | Folo/reader、Postiz calendar、WorkSurface DAG 只作产品参考 |

## 6. Adapter 总策略

### Capability-first，不是 platform-first

每个实例保存有效能力：

```text
platform: instagram
accountType: professional
mode: official-api
capabilities:
  readOwned: authorized
  searchPublic: unsupported
  publishImage: callable
  publishReel: callable
  analyticsPost: authorized
checkedAt: ...
expiresAt: ...
evidenceRefs: ...
```

### 接入优先级

1. `official-api`
2. `official-feed-export`
3. `delegated-api`
4. `share-sdk`
5. `manual-package`
6. `browser-assisted`（单独授权和隔离）
7. `private-api/cookie`（拒绝）

### 首批平台建议

首批目标已经收敛为抖音和小红书：

- 输入先用用户提供的 URL、截图、文字和自有媒体，不把全站自动采集列入 MVP。
- Run 0 通过 DSH Pocket 把发布包交给手机，由用户进入两个官方 App 确认并回填结果。
- Run 1 在拿到两个平台 App Key 后，用薄 Android 桥分别调用官方 Share SDK。
- Run 2 只在抖音 `video.create` 获批后实现服务器 OAuth、上传、创建与状态读取。
- 小红书不使用 Cookie、私有签名或 DOM 自动发布来冒充官方能力。

详细证据和未知项见[平台矩阵](PLATFORM_MATRIX.md)。

## 7. Build / Wrap / Delegate / Reference / Reject

| 类型 | 清单 |
| --- | --- |
| **Build thin** | 领域 schema/ID、四 Port、manifest/registry、anti-corruption mapper、EvidenceSpan、DemandSignal、Claim Ledger、approval/outbox domain、receipt、DSH UI |
| **Host reuse** | Cordis lifecycle、Credentials、Settings、ModelCatalog/Runtime、Attachment、WorkSurface、Personal Knowledge、Persona consumer、Locale、plugin checker |
| **Library/Protocol** | PostgreSQL/pgvector、pg-boss 或 Graphile、remark、Sharp、MCP SDK、OpenTelemetry、JSON Schema/AJV、S3/Singer/OpenLineage protocol |
| **Delegate** | dlt worker、Meltano taps、RSSHub、Docling、Postiz、Activepieces；未来可能 Haystack/OPA/OpenFGA/Temporal |
| **Reference** | NiFi provenance、Airbyte connector tests、BERTopic modular pipeline、Folo/RAGFlow/DataHub UI、`tubban1/leadgen` 阶段化闭环、国内 Playwright publisher 的字段/失败样本 |
| **Reject** | 私有 API、Cookie 交给 Agent、签名逆向、验证码/风控规避、无 receipt 的自动重发、无证据事实生成 |

## 8. 推荐实施顺序

### Phase 0：抖音 + 小红书 Run 0

- 用 3–10 条用户有权提供的素材建立一次内容任务。
- 生成 brief、抖音草稿、小红书草稿和两个发布包。
- 用 Pocket 在手机打开发布包；用户在官方 App 中确认。
- 回填 URL、截图或人工确认，并正确记录取消和失败。

验收：两个平台各完成一次，且同一流程第二次重复时无需改代码。

### Phase 1：官方移动分享桥

- 申请并验证抖音、小红书 App Key。
- 建一个只负责一次性任务下载、官方 SDK 调起和结果回传的薄 Android companion。
- 只共用两个平台真实相同的 handoff/confirm/result 状态，不假设字段和回执相同。

验收：两个官方 App 均由用户确认；SDK 取消、错误和 session receipt 可对账。

### Phase 2：抖音服务器 OpenAPI

- 获得 `video.create` 等真实权限后实现 OAuth、token 保管、上传、创建和授权账号作品读取。
- 发布后保存审核中状态，不能把接口受理当成公开成功。

验收：在用户测试账号完成一次真实创建并读回状态；撤权、失败和不确定结果有记录。

### Phase 3：根据运行证据重构

- 只有重复状态机、receipt 或媒体校验真实出现后才提取共用组件。
- 信息获取优先补用户导入和授权账号 API；是否扩展公开来源由真实任务价值决定。
- 完整 repository、outbox、hybrid retrieval 和权限控制按数据量与失败样本引入。

## 9. 关键 Spike 与采用门

| Spike | 要回答的问题 | 通过标准 |
| --- | --- | --- |
| WorkSurface | 能否承载 Brief/Variant 协作而不建第二版本系统？ | revision/ref/DAG/评审满足用例 |
| dlt vs native/Singer | 官方 REST adapter 的分页、增量、测试和映射成本谁更低？ | 同一 fixture、cursor 和 failure suite 比较 |
| PostgreSQL bundle | canonical + pgvector + outbox 是否能用一个事务满足 MVP？ | crash/retry/rebuild/ACL tests |
| Postiz | schema discovery、媒体、draft/schedule、receipt/reconcile 是否完整？ | sandbox 账号完成 partial/timeout/revoke tests |
| Manual package | 无 API 平台能否仍形成可审计闭环？ | 用户能完成发布并回填 external receipt |
| Demand eval | “需求信号”相对 baseline 是否真正提升判断？ | human label、反证覆盖、稳定性和成本达标 |

任何组件都要经过：固定版本/镜像 → LICENSE/依赖审查 → fixture contract → sandbox probe → failure/revoke/reconcile → ADR 接受。stars、connector 数或 demo 不能替代采用门。

## 10. 已知不确定性

这些问题会改变首批 adapter，但不会改变总体架构：

1. 用户优先平台和账号类型：个人、创作者、企业、机构、专业账号。
2. 是否具备国内平台主体资质和应用审核条件。
3. 是否接受自托管 RSSHub/Postiz/Activepieces/Python worker。
4. 数据保留期限、原文/媒体保存范围和删除请求流程。
5. 发布批准是逐条、campaign 范围，还是只允许草稿/人工交接。
6. “需求”最终服务于选题、线索、品牌、产品研究还是直接转化。
7. 团队协作、租户隔离和外部分享是否属于第一阶段。

## 11. 最终决定

推荐采用 **DSH-owned domain/control plane + replaceable component adapters**：

- 框架中心是证据、版本、批准和回执，不是平台脚本。
- PostgreSQL 是最小统一事实源；WorkSurface 是人类内容工作面。
- dlt/Singer/RSSHub/Docling、Haystack/BERTopic、remark/Sharp/FFmpeg、Postiz/Activepieces/pg-boss 各自在清晰边界内复用。
- 任何平台都通过 capability evidence 和 conformance 进入，而不是靠 README 的“支持”标签。
- 第一个实现目标是一条完整可追溯闭环，而不是平台数量。

这套结构既能吸收 `leadgen` 等纵向项目的流程经验，也避免复制其强耦合、事实生成、凭据和自动副作用问题。
