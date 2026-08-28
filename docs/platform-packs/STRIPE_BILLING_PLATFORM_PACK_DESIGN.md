# Stripe Billing Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何 Stripe 数据  
核验日期：2026-08-26  
Pack ref：`stripe-owned-subscription-outcomes/v0-design`

## 1. 定位与边界

本 Pack 只读取用户组织拥有并明确授权的 Stripe account 中与价值兑现相关的 Product/Price、Subscription、Invoice/Invoice Payment、PaymentIntent、Refund、Credit Note、Dispute 和 Event。它用于区分“商业决定、应收、实际支付结果、续费失败、主动取消、退款/信用、争议”，不采集支付方式详情、卡号、地址、Customer 画像，也不执行收费、退款、取消、催款或任何账单写入。

API 基线固定为 GA `2026-07-29.dahlia`：Stripe 官方 Go SDK `v86.2.0` 在该版本固定 API；当前研究 revision 使用 SDK `v86.3.0` 的 commit，但不跟随 `latest` 漂移：[stripe-go changelog](https://github.com/stripe/stripe-go/blob/cde1a43c7e4d321320d5804da47bc4de10396179/CHANGELOG.md)、[API versioning](https://docs.stripe.com/api/versioning)。

```text
platform             stripe-billing
surface              owned Stripe account; live and sandbox are distinct
api baseline         2026-07-29.dahlia (GA)
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 必须保留的语义 |
| --- | --- | --- | --- |
| `stripe.account/v1` | tenant/surface | exact account + mode | live/sandbox、Connect context 与 API default version 都是边界 |
| `stripe.product/v2026-07-29` | taxonomy/entity | account + product ID | 产品目录；active/metadata 不是需求证据 |
| `stripe.price/v2026-07-29` | taxonomy/entity | account + price ID | currency、recurring interval、usage/price model；不能用 display name join |
| `stripe.subscription/v2026-07-29` | mutable lifecycle entity | account + subscription ID | `incomplete`、`trialing`、`active`、`past_due`、`unpaid`、`paused`、`canceled` 等状态 |
| `stripe.subscription-cancellation/v2026-07-29` | embedded decision/outcome | subscription revision | `cancel_at`、`cancel_at_period_end`、`canceled_at`、`ended_at` 和 cancellation details 分开 |
| `stripe.invoice/v2026-07-29` | mutable financial document | account + invoice ID | draft/open/paid/uncollectible/void；invoice paid 不保证 processor charge succeeded |
| `stripe.invoice-payment/v2026-07-29` | payment allocation | invoice + invoice payment ID | invoice 与 charge/payment intent/payment record 的关联和实际 paid transition |
| `stripe.payment-intent/v2026-07-29` | payment attempt/outcome | account + PaymentIntent ID | processing/requires action/requires payment method/succeeded 等支付生命周期 |
| `stripe.refund/v2026-07-29` | cash reversal | account + refund ID | partial/multiple refund、amount/currency/status/reason；只看 Charge refunded flag 不足 |
| `stripe.credit-note/v2026-07-29` | financial adjustment | account + credit note ID | pre-payment 与 post-payment，refund/customer balance/out-of-band credit 不能混为现金退款 |
| `stripe.dispute/v2026-07-29` | contested payment claim | account + dispute ID | amount/reason/status；reason 是争议主张，可能是欺诈、重复或产品问题 |
| `stripe.event/v2026-07-29` | immutable event snapshot | account + event ID | payload 固定为事件生成/endpoint 的 API version；最多回读 30 天 |

### 2.1 不能压平的状态

- `canceled_at` 对 period-end cancellation 记录的是发起更新的时间，不是服务真正结束的时间；`ended_at`/period end 才能表达生效边界：[Subscription object](https://docs.stripe.com/api/subscriptions/object)、[Cancel subscriptions](https://docs.stripe.com/billing/subscriptions/cancel)。
- `past_due` 是一次或多次支付未完成的运营状态；最终可能恢复、保持 overdue、变为 `unpaid` 或因配置进入 `canceled`，不能首次失败就标 churn：[Subscription lifecycle](https://docs.stripe.com/billing/subscriptions/overview)、[Smart Retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries)。
- `invoice.paid` 可由免费 invoice、customer credit 或 out-of-band 标记产生，不总有成功 PaymentIntent；invoice、payment attempt 和 cash movement 必须分开：[How invoicing works](https://docs.stripe.com/invoicing/overview)。
- Credit Note 会先减少未付 invoice，也可在付款后拆成 refund、customer balance credit 和 out-of-band credit；它不是 Refund 的别名：[Credit Note object](https://docs.stripe.com/api/credit_notes/object)。
- Dispute 可能是 fraud/unrecognized/duplicate，也可能是 product not received/unacceptable；不得把所有 dispute 当产品痛点或已证实客户陈述：[Dispute object](https://docs.stripe.com/api/disputes/object)。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `billing.list.owned-subscription-snapshots/v1` | account + bounded roster → subscriptions | REST list/retrieve | `eligible-with-policy` | cursor page；全量/周期 reconciliation；状态与取消时间分开 |
| `billing.list.owned-invoice-outcomes/v1` | account/subscription → invoices + invoice payments | REST list/retrieve | `eligible-with-policy` | invoice paid 与 payment succeeded 分开 |
| `billing.list.owned-payment-outcomes/v1` | approved invoice refs → PaymentIntent/payment relation | REST retrieve/list | `eligible-with-policy` | 不展开 payment method/customer profile |
| `billing.list.owned-value-reversals/v1` | account/window → refunds + credit notes + disputes | REST list/retrieve | `eligible-with-policy` | cash refund、credit、dispute 独立 subtype |
| `taxonomy.list.owned-billing-products-prices/v1` | account → Product/Price taxonomy | REST list | `eligible` | projection 的 exact product/price dependency |
| `billing.receive.owned-billing-events/v1` | event destination → versioned events | webhook/events | `deferred` | endpoint 创建、签名、选择事件、重试和 30-day gap 尚未验证 |
| `billing.query.owned-outcomes.agent/v1` | prompt → Stripe objects | hosted/local MCP | `deferred` | tool surface 同时含 create/refund 等写操作，不能作确定性 ingress baseline |
| `identity.read.billing-customer-payment-method/v1` | refs → Customer/payment method/card/address | REST/MCP | `rejected` | 需求研究不需要身份与 PCI-adjacent details |
| `billing.write.subscription-payment-refund/v1` | instruction → charge/refund/cancel/update | REST/MCP | `rejected` | 真实资金、服务资格和账务副作用 |

本 Pack 不定义 Probe Skill。取消订阅、发起退款、改变 price、创建 payment link 或催款均改变真实商业事实，不是无副作用的信息测试。

## 4. Access Methods

### 4.1 `stripe-billing-rest-2026-07-29/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- auth：单 account 优先资源级 `Read` restricted API key，并限制 stable egress IP；credential 只保存 ref。Connect 多 account 分发需单独审查 OAuth/extension 模型，不能拿平台 secret key冒充 tenant consent：[API keys](https://docs.stripe.com/keys)、[key best practices](https://docs.stripe.com/keys-best-practices)；
- version：每次请求显式 `Stripe-Version: 2026-07-29.dahlia`；webhook endpoint version 另固定，不继承调用时 header；
- scope：Product/Price、Subscription、Invoice/Invoice Payment、PaymentIntent、Refund、Credit Note、Dispute、Event 的只读权限；Customer、Payment Method、Balance、Payout、Tax、Identity 和 Files 默认无权限；
- pagination：v1 list 使用 `starting_after`/`ending_before`、`has_more`，limit 1–100；cursor 只属于 exact endpoint/filter/version：[Pagination](https://docs.stripe.com/api/pagination)；
- search：只用于人工诊断或 bounded lookup，不作 checkpoint。Search 常态下约一分钟才可见，outage 时更久，且分页可能重排、漏/重记录；每环境全 search 共 20 read/s：[Search limitations](https://docs.stripe.com/search)；
- quotas：live 基础 100 ops/s、sandbox 25 ops/s，endpoint 默认 25/s，另有 concurrency/resource limit；读取 `Stripe-Rate-Limited-Reason` 并退避，不能换 key 绕过：[Rate limits](https://docs.stripe.com/rate-limits)。

Stripe 的多数账单 list 没有统一 `updated_at` 增量契约。初次同步采用有界 full snapshot；后续以事件提示 + exact object read-back + 周期性 full reconciliation 组合。只依赖 `created` 会漏后续 cancel/refund/status changes。

### 4.2 `stripe-billing-events-v1`

- event allowlist 只含 subscription/invoice/payment/refund/credit-note/dispute 相关事件；Selection-required 类型必须显式配置；
- delivery 可能重复且不保证顺序，按 event ID 去重，收到后按 object ID read-back current state；事件时间、业务生效时间和 observed time 分开：[Webhook behavior](https://docs.stripe.com/webhooks)；
- signature verification 使用 raw body、endpoint secret 和有限时间容差；持久化成功后才 ack；
- `/v1/events` 只回溯最近 30 天，且 event payload 保留生成时 API version；超过窗口或 endpoint outage 形成明确 history gap：[List events](https://docs.stripe.com/api/events/list)、[Process undelivered events](https://docs.stripe.com/webhooks/process-undelivered-events)；
- event snapshot 不是当前对象，也不能因为 delivery 已耗尽就声称对象历史完整。

本轮不创建 endpoint，route 保持 deferred。

### 4.3 `stripe-mcp/v1`

Stripe remote MCP 与官方 Agent Toolkit 支持 OAuth/RAK，但公开 tool surface 同时包含读取和创建对象；官方建议 human confirmation 并警告多 server prompt injection：[Stripe MCP](https://docs.stripe.com/mcp)、[Agent workflows](https://docs.stripe.com/agents)。因此它仅作为人工 diagnose 候选。采用前必须固定 server/tool inventory、只读 RAK、deny write、field projection、coverage/分页语义、prompt-injection tests 和 drift canary；不得使用 `@latest`/`npx -y` 作为发布契约。

### 4.4 `stripe-authorized-export/v1`

用户选择的 Dashboard/Data Pipeline export 可作为 manual/authorized fallback，但必须记录生成产品、时间、filters、columns、mode、currency、omissions 和 rights。导出不能自动继承 REST/webhook history coverage，Data Pipeline 的独立费用、仓库和服务条款也需另审。

## 5. Platform Skills

### `stripe-billing-pack-research/v1`

- purpose：`research/curate`；核验 GA API/SDK、Billing ontology、event version、keys/scopes、rates、terms、MCP 和固定开源 artifacts；
- 输出 evidence-bound dossier/proposal；禁止创建 key、endpoint、MCP connection 或执行 SDK。

### `stripe-owned-subscription-outcomes/v1`

- purpose：`acquire`；输入固定 Pack/snapshot、account+mode roster、product/price allowlist、API version、time fence、DataHandling/Monetary policy 和预算；
- allowlist：只读 taxonomy、subscription/invoice/payment/refund/credit/dispute snapshot 与已验证 event read-back；
- 输出 native Observations、versioned event relations、CoverageAssessment、DataHandling、Monetary semantics 和最小化 value-realization projection；
- 禁止 Customer/payment-method/files 展开、资金/订阅写入、Search 作 checkpoint、把 payment failure/cancel/refund/dispute 自动标为 complaint。

### `stripe-billing-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 invoice/payment 分离、scheduled/effective cancellation、partial refunds、多 credit outcomes、dispute claim、event version/order/dedupe、30-day gap、minor units、rate/scopes 和 forbidden writes；
- sandbox live 需用户另行授权 Stripe sandbox + read-only restricted key；用 Test Clocks 由独立测试管理员准备生命周期，本 Connector 只读：[Billing testing](https://docs.stripe.com/billing/testing)。

## 6. Projection、数据治理与证据强度

- `owned-subscription-outcome` 必须包含 account/mode/pack/API version、native refs、product/price taxonomy revision、subscription/invoice/payment/reversal subtype、created/effective/period/canceled/ended/observed times和 state basis。
- amount 值留在 schema-bound payload；`MonetaryDatasetMetadata` 对每个 selector 声明 role、currency selector、minor/major unit、sign 和 rounding。Stripe API amount 通常使用 currency minor unit，zero-decimal 和特殊 currency 不能固定除以 100：[Supported currencies](https://docs.stripe.com/currencies)。
- Customer ID 仅作 account-scoped pseudonymous relation；email/name/address/phone/tax/payment method/card/bank/receipt/PDF/metadata 默认 drop 或 quarantine。Refund destination details、dispute evidence 和 invoice hosted URLs 不采集。
- customer portal 的 cancellation feedback 可在有 evidence 时标 `subject-authored`；internal operator cancellation 是 `counterparty-authored`；payment retry/status 是 `provider-generated`。`requested_by_customer` 等 provider enum 不是客户逐字引语。
- payment failure 可形成 `payment-failure` evidence；actual continuity/end 可形成 `retention-outcome`；refund/credit/chargeback 形成 `value-reversal`；dispute 另标 `dispute`。任何一类都不能无上下文升级为 complaint、budget、switching 或产品失败。
- live 与 sandbox 不混合；Connect platform/account contexts 不合并。撤权、对象 correction 和 privacy deletion 必须撤销 index/projection；只保留最小审计 receipt。
- API/Apps/Data 使用受所在地 Stripe Services Agreement、Apps Agreement、DPA 和用户协议约束：[SSA overview](https://stripe.com/en-de/legal/ssa-overview)、[Stripe Apps Agreement](https://stripe.com/legal/apps)、[DPA FAQ](https://stripe.com/legal/dpa/faqs)。Pack 记录待审证据，不替代法律意见。

## 7. 开源与 Agent Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote` 固定；仅读取 README/LICENSE/metadata，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [stripe/stripe-go](https://github.com/stripe/stripe-go/tree/cde1a43c7e4d321320d5804da47bc4de10396179) `cde1a43...` / v86.3.0 | Stripe 官方；MIT | API `2026-07-29.dahlia` types、pagination、webhook signature、mock seam | `official-reference`；SDK 含完整 write surface，read-only policy 仍需外置验证 |
| [stripe/openapi](https://github.com/stripe/openapi/tree/5326c7c7720c0785528e513329b9738ac625ff98) `5326c7c...` | Stripe 官方；MIT | fixed GA v1/v2 schema、events、fixtures | `official-contract-reference`；`latest/` 目录必须再绑定 commit/API date，不能运行时漂移 |
| [stripe/ai](https://github.com/stripe/ai/tree/bad904b02f7071592c38bcca83d33667ff015bb1) `bad904b...` | Stripe 官方；MIT | remote/local MCP、Agent Toolkit tool discovery 与 RAK boundary | `discovery-only/deferred`；工具含 writes、依赖远程 MCP、需要 live tool inventory 和 prompt-injection/approval tests |
| [airbytehq/airbyte Stripe source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-stripe) `1339a9e...` | Airbyte；ELv2 path | incremental state、refund update、30-day event retention 与历史漏数 regression evidence | `negative-fixture/reference-only`；breaking notes 已记录 line item 漏发和 cursor reset，不能整体复用 |

## 8. Verification Plan

### evidence-review / static-contract

- account+mode、GA API date、concept identity、native relations 和 schema refs 固定；
- list/search/events/webhook/MCP/manual representation 不互相冒充；
- auth 只能 resource-level read；Customer/payment methods/files/writes 静态拒绝；
- cancellation schedule/effective end、invoice/payment、refund/credit/dispute、amount/currency语义分别建模；
- evidence authorship 和 coverage gap 可审计。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| cancel at period end then reverse | request/canceled/effective times 分开；取消撤销生成新 revision |
| payment-failed then recovered | 不提前标 churn；payment failure 与 retention outcome 分开 |
| dunning ends canceled vs unpaid | 保存 account policy/result，不推断 customer intent |
| free/out-of-band/credit-paid invoice | invoice paid 不制造 processor payment evidence |
| async payment processing then failure | subscription active 不等于 cash settled |
| two partial refunds | 每个 refund 独立；总额/remaining 按 schema role，不用 boolean |
| credit note pre/post/mixed | due reduction、cash refund、customer credit、out-of-band 不混写 |
| dispute fraud vs product unacceptable | claim subtype保留；product pain 仅候选且需 review |
| USD/JPY/ISK amounts | unit/rounding 映射正确；禁止固定 `/100` |
| duplicate/out-of-order webhook | event ID 幂等、read-back、source/effective/observed time 分开 |
| event older than 30 days missing | history/coverage 标 gap，不伪造 complete |
| event API version differs | 按 event version decode，不以 request header 重解释旧 payload |
| Search delayed/reordered | 不用 Search 作 checkpoint；重叠/reconciliation 保留 |
| unknown metadata/customer field | drop/quarantine；不进入 logs/index/fixture |
| 401/403/429/concurrency | 正确分类、Retry-After/reason 退避，不换 key 绕过 |
| attempted cancel/refund/create/MCP write | static/policy gate 拒绝，零 platform-write |

### sandbox-live / operational-canary

用户另行授权后，才可在 sandbox 使用 synthetic products/subscriptions/Test Clocks；管理员制造付款成功/失败、period-end cancellation、partial refund/credit/dispute test state，Connector 只读。canary 监测 API/SDK version、RAK permissions、event tool/type inventory、30-day recovery headroom、event lag/order/duplicate、list reconciliation delta、rate headers、schema/enum/currency drift、PII quarantine、attribution unknown rate 和 projection correction backlog。

## 9. 晋级缺口

进入 `modeled` 需要 accepted 2026-07-29 concepts/capabilities/access/adoption snapshots、account/product roster、native schemas、DataHandling/Monetary/attribution/coverage policy；进入 `verified` 需要 fixture report，并经用户授权完成 sandbox read-only report。当前没有 Connector、credential、event endpoint、MCP connection、live data 或 callable route。
