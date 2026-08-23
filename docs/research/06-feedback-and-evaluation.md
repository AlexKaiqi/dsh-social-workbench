# 06：反馈与评估

## 研究问题

如何把平台返回的内容状态、指标和业务结果变成可比较的反馈，同时评估采集、检索、需求判断、内容和发布系统本身，而不把不同平台指标简单相加？

## 两类反馈必须分开

### 业务反馈

```text
PublicationReceipt
  -> MetricSnapshot(platform metric + definition + window + observedAt)
  -> NormalizedOutcome(impression / engagement / click / lead / conversion)
  -> HypothesisReview(contentRevision + audience + channel + result)
```

### 系统质量

```text
Connector: freshness / completeness / duplicate / tombstone lag
Retrieval: recall@k / MRR / unauthorized leakage / citation precision
Signal: evidence coverage / human accept / merge-split stability
Content: supported-claim rate / edit distance / approval rate
Publish: success / partial / unknown / duplicate / reconcile latency
```

## 候选组件结论

| 组件 | 用途 | 结论 |
| --- | --- | --- |
| 平台官方 analytics API | 帖子/账号的原始指标快照 | 唯一业务指标来源；保存平台原名、定义、窗口和权限 |
| [Postiz Analytics API](https://docs.postiz.com/public-api/introduction) | delegated provider 的 platform/post analytics | 委托发布时可复用，但仍保存底层平台、account、external post ID |
| [OpenTelemetry JS](https://opentelemetry.io/docs/languages/js/) | trace/metric、run correlation | 贯穿运行面的首选；traces/metrics 稳定，logs 仍单独封装 |
| [OpenLineage](https://openlineage.io/docs/spec/run-cycle/) | 多执行引擎的数据运行 lineage | 后期映射；不等于产品 analytics |
| [Promptfoo](https://www.promptfoo.dev/docs/guides/evaluate-rag/) | retrieval/generation 分离评测和 CI regression | 开发评测首选候选；加入本项目 deterministic assertions |
| Ragas | faithfulness/context 等辅助指标 | 可补充；LLM judge 必须校准且不能单独作为发布门 |
| PostgreSQL / BI export | metric snapshot、cohort、hypothesis review | 首版足够；不急于引入独立产品分析平台 |

OpenTelemetry JS 官方状态中 traces 和 metrics 为 stable、logs 仍在 development，因此首版让 trace ID 贯穿流程，业务审计日志继续使用本项目 schema，而不是假设 OTel logs 已解决领域审计。

## 指标统一规则

- 永远保存平台原始 metric name/value/definition；normalized metric 是派生 projection。
- 曝光、播放、阅读、点赞、收藏、评论、点击、询盘和付费不可互相替代。
- 每个 snapshot 绑定 publication receipt、content revision、account、窗口和采集时间。
- 指标缺失、延迟和平台回填都生成新 snapshot，不覆盖历史。
- 分析展示相关性，不自动宣称内容导致转化。

## 工作台自己实现

- MetricSnapshot、NormalizedOutcome、HypothesisReview 和 EvaluationRun schema。
- 平台指标 mapping 的版本与置信度。
- golden datasets、human labels 和 regression gates。
- 采集/检索/信号/内容/发布的分层 dashboard。
- 反馈如何回到下一轮 brief 的显式引用，不让模型自动“学习”未确认偏好。

## 验收

1. 同一帖子多次指标拉取形成时间序列，不覆盖。
2. 不同平台相似名称的指标保持原定义并可追踪映射。
3. 能把一次表现回到 source evidence、signal、brief、variant、plan 和 receipt。
4. 评测能分别定位 retrieval、generation 或 publisher 回归。
5. 无业务转化数据时，报告明确只衡量代理指标。
