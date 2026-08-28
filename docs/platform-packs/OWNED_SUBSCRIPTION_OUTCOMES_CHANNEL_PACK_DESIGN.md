# Owned Subscription Outcomes Channel Pack 设计

状态：`researched` 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-subscription-outcomes-demand/v0-design`

## 1. 为什么这是独立信号层

CRM 说明组织内部记录了“买/不买”；Billing/Payment 才说明之后是否开票、收款、续费、取消、退款或发生争议。二者共同描述价值兑现链，但不能合成一个 conversion/churn 字段：赢单不等于付款，invoice paid 不总等于 processor 扣款成功，一次 renewal failure 不等于流失，scheduled cancellation 不等于已经结束，credit note 也不总是现金退款。

```text
Owned Sales Decisions ── purchase decision
            │
            ▼
Stripe Billing ───────┐
                      ├─> Owned Subscription Outcomes Channel
Chargebee Billing ────┘      ├─ product/plan roster + authority map
                             ├─ subscription/invoice/payment/reversal facts
                             ├─ monetary/data/attribution policy
                             ├─ overlap/dedupe + coverage
                             └─ read-only skills
```

本 Channel 用于发现“承诺后是否真正兑现、在哪一步失败、是否继续使用/付费、价值是否被回撤”。它不做 revenue recognition、会计总账、客户健康分、信用判断、催收或自动 retention action。

## 2. 成员 Pack 与共同能力

| Member | 原生 surface | 当前状态 | 关键 coverage 边界 |
| --- | --- | --- | --- |
| [Stripe Billing](STRIPE_BILLING_PLATFORM_PACK_DESIGN.md) | owned account；GA 2026-07-29 Subscription/Invoice/Payment/Refund/Credit/Dispute/Event | `researched` design | events 30 天、list 无统一 updated_at、webhook乱序/重复、invoice/payment语义和 currency特殊规则 |
| [Chargebee Billing](CHARGEBEE_BILLING_PLATFORM_PACK_DESIGN.md) | owned site；API v2 + Product Catalog schema | `researched` design | list eventual/read strong、updated_at overlap/resource_version、deleted/event/MCP/decimal currency |

共同 capability proposal：

- `billing.list.owned-subscription-snapshots/v1`
- `billing.list.owned-invoice-outcomes/v1`
- `billing.list.owned-payment-outcomes/v1`
- `billing.list.owned-value-reversals/v1`
- `billing.receive.owned-billing-events/v1`
- `taxonomy.list.owned-billing-products-prices/v1`

成员原生 REST/list/retrieve/search/event/webhook/MCP/export capability 保持独立。Customer、Payment Method/Source、invoice PDF、dispute evidence files、metadata arbitrary expansion、billing writes 和催收动作不进入共同 allowlist。

## 3. Roster 与事实权威

一个业务可能只用 Stripe，也可能用 Chargebee 管订阅、Stripe 作 gateway；后一种情况下同一经济事件会在两个系统出现。Channel 必须固定 `ChannelRosterRevision`，不能把两个数据源简单相加。

| 字段 | 作用 |
| --- | --- |
| product/offering subject ref | 用户确认它对应哪个产品/方案；不从 Product/Item 名称猜 |
| member pack + exact surface | Stripe account+mode 或 Chargebee site+environment+data center |
| ownership/authorization evidence | 证明组织有权研究该 tenant/population |
| included product/price/item-price refs | exact native taxonomy allowlist 与有效期 |
| authority by fact class | subscription/invoice/payment/refund/credit/dispute 各自指定 authoritative member |
| gateway/processor relation | 仅用户确认、平台 exact reference 或迁移账册可证明 Chargebee transaction 对应哪个 Stripe payment/refund |
| currency/decimal/conversion policy | 原值、currency、unit、rounding；是否允许 provider/external conversion |
| field/data-handling policy | exact selectors、sensitivity、disposition、attribution defaults |
| exclusions | test customers、internal/demo/free plans、fraud-only records、Customer/PaymentSource/PII、legacy migration gaps |
| valid window | gateway migration、catalog change、account merge、API/schema 或 authority 变化时追加 revision |

### 3.1 Overlap 与冲突规则

- 两个平台同时记录同一 payment/refund 时，只有 exact gateway reference + roster relation + compatible amount/currency/time 才可标为同一经济事件；金额/时间/客户相似不能模糊 dedupe。
- authority map 决定 normalized current fact。例如 Chargebee 可作为 subscription/invoice authority、Stripe 作为 processor outcome authority；这只是某个 roster revision 的业务事实，不是平台固有优先级。
- 非 authority member 保留为 corroborating Observation/lineage，不能删除；冲突生成 review item，而不是 last-write-wins。
- gateway migration/dual-write 窗口必须显式，旧/new system 的 missing/deleted state 不互相补写。

## 4. `owned-subscription-outcome` Projection

| 字段 | 来源与规则 |
| --- | --- |
| member/pack/surface/representation | 必填；保留 tenant、environment、API/catalog/event version |
| product/offering subject + taxonomy revision | roster subject + exact Product/Price 或 Item/ItemPrice Observation；列入 `DerivedFrom` |
| native subscription/invoice/payment/reversal refs | platform-local；跨 member relation 另存，不共享 ID namespace |
| subscription lifecycle | future/trial/active/non-renewing/past-due/unpaid/paused/canceled/ended 等 reviewed mapping + native state |
| cancellation schedule/effect | requested/scheduled/effective/end times分开；cause/feedback与attribution分开 |
| invoice lifecycle | draft/open/due/paid/uncollectible/void/write-off 等 normalized state + native state/basis |
| payment lifecycle | attempted/processing/action-required/failed/succeeded/reversed；不能由 invoice alone 填写 |
| reversal lifecycle | adjustment/credit/refund/payment reversal/dispute/chargeback + pending/succeeded/failed/resolved subtype |
| monetary fields | original amount/currency/selector role/unit/sign/rounding；conversion必须引用固定 policy |
| attempt/dunning facts | attempt count、next attempt、dunning result；provider operation，不自动代表 customer intent |
| reason/evidence | exact categorical/text span + native source；reason code不改写成客户原话 |
| event/source/effective/observed times | 三者分开；乱序事件不覆盖高版本 current snapshot |
| evidence attribution | subject/counterparty/provider/derived/unknown + basis |
| history/deletion/coverage | provider window、event gap、list/retrieve consistency、include-deleted 和 reconciliation evidence |

Projection 不包含 customer email/name/address/payment method/card/bank、invoice/credit PDF、dispute evidence file、销售/客服活动。tenant-scoped pseudonymous customer relation仅在 roster/分析确需 cohort 且 policy 允许时保留。

## 5. 证据映射与推断边界

| Source fact | 可形成的 evidence | 禁止自动推断 |
| --- | --- | --- |
| successful processor payment | `payment` | 满意、持续使用、全额 invoice、无退款 |
| failed/required-action payment attempt | `payment-failure` | churn、没钱、产品问题、客户拒付 |
| non-renewing/canceled/ended state | `retention-outcome` | 主动流失、具体原因、产品失败 |
| portal cancellation feedback | `retention-outcome` + reviewed complaint/switching candidate | 反馈真实性、代表全体用户、internal operator provenance |
| refund/credit/adjustment/reversal | `value-reversal` | cash refund、投诉、产品不可用 |
| dispute/chargeback claim | `dispute`，必要时另加 `value-reversal` | 已证实事实、客户作者身份、产品痛点 |
| invoice paid only | invoice outcome；有明确 payment relation才可 `payment` | processor success、现金到账、无 credit/out-of-band |

Signal Miner 必须读取 native subtype、attribution、monetary role 和 counter-evidence。一个“退款成功”可以支持价值回撤，但可能因为 duplicate/fraud/goodwill；一个“取消”可能因 payment failed、test cleanup、seasonal plan 或产品不合适。缺少 cause 时保持 unknown。

## 6. 共同 Monetary、DataHandling 与 Coverage policy

### 6.1 Monetary

`MonetaryDatasetMetadata` 只描述 schema fields，不保存值：

- role：gross/net/due/paid/outstanding/refunded/credited/disputed/tax/discount/unknown；
- unit：minor-unit-integer、major-unit-decimal、provider-defined；
- sign：unsigned-by-role、signed-ledger、provider-defined；
- currency：row selector 或 fixed currency二选一；
- rounding/conversion：provider rule和versioned conversion ref；空 conversion ref 表示只保留原币，不产生跨币汇总。

禁止：固定 `/100`、跨 currency 直接相加、把 negative amount 猜成 refund、把 credit 当 cash、用 current FX 重写历史事实、把 gross/paid/due混为一个 Amount。

### 6.2 DataHandling

- raw billing payload 默认 `restricted`、tenant partition、purpose-bound、短 retention；
- default unknown field `quarantine`；只有 reviewed schema selector进入 canonical；
- Customer/PaymentSource/PaymentMethod/card/bank/address/contact/IP/PDF/secret/gateway token drop；必要的 external IDs pseudonymize/restrict；
- arbitrary metadata、invoice notes、dispute evidence、refund destination details不进入模型上下文、日志、fixture或索引；
- deletion/rectification传播到 evidence/index/derived review；audit只保留不可逆最小receipt。

### 6.3 Coverage

Channel coverage 是成员 coverage 的向量，不是一个布尔值：

- Stripe：account/mode/product roster、snapshot fence、event 30-day gap、webhook/reconciliation、Search/list limitations；
- Chargebee：site/catalog roster、eventual list lag、strong retrieve、5-minute overlap、resource version、include-deleted/event window；
- Channel：fact authority、gateway overlap、free/test/internal exclusions、migration windows、currency compatibility 和 unresolved conflicts。

“所有配置成员本轮成功”只代表 roster coverage；不能外推全部客户、全部历史、全部市场或真实产品使用价值。

## 7. Channel Skills

### `owned-subscription-outcomes-research/v1`

- purpose：`research/curate`；发现/复核 Stripe/Chargebee 官方概念、API/schema/terms、SDK/OpenAPI/MCP/Agent Skill artifacts 和 adoption；
- 只生成 proposal，不安装 skill/MCP、不开 key/webhook、不调用 live systems。

### `owned-subscription-outcomes-acquire/v1`

- purpose：`acquire`；逐 member 解析已验证 capability，输入固定 roster/authority/schema/DataHandling/Monetary/coverage policy；
- allowed effects：`none`、本地不可变事实写入；
- 输出 member-native observations + cross-member projection/overlap/conflict report；
- 禁止身份/支付方式展开、MCP任意问答fallback、export creation、billing mutation、外联或因某 member degraded借用另一 member maturity。

### `owned-subscription-outcomes-conformance/v1`

- purpose：`verify/diagnose`；组合已完成的 member reports，检查 roster、authority、dedupe、projection、monetary、data handling、attribution、coverage和 degradation；
- fixture 默认无网络；live 只在用户另行授权的 synthetic Stripe sandbox/Chargebee test site执行，两个 Connector 均只读。

本 Channel 不定义 Probe Skill。若未来验证取消原因、定价或 retention 假设，应由独立产品实验/研究工作流完成，包含 truthful treatment、consent、assignment、exposure、metrics 和 approval；不能通过真实退款、失败支付或订阅变更制造“需求证据”。

## 8. Verification Plan

### static-contract

- member refs/version/maturity、roster/authority/gateway relation、projection schema固定；
- member credentials、IDs、cursor、events和verification claims保持隔离；
- payment/purchase-decision/invoice/payment-failure/retention/value-reversal/dispute不混写；
- exact DataHandling/Monetary/attribution/coverage policy被每个 output引用；
-任何 write、Customer/PaymentSource/PDF/export/MCP broad tool静态拒绝。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| CRM won, no billing record | purchase-decision保留；不制造payment/retention事实 |
| invoice paid by credit/out-of-band | 不制造processor payment success |
| payment succeeds after retry | payment-failure与payment evidence都可追溯；不标churn |
| scheduled cancel later revoked | requested/effective state分开；旧outcome被新revision纠正 |
| non-renewing reaches end | effective retention outcome只在term end产生 |
| refund plus credit note | exact cash refund只计一次；credit/adjustment单独role |
| dispute then won/lost | claim与resolution分开；value reversal按真实result更新 |
| Chargebee-on-Stripe same payment | exact gateway relation去重；两member lineage保留 |
| similar amount/time without relation | 不做fuzzy dedupe，生成overlap review候选 |
| authority member conflicts | 不last-write-wins；输出conflict/coverage降级 |
| gateway migration window | old/new authority按roster revision/time生效 |
| USD/JPY/multi-decimal | 原币/unit/rounding正确；不非法汇总 |
| customer/metadata/PDF field appears | drop/quarantine；不可进index/model/logfixture |
| one member suspended | 生成missing-member/partial coverage；另一成员不借成熟度 |
| Agent/MCP attempts refund/cancel/export | policy拒绝，零external effect |

### sandbox-live / operational-canary

经用户授权后，用 synthetic IDs 验证 member read-only sandbox，再运行组合 report。canary 监测 member pack/report expiry、roster/authority/catalog/gateway drift、duplicate economic-event ratio、unresolved conflicts、event/list reconciliation delta、currency incompatibility、PII quarantine、unknown attribution、payment-to-retention lag、correction backlog、manual fallback success 和零账单写入不变量。

## 9. Go 抽象影响

本轮只增加平台无关静态契约：

- `SignalEvidenceType` 新增 `payment-failure`、`retention-outcome`、`value-reversal`、`dispute`，并在注释中禁止过度推断；
- `MonetaryAmountRole`、`MonetaryUnitEncoding`、`MonetarySignConvention`、`MonetaryFieldSemantics` 和 `MonetaryDatasetMetadata` 描述 schema-bound amount 语义；
- `Observation` 与 `SourceItemCandidate` 可附 Monetary metadata，实际金额继续留在版本化 payload schema；
- 未增加 Stripe/Chargebee 字段、SDK 类型、client 或实现接口。

## 10. 晋级缺口

当前三文件仅为 evidence-reviewed design。进入 `modeled` 需要 accepted member snapshots、ChannelRoster/authority、共同 projection/Monetary/DataHandling/attribution/coverage schemas；进入 `verified` 需 member fixture reports、Channel conformance report，并经用户授权完成 read-only synthetic sandbox。真实 Connector、credential、webhook/MCP、export和任何账单副作用继续不存在。
