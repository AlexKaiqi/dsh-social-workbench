# 参考组合与选择路线

## 1. 推荐基线：DSH-owned Control Plane

```text
                         ┌──────── Control Plane ────────┐
                         │ Registry / Credentials / OPA │
                         │ Approval / Audit / Telemetry │
                         └──────────────┬───────────────┘
                                        │
Ingress adapters ──> Observation Log ──> Canonical Repo
 RSS/API/dlt            blob + hash       PostgreSQL
 RSSHub/Crawlee                           + pgvector
 Docling                                  + S3 seam
                                             │
                                  Knowledge Access
                                  lexical/vector/hybrid
                                  evidence + ACL + eval
                                             │
                                  Brief / Variants
                                             │
                                  Tool Plan + Outbox
                                   direct API/Postiz
                                             │
                                      Result reconcile
```

DSH 持有的是控制面和领域真相，外部框架都通过 port 被包裹。这能避免同时拥有 Airbyte/Meltano secret、RAGFlow dataset、Postiz calendar 和 DSH publication plan 四套互相漂移的状态。

## 2. Stack A：本机研究 MVP

适用：单用户、每天数百到数千条来源、几个发布账号。

| 能力 | 组合 |
| --- | --- |
| Ingress | DSH scheduler + TypeScript 官方 API/RSS adapter；复杂 Python REST 用 dlt worker |
| 网页/文档 | RSSHub 委托；白名单 Crawl4AI/Crawlee；Docling worker |
| Repo | PostgreSQL + pgvector；小 blob 可先本地 content-addressed store，接口按 S3 设计 |
| Access | PostgreSQL FTS + vector + RRF；Haystack spike 仅做 pipeline，不持有事实 |
| Tools | DSH MCP/tool surface + DB transactional outbox；一个 Postiz adapter + 一个 direct official adapter |
| Control | DSH Credentials、显式 policy code、approval hash、结构化 audit、OpenTelemetry trace ID |

不引入：Kafka、Airflow、NiFi、Milvus、Iceberg、DataHub、Temporal、GraphRAG。

## 3. Stack B：多来源个人/小团队

适用：几十个来源、多个账号、每天万级内容、需要失败恢复和多人批准。

| 能力 | 组合 |
| --- | --- |
| Ingress | Meltano/Singer 或 dlt adapter pool；Dagster/Prefect 负责编排 indexing assets |
| Repo | PostgreSQL canonical + S3/SeaweedFS raw blob + OpenSearch 或 Qdrant projection |
| Access | Haystack hybrid/retrieval pipeline；OpenFGA 做 source/document/account ACL |
| Tools | Postiz + direct domestic official API；Activepieces 承担长尾 SaaS；outbox 保持事实源 |
| Durable workflow | 先 DB queue；跨天审批/复杂补偿出现后再上 Temporal |
| Observability | OpenTelemetry + LLM tracing backend；OpenLineage 记录数据作业 |

## 4. Stack C：平台化/大规模

适用：多租户产品、百万级日采集、专职数据/平台团队。

| 能力 | 候选 |
| --- | --- |
| Ingress | Airbyte/NiFi/Camel 独立集群、Kafka/Flink、官方 webhook；许可证单独谈判 |
| Repo | PostgreSQL control plane + object store/Iceberg history + OpenSearch + Qdrant/Milvus |
| Catalog/lineage | OpenLineage + DataHub/OpenMetadata |
| Access | 独立 Retrieval Service、OpenFGA/OPA、在线/离线 golden eval、缓存与 budget controls |
| Tools | Temporal durable workflows、region/account queues、policy decision point、强审计 |
| Operations | SLO、容量规划、灾备、数据驻留、租户隔离、安全审计、平台 API 变更值班 |

这一级只有在真实负载和组织能力存在时才成立；不能靠提前部署大量基础设施获得。

## 5. 三个需要做的框架对照 Spike

### Spike 1：dlt vs Meltano

使用同一个分页 REST API fixture 和一个 sandbox 官方 API，比较：

- 认证、分页、增量 cursor、schema 演化、429/5xx、更新/删除；
- adapter 代码量、contract test、启动时间、部署隔离；
- 如何只消费 DSH credential ref 而不落第二份 secret；
- 输出 Observation envelope 的难度。

倾向：平台较少时 dlt；长尾 connector catalog 成为主要价值时 Meltano。

### Spike 2：Haystack vs LlamaIndex

对同一中文/英文 social evidence golden set 测试：

- BM25、dense、hybrid、reranker 的 Recall@K/MRR；
- metadata/ACL filter 正确率；
- evidence span 和 citation 精度；
- index rebuild、版本锁定和 framework object 泄漏程度。

倾向：显式、可测 pipeline 选 Haystack；快速 connector/retrieval 实验选 LlamaIndex。最终 API 必须保持框架中立。

### Spike 3：Postiz vs direct adapter

对同一个测试内容分别走 Postiz 和一个开放平台官方 API，比较：

- OAuth 建设、媒体上传、平台 schema、draft/schedule/publish；
- idempotency、超时 reconcile、部分失败、错误可解释性；
- 自托管配置、升级破坏、AGPL 边界和日志安全；
- 工作台能否保持自己的 PublicationPlan/Result 真相。

倾向：国际长尾平台委托 Postiz；国内强业务平台且有官方 API 时直连。

## 6. 选择门槛

任何框架成为生产依赖前都要满足：

1. 许可证允许当前“DSH 插件 + 用户自己的平台凭据 + 可能产品化”的使用方式。
2. 能固定版本，能离线/隔离测试，能导出数据，不形成第二事实源。
3. adapter 能通过本项目 conformance suite，而不是只跑通 hello world。
4. 失效时存在降级路径：读取暂停、索引重建、人工交接或 direct adapter。
5. 运维成本与实际规模相称。

## 7. 当前推荐的最小技术决策

- 先设计 adapter contracts 与 catalog，不选择全局“大框架”。
- 先 PostgreSQL + pgvector，保留 S3/OpenSearch/Qdrant projection seam。
- 先 DSH scheduler/outbox，保留 Prefect/Dagster/Temporal execution seam。
- Ingress 首批对照 dlt 与自有 TypeScript adapter；Meltano 是第二候选。
- Access 首批对照 Haystack 与框架无关的 SQL baseline。
- 发布首批对照 Postiz delegated 与一个 direct official API。

这六项能最大幅度降低未知性，同时没有提前承担平台化基础设施。
