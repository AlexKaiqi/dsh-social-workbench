# 候选领域契约

这里同时包含早期研究原型与已经进入 0.2.0 运行时的版本化契约。标为“运行切片”的 schema 已是 Host/CLI/Client 的事实边界；变化时必须同步实现、测试与兼容说明。

| Schema | 作用 |
| --- | --- |
| `adapter-manifest.schema.json` | 描述 adapter 包的类型、运行方式、许可、理论能力、证据和 conformance 状态 |
| `connector-capability.schema.json` | 描述一个已配置连接器实例的真实能力、证据和授权状态 |
| `source-item.schema.json` | 保存标准化来源事实和 provenance，不包含模型推断 |
| `demand-signal.schema.json` | 保存由多个证据支持的需求假设、反例和置信度 |
| `content-brief.schema.json` | 把需求信号转为带 claim ledger 的内容任务 |
| `publication-plan.schema.json` | 运行切片：plan hash、双平台 revision、排期和仅允许本地入队的用户批准 |
| `publication-outbox.schema.json` | 运行切片：确定性幂等 outbox item、执行/对账引用和逐平台状态 |
| `publication-result.schema.json` | 保存外部发布结果、错误和指标回流 |
| `reconciliation.schema.json` | 运行切片：unknown 结果的平台侧证据对账，不触发重新提交 |
| `metric-snapshot.schema.json` | 运行切片：追加式平台原始指标、定义、窗口、来源和 mapping version |
| `feedback-item.schema.json` | 运行切片：授权评论/问题/人工记录，并禁止跨平台身份归并 |
| `hypothesis-review.schema.json` | 运行切片：指标/反馈引用、假设结论和下一轮 brief 输入 |
| `loop-dashboard.schema.json` | 运行切片：Client 可见的只读计数与脱敏最近对象投影 |
| `publication-revision.schema.json` | 运行切片：冻结平台、账号、可见性、文案和媒体内容哈希 |
| `publication-confirmation.schema.json` | 运行切片：保存一次性批准的哈希、范围、过期与消费状态，不保存明文 token |
| `publication-receipt.schema.json` | 运行切片：区分 submitted/confirmed/unknown，并保存平台反查和证据引用 |
| `source-bundle.schema.json` | 运行切片：本地/授权素材、权利说明与附件内容指纹 |
| `evidence-brief.schema.json` | 运行切片：每条 claim 都必须引用本次 source 的证据化 brief |
| `content-package.schema.json` | 运行切片：同一 brief 生成的小红书/抖音变体、marker 与两个冻结 revision |

共同原则：Adapter Manifest 描述代码理论能力，Connector Capability 描述账号当前实际能力；二者不可合并。ID 是内部稳定 ID；外部平台 ID 单独保存；所有时间为 RFC 3339；secret 只能用 credential ref 间接引用；任何 derived 对象都通过 ID 回链，而不复制一份来源真相。`publication-result` 仍是早期通用研究对象；当前 browser-assisted 实现以 plan/outbox/revision/confirmation/receipt/reconciliation v1 为事实源，不能把旧 `published` 状态映射成未经反查的 `confirmed`。
