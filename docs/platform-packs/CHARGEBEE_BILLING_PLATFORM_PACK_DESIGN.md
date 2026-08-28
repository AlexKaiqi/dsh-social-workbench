# Chargebee Billing Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何 Chargebee 数据  
核验日期：2026-08-26  
Pack ref：`chargebee-owned-subscription-outcomes/v0-design`

## 1. 定位与边界

本 Pack 只覆盖用户组织拥有并明确授权的 Chargebee site 中 Configuration、Item/Item Price、Subscription、Invoice、Transaction、Credit Note、Currency 和 Event。它研究订阅持续、续费失败、取消、支付、退款/信用的价值兑现结果；不读取 Customer 联系资料、Payment Source、卡/银行/gateway token、invoice PDF，也不创建/修改/取消/退款任何账单对象。

Chargebee API 固定 `/api/v2`，并通过 Configuration snapshot 固定 Product Catalog `v1`/`v2`/compat response schema；不能只写“Chargebee v2”便忽略同一 API version 内的 catalog sub-version：[Versioning](https://apidocs.chargebee.com/docs/api/v2/pcv-1/versioning)、[Configurations](https://apidocs.chargebee.com/docs/api/configurations)。官方 Go SDK reference 固定 v4.8.0 commit `8241079...`。

```text
platform             chargebee-billing
surface              owned Chargebee site; test/live and data center are distinct
api baseline         v2 + configuration-declared Product Catalog schema
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 必须保留的语义 |
| --- | --- | --- | --- |
| `chargebee.site/v2` | tenant/surface | data center + exact site | test/live、business entity 与 API key 都是 site-scoped |
| `chargebee.configuration/v2` | schema/config revision | site + observed revision | product catalog version、response schema type；mapping dependency |
| `chargebee.item/v2` | taxonomy/entity | site + item ID | plan/addon/charge；archive/delete 不等于需求变化 |
| `chargebee.item-price/v2` | taxonomy/entity | site + item price ID | currency、period、pricing model、decimal mode；ID 是 immutable taxonomy key |
| `chargebee.subscription/v2` | mutable lifecycle entity | site + subscription ID | future/in_trial/active/non_renewing/paused/cancelled + scheduled changes |
| `chargebee.invoice/v2` | mutable financial document | site + invoice ID | paid/posted/payment_due/not_paid/voided/pending、dunning、due/paid/credits |
| `chargebee.transaction/v2` | payment/refund transaction | site + transaction ID | authorization/payment/refund/payment_reversal；success/failure/in_progress 等状态 |
| `chargebee.credit-note/v2` | financial adjustment | site + credit note ID | adjustment/refundable/store；refund_due/refunded/allocated/voided 等状态 |
| `chargebee.currency/v2` | monetary taxonomy | site + currency ID/code | base currency、zero-decimal、multi-decimal pricing、exchange-rate configuration |
| `chargebee.event/v2` | immutable point-in-time event | site + event ID | source、occurred_at、api_version、resource snapshot/version、webhook delivery |

### 2.1 原生语义必须保留

- `non_renewing` 表示计划不再续费但当前 term 尚未结束；`cancelled_at` 可表示已取消或计划取消时间，不能只据 timestamp 判断服务已停止：[Subscriptions](https://apidocs.chargebee.com/docs/api/subscriptions)、[List subscriptions](https://apidocs.chargebee.com/docs/api/subscriptions/list-subscriptions)。
- `cancel_reason` 是 Chargebee 自动原因；`cancel_reason_code` 是 site 自定义 code。二者与 customer portal 原话、内部操作员备注不同。
- Invoice `amount_paid` 是成功 linked payments 之和；invoice status、payment transaction status 与 dunning status 是三条事实链：[Invoices](https://apidocs.chargebee.com/docs/api/invoices)、[Transactions](https://apidocs.chargebee.com/docs/api/transactions)。
- adjustment credit note 减少未付 invoice；refundable/store credit 可留待以后抵扣，只有 linked refund transaction 成功才证明现金退款：[Credit notes](https://apidocs.chargebee.com/docs/api/credit_notes)、[Refund a credit note](https://apidocs.chargebee.com/docs/api/credit_notes/refund-a-credit-note)。
- V2 refund 通过 Credit Note 再关联 Transaction，不直接挂在 Invoice；V1 模型不能泄漏进 V2 projection：[API V2 upgrade guide](https://apidocs.chargebee.com/docs/api/v1/api_v2_upgradation_guide)。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `billing.list.owned-subscription-snapshots/v1` | site + roster/window → subscriptions | v2 list/retrieve | `eligible-with-policy` | updated_at overlap + resource_version + include_deleted |
| `billing.list.owned-invoice-outcomes/v1` | site/subscription → invoices | v2 list/retrieve | `eligible-with-policy` | invoice/dunning/payment facts 分开 |
| `billing.list.owned-payment-outcomes/v1` | site/window → payment transactions | v2 transactions | `eligible-with-policy` | 只读 payment/refund result；drop payment method details |
| `billing.list.owned-value-reversals/v1` | site/window → credit notes + refund transactions | v2 list/retrieve | `eligible-with-policy` | adjustment/store/refundable/cash refund 分开 |
| `taxonomy.list.owned-billing-products-prices/v1` | site → config/items/item prices/currencies | v2 API | `eligible` | configuration snapshot 是 schema gate |
| `billing.receive.owned-billing-events/v1` | site event/webhook → lifecycle events | Events/webhook | `deferred` | delivery/auth/order/gap 尚未 conformance |
| `billing.query.owned-outcomes.agent/v1` | prompt → subscriptions/invoices/transactions | Data Lookup MCP | `deferred` | server 可启用广泛 customer/PDF/export/payment fields；tool inventory 需固定 |
| `identity.read.billing-customer-payment-source/v1` | refs → customer/payment source | v2 API/MCP | `rejected` | 不需要联系资料、地址、payment method 或 gateway tokens |
| `billing.write.subscription-payment-refund/v1` | instruction → mutation/refund/cancel | v2/MCP | `rejected` | 真实账务、资金和服务资格副作用 |

本 Pack 不定义 Probe Skill。创建 demo catalog、订阅、usage、invoice、credit/refund 或取消都属于 billing operations；即便在官方 Onboarding MCP 中可用，也不能借“测试”绕过独立 sandbox 与批准边界。

## 4. Access Methods

### 4.1 `chargebee-v2-incremental-read/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- endpoint：exact data-center/site hostname + `/api/v2`；先读取 Configuration 并固定 catalog/schema；
- auth：HTTP Basic，API key 作 username、password 为空；test/live key 独立。优先 read-only key，credential 只存 ref；publishable key 仅覆盖有限产品目录，不适合账单结果：[Authentication](https://apidocs.chargebee.com/docs/api/auth)、[API key types](https://www.chargebee.com/docs/billing/2.0/site-configuration/api_keys)；
- pagination：`limit` 1–100；必须原样使用 response `next_offset`，不得解析或跨 endpoint/filter/version 复用；
- incremental：对支持的资源固定 `[last_sync-5m, end)`、`updated_at asc`，按 resource ID + `resource_version` 只接受更高版本；这是官方推荐算法，不把 offset 当跨 run cursor：[List operations](https://apidocs.chargebee.com/docs/api/list-ops)；
- consistency：single retrieve 是 strong read；list/export 是 eventual read。事件提示后需要 exact retrieve 才能声称 current state：[Read consistency](https://apidocs.chargebee.com/docs/api/read-consistency)；
- deletion：支持 `include_deleted=true` 的资源单独 reconciliation，`deleted` 变成 Tombstone/correction；不支持的资源明确 `DeletionPropagationProviderLimit/Unknown`；
- quotas：live 默认 Starter 150/min、Performance 1000/min、Enterprise 3500/min，test 150/min；以 site 实际 entitlement 为准。429 遵循 `Retry-After` + exponential backoff+jitter：[Error handling and rate limits](https://apidocs.chargebee.com/docs/api/error-handling)。

### 4.2 `chargebee-events-webhook-v2/v1`

- event payload 固定 `api_version=v2`，resource snapshot 的 `resource_version` 决定同一对象的先后；event source 区分 admin_console/api/scheduled_job/hosted_page/portal/system 等：[Events](https://apidocs.chargebee.com/docs/api/events)；
- webhook 可能重复、乱序且不是 time-critical transport；按 event ID dedupe，用 resource_version 抑制 stale snapshot，需要 current state 时 exact retrieve；
- webhook endpoint Basic Auth 只证明共享 secret，完整性可通过 Retrieve Event 再核验；payload/content 仍需 schema/data policy；
- fixed retry schedule 约到 3 天 7 小时；event list 以 `occurred_at` polling 做补偿。`webhook_status` 默认说明只覆盖近 6 天，早期事件需显式 occurred_at filter：[List events](https://apidocs.chargebee.com/docs/api/events/list-events)、[Webhook settings](https://www.chargebee.com/docs/billing/2.0/site-configuration/webhook_settings)；
- event retention 的绝对长期承诺未在当前证据中统一证明；本 Pack 不以“能按较早 occurred_at 查询”声称无限历史。

本轮不创建 webhook，route 保持 deferred。

### 4.3 `chargebee-data-lookup-mcp/v1`

官方 Data Lookup MCP 可按 toolset 启停并以 OAuth 继承用户 role，或用 server API key 获得全部 enabled tools；但 toolsets 同时包含 Customer details、invoice/credit PDF link、Transaction payment-method details 和创建 export jobs：[Data Lookup MCP](https://www.chargebee.com/docs/billing/2.0/ai-in-chargebee/data-lookup-agent)。因此仅记录为 diagnose 候选。采用前必须固定 Subscription/Invoice/Credit Note/Transaction/Event/Product 的窄 tool inventory，禁用 Customer/PDF/Export/PaymentIntent gateway details，优先 OAuth role，验证分页/coverage、input constraints、output minimization 和 tool drift。

### 4.4 `chargebee-authorized-export/v1`

用户在 UI/MCP 明确选择并完成的 export 可走 `authorized-export/manual-import`。export job 是平台写入/生成动作，不属于 read-only Connector 自动能力；必须记录操作者批准、filters、fields、site/schema、generatedAt、file hash、retention 和 omissions。下载 ZIP/CSV 还需单独 archive safety 与 PII policy。

## 5. Platform Skills

### `chargebee-billing-pack-research/v1`

- purpose：`research/curate`；核验 API v2/catalog schema、concepts、list/event/webhook/keys/rates/terms、MCP/Agent Skill 和 fixed artifacts；
- 输出 evidence-bound proposal；禁止执行 `npx skills add`、CLI、SDK、API Explorer、MCP connection 或任何 site 操作。

### `chargebee-owned-subscription-outcomes/v1`

- purpose：`acquire`；输入固定 Pack/snapshot、site/data-center/environment、configuration snapshot、item-price roster、field allowlist、time fence/lookback、DataHandling/Monetary policy 和预算；
- allowlist：Configuration/Currency/Item/ItemPrice/Subscription/Invoice/Transaction/CreditNote 的 read-only list/retrieve，以及通过验证的 event read-back；
- 输出 native Observations、resource-version history、tombstones、CoverageAssessment、DataHandling/Monetary metadata 和 value-realization projection；
- 禁止 Customer/PaymentSource/gateway token/PDF/address/contact/meta_data 自动展开、任何 POST、MCP export、把 cancel/payment failure/refund 直接标 complaint。

### `chargebee-billing-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 configuration/cross-catalog fail-fast、updated_at overlap/resource_version、eventual list vs strong retrieve、deleted resources、non_renewing/cancelled、invoice/dunning/payment、credit/refund、currency decimal、event dedupe/order 和 forbidden writes；
- sandbox live 需用户另行授权 test site + read-only key；Time Machine 只由独立测试管理员操作，Connector 只读：[Getting started/testing](https://apidocs.chargebee.com/docs/api/getting-started)。

## 6. Projection、数据治理与证据强度

- normalized outcome 包含 site/environment/config revision、native refs、item/item-price taxonomy revision、subscription/invoice/transaction/credit subtype、source/resource/effective/observed times、event source、state basis 和 coverage。
- amount 保留原值；`MonetaryDatasetMetadata` 逐 selector 声明 role、currency、minor/major decimal、sign、rounding。Chargebee 常见 `in cents` integer 对 zero-decimal currency仍是 major unit；启用 multi-decimal 后 `_in_decimal` 是 major-unit string且 invoice line amount另有 rounding：[Currencies](https://apidocs.chargebee.com/docs/api/currencies)。
- Customer/subscription IDs 仅作 site-scoped pseudonymous relation；customer name/email/phone/address/IP、payment method/masked card、gateway IDs/tokens、invoice notes/PDF、event user/origin email、arbitrary meta_data 默认 drop/quarantine。
- portal/hosted-page customer action可在有 schema evidence 时标 `subject-authored`；admin_console/API 操作是 `counterparty-authored`；scheduled_job/system/dunning 是 `provider-generated`。自定义 cancel reason code 也不能自动视为 customer quote。
- payment failure、retention outcome、value reversal 分开；Chargebee 没有跨 gateway 统一 dispute object 时，不从 chargeback payment method/value 反推完整 dispute lifecycle。
- site、business entity、test/live、Product Catalog schema 不混合。deletion/correction 传播到 canonical、EvidenceSpan、index 和 derived review。
- 使用受 Chargebee Terms、Privacy Notice、DPA、API policy 和用户合同约束；Terms 还限制第三方 data processing、敏感数据和竞争用途：[Terms](https://www.chargebee.com/company/terms/)、[Privacy](https://www.chargebee.com/privacy/)、[DPA](https://www.chargebee.com/privacy/dpa/)。本 Pack 仅记录待审证据。

## 7. 开源、Agent Skill 与 MCP Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote` 固定；仅读取 README/LICENSE/metadata/SKILL，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [chargebee/chargebee-go](https://github.com/chargebee/chargebee-go/tree/8241079a28167ba0134125adeafe421c2ff76fcb) `8241079...` / v4.8.0 | Chargebee 官方；MIT | v2 models、pagination、retry、webhook typed events、OTel seam | `official-reference`；完整 write surface 不授权，generated enum 仍需 fixed schema fixtures |
| [chargebee/openapi](https://github.com/chargebee/openapi/tree/4b3edca1d4858e7b93ecf95c1d6c21c4b99c49ba) `4b3edca...` | Chargebee 官方；MIT | API v2 + PC v1/v2 schemas、SDK generation source | `official-contract-reference`；运行时仍必须读取 site Configuration，不能任选 schema |
| [chargebee/ai](https://github.com/chargebee/ai/tree/6cb5b9e60ac4f61bd799a4f7803ecef047df7775) `6cb5b9e...` | Chargebee 官方 publisher；未发现 repository license | `chargebee-integration` Skill 的 docs routing/SDK/webhook样本 | `rejected-reuse/discovery-only`；要求 CLI/SDK/CRUD，许可证缺失，Basic Auth sample 省略标准 base64 encoding，不能作为执行知识或安全基线 |
| [airbytehq/airbyte Chargebee source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-chargebee) `1339a9e...` | Airbyte；ELv2 path | declarative stream/state/schema 与 connector fixtures | `reference-only`；默认建议含 Customer/PaymentSource 等过宽 streams，不能整体复用 |
| [Chargebee Data Lookup MCP](https://www.chargebee.com/docs/billing/2.0/ai-in-chargebee/data-lookup-agent) current docs | Chargebee hosted service；商业条款 | 官方 read toolset、OAuth role/API key/input controls | `deferred`；不是开源代码，tool/schema/permission/PII/export drift 要单独验证 |

## 8. Verification Plan

### evidence-review / static-contract

- exact site/environment/data center、API v2、configuration/catalog schema、concept identity固定；
- API list/retrieve、event/webhook、MCP/export representation 分开；
- read-only key/tool/field allowlist，不含 Customer/PaymentSource/PDF/export/write；
- subscription schedule/effective state、invoice/dunning/transaction、credit/refund、monetary unit分开；
- resource version/deletion/coverage/attribution规则可审计。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| PC v1/v2/compat mismatch | configuration gate fail-fast；不把 plan/addon 与 item schema静默混用 |
| update occurs during pagination | 5-minute overlap + resource_version 补回；offset不作跨 run cursor |
| list stale, retrieve current | eventual/strong consistency分开；read-back correction幂等 |
| same updated_at multiple IDs | 全部保留并按 ID+resource_version 去重 |
| deleted subscription/invoice/transaction | include_deleted population与 tombstone传播；unsupported deletion标 provider-limited |
| active→non_renewing→cancelled | scheduled/effective term end分开，不提前标已流失 |
| cancel due not_paid vs portal reason | provider-generated与subject-authored分开 |
| invoice payment_due→paid | invoice、dunning、successful transaction evidence各自存在 |
| failed transaction later succeeds | payment-failure可撤销/补充，不直接形成 retention loss |
| adjustment/refundable/store credit | due reduction、future credit、cash refund不混写 |
| partial refund across transactions | 每个 refund transaction独立，credit note status/available amount正确 |
| USD/JPY/multi-decimal item price | integer/decimal/rounding mapping正确，禁止统一 `/100` |
| duplicate/out-of-order event | event ID/resource_version幂等；stale snapshot不覆盖current |
| event gap beyond proven window | Coverage/HistoryUnknown，不声称无限事件历史 |
| MCP gains Customer/PDF/Export tool | route保持deferred/blocked，allowed effects/fields不扩张 |
| unknown custom/meta/payment field | drop/quarantine；不进入 logs/index/fixture |
| 401/403/429/lock_timeout | 错误分类、Retry-After/backoff+jitter正确 |
| attempted POST/cancel/refund/export | static/policy gate拒绝，零 platform-write |

### sandbox-live / operational-canary

用户另行授权后，test site 由管理员用 synthetic catalog/Time Machine 准备 renewal、dunning、non-renewing、cancel、credit/refund；Connector 只读。canary 监测 API/schema/SDK/Agent Skill/MCP tool drift、configuration/catalog changes、list lag/overlap delta、resource-version regressions、delete visibility、event lag/order/duplicate、quota/Retry-After、currency/rounding、PII quarantine、attribution unknown 和 correction backlog。

## 9. 晋级缺口

进入 `modeled` 需要 accepted v2+catalog concepts/capabilities/access/adoption snapshots、site/item roster、schemas、DataHandling/Monetary/attribution/coverage policy；进入 `verified` 需要 fixture report，并经用户授权完成 test-site read-only report。当前没有 Connector、credential、webhook/MCP connection、live data、export 或 callable route。
