# eBay Marketplace Platform Pack 设计样本

状态：`researched` 设计候选；未注册应用、未取得生产批准、未认证卖家、未调用 API、未执行 Probe  
核验日期：2026-08-26  
目标：区分公共商品发现、自有卖家商品管理、自有交易结果与高影响营销/发布能力，并验证 eBay API License 对需求数仓和跨平台分析的约束。

## 1. Pack 摘要

```text
pack ref             ebay-marketplace-demand-probe/v0-design
platform             ebay
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

eBay 的 API 面比闲鱼完整，但“有 API”不等于允许本系统把公开 listing 做成跨平台需求数仓。Buy API 生产使用面向获批 partner，需要业务模型审批、Application Growth Check 和相应合同；当前 API License 又要求对站点统计、类目平均售价、卖家表现、转化/完成率、跨平台比较和价格建模取得 eBay 明确书面许可。当前公共发现能力因此为 `partner-and-written-use-required`，不发布 callable route。

自有卖家 Inventory、Analytics、Fulfillment 和 Feedback 是另一组能力。它们需要用户 OAuth、卖家资格和细粒度 scope，且只可在平台预期用途内处理授权卖家自己的事实。把这些事实导入长期跨平台研究库、派生卖家表现或转化率，仍需单独用途审查。当前只设计契约和 sandbox 路径，不创建 keyset、credential 或 ConnectorInstance。

## 2. 平台与账号边界

必须按 marketplace、environment、application 和 principal 固定能力：

| Profile | 权限面 | 本 Pack 决策 |
| --- | --- | --- |
| `buy-sandbox-application` | Application token；Buy API mock/sandbox | `sandbox-candidate`；仅在用户另行授权后验证协议，不证明生产或真实市场 coverage |
| `approved-buy-partner` | 获批业务模型、合同与 production keyset | `partner-and-written-use-required`；用途必须明确覆盖需求研究、保存、索引与派生 |
| `owned-seller-user` | User token；授权卖家的 Inventory/Analytics/Fulfillment 等 scope | read 为 `eligible-with-policy`；写能力逐项 deferred/high-impact |
| `marketing-eligible-seller` | Store/广告资格与附加条款 | `deferred`；广告、折扣和主动 offer 不属于默认需求研究 route |

Application access token 只证明应用身份；User access token 才代表用户通过 eBay consent 授予 scope。Sandbox 与 Production 使用不同 keyset，sandbox mock item、测试 order 和测试 listing 不得进入市场需求统计。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `ebay.marketplace/v1` | enumeration/entity | `EBAY_US` 等 marketplace ID | 类目、币种、税费、政策、支持 API 与 locale 都可能不同 |
| `ebay.application-keyset/v1` | policy/entity | application + environment | production/sandbox 分离；secret 只能保存 credential ref |
| `ebay.category/v1` | versioned taxonomy | marketplace + category tree/version + category ID | leaf category、aspect、condition、listing policy 的解释上下文 |
| `ebay.catalog-product/v1` | entity | ePID | eBay catalog product；不等于某个卖家的 inventory item 或 listing |
| `ebay.inventory-item/v1` | seller-owned entity | seller scope + SKU | 产品、condition、quantity 等卖家库存记录；发布前存在 |
| `ebay.inventory-item-group/v1` | seller-owned entity | seller scope + group key | 多 variation inventory items 的管理容器 |
| `ebay.inventory-location/v1` | restricted entity | seller scope + merchant location key | 库存/履约位置；精确地址不进入普通数仓 |
| `ebay.offer/v1` | seller-owned mutable entity | seller scope + offer ID | marketplace、SKU/location/category、price、description 与 business policy；未发布时不是 live listing |
| `ebay.listing-item/v1` | public/owned mutable entity | REST item ID + legacy listing ID relation | 发布后的 marketplace item；active、visible、available 和 purchasable 是不同事实 |
| `ebay.item-group/v1` | public entity | item group ID | 买家侧 variation group；不能自动等同 seller inventory item group |
| `ebay.search-placement/v1` | observation | query/sort/filter revision + item + observedAt | 一次有界搜索中的位置；Best Match 会变，不能当稳定 rank |
| `ebay.traffic-report-cell/v1` | owned aggregate | seller + marketplace + window + dimension + metric | impression/view 等定义化聚合；不是 raw buyer event |
| `ebay.order/v1` | restricted entity | seller scope + order ID | 完成 checkout 后的订单；pending-payment 不由 Fulfillment `getOrders` 覆盖 |
| `ebay.order-line-item/v1` | restricted entity | order + line item ID | listing/variation、quantity、金额和履约的交易粒度 |
| `ebay.fulfillment/v1` | restricted entity/event | order + fulfillment ID | shipment/fulfillment 状态；与付款、退款分离 |
| `ebay.refund-dispute/v1` | restricted entity/event | order/refund/dispute ID | 逆向价值与争议；不能等同负面需求反馈 |
| `ebay.feedback/v1` | restricted/authored entity | line item + feedback ID | Feedback API 以 order line item 为粒度，不是整单评价 |
| `ebay.account-deletion/v1` | privacy event | notification ID + immutable user ID | 必须幂等验证并级联删除相关用户数据 |

主要关系：

```text
catalog-product ── may-describe ──> inventory-item
inventory-item-group ── groups ──> inventory-item
inventory-item + location + category + business-policies ── configures ──> offer
offer ── published-as ──> listing-item
listing-item ── appears-in ──> search-placement
order ── contains ──> order-line-item ── exact-listing-ref ──> listing-item
order-line-item ── fulfilled-by ──> fulfillment
order-line-item ── may-have ──> refund-dispute / feedback
```

### 3.1 不得提前消除的差异

- Inventory Item、Offer 与 Listing 是三层对象；SKU、offer ID、REST item ID 和 legacy listing ID 不得互换。
- `FIXED_PRICE`、`AUCTION`、`BEST_OFFER` 与 `CLASSIFIED_AD` 是不同交易机制。ask price、current bid、minimum bid、accepted offer、shipping、tax 和 checkout total 不能共享一个无角色 `price`。
- Browse API 表达当前可发现/可获取 item，不证明完成交易历史。Marketplace Insights 当前受限且不接受新用户，不能用 Browse 消失或结束时间推断 sold/completed。
- active、search-visible、available quantity、buyable、listing-on-hold、ended、withdrawn、removed 和 out-of-stock 必须分开。
- listing impression、listing view、watch/interest、bid、Best Offer、checkout order、payment、fulfillment、refund/dispute 和 feedback 是不同漏斗/事实层。
- Search offset 最多只遍历有界结果集；结果受 marketplace、delivery context、filter、sort、推广和时间影响，不能声称市场全量。

## 4. Capability 与 adoption decision

| Capability | 官方产品面 | Adoption | 设计边界 |
| --- | --- | --- | --- |
| `discovery.search.marketplace-listings/v1` | Browse API `search/searchByImage` | `partner-and-written-use-required` | production Buy API批准 + 用途书面许可；只保存批准窗口与字段 |
| `content.read.marketplace-listing/v1` | Browse `getItem/getItems/...` | `partner-and-written-use-required` | Application token；当前 item snapshot，不推断交易历史 |
| `taxonomy.read.marketplace-listing-definition/v1` | Taxonomy/Metadata APIs | `eligible-after-approval` | 固定 marketplace、category tree、aspect/condition/policy revision |
| `discovery.refresh.marketplace-feed/v1` | Buy Feed APIs | `partner-only` | affiliate/production要求；不得静默升级成全市场 mirror |
| `commerce.search.completed-listings/v1` | Marketplace Insights | `unavailable-to-new-users` | 当前 restricted/not open；不得用 Trading/community替代 |
| `content.read.owned-inventory-offer/v1` | Inventory API GET | `eligible-with-policy` | User token、owned seller、read-only scope、schema/marketplace固定 |
| `account.listing.publish.owned/v1` | Inventory `publishOffer` | `deferred-high-impact` | 必须先有 inventory/location/business policy；sandbox-first；production逐 revision批准 |
| `account.listing.update-withdraw.owned/v1` | update/withdraw/delete offer | `deferred-high-impact` | update、withdraw、delete 的外部效果不同，不能 generic cancel |
| `analytics.read.owned-listing-traffic/v1` | Analytics `getTrafficReport` | `eligible-with-policy` | 仅授权卖家、受支持marketplace、固定metric/window；跨平台派生需书面用途许可 |
| `commerce.read.owned-order-outcomes/v1` | Fulfillment `getOrders/getOrder` | `deferred-restricted` | checkout-complete；高PII schema，aggregate-first；默认不取buyer/address |
| `feedback.read.owned-line-item/v1` | Feedback API GET | `deferred-restricted` | line-item级；需身份/保留/删除最小化 |
| `feedback.write.owned-line-item/v1` | leave/respond feedback | `rejected-default` | 真实用户可见、不可作为 synthetic Probe |
| `engagement.send.offer-to-interested-buyers/v1` | Negotiation API | `rejected-default` | 主动触达和价格变化；不得由采集 credential 或 Agent 自动执行 |
| `marketing.manage.owned-listing-campaign/v1` | Marketing API | `rejected-default` | 预算、广告 serving 和归因副作用属于独立广告 Probe 产品 |

公共 Browse/Feed 的 blocked decision 位于 network 和 PortBinding 之前。网页抓取、Shopping/Trading legacy API、代理服务、社区 MCP 或“只保存去身份化聚合”都不能绕过生产与用途批准。

## 5. Access Methods

### 5.1 `ebay-buy-approved-browse/v1`

- mode：`official-api`；official：`true`；auth：Application access token；
- API snapshot：Browse `1.20.5`（2026-07-14 release note）；
- scope：固定 marketplace、query/filter/sort/delivery context/window；
- limits：默认 Browse 5,000 calls/day；search 最多遍历 10,000 matches，offset 必须与 limit 对齐；动态限额仍以 Developer Analytics/响应为准；
- production prerequisites：获批业务模型、Buy API production access、相应合同和明确覆盖研究/保存/索引用途的书面许可；
- current decision：`blocked-before-binding`。

### 5.2 `ebay-owned-seller-rest/v1`

- mode：`official-api`；auth：Authorization Code Grant 的 User token；
- API snapshots：Inventory `1.18.5`、Analytics `1.3.2`、Fulfillment `1.20.7`；每个 capability 独立 pin；
- read scopes 与 write scopes 分离；不得给研究 route 注入 `sell.inventory`、refund、fulfillment write 或 marketing scope；
- Inventory API 发布的 listing 只能继续通过 Inventory API 修改，不能假定 Seller Hub 与 API 双写一致；
- order payload 包含地址、电话、邮箱等高敏字段，默认使用 reviewed selector drop/restrict，普通索引 bytes 必须为零；
- current decision：knowledge eligible，尚无 connection/route。

### 5.3 `ebay-sandbox-selling/v1`

- sandbox 是不影响生产 listing、真实用户或银行账户的测试环境；
- 只验证 OAuth、schema、warning/error、inventory→offer→listing 和 reconcile 状态机，不生成市场信号；
- 当前官方 MCP `1.1.0` 不支持 sandbox，不能用于该验证；
- 2026 年 sandbox status 曾出现 keyset 和 `publishOffer` 故障，health 与 conformance 必须分开。

### 5.4 data deletion

所有生产应用必须订阅 Marketplace Account Deletion，或在确实不持久化 eBay data 时完成官方 exemption。持久化应用必须验证 endpoint challenge、ECC signature、notification ID 幂等、重试和用户数据不可逆删除；法律保留只能隔离为有明确依据的 exception。公开 listing 下线、用户匿名化和 account deletion 还要分别触发 canonical/evidence/index/display 失效。

## 6. Platform Skills

当前未发现 eBay 官方 Agent Skill。内部只设计以下 Pack Skills：

### `ebay-pack-research/v1`

- 核验 API/release notes、Buy/Sell eligibility、License、marketplace support、policy 与 OSS revision；
- 输出 KnowledgeProposal、capability adoption 和 rejected fallback；
- 禁止创建 keyset、OAuth consent、安装 MCP、调用 production/sandbox 或下载 item feed。

### `ebay-owned-offer-probe/v1`

- 输入：真实自有库存/服务、合法权利、marketplace/category、真实 quantity/price、location、payment/fulfillment/return policies 和 ProbePlan；
- 首阶段仅产生 schema-bound preview、required-field findings、费用预检计划和 receipt/reconcile plan；
- block：want ad、placeholder、不可交付、重复 fixed-price listing、禁限售、侵权、误导、跨境不合法或无 seller/account/business-policy 资格；
- 禁止默认 publish/update/withdraw、发送 offer、广告、feedback、refund 或真实订单动作。

### `ebay-conformance/v1`

- 默认使用本地 fixtures，无网络、无 keyset、无 token；
- 验证 identity/price role/state/coverage、policy-before-binding、scope partition、PII drop、deletion cascade、unknown/reconcile 和 negative writes；
- sandbox/live/operational 分级必须由用户另行批准，Skill 本身不扩权。

## 7. Probe 与推断边界

eBay 的真实 listing 可以验证 offer，但不是“占坑测点击”。No item listings policy 要求 listing 真诚、透明地销售可交付商品或服务；want ad、placeholder 和不可交付 item 均不允许。重复 fixed-price listing、禁限售、知识产权、presale、跨境和消费者保障规则在每次 preview 时重新核验。

- 公共 listing 的标题、描述、condition、格式与价格只证明卖家当前主张，不证明需求、成交或愿付价格；
- bid/watch/view/Best Offer 也不能单独证明购买；order line 才证明完成 checkout，仍不等于付款、履约、满意或留存；
- 自有 Analytics metric 是 provider-defined aggregate；CTR/转化必须保存分子、分母、窗口、归因与 reconciliation watermark；
- sandbox effect 只能证明协议和状态机，不形成真实市场证据；
- production publish 必须绑定具体 seller、marketplace、offer/listing hash、费用/库存/履约义务和一次性批准；success 必须用返回 listing ID + read-back 对账，timeout/5xx 后不得盲目重发；
- 跨 eBay/闲鱼的价格建模、卖家表现、市场规模或转化比较在取得 eBay 明确书面许可前全部 policy-blocked。

## 8. 固定开源、MCP 与 SDK 证据

所有 revision 仅通过官方页面、raw manifest 与 `git ls-remote` 只读核验；没有 clone、安装或执行：

| Artifact / revision | License | 价值 | 决策 |
| --- | --- | --- | --- |
| [eBay/npm-public-api-mcp](https://github.com/eBay/npm-public-api-mcp) `124d5535fd5b8d8b089081e533343d2212557013`，package `1.1.0` | Apache-2.0 | 官方 OpenAPI discovery + generic GET MCP；application/user token | `reference-only`；不支持sandbox、生产generic GET面过宽、可接触私有用户数据，不能替代Connector/policy/field contract；不执行 `npx -y` |
| [eBay/event-notification-golang-sdk](https://github.com/eBay/event-notification-golang-sdk) `0044b7598d3c955572e3cd2bd77f3c7915377761` | Apache-2.0 | challenge、ECC signature、公钥缓存、account deletion schema | `reference-only`；旧依赖与示例secret配置需安全审计，不直接采用 |
| [eBay/ebay-oauth-nodejs-client](https://github.com/eBay/ebay-oauth-nodejs-client) `28215678741221a3238de984d2cde524c70da904` | Apache-2.0 | application/user/refresh token流程 | `reference-only`；OAuth helper不拥有scope/policy/credential lifecycle |
| [hendt/ebay-api](https://github.com/hendt/ebay-api) `v10.0.0` / `130c0945b94139257e4ddc403b76de2cd823539e` | MIT | 广泛REST/legacy schema、OAuth、版本漂移样本 | `reference-only`；宽读写wrapper且包含restricted/legacy面，不形成route |
| [YosefHayim/ebay-mcp](https://github.com/YosefHayim/ebay-mcp) `v1.9.0` / `c46f4c0ccb8c808e750e00a42696de9beef8c924` | MIT | 332 tools、scope/tool gating与diagnostics研究 | `rejected-as-connector`；可发布、改价、退款、履约、营销，远超需求研究最小权限 |
| [cunicopia-dev/ebay-mcp](https://github.com/cunicopia-dev/ebay-mcp) `v0.1.0` / `e2a455626c2e149b9e21b588e193a35860a4e9d4` | MIT | Browse read与price-summary反例 | `rejected`；price intelligence/aggregated landscape 与当前书面许可门冲突 |

代码许可证不授予 eBay data、账号、业务模型或生产 API 权利。官方 ownership 也不等于该 MCP 的 generic tool surface 满足最小权限、schema、retention 或审计要求。

## 9. Verification Plan

### evidence-review

- 固定 Browse/Inventory/Analytics/Fulfillment/Feedback release、marketplace support 与 scopes；
- 记录 Buy production partner流程、License restricted derivations、account deletion要求和 selling policies；
- 固定 OSS owner/revision/license/tool/effect；任何 route adoption 必须引用重新核验的有效证据。

### static-contract

- product/inventory item/group/offer/listing/order/line item/feedback identity不可互换；
- format、price role、listing state、funnel phase、metric definition和coverage均为一等字段；
- public discovery blocked 必须发生在 credential、network 和 PortBinding 前；
- 研究 route 不得持有 write、message、feedback、refund、fulfillment 或 marketing scope；
- PII selector默认drop/restrict，seller/buyer identity不得进入metric dimension或跨平台entity resolution；
- deletion必须穿透canonical、evidence、projection和index；
- eBay data不得进入跨平台price/conversion/market-size materialized view，除非Pack引用精确书面许可。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| catalog product + two seller listings | product可关联但listing/offer/seller identity不合并 |
| inventory item → offer → listing | SKU/offer/item IDs和revision分别保留 |
| auction with bid then fixed-price unavailable | buying options按时间变化；不把ask当成交价 |
| search result >10K | coverage为truncated；不得分片后声称全市场或派生均价 |
| listing disappears | ended/removed/sold/out-of-stock/permission unknown，不自动推断成交 |
| traffic report cells | metric/window/dimension/marketplace与additivity固定；ratio重算受政策门控制 |
| order line + refund + feedback | checkout/payment/fulfillment/reversal/feedback分层，PII bytes=0 |
| account deletion retry | signature、notification ID幂等、级联不可逆删除和ack/reconcile |
| publish timeout |状态为unknown并read-back；不自动重发 |
| broad MCP or wrapper | tool/scope/adoption evaluator拒绝生成default route |

### sandbox-live 与 operational-canary

只有用户另行授权后，才可创建 sandbox application/user，验证最小 read scope 和一个真实 schema-valid 测试 inventory→offer→listing 流程。Sandbox数据不进入DemandSignal。Production canary还需业务/用途批准、真实自有可履约item、seller资格、逐revision批准、预算/费用guardrail、read-back与withdraw/reconcile计划；当前全部未执行。

## 10. 可观测性

- knowledge：Browse/Inventory/Analytics/Fulfillment schema、marketplace support、policy/license、Buy approval和书面用途许可expiry；
- resolution：environment/keyset/principal/scope、blocked reason、production eligibility、business-policy与seller qualification；
- collection：query/filter/sort/delivery context、offset/10K truncation、5K daily quota、field omissions、item freshness与down/remove reconciliation；
- offer integrity：inventory/offer/listing identity、category/aspect/condition/policy revision、format/price role、quantity/visibility/purchasability、listing-on-hold；
- outcome integrity：traffic metric definition、window/timezone/reconciliation、order/line/payment/fulfillment/refund/dispute/feedback coverage和PII treatment；
- deletion：endpoint challenge/signature、notification duplicate/retry、ack age、cascade backlog与legal-hold exception；
- Probe：preview hash、fees、policy findings、approval invalidation、publish attempt、unknown age、read-back、withdraw/reconcile和真实履约结果；
- negative：restricted derivation、cross-platform comparison、price model、MCP generic GET、write scope、message/feedback/marketing/refund invocation count必须为零。

## 11. 当前结论

1. eBay 技术上能验证交易市场的完整对象链，但公共需求挖掘不是默认获准用途。
2. 当前不发布 Browse、Feed、MCP 或网页 fallback route；先取得生产与书面用途许可。
3. 自有卖家 read、sandbox Probe 和 production publish 必须是三个独立成熟度与授权面。
4. `MarketplaceOffer*` 只统一来源 representation；listing count、价格、bid、traffic和order不能自动升级为需求、市场规模或因果结论。
5. 下一步只能先做 static/fixture conformance；任何 keyset、OAuth、sandbox或真实listing均需用户另行授权。

## 12. 官方证据

- [Browse API](https://developer.ebay.com/api-docs/buy/api-browse.html)、[Browse release notes](https://developer.ebay.com/develop/api/buy/release_notes)、[Buy API requirements](https://developer.ebay.com/api-docs/buy/buy-requirements.html)
- [Buy field filters](https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html)、[API call limits](https://developer.ebay.com/develop/get-started/api-call-limits)
- [Inventory API overview](https://developer.ebay.com/api-docs/sell/inventory/static/overview.html)、[Inventory release notes](https://developer.ebay.com/api-docs/sell/inventory/static/release-notes.html)、[Managing offers](https://developer.ebay.com/api-docs/sell/static/inventory/managing-offers.html)
- [Analytics API overview](https://developer.ebay.com/api-docs/sell/analytics/static/overview.html)、[Traffic report](https://developer.ebay.com/api-docs/sell/static/performance/traffic-report.html)
- [Fulfillment API](https://developer.ebay.com/develop/api/sell/fulfillment_api)、[Feedback API](https://developer.ebay.com/develop/api/buy/feedback_api)、[Negotiation API](https://developer.ebay.com/develop/api/sell/negotiation_api)
- [OAuth token types](https://developer.ebay.com/api-docs/static/oauth-token-types.html)、[Marketplace account deletion](https://developer.ebay.com/develop/guides/sell/marketplace-user-account-deletion)
- [API License Agreement](https://developer.ebay.com/cms/files/api_license_2018-10-26.pdf)
- [No item listings policy](https://www.ebay.com/help/policies/safety-security-programs/prohibited-and-restricted-items-policy?id=4242)、[Duplicate listings policy](https://www.ebay.com/help/Policy/-/Duplicate_listings_policy?id=4255)、[Prohibited and restricted items](https://www.ebay.com/help/policies/selling-policies/selling-policies?id=4207)
