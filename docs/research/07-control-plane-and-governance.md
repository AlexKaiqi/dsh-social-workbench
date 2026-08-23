# 07：控制面与治理

## 研究问题

如何让所有轨道共享同一套能力登记、凭据、授权、审批、幂等、审计、保留策略、可观测性和 kill switch，而不是每个 adapter 各自实现一套？

控制面不处理内容正文，也不成为业务仓库；它决定谁在什么条件下可以对哪个对象执行哪种能力。

## 必需组件

| 组件 | 拥有的事实 | 实现结论 |
| --- | --- | --- |
| Connector Registry | manifest、instance、effective capability、health、evidence TTL | 工作台自建薄层 |
| Credential Boundary | credential ref、scope、resolve、rotation/revoke | 直接复用 DSH Credentials；模型/Client/DB 不见明文 |
| Settings | 普通配置、feature flag、retention setting | 复用 DSH Settings；高体量领域数据不放 Settings |
| Policy Service | visibility、rights、purpose、account、risk、action decision | MVP 显式代码；复杂后评估 OPA |
| Relationship Authorization | user/workspace/source/document/account 关系 | 单人 MVP 不引入；团队/共享后评估 OpenFGA |
| Approval Service | plan hash、approver、scope、expiry、revocation | 工作台自建，不委托给 workflow action |
| Idempotency/Outbox | logical action key、attempt、lease、retry、DLQ | PostgreSQL + pg-boss/Graphile spike |
| Schema Registry | JSON Schema version、validation report | JSON Schema 2020-12 + AJV |
| Audit/Trace | decision、actor、input refs、result refs、trace ID | 领域 audit + OpenTelemetry |
| Kill Switch | connector/account/capability/global disable | 工作台自建并置于执行前最后一道门 |

## 候选组件结论

- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)提供稳定、语言中立的数据契约；AJV 作为 Node validator，并与现有 DSH checker 复用。
- [OpenFGA](https://openfga.dev/docs/concepts)适合关系型授权；其官方 RAG 指南也强调文档权限必须进入检索。仅在多用户、共享、继承关系出现后引入。
- [OPA](https://www.openpolicyagent.org/docs/rest-api)适合上下文策略和集中 decision API；MVP 规则少时外置会增加复杂度。
- [OpenTelemetry](https://opentelemetry.io/docs/languages/js/)用于 trace/metrics correlation；领域批准、receipt 和 rights audit 仍用自有 schema。
- pg-boss/Graphile Worker 用于执行，不拥有 PublicationPlan 或 Receipt 真相。

## 风险分级

| 风险 | 示例 | 默认门 |
| --- | --- | --- |
| 低 | feed 读取、fixture 验证、schema discovery | 已授权 connector 可自动 |
| 中 | 授权账号 analytics、重新解析、生成 derivative | policy + rate/cost limit |
| 高 | 发布、评论、邮件、创建资源、修改 DNS | immutable preview + 一次性批准 + outbox |
| 破坏性 | 删除帖子、解绑域名、删除账号/仓库、批量遗忘 | 精确目标解析 + 二次确认 + receipt |
| 禁止 | 私密资料批量筛选、Cookie/private API、绕验证码/风控 | 不进入 capability registry |

## Prompt injection 边界

外部网页、评论、文档和媒体转录全部是“不可信数据”。它们只能进入 extractor/analysis 输入，不能把其中的指令提升为 system/tool command。任何模型生成的 action proposal 必须重新经过 schema、policy、preview 和用户批准。

## 验收

1. Client、模型输出、普通日志和数据库中均没有明文 token/Cookie。
2. capability 过期或 health probe 失败后自动从 callable 降级。
3. 批准 token 不能用于不同账号、不同内容 revision 或过期时间之后。
4. kill switch 在 worker 调用外部服务前再次检查。
5. audit 能回答谁、何时、基于什么 evidence/plan、执行了什么、平台返回什么。
6. 任何 delegated service 下线后，canonical repo 和批准历史仍完整。
