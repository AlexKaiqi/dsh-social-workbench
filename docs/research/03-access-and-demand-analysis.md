# 03：知识访问与需求分析

## 研究问题

如何让用户和 Agent 获得有权限、可定位、可解释的证据；又如何从讨论中识别需求，而不把热度、模型总结或聚类结果伪装成市场事实？

本轨道输出 `EvidenceSpan` 和 `DemandSignalRevision`，不修改来源事实、不生成发布稿、不执行动作。

## 两个子问题必须分开

### Evidence Access

```text
QueryContext(user, workspace, purpose, filters)
  -> lexical/vector candidates
  -> canonical ACL/rights/retention filter
  -> rerank
  -> EvidenceSpan(sourceRef, exactSpan, scoreKind, score,
                  retrievalStage, policyDecisionRef)
```

### Demand Analysis

```text
EvidenceSpan[]
  -> dedupe / topic candidate / temporal aggregation
  -> model-assisted extraction
  -> DemandSignal(audience, problem, context, urgency,
                  frequency, workaround, willingnessEvidence,
                  counterEvidence, confidence, evidenceRefs)
```

讨论量、点赞和搜索量只属于 signal feature；购买意愿、紧迫度和目标受众需要独立证据。

## 候选组件结论

| 组件 | 可复用部分 | 结论 |
| --- | --- | --- |
| PostgreSQL FTS + pgvector | lexical/vector candidates、metadata filter、hybrid baseline | 首版直接使用；先建立 golden set，再谈复杂 RAG |
| [Haystack](https://docs.haystack.deepset.ai/) | component、Retriever、Joiner、显式 indexing/query pipeline | 需要复杂 hybrid/rerank 时首选 Python spike；返回值必须映射为 EvidenceSpan |
| [LlamaIndex](https://github.com/run-llama/llama_index) | reader、node parser、retriever、query workflow | 快速实验备选；框架对象和本地 persistence 不进入 canonical schema |
| [BERTopic](https://maartengr.github.io/BERTopic/algorithm/algorithm.html) | embedding→降维→聚类→c-TF-IDF→表示的模块化 topic pipeline | 作为离线 topic candidate 生成器；聚类不等于需求，需版本和人工命名 |
| [Ragas](https://docs.ragas.io/) | retrieval/faithfulness 等评测组件 | 可作为辅助 evaluator，不能用 LLM judge 代替业务 golden set |
| [Promptfoo](https://www.promptfoo.dev/docs/guides/evaluate-rag/) | 分离评测 retrieval 与 generation、CI regression | 首版评测工具候选；加入确定性 citation/权限断言 |
| OpenFGA / OPA | 文档关系授权 / 上下文策略 | 权限关系复杂后引入；MVP 先用显式 policy service interface |

BERTopic 的官方算法把 embedding、降维、聚类、tokenization、weighting 和 representation 分开，适合用作可替换研究组件；但 UMAP/HDBSCAN 有随机性和参数敏感性，因此每次结果必须记录模型、参数、语料 revision 和代表文档。

## 推荐实现顺序

1. PostgreSQL FTS baseline：关键词、时间、来源、语言和权限过滤。
2. pgvector semantic candidates；和 lexical 结果做 RRF/简单融合。
3. 建立 50–200 个真实问题的 golden set，标注期望证据和不可见证据。
4. 只有 baseline 不足时引入 reranker/Haystack。
5. topic mining 先用统计窗口和可解释规则，再对 BERTopic 做离线对照。
6. LLM 只负责结构化抽取/命名/归纳；必须返回 evidence refs、反例和置信度。

## 工作台自己实现

- `EvidenceSpan` 和 `DemandSignal` schema。
- ACL/rights/retention 在 retrieval 前后的强制检查。
- 需求信号的 feature ledger、反证、人工合并/拆分和 revision。
- query/retrieval/model/parameter 版本与成本记录。
- 业务 golden set、确定性断言和 human review rubric。

## 验收

1. 无权限文档在 lexical、vector、cache 和生成答案中均不可见。
2. 每个信号至少有两个 evidence refs 或明确标记 single-source。
3. 删除任一来源后，信号重新计算并降低/改变置信度。
4. 能展示支持证据和反证，而不是只展示模型摘要。
5. retrieval 与 signal extraction 可独立回归，模型升级不会覆盖旧 revision。
