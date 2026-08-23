# 候选领域契约

这些 JSON Schema 是研究阶段的语言原型，用于验证对象边界，不是已经发布的 Host/Client 协议。实现前允许破坏性修改；一旦进入运行时，必须确定协议版本、兼容策略和迁移测试。

| Schema | 作用 |
| --- | --- |
| `adapter-manifest.schema.json` | 描述 adapter 包的类型、运行方式、许可、理论能力、证据和 conformance 状态 |
| `connector-capability.schema.json` | 描述一个已配置连接器实例的真实能力、证据和授权状态 |
| `source-item.schema.json` | 保存标准化来源事实和 provenance，不包含模型推断 |
| `demand-signal.schema.json` | 保存由多个证据支持的需求假设、反例和置信度 |
| `content-brief.schema.json` | 把需求信号转为带 claim ledger 的内容任务 |
| `publication-plan.schema.json` | 描述待批准的不可变发布计划 |
| `publication-result.schema.json` | 保存外部发布结果、错误和指标回流 |
| `publication-revision.schema.json` | 运行切片：冻结平台、账号、可见性、文案和媒体内容哈希 |
| `publication-confirmation.schema.json` | 运行切片：保存一次性批准的哈希、范围、过期与消费状态，不保存明文 token |
| `publication-receipt.schema.json` | 运行切片：区分 submitted/confirmed/unknown，并保存平台反查和证据引用 |
| `source-bundle.schema.json` | 运行切片：本地/授权素材、权利说明与附件内容指纹 |
| `evidence-brief.schema.json` | 运行切片：每条 claim 都必须引用本次 source 的证据化 brief |
| `content-package.schema.json` | 运行切片：同一 brief 生成的小红书/抖音变体、marker 与两个冻结 revision |

共同原则：Adapter Manifest 描述代码理论能力，Connector Capability 描述账号当前实际能力；二者不可合并。ID 是内部稳定 ID；外部平台 ID 单独保存；所有时间为 RFC 3339；secret 只能用 credential ref 间接引用；任何 derived 对象都通过 ID 回链，而不复制一份来源真相。`publication-result` 是早期通用研究对象；真实 browser-assisted walking skeleton 以 revision/confirmation/receipt v1 为事实源，不能把旧 `published` 状态映射成未经反查的 `confirmed`。
