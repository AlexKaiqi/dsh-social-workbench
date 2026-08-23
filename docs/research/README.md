# 独立研究问题索引

核验日期：2026-08-23。

## 为什么这样拆

最终目标不是“做一个万能社媒机器人”，而是让以下结果持续成立：来源可接入、结论有证据、内容可协作、动作受控、结果可对账。平台 API、模型、检索框架和发布服务都会变化，因此把它们做成可替换组件；领域事实、批准和审计由工作台持有。

八条研究轨道通过版本化对象连接，可以独立选型、实现和验收：

| 轨道 | 独立问题 | 输入 | 输出 |
| --- | --- | --- | --- |
| [01 采集与适配器](01-acquisition-and-adapters.md) | 如何从公开/授权来源稳定、增量、可撤权地获取信息？ | ConnectorInstance + cursor | Observation |
| [02 知识仓库](02-knowledge-repository.md) | 如何保存原始证据、规范化对象、版本、权限和删除？ | Observation | SourceItem revision / tombstone |
| [03 知识访问与需求分析](03-access-and-demand-analysis.md) | 如何找到证据并把讨论转成可反驳的需求信号？ | QueryContext + SourceItem | EvidenceSpan + DemandSignal |
| [04 内容生产](04-content-production.md) | 如何从信号生成有证据、可编辑、适配各平台的内容？ | DemandSignal + evidence | Brief + Claim + Variant |
| [05 发布执行](05-publishing-and-execution.md) | 如何预览、批准、发布、重试并对账？ | immutable PublicationPlan | PublicationReceipt |
| [06 反馈与评估](06-feedback-and-evaluation.md) | 如何把平台表现和系统质量转成下一轮证据？ | Receipt + metric snapshots | OutcomeObservation + Evaluation |
| [07 控制面与治理](07-control-plane-and-governance.md) | 如何统一能力、凭据、授权、审批、审计和可观测性？ | 所有轨道的请求/事件 | PolicyDecision + Audit/Trace |
| [08 DSH 工作台集成](08-dsh-workbench-integration.md) | 如何把这些能力组合成一个可用而不重复建设的插件？ | 领域服务 + DSH services | Host/Client workbench |

## 共同研究模板

每条轨道都回答：

1. 它拥有哪个事实，不拥有什么。
2. 最小稳定契约是什么。
3. 哪些成熟组件可以直接复用、隔离委托或只作参考。
4. 哪些部分必须由 Social Workbench 自己实现。
5. 什么测试能证明这一轨道成立。
6. 失效时如何降级，而不破坏其他轨道。

总体结论见[最终架构与组件报告](../FINAL_ARCHITECTURE_REPORT.md)。
