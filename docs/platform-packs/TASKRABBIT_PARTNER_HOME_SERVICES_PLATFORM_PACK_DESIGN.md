# Taskrabbit Partner Home Services Platform Pack 设计样本

状态：`researched` 设计候选；未申请合作、未接受合作协议、未创建凭据、未连接 sandbox/production、未读取 Project、未估价、未预约或取消  
核验日期：2026-08-26  
目标：固定 Taskrabbit general marketplace 与 Partner Home Services API 的不同概念和 authority population，准确表达 estimate → availability → bid → booking → appointment → outcome，并把官方文档可被 AI 阅读与平台数据允许进入 AI/数仓严格分开。

## 1. Pack 摘要

```text
pack ref             taskrabbit-partner-home-services/v0-design
platform             taskrabbit
surface              partner-home-services-api
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

Taskrabbit 当前官方 Developer Hub 提供 Home Services Partner API：OpenAPI `3.1.0`，info version `2025-12`，覆盖服务目录、资格/价格估计、实时可用时段、正式报价、预约、Project/Appointment、改期、取消与 signed webhook。它让品牌合作方把 Taskrabbit 服务嵌入自己的 checkout/post-purchase experience，而不是公开搜索 Taskrabbit 用户发布的 Tasks。

当前 Overview 写“所有请求需要 partnership manager 提供的 API key”，endpoint OpenAPI 却声明 OAuth2 client credentials 和 `partner_platform_api/booking` scope；旧 Delivery by Dolly Getting Started 又仍显示 Home Services “Coming Soon”。这些是必须由合作方 onboarding/contract 与 sandbox conformance 解决的文档冲突，不能任选一种认证实现。

Taskrabbit AUP 禁止自动 mining/crawling/collecting/indexing 平台，禁止未经书面同意复制/重传，并禁止把任何 Taskrabbit 信息提交给 AI。官方 `llms.txt` 只证明文档有 AI-readable representation，不证明客户、地址、Project、Tasker 或履约数据有 AI/warehouse/index 权利。因此本 Pack 当前为 `researched/no-route`。

## 2. 平台面与 authority population

| Profile | 真实 population | 当前决定 |
| --- | --- | --- |
| `general-marketplace-discovery` | Taskrabbit 客户发布/选择 Tasker 的通用 marketplace | `policy-blocked/no-official-route`；Partner API 不提供公共 Task/Tasker 搜索，AUP 禁止 scraping/index/AI fallback |
| `partner-service-catalog` | partnership/brand 已配置的 Service 与 Service Item | `partner-restricted-read-candidate`；只有具体 brand principal 和合同范围后可绑定 |
| `partner-estimate-availability` | 合作方自己 checkout 中的客户地址与服务选择 | `partner-restricted-compute-candidate`；会发送位置与服务数据，可能受 quota/cost/privacy 约束 |
| `partner-project-operations` | 由该合作方创建、引用和管理的 Project/Appointment | `partner-owned-read-candidate`；不得扩大到全市场需求或 Tasker 画像 |
| `partner-booking-effects` | bid/reservation、book、appointment、reschedule、cancel | `deferred-high-impact`；每个外部效果独立 preview/approval/receipt/reconcile |
| `partner-webhook-outcomes` | 自有 Project 的 completed/canceled/rescheduled event | `deferred-push-candidate`；必须签名验证、幂等、重放和 pull reconcile |
| `durable-demand-research` | 长期 Observation、warehouse、Dolt/index/RAG/AI | `policy-blocked`；需要合作协议明确覆盖数据对象、AI、保存、派生、索引、保留与删除 |
| `delivery-by-dolly` | 配送请求、Courier 与配送状态 | `out-of-pack`；是不同 API、schema、认证/协议和业务链，不能与 Home Services 静默合并 |

Brand、partner legal principal、API client、sandbox subdomain、production subdomain、Svix endpoint 与用户 Taskrabbit account 都是不同 authority。Port binding 必须固定 legal principal、approved app、brand、environment、auth scheme、scope、purpose 和 retention policy。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `taskrabbit.partner/v1` | restricted principal | partner agreement + app/client | 能调用 API 的合作方，不是一般 Client/Tasker |
| `taskrabbit.brand/v1` | partner configuration | brand UUID + revision | Service Catalog 和 pricing 的配置边界 |
| `taskrabbit.service/v1` | configured supply taxonomy | brand + service UUID + revision | 合作方可售的服务定义；不是客户需求实例 |
| `taskrabbit.service-item/v1` | partner checkout input | product/service item ref + revision | estimate/availability/bid 的服务项；来源可能是合作方商品订单 |
| `taskrabbit.location/v1` | restricted request input | scoped opaque location ref | postal code/country 或完整地址；只在精确目的下使用 |
| `taskrabbit.estimate/v1` | non-binding computation | request hash + response revision/expiry | 资格与预估价；邮编估价可能不同于最终完整地址价格 |
| `taskrabbit.availability-window/v1` | ephemeral capacity claim | request + window ID/time + observedAt | 实时可约时段及估价；不是已保留 appointment |
| `taskrabbit.bid-project-agreement/v1` | quote/reservation | bid/project UUID + revision/expiry | 官方称 Bid；锁定更准确价格并暂时保留时段，状态可为 Draft |
| `taskrabbit.booked-project/v1` | booked agreement | project UUID + revision | Book 后的 live Project；含客户同意、合作方交易引用和 charged amount |
| `taskrabbit.appointment/v1` | scheduled performance | project + appointment ref/revision | 实际服务时段；可新建/改期，不能用 availability 代替 |
| `taskrabbit.tasker-assignment/v1` | restricted fulfillment party | project-scoped opaque Tasker ref | status 只提供 limited Tasker info；不得构建通用人才画像 |
| `taskrabbit.project-completion/v1` | outcome event | project + event/delivery revision | webhook 表示工作已被标为完成；不自动等于 invoice paid 或质量成功 |
| `taskrabbit.project-cancellation/v1` | reversal event | project + cancellation revision | 触发 Tasker 通知、退款/政策工作流，可能有 cancellation fee |
| `taskrabbit.project-reschedule/v1` | schedule revision | project + previous/new time + event revision | `timestamp` 当前被定义为 `new_start_time`，不是通用处理时间 |
| `taskrabbit.invoice-payment/v1` | financial outcome | partner/project accounting refs | completion、invoice、payment、refund和fee必须分开 |
| `taskrabbit.service-agreement/v1` | legal agreement | client + Tasker + scheduled Task terms | Global Terms 下通用 marketplace 中，Task 被 schedule 后形成 Client 与 Tasker 的 Service Agreement；Partner 条款仍需单独核对 |

主要关系：

```text
partner product/order + service item + location
  -> estimate
  -> availability window
  -> bid / draft project agreement + temporary reservation
  -> booking + client policy acceptance + partner transaction reference
  -> appointment
  -> reschedule / completion / cancellation
  -> invoice / payment / refund / cancellation fee
```

General marketplace 中的 client-authored Task、Client 选择 Tasker、Tasker 自定一般 marketplace rate、chat 与 Service Agreement，不得被 Partner API 的 configured Service/quote/project 模型覆盖。Delivery by Dolly 也不属于这条对象链。

## 4. Capability 与 adoption decision

| Capability | 官方面 | Adoption | 设计边界 |
| --- | --- | --- | --- |
| `discovery.search.public-service-requests/v1` | Partner API 无此能力 | `rejected` | 不允许以网页、browser automation、community MCP 或 cookie session 补全 |
| `taxonomy.read.partner-services/v1` | brand-scoped Service Catalog | `partner-only/deferred` | 只读取获批 brand 配置；Service 是供给/knowledge，不是需求 |
| `compute.service-eligibility-estimate/v1` | Estimate endpoint | `partner-only/deferred` | 地址/邮编与服务项最小化；结果 non-binding、有时间与位置语义 |
| `compute.service-availability/v1` | Availability endpoint | `partner-only/deferred` | 实时 window 是 ephemeral capacity observation，不是 reservation |
| `account.service-quote.reserve/v1` | Bid endpoint | `deferred-external-effect` | 锁价并临时保留时段；需要真实订单、幂等键、expiry 和 abandon/reconcile |
| `account.service-book/v1` | Book endpoint | `rejected-default/deferred-binding` | 创建 live Project、确认付款与客户政策同意、发送通知；必须人工业务批准 |
| `content.read.owned-service-project/v1` | list/get Project、status | `partner-only/deferred` | 只读自有 Project；limited Tasker info 隔离，不推断市场 coverage |
| `account.service-appointment/v1` | create appointment | `deferred-high-impact` | 会安排真人履约；与 booking 分开审批 |
| `account.service-reschedule/v1` | reschedule availability + reschedule | `deferred-high-impact` | 先查 window 再改变 appointment；通知/费用语义需合同与 fixture 固定 |
| `account.service-cancel/v1` | cancel booked Project | `deferred-reversal-financial` | 触发通知、refund/policy、可能 cancellation fee；timeout 先 reconcile |
| `events.read.owned-service-outcomes/v1` | Svix webhooks | `partner-only/deferred` | signature、duplicate/out-of-order、retry/replay与project pull reconcile |
| `research.materialize.taskrabbit-demand/v1` | 无满足当前用途的授权证据 | `policy-blocked` | zero Observation/SourceItem/EvidenceSpan/warehouse/index/vector/RAG/AI |

Policy evaluation 位于 credential、network、PortBinding、estimate、webhook receiver 与任何 persistence 之前。即使一个 capability 是“计算”或“读取”，把客户地址或平台信息发送给 Agent 仍需单独 purpose/AI 权利。

## 5. Access Methods

### 5.1 `taskrabbit-partner-platform-2025-12/v1`

- official OpenAPI `3.1.0`，title `Taskrabbit Partner Platform API`，info version `2025-12`；
- server shape `https://{api_subdomain}.partner-platform.taskrabbit.com/2025-12`，endpoint 文档将其描述为 Partner Test Environment；另有指南声明部分能力可用于 Sandbox 与 Production；
- OpenAPI 声明 OAuth2 client credentials、token URL placeholder 与 `partner_platform_api/booking` scope；Overview 同时写 partnership manager 提供 API key，构成阻断性 conformance gap；
- endpoint 包括 Service Catalog、Estimate、Availability、Bid、Book、Project list/get/status、Appointment、Reschedule availability/action、Cancel；
- current decision：schema/capability evidence only，`no-binding`。

### 5.2 `taskrabbit-svix-project-webhooks/v1`

- official event：`project.completed`、`project.canceled`、`project.rescheduled`；
- Svix Partner Dashboard 在 onboarding 时提供，负责 endpoint/subscription、retry、delivery log 与 manual replay；
- 每个 payload 必须校验 endpoint secret 签名；duplicate 必须幂等，webhook 不是最终事实源时需 pull reconcile；
- rescheduled event 的 `timestamp` 当前等于 `new_start_time`，字段必须按 event schema 解释，不能装入统一 `processed_at`；
- current decision：push contract evidence only，未配置 endpoint。

### 5.3 `taskrabbit-delivery-by-dolly/v1`

旧 Getting Started 描述 Auth0 M2M OAuth2、Delivery request/status、Delivery webhook 与 sandbox。它同时仍把 Home Services 标为 “Coming Soon”。该资料只能证明 Dolly surface，不能为 Home Services 填充认证、状态、权限、production readiness 或 webhook schema。

### 5.4 manual / browser / MCP

当前没有 public marketplace manual/browser fallback。AUP 明确禁止 automated/manual data mining、collecting、republishing、downloading、managing/indexing 与提交至 AI。用户手工看到的 Task、Tasker、评论或地址不能因此成为可持久化的 Taskrabbit Observation。

未验证 Taskrabbit 官方 Marketplace MCP 或官方 Agent Skill。第三方目录声称的 remote MCP 没有官方页面佐证，不能连接。社区 MCP 见供应链审计，明确拒绝。

## 6. Platform Skills

### `taskrabbit-pack-research/v1`

- 固定 `llms.txt`、OpenAPI/guide revision、Global Terms/AUP/privacy/fees/cancellation 与 OSS evidence；
- 输出 KnowledgeProposal、auth conflict、authority population、data-use decision、expiry 和 drift trigger；
- 禁止接受合作协议、申请 access、创建 credential、连接 sandbox/production。

### `taskrabbit-partner-contract-resolution/v1`

- 输入必须包含 legal partner、brand/app、sandbox/production subdomain、auth scheme/scope、可用 endpoint、customer consent、Taskrabbit/partner data controller role、AI/warehouse/index/retention/deletion、费用/退款/取消与 webhook 条款；
- API key/OAuth、test/production、partner agreement 与 AUP override 的冲突必须由书面证据解决；
- 任一关键项缺失时在 credential/network/PortBinding 前返回 `partner-contract-missing` 或 `policy-blocked`。

### `taskrabbit-owned-fulfillment-read/v1`

- 只允许已绑定 partner principal 的 Service Catalog、自有 Project/status 与已验签 webhook；
- address、client contact、Tasker、payment 和 free text 默认不进入模型；
- page/list coverage 只能声明 partner-owned population，不能扩大为 Taskrabbit market demand。

### `taskrabbit-truthful-home-service-probe/v1`

- 输入：真实 partner order、合法 service item、准确地址/scope、真实客户授权、预算/付款、可履约时间、人工 owner 与取消方案；
- estimate、availability、bid/reservation、book、appointment、reschedule、cancel 每步生成独立 preview、approval、idempotency、receipt 与 reconcile；
- block：ghost/fake order、虚假客户或地址、重复/spam booking、未获客户政策同意、不可履约服务、为了测点击而占用 Tasker/时段、站外付款绕过、自动评价或将平台数据交给 AI；
- 本轮只有 contract，没有执行 route。

### `taskrabbit-sandbox-conformance/v1`

- 默认只运行本地合成 fixtures；
- 未来 sandbox-live 也只验证精确 auth/schema/effect/idempotency，不提升 production、general marketplace、rights、coverage 或 durable research maturity；
- 所有 synthetic ID/receipt/metric 必须与 production namespace 隔离。

这些是本系统拟定义的 Skill contract，不是已安装或 Taskrabbit 官方发布的 Agent Skill。

## 7. 数据、推断与 Probe 边界

- Estimate 是非 binding provider computation；postal-code estimate 与 full-address quote 不可合并。
- Availability window 是 observed capacity；不证明 Tasker 已分配，也不是 appointment。
- Taskrabbit 的 `Bid` 是合作方 booking flow 中的正式 quote/draft agreement，不是自由职业平台 seller proposal。
- Bid 暂时保留时段并锁定价格，因此是外部效果；Book 才创建 live Project，但二者都不是纯 read。
- `client_amount_charged_cents` 是合作方向客户收取的金额角色，不能自动等同 Tasker payout、Taskrabbit fee、invoice paid 或 market price。
- Project completed webhook 表示 provider state，不能单独证明客户满意、invoice paid 或无 refund/dispute。
- Cancel 可能触发 Tasker notification、refund 与 cancellation fee；请求 timeout 保持 unknown 并先按 Project 状态/receipt reconcile。
- 地址、电话、客户与 Tasker资料均隔离；通用 metrics 不记录 project UUID、transaction ref、地址、姓名、电话、正文或金额。
- 当前 Taskrabbit platform/customer/project data 不写入 Observation、SourceItem、EvidenceSpan、Dolt、分析数仓、lexical/semantic/vector index、RAG、Agent prompt 或 eval。

## 8. 官方与开源证据审计

以下只通过官方页面、raw 文件与先前 `git ls-remote` 只读核验；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| Taskrabbit `llms.txt` + per-page Markdown/OpenAPI `2025-12` | Taskrabbit 官方文档；不是 SDK 许可证 | 可固定 endpoint/schema 与文档 index，适合 evidence snapshot | `canonical-contract-candidate`；仍需 partner contract 与 auth/schema conformance，不授予平台数据 AI 权利 |
| [taskrabbit GitHub organization](https://github.com/taskrabbit) | Taskrabbit 官方组织；repo-specific | 通用工程开源项目 | `no-current-partner-sdk-found`；不能用组织身份推断某 repo 是 Home Services connector |
| [markswendsen-code/mcp-taskrabbit](https://github.com/markswendsen-code/mcp-taskrabbit) HEAD `3b39eecc7b49740f60f2c7b7b88a3a8b1619dbf5`，无 tag；manifest `0.1.0` | community；package 声明 MIT，但固定 revision 的 `LICENSE` 返回 404 | browser/cookie MCP 风险样本；search/tasker/book/message/cancel tool taxonomy | `rejected-as-connector`；用浏览器访问消费者网站，持久 cookie，含 booking/message/cancel；package 依赖 `patchright` 而 source import/发布信息存在漂移，且与 AUP/AI/index 条款冲突 |
| Svix verification libraries | Svix 通用官方 SDK，repo-specific license | webhook signature/retry 机制参考 | `generic-dependency-only`；不是 Taskrabbit Connector，也不证明 onboarding、event scope 或数据权利 |

开源代码许可证不授予 Taskrabbit 数据、账号、品牌、Tasker、合作接口或自动化权利。第三方 MCP 的 `confirm` boolean 也不能替代外部审批、平台许可和业务 receipt/reconcile。

## 9. Verification Plan

### evidence-review

- 固定 `llms.txt`、OpenAPI info/server/security、guide updatedAt、Global Terms/AUP/privacy/fees/cancellation hash 与 observedAt；
- 获得合作资料后固定 legal principal、brand/app、environment/subdomain、auth、scope、objects/fields、customer consent、AI/storage/index/retention/deletion 与 expiry；
- 固定 community artifact owner/revision/tag/license/auth/session/effect/maintenance drift，不安装执行。

### static-contract

- general marketplace、Partner Home Services 与 Delivery by Dolly 三个 surface 不合并；
- Service Catalog、service item/request、Estimate、Availability、Bid/quote、Draft Project、Booking、Appointment、Completion、Cancellation 与 financial outcome 不互换；
- API key/OAuth 与 test/production 冲突未解决时 route 为零；
- AUP/partner data-use 决策发生在 credential/network/binding/persistence/AI 前；
- read credential 不能绑定 bid/book/appointment/reschedule/cancel；
- community MCP/browser/cookie、unverified remote MCP 与 HTML fallback 被拒绝；
- webhook 未验签不 ack、不落 canonical；duplicate/out-of-order/replay 幂等。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| postal code estimate → full address estimate | 两个 request/location scope 分离；价格变化不被判为 drift |
| unavailable service/location | eligibility false 不生成需求、booking或市场缺口结论 |
| availability windows | window 是 ephemeral claim，过期后不可当 appointment |
| bid with price/time reservation | quote amount/expiry/idempotency保留；产生外部 effect intent，不自动 book |
| repeated bid idempotency key | 同一业务 intent 不创建第二个 draft project/reservation |
| book with policy acceptance/payment reference | consent、charged amount、transaction ref 与 live Project receipt 齐备 |
| book timeout / duplicate | state unknown；按 project/transaction reference reconcile，禁止跨route重发 |
| buy now, schedule later | purchase/booking 与 appointment 明确分离 |
| appointment + reschedule | previous/new time exact relation；availability 不是 reschedule receipt |
| cancel with fee/refund | cancellation、notification、fee、refund各自建模，不写成负 payment |
| completed webhook before/after pull | signed event与current Project state reconcile；不推断 paid/satisfied |
| rescheduled webhook timestamp | `timestamp`映射为new start time，不错误映射processedAt |
| duplicate/out-of-order/replayed webhook | signature先验、dedupe、monotonic=false、manual replay可审计 |
| limited Tasker info | zero identity/profile index；只保留project-scoped opaque ref |
| auth docs conflict | resolver拒绝猜测 API key/OAuth，negative reason可观测 |
| no partner data-use exception | Observation/warehouse/index/vector/Agent bytes均为零 |
| community MCP/browser route | no binding，cookie/session/write风险计数递增 |

### sandbox-live / operational-canary

只有用户另行授权、合作方 onboarding 与书面数据用途完整、credential/secret store 就绪后，才可在官方 sandbox 用合成 partner order 验证一个最小 estimate → availability → bid → book/cancel 流程。每个 effect 独立审批并验证 cleanup/reconcile。Production canary 还要求真实客户授权、真实服务订单、可履约 owner、付款与取消预案；当前不执行。

## 10. 可观测性

- knowledge：`llms.txt`/OpenAPI/guide/Terms/AUP hash、version `2025-12`、updatedAt、evidence expiry 与 drift trigger；
- permission：partner agreement ref、legal principal、brand/app、environment/subdomain、auth scheme/scope、purpose、AI/storage/index/retention/deletion；
- resolution：route/mode、credential ref、API key/OAuth conflict、candidate rejection、no-fallback 与 production/sandbox isolation；
- privacy：address precision、client consent、customer/Tasker field quarantine、model bytes、persistent/index/vector bytes 与 deletion watermark；
- quote/booking：service items、location scope hash、estimate/quote expiry、availability age、idempotency key、reservation、charged-amount role、transaction/accounting ref；
- action：draft/preview/approval/intent/attempt/unknown/reconcile、notification、contract/payment/cancellation/fee effect；
- webhook：Svix endpoint ref、event/schema revision、signature result、delivery/dedupe key、retry count、replay actor、out-of-order lag 与 pull reconciliation；
- coverage：partner/brand/project population、list cursor、status freshness；必须报告 `public market coverage = not-applicable`；
- negative：public scraping/index/AI submission、community/unverified MCP、browser/cookie、wrong surface、auth guess、unapproved booking/cancel 与 duplicate effect。

高基数 project/client/Tasker ID、地址、交易引用、URL、正文、token 和金额不得进入通用 metrics label，只能以 opaque audit ref 进入受控审计。

## 11. 当前结论

1. Taskrabbit Home Services API 是高质量、版本化的合作方履约接口，不是公开需求发现 API。
2. 它要求核心抽象补充 partner booking、estimate、availability、quote、booking、appointment、reschedule、completion、cancellation、lead/fee 等概念，但无需创建 Taskrabbit 专属核心类型。
3. API key/OAuth、Coming Soon/current endpoint、test/production 和 webhook timestamp 的文档冲突必须成为 verification gate。
4. `llms.txt` 只授权/便利文档发现；AUP 当前阻止把平台数据交给 AI、长期保存或索引，除非合作协议明确覆盖。
5. 当前发布 `researched/no-route` Pack；不申请合作、不连接 sandbox、不运行 SDK/MCP、不创建预约或其他平台副作用。

## 12. 官方证据

- [Taskrabbit Developer Hub](https://developer.taskrabbit.com/)
- [AI-readable documentation index](https://developer.taskrabbit.com/llms.txt)
- [Home Services API Overview](https://developer.taskrabbit.com/docs/overview-taskrabbit-home-services-api)
- [Estimate](https://developer.taskrabbit.com/docs/project-estimate) / [Estimate OpenAPI](https://developer.taskrabbit.com/reference/projectestimate)
- [Availability](https://developer.taskrabbit.com/docs/checking-availability) / [Availability OpenAPI](https://developer.taskrabbit.com/reference/projectavailability)
- [Creating a Bid](https://developer.taskrabbit.com/docs/creating-a-bid) / [Bid OpenAPI](https://developer.taskrabbit.com/reference/projectbid)
- [Booking](https://developer.taskrabbit.com/docs/booking-a-project) / [Book OpenAPI](https://developer.taskrabbit.com/reference/projectbook)
- [Service Catalog](https://developer.taskrabbit.com/docs/get-service-catalog)
- [Project Status](https://developer.taskrabbit.com/docs/get-project-status)
- [Canceling](https://developer.taskrabbit.com/docs/canceling-a-project) / [Cancel endpoint](https://developer.taskrabbit.com/reference/cancelbookedproject)
- [Reschedule endpoint](https://developer.taskrabbit.com/reference/rescheduleproject)
- [Project Webhooks](https://developer.taskrabbit.com/docs/webhooks-1)
- [Delivery by Dolly Getting Started](https://developer.taskrabbit.com/docs/getting-started)
- [Taskrabbit Global Terms](https://support.taskrabbit.com/hc/en-us/articles/46260465608603-Taskrabbit-Global-Terms-of-Service)
- [Taskrabbit Platform AUP](https://support.taskrabbit.com/hc/en-gb/articles/46260475390107-Taskrabbit-Platform-Acceptable-Use-Policy)
- [Taskrabbit Global Privacy Policy](https://support.taskrabbit.com/hc/en-us/articles/46260411318427-Taskrabbit-Global-Privacy-Policy)
- [Fees, Payments and Cancellation Supplemental Terms](https://support.taskrabbit.com/hc/en-ca/articles/46260514951579-Fees-Payments-and-Cancellation-Supplemental-Terms)
- [Cancellation Policy](https://support.taskrabbit.com/hc/en-us/articles/46260411471899-Cancellation-Policy)
- [Skills, Tools and Scope Policy](https://support.taskrabbit.com/hc/en-us/articles/39409841984909-Skills-Tools-and-Scope-Policy)
