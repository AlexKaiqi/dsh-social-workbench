# 05：发布与外部执行

## 研究问题

如何把已经验证的内容安全地变成真实平台副作用，并在超时、重试、部分成功、撤权和平台状态变化时保持可审计、可对账？

本轨道只消费不可变 `PublicationPlan`。它不能自行改稿、补账号、放宽可见性或绕过批准。

## 安全状态机

```text
draft
  -> validated
  -> previewed(planHash)
  -> approved(account + scope + expiresAt + planHash)
  -> queued(idempotencyKey)
  -> executing
  -> succeeded | partial | failed | unknown
  -> reconciling
  -> published | rejected | deleted | manual-action-required
```

一次 HTTP 200 不等于 published；请求超时也不等于 failed。未知结果必须查询平台或委托服务，不允许盲目重发。

## 候选组件结论

| 组件 | 可复用单位 | 集成方式 | 结论 |
| --- | --- | --- | --- |
| DSH Tool contract | 模型可见 schema、Host executor、授权边界 | host reuse | 高影响动作的唯一入口；tool 只创建/检查 plan，不能直接绕过 outbox |
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | tools/resources/prompts 和 transport/auth helpers | library | 对外/委托协议；MCP 本身不提供批准、幂等和对账 |
| [Postiz API](https://docs.postiz.com/public-api/introduction) / [MCP](https://docs.postiz.com/mcp/introduction) | integration/account、动态平台 schema、媒体、draft/schedule/publish、analytics | 独立服务 delegate | 国际多平台发布首选 spike；工作台仍持有 plan/approval/receipt |
| [Activepieces](https://www.activepieces.com/docs/overview/welcome) | TypeScript piece、action/trigger、版本化 flow、人工输入 | 独立服务 delegate | 长尾 SaaS action 和 HITL 候选；不把 flow state 当发布事实 |
| [pg-boss](https://github.com/timgit/pg-boss) | PostgreSQL queue、retry、DLQ、cron、singleton key | Node library | 首版 outbox worker 候选；job delivery 不能保证外部 effect 恰好一次 |
| Graphile Worker | PostgreSQL jobs、LISTEN/NOTIFY、retry/cron | Node library | 与 pg-boss 做小型对照，二选一 |
| [Temporal](https://docs.temporal.io/) | durable Workflow/Activity、signal/timer、跨天恢复 | 独立服务 | 出现复杂长流程后升级，不与 MVP outbox 同时建立两套真相 |
| OpenAPI Generator | 官方 OpenAPI 到底层 client/model | build tool | 有官方 spec 时复用；领域映射、OAuth、错误和 reconcile 仍自建 |

Postiz 当前 API 显式区分 integration、provider settings、媒体上传、post 创建和 analytics，并允许查询平台 schema；这比让模型记住平台字段可靠。但 Postiz 的创建状态仍需映射到本项目状态并持续 reconcile，不能直接标记为 published。

pg-boss 文档也明确指出：即便 job delivery 使用 `SKIP LOCKED`，配置 retry 后任务仍可能再次处理，因此 publisher 必须有独立 idempotency key、外部 ID 和 reconcile。

## Publisher adapter 契约

```text
discoverCapabilities(instanceRef) -> EffectiveCapabilities
validate(planItem)                -> ValidationReport
preview(planItem)                 -> ImmutablePreview
execute(approvedPlanItem)         -> AttemptReceipt
reconcile(attemptReceipt)         -> PublicationReceipt
deleteOrRevoke(receipt)           -> ActionReceipt
```

发布 mode 必须显式：`official-api`、`delegated-api`、`share-sdk`、`browser-assisted`、`manual-package`、`unsupported`。

## 平台策略

- 国际多平台：优先 Postiz delegate；对 Mastodon、Bluesky、Telegram 等透明 API 可直连以验证 contract。
- 国内有官方 API：按账号/profile 单独直连，例如公众号草稿/发布、B 站、抖音、微博、快手；实际 scope 后才 callable。
- 小红书、视频号等未验证通用服务器发布的平台：正式支持 `manual-package`，或官方 share SDK 的用户可见流程。
- 浏览器自动化只在条款允许、用户逐次确认和隔离运行的单独研究项目中考虑，默认不进入无人值守执行。

## 验收

1. plan 任一字段变化都会使批准失效。
2. 同一 idempotency key 多次入队只产生一个逻辑 publication。
3. 超时后进入 `unknown` 并 reconcile，不盲目重发。
4. 多平台一项失败时保留其他 receipt，整体状态为 partial。
5. credential 撤权、限流、schema drift、内容拒绝和媒体失败有不同错误分类。
6. `manual-package` 与 API 发布具有同样的 preview、批准和最终人工 receipt。
