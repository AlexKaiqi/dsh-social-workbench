# 02：知识仓库

## 研究问题

如何保存原始观察、规范化对象、派生结论、版本、权限、删除和媒体，使任何结论都能回到证据，同时不被某个 vector database 或 RAG 框架锁定？

本轨道拥有 canonical persistence，不拥有检索排序、模型推断或发布调度。

## 必须分开的事实

```text
Observation        原始、不可变；保存 payload/blob ref 和采集事实
SourceItemRevision 规范化的来源对象；更新生成新 revision
DerivedArtifact    chunk、embedding、summary、topic 等可重建投影
DomainRevision     DemandSignal、Brief、Variant、Plan 等领域版本
Tombstone          上游删除、撤权、过期和本地删除请求
LineageEdge        input revision -> process/version -> output revision
```

Session transcript、Personal Knowledge、WorkSurface 文件和 Social Knowledge 不能互相复制成第二事实源，只通过稳定 revision ref 连接。

## 候选组件结论

| 组件 | 负责 | 结论 |
| --- | --- | --- |
| PostgreSQL | transaction、constraint、JSONB、全文、ACL metadata、PITR | canonical store 首选；首版不另建分布式数据库 |
| [pgvector](https://github.com/pgvector/pgvector) | exact/HNSW/IVFFlat vector search 与 metadata filter | 作为 PostgreSQL projection；HNSW/IVFFlat 是性能选择，不是知识真相 |
| S3 API | 原始 payload、图片、音视频和解析产物 | 对象超过数据库舒适区后采用；DB 保存 hash、rights、retention 和 object ref |
| [OpenLineage](https://openlineage.io/docs/spec/run-cycle/) | run/job/dataset event 和跨执行引擎 lineage | 多 worker/引擎后映射；不替代领域 provenance |
| OpenSearch / Qdrant | 大规模全文聚合或独立 hybrid/vector 检索 | 只作为可重建 projection；有实测规模/延迟需求后引入 |
| Iceberg / DataHub | 湖仓历史分析或企业 metadata catalog | 当前过重；团队/数据规模证明后再评估 |

pgvector 官方资料明确区分 exact 与 HNSW/IVFFlat 的速度/召回权衡，并指出带过滤的 ANN 需要 iterative scan、partial index 或 partition。由此得出的约束是：权限和租户过滤必须先绑定 canonical metadata，不能依赖向量 top-K 后再“补过滤”。

## 推荐物理结构

```text
PostgreSQL
├── observations
├── source_items + source_item_revisions
├── evidence_spans
├── demand_signals + revisions
├── content_briefs / claims / variants + revisions
├── publication_plans / approvals / receipts
├── connector_instances / checkpoints / capability_evidence
├── tombstones / rights / retention_jobs
├── outbox_jobs
└── projection tables: chunks / embeddings / metrics

S3-compatible store
└── raw payloads / source media / generated derivatives
```

所有表使用稳定 ID + revision，不从文件名、目录、时间戳或外部平台 ID 猜关系。外部 ID 只在带 provider/account namespace 的映射表中唯一。

## 工作台自己实现

- 领域 schema、migration、revision/CAS、删除传播和 retention。
- Observation → SourceItem 的 anti-corruption mapper。
- 字段级 provenance 或可定位 EvidenceSpan。
- 原始/规范化/派生/生成四类数据的存储和保留边界。
- 权限继承：chunk/embedding 必须继承 canonical object，不单独授予。
- projection rebuild、schema migration 和一致性检查。

## 验收

1. 同一上游对象更新后保留旧 revision，查询默认返回 current revision。
2. 每个 EvidenceSpan 能定位到 source revision 的精确区段。
3. 删除/撤权会使 retrieval 不再返回对象，并按策略保留最小审计记录。
4. 删除全部 embedding 后可从 canonical data 重建，不丢领域信息。
5. 同一个外部 ID 在不同 provider/account 下不会冲突。
6. canonical change 和 outbox enqueue 能在一个数据库事务中完成。
