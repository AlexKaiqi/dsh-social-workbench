# 四阶段开源框架与适配器生态

核验日期：2026-08-23。本矩阵回答两个不同问题：框架本身是否适合承担某一层，以及它的 adapter/catalog 能否直接复用。集成数量不能直接横向比较：一个 Airflow provider、Camel component、Singer tap、LangChain loader 和 Activepieces piece 的能力粒度完全不同。

## 结论

没有必要也不应选择一个框架包办四层。建议 DSH Social Workbench 持有领域状态与控制面，并在每层保留替换 seam：

各生态对具体社交平台究竟提供读取、分析还是发布能力，另见[Adapter 生态与平台能力交叉调研](ADAPTER_CATALOG_SURVEY.md)。

| 层 | 首选起点 | 规模/复杂度上升后的候选 |
| --- | --- | --- |
| Ingress | 自有 TypeScript adapter contract + RSS/官方 API；Python API 源可用 dlt | Meltano/Singer、Airbyte 外部服务、NiFi/Apache Camel |
| Knowledge Repo | PostgreSQL + pgvector；原始大对象使用 S3 接口 | OpenSearch、Qdrant、Iceberg/对象存储、OpenLineage |
| Knowledge Access | 自有 evidence-first 查询契约；Haystack 做检索 pipeline spike | LlamaIndex、LangChain integrations、RAGFlow；GraphRAG 只做实验 |
| Tools | DSH tool contract + transactional outbox；MCP 只作调用表面 | Postiz、Activepieces、Temporal、Apache Camel |

横跨四层还需要独立控制面：Connector Registry、Credentials、授权策略、审批、幂等、审计、可观测性和数据血缘。它们不能藏在某一个 adapter 内。

## 1. Ingress

### 1.1 通用数据/API 连接器

| 框架 | 成熟度与 adapter 模型 | 许可证 | 优势 | 对本项目的限制 | 建议 |
| --- | --- | --- | --- | --- | --- |
| [dlt](https://github.com/dlt-hub/dlt) | 活跃 Python library；source/resource/destination；REST source 声明 endpoint、认证、分页、增量和 schema | Apache-2.0 | 轻量、可嵌入 worker、适合快速构建官方 REST API adapter；可加载数据库、文件和 vector destination | Verified source 数量远少于 Airbyte/Meltano；默认 secret 文件不能替代 DSH Credentials | 首个 Python connector runtime 候选；只传 credential ref 解析后的短期凭据 |
| [Meltano + Singer](https://github.com/meltano/meltano) | 稳定 code-first ELT；tap/target 通过 Singer message、catalog 和 state 组合；Hub 宣称 600+ API/DB 插件 | Meltano MIT、SDK/Hub Apache-2.0；每个 tap/target 单独审计 | 开放规范、tap 与 target 解耦、有 variant/维护状态，适合复用长尾连接器 | 社区 variant 质量差异很大；Python subprocess、state 和 config 生命周期需与 DSH 对齐 | 当首批平台之外出现大量 SaaS/数据库来源时评估 |
| [Airbyte](https://github.com/airbytehq/airbyte) | 成熟平台和大型 connector catalog；Python CDK/low-code manifest/Connector Builder | connectors 与多数公开仓库为 ELv2；protocol 为 MIT | connector 数量、测试规范、增量同步和低代码 REST 构建成熟 | ELv2 不是 OSI 开源；作为产品后端暴露 UI/API 或转售会触及限制；部署重 | 只考虑独立部署/HTTP 委托，不复制或嵌入；先做许可证确认 |
| [Apache NiFi](https://nifi.apache.org/) | 老牌数据流系统；Processor/FlowFile/Connection；细粒度 provenance、replay 和 backpressure | Apache-2.0 | 对流式/批式路由、监管、回放和大规模运维非常成熟 | JVM 集群与 UI 运维远超当前 MVP；社交平台专用 adapter 少 | 监管/高吞吐阶段参考其 provenance 模型，不作为首版 runtime |
| [Apache Camel](https://camel.apache.org/) | 350+ component、Kamelet、Endpoint DSL 与企业集成模式 | Apache-2.0 | 路由、重试、circuit breaker、saga 和企业系统 adapter 极成熟 | Java 运行面与当前 Node/DSH 组合成本高；社交平台发布仍需自写 | 企业系统/消息总线显著增多时用独立 service，不作为领域核心 |

官方依据：[dlt REST source](https://dlthub.com/docs/dlt-ecosystem/verified-sources/rest_api)、[Meltano Singer spec](https://hub.meltano.com/singer/spec/)、[Airbyte CDK](https://github.com/airbytehq/airbyte-python-cdk)、[Airbyte license](https://github.com/airbytehq/airbyte/blob/master/docs/community/licenses/README.md)、[NiFi provenance](https://nifi.apache.org/nifi-docs/user-guide.html)。

### 1.2 网页、Feed 与平台内容

| 框架 | Adapter 模型 | 适用位置 | 风险与结论 |
| --- | --- | --- | --- |
| [RSSHub](https://github.com/DIYgod/RSSHub) | 每站 route 将公开页面转换为 feed | 公开内容的 delegated ingress | 社区覆盖强但 route 会随 DOM/风控失效；AGPL；必须保留原 URL、采集模式和 route 版本 |
| [Crawlee](https://github.com/apify/crawlee) | HTTP/Cheerio/Playwright crawler、request queue、session/proxy | 允许抓取的白名单网页 | Apache-2.0、工程成熟；反阻断能力不是平台授权，默认禁止登录态社交档案采集 |
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | 面向 LLM 的网页抽取与 Playwright | 小规模网页到结构化文本 | Apache-2.0；更偏抽取 library，调度/血缘/许可仍需本项目承担 |
| [Firecrawl](https://github.com/firecrawl/firecrawl) | API-first search/scrape/crawl，输出 Markdown/JSON，提供 MCP | 独立网页抽取服务 | core AGPL、SDK 部分 MIT；适合委托服务 spike，不默认嵌入 |
| 平台官方 API | 平台独立 OAuth、cursor/webhook、scope | 社交平台首选 ingress | 最可靠但覆盖受限；读取、搜索、发布、analytics 必须分别登记 capability |

### 1.3 文档解析

| 框架 | 能力 | 建议 |
| --- | --- | --- |
| [Docling](https://github.com/docling-project/docling) | MIT；PDF/Office/HTML 等统一结构、版面、表格、OCR，能输出结构化 JSON/Markdown | 富文档首选 spike；输出仍先进入 immutable observation，再生成 chunk |
| [Apache Tika](https://tika.apache.org/) | Apache-2.0；统一检测并提取上千文件类型的文本与 metadata | 通用格式兜底，适合 Java service；复杂版面理解弱于 Docling |
| [Unstructured](https://docs.unstructured.io/open-source/ingestion/overview) | source/destination connector + partition pipeline | connector/catalog 参考；需逐包确认本地/商业 API 边界和依赖 |

### 1.4 编排器不是 connector

[Dagster](https://docs.dagster.io/)适合把 SourceItem、索引和分析结果视为 asset，并提供 lineage/testability；[Prefect](https://github.com/PrefectHQ/prefect)适合把 Python 采集脚本快速升级为有重试、调度和观测的 flow；[Airflow](https://airflow.apache.org/registry/providers/)有 100+ provider，适合成熟数据团队的批处理 DAG。三者解决“何时、按什么依赖运行”，不会自动解决社交平台 scope、证据模型和删除同步。MVP 不应仅为定时拉取引入完整 orchestrator。

## 2. Knowledge Repo

Knowledge Repo 不是单一 vector database。至少包含：原始 observation、canonical domain objects、全文/向量索引投影、媒体对象、版本/血缘与删除状态。

| 框架 | 最擅长 | 优势 | 边界 | 建议 |
| --- | --- | --- | --- | --- |
| PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) | canonical metadata、事务、过滤、全文 + vector | 单一事务真相；JOIN、约束、PITR；HNSW/IVFFlat 与混合检索 | 超大向量规模、复杂 BM25 与横向扩展需要调优 | MVP 默认；SourceItem、Signal、Brief、Plan 和 access policy 都先在这里 |
| [Qdrant](https://qdrant.tech/documentation/) | 独立 vector/hybrid retrieval service | payload filter、hybrid/multistage query、官方多语言 client | 不应承担审批、发布和 canonical relation 真相 | pgvector 无法满足检索延迟/规模后再投影到 Qdrant |
| [OpenSearch](https://opensearch.org/platform/vector-engine/) | 大规模全文、聚合、日志与 hybrid search | Apache-2.0；词法检索、向量、聚合和多租户搜索成熟 | 集群运维与 schema/index 生命周期更重 | 精确关键词、趋势分析和大规模过滤成为核心后引入 |
| [Milvus](https://milvus.io/docs/overview.md) | 云原生超大规模 ANN | Apache-2.0、存算分离、分布式扩展 | 基础设施复杂度高；对当前证据仓库明显过度 | 只有千万/亿级向量和专门团队时评估 |
| S3 API / [SeaweedFS](https://github.com/seaweedfs/seaweedfs) | 原始 payload、媒体和解析产物 | 便宜、内容寻址、与数据库解耦；SeaweedFS Apache-2.0 | 对象存储不提供领域事务和检索 | 原始 observation/媒体超过数据库舒适区时采用 |
| [Apache Iceberg](https://iceberg.apache.org/spec/) | 大规模历史分析表、snapshot 和 schema evolution | 开放格式、time travel、并发提交、计算引擎生态 | 小数据/在线事务过重；仍需 catalog/compute | 指标和 observation 进入长期湖仓分析后再用 |
| [OpenLineage](https://github.com/OpenLineage/OpenLineage) | run/job/dataset 血缘事件标准 | Apache-2.0；Airflow/Spark/dbt/Flink 等集成 | 不保存内容，也不代替领域 provenance | 多执行引擎出现后映射本项目 lineage，而不是首版依赖 |
| [DataHub](https://github.com/datahub-project/datahub) | 企业 metadata graph、catalog 和 lineage | push/pull ingestion 与 SDK 完整 | 面向企业数据资产，远重于单人内容工作台 | 团队规模、治理对象和数据源显著扩大后评估 |

关键选择规则：先把 PostgreSQL 当事实源；vector/search 都是可重建 projection。不要让 chunk 或 embedding 变成唯一知识真相，也不要用向量相似度承担权限过滤。

## 3. Knowledge Access

这一层负责“谁能以何种方式获得哪些证据”，不只是 `topK`。稳定返回至少应包含 evidence span、source revision、score 类型、过滤条件、授权决策和检索版本。

| 框架 | Adapter 生态 | 优势 | 局限 | 建议 |
| --- | --- | --- | --- | --- |
| [Haystack](https://docs.haystack.deepset.ai/) | component、Document Store、Retriever、Generator integrations | Apache-2.0；显式有向多图 pipeline；hybrid retriever 和 filter 清晰 | connector 数量不如 LangChain；Python runtime | 首选 retrieval pipeline spike，特别适合可测试的 indexing/query 分离 |
| [LlamaIndex](https://github.com/run-llama/llama_index) | 300+ integration package；reader/index/retriever/query engine | MIT core；数据接入和索引实验速度快 | 单个 integration 的许可证/质量需审计；其持久化不能成为 canonical repo | 当需要快速试验 reader/retriever 时优先于自写，但封在 access adapter 后 |
| [LangChain](https://docs.langchain.com/oss/python/integrations/providers/overview) | 1000+ loader、vector store、tool、model integration | 最大适配生态；统一核心 interface、独立 provider packages | 广度导致质量与版本差异；容易让领域逻辑耦合框架对象 | 作为 adapter 来源与兼容层，不作为 Knowledge Repo 事实模型 |
| [RAGFlow](https://github.com/infiniflow/ragflow) | 完整 ingestion、解析、dataset、RAG 和 agent 产品 | 对富文档理解、可视化 dataset 和开箱体验强 | 会与工作台 UI、repo、权限和 agent 层重复；部署重 | 作为产品/解析效果 benchmark，不嵌入首版 |
| [Microsoft GraphRAG](https://github.com/microsoft/graphrag) | 图构建与 local/global query pipeline | 方法公开、MIT、研究影响大 | 官方仓库已说明进入 maintenance mode，且定位为 research project | 只在多跳/全局主题问题上做离线对照实验，不能选作核心框架 |
| [LightRAG](https://github.com/HKUDS/LightRAG) | KV/vector/graph 多后端，图检索模式 | 轻量、活跃、实验方便 | 快速变化，实体关系是模型派生而非权威事实 | Research track；必须和 lexical/vector baseline 做评测 |

### 权限与评测

- [OpenFGA](https://openfga.dev/docs/concepts)适合用户、workspace、source、document、account 的关系型授权；但 chunk 访问必须继承 canonical object 的权限。
- [OPA](https://www.openpolicyagent.org/docs)适合“是否允许该采集/检索/发布动作”的上下文策略；MVP 可先用显式代码，复杂后再外置策略。
- [Ragas](https://github.com/vibrantlabsai/ragas)可做 retrieval/answer 指标，但通用 LLM judge 不能替代业务 golden set。
- [Promptfoo](https://www.promptfoo.dev/docs/guides/evaluate-rag/)可把 RAG 与 prompt regression 放进 CI。

推荐顺序：BM25/全文 baseline → vector → hybrid + reranker → 仅在证明收益后 GraphRAG。没有检索评测集前，不应因为“更先进”引入知识图谱。

## 4. Tools 与发布操作

### 4.1 Tool surface 与执行器

| 框架 | Adapter/扩展模型 | 优势 | 约束 | 建议 |
| --- | --- | --- | --- | --- |
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | tools/resources/prompts + transports/auth | 标准调用表面，适合 DSH/外部 Agent 发现能力 | MCP 不提供审批、幂等、事务或平台授权；暴露 tool 不等于可安全执行 | 作为边界协议；所有 effect tool 仍走 DSH policy/outbox |
| [Postiz](https://github.com/gitroomhq/postiz-app) | social provider + integration account；API/MCP 动态返回平台 settings schema | 聚焦发布、调度、媒体和多个国际平台；成熟度高于小型 MCP publisher | 自托管仍要逐平台配置 app ID/secret；AGPL；OAuth 故障与平台变化不会消失 | 国际发布 delegated service 首选 spike |
| [Activepieces](https://github.com/activepieces/activepieces) | TypeScript Piece，trigger/action/property/auth；piece 可成为 MCP | CE MIT、adapter 生态活跃、flow/retry/HITL/UI 完整 | enterprise 功能另行许可；通用 flow 不懂 PublicationPlan 的批准语义 | 长尾 actions 和人工流程的外部执行器；不拥有 canonical 状态 |
| [Temporal](https://temporal.io/) | Workflow + Activity + signal/timer/task queue | MIT、极成熟 durable execution；适合长时间等待审批、重试和 reconciliation | 引入服务和 deterministic workflow 约束；不能替代 connector contract | 当 outbox + worker 不足以处理长流程/恢复时升级 |
| [Apache Camel](https://camel.apache.org/what-is-apache-camel/) | component/endpoint/route/Kamelet | 350+ connector、EIP、circuit breaker/saga | Java 生态、部署较重、社交发布仍需专用实现 | 企业集成很多时作为独立 action bus |
| [Node-RED](https://nodered.org/) | node + flow library | Apache-2.0、可视化、社区节点众多 | 节点质量、版本、密钥和多租户治理需额外建设 | 原型和个人自动化参考，不做核心发布引擎 |
| [Windmill](https://github.com/windmill-labs/windmill) | script/resource/resource type/workflow | 脚本、审批、UI 和 Git 同步强 | source/发行版许可混合，嵌入/转售有限制 | 内部独立服务可评估，不直接嵌入插件 |
| [n8n](https://github.com/n8n-io/n8n) | node/credential/workflow | adapter 与模板生态巨大、体验成熟 | Sustainable Use License 明确限制将用户自己的凭据用于产品后端的部分场景；不是 OSI 开源 | 本项目很可能触及许可敏感区，只作为用户自有外部实例集成，实施前书面确认 |

Postiz 的一个值得直接借鉴的设计是 `integrationSchema`：调用发布前先发现平台字符限制和 settings schema，而不是让模型凭记忆拼 payload。[Postiz MCP tools](https://docs.postiz.com/mcp/tools)同时说明 draft、schedule 和 publish 是不同状态。

### 4.2 API adapter 生成工具

[OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator)适合从官方 OpenAPI 生成底层 client，但生成 client 不是领域 adapter。仍需手写 capability 映射、OAuth 生命周期、速率限制、幂等、错误分类、preview 和 reconciliation。没有官方 OpenAPI 时，可以借鉴 dlt/Airbyte 的 declarative REST manifest，但禁止让 manifest 直接声明高影响发布工具而绕过审核。

## 5. 整体编排框架怎么选

| 情景 | 候选 | 判断 |
| --- | --- | --- |
| 单机/个人 MVP | DSH Host scheduler + DB outbox | 最少基础设施，领域状态最清楚；首选 |
| Python-heavy 采集/索引 | Prefect 或 Dagster | Prefect 更像 resilient Python flow；Dagster 更适合 asset/lineage 视角 |
| 成熟数据团队/大量 batch | Airflow | provider 和运维知识成熟，但不适合低延迟交互式发布主链 |
| 长时间等待批准、跨天调度、复杂重试/补偿 | Temporal | durable workflow 能力最强；在真实复杂度出现后引入 |
| 大量企业系统与消息路由 | Apache Camel / NiFi | 强集成和治理，但运行面较重 |
| 非技术用户自行编排长尾 SaaS | Activepieces | 比自建 workflow editor 更合理；领域审批仍回到 DSH |

## 6. 采用级别

### 建议立即进入设计基线

- PostgreSQL + pgvector：canonical store 与第一版 hybrid retrieval。
- S3 接口：原始 payload/媒体的可替换对象存储 seam。
- DSH-owned adapter manifest、connector registry、approval/outbox。
- 官方 MCP TypeScript SDK：只用于对外 resources/tools 表面。
- OpenTelemetry trace IDs：贯穿 ingress、retrieval、analysis、publish。

### 建议做 spike，不先绑定

- dlt 与 Meltano：比较首个 REST adapter 的开发/测试/增量同步成本。
- Haystack 与 LlamaIndex：用同一 golden set 比较检索质量和代码耦合。
- RSSHub、Postiz、Activepieces：都通过外部服务边界验证。
- Docling：对真实素材评估版面/表格/中文效果。

### 暂不进入 MVP

- Airbyte/NiFi/Camel 集群、Milvus、Iceberg、DataHub、GraphRAG、Temporal。
- 浏览器登录态社交采集和发布。
- n8n 作为内嵌产品后端。

这不是否定这些框架，而是它们解决的规模或治理问题尚未被当前目标证明。
