# Marketplace Offer Discovery & Truthful Probe Channel Pack 设计

状态：`researched` 组合设计；无 callable member route、无账号、无采集、无外部副作用  
核验日期：2026-08-26  
目标：组合闲鱼与 eBay 的 listing/offer 证据和真实可履约 Probe，同时保留成员授权、对象链、漏斗定义和跨平台用途限制。

## 1. Channel 结论

```text
channel ref          marketplace-offer-discovery/v0-design
members              goofish-demand-probe/v0-design
                     ebay-marketplace-demand-probe/v0-design
shared purpose       offer language research + truthful owned offer validation
shared source model  MarketplaceOffer* + MarketplaceOutcome*
callable coverage    none
external effects     none
```

Channel 的共同目标不是建立“全网商品价格库”，而是回答：哪些真实 offer、交付、价格机制和保障主张值得验证；自有、真实、可履约 listing 发布后出现了什么方向性反馈。闲鱼当前只有用户选择的 manual observation/manual package；eBay 公共 Browse 需要 production partner 与书面用途许可，自有卖家 API 又是另一授权面。二者不能共享 route、credential、coverage 或成熟度。

第一性原理下，共同 abstraction 必须覆盖 seller offer 与交易结果，但不能把平台对象压成一个 `listing`：eBay 的 inventory item→offer→listing 链与闲鱼 App listing/partner order链不同；跨成员只在 `MarketplaceOffer*` 和 `MarketplaceOutcome*` projection 层对齐。

## 2. 固定成员

| Member | Source representation | 当前 route | 主要 gate |
| --- | --- | --- | --- |
| [闲鱼 Platform Pack](./XIANYU_PLATFORM_PACK_DESIGN.md) | App listing、manual observation、manual probe receipt、partner-only order facts | none；manual design only | 无通用官方search/publish API；真实可履约；private mtop/Cookie/IM拒绝 |
| [eBay Platform Pack](./EBAY_MARKETPLACE_PLATFORM_PACK_DESIGN.md) | inventory item/offer/listing、Browse placement、owned traffic/order/feedback | none | Buy production partner、书面用途许可、OAuth/scope/PII/deletion、逐write批准 |

任何成员 blocked 都形成 `missing-member` 或 `restricted-projection`，不能由另一个成员、网页、MCP、community SDK 或人工补录伪装完整。

## 3. ChannelScopeRevision

一次 revision 必须固定：

- research question 与允许的 qualitative/quantitative derivation；
- member platform variant、marketplace/site、account profile 和 environment；
- category/listing type/buying format/condition/aspect taxonomy refs；
- query、filter、sort、delivery/region、currency、window、sample limit 和 exclusions；
- public selected、approved API、owned seller、sandbox 或 manual receipt 的 representation；
- rights/data-use、member-specific retention/deletion 和 eBay restricted-derivation policy；
- Probe subject、真实 ownership/fulfillment、price role、inventory、shipping/return、budget与guardrail；
- coverage target、missing-member behavior、materialized-view allowlist 和 expiry。

Scope revision 不保存 credential、Cookie、买卖双方身份、地址、消息正文或支付资料。

## 4. 共同来源 abstraction

### 4.1 `MarketplaceOffer*`

共同表达：

- marketplace/category、product/inventory/group/offer/listing 的原生引用与 exact relation；
- listing format、native state、active/visible/available/purchasable 等正交事实；
- price role 与 monetary schema，而不是一个跨平台裸金额；
- title/description/condition/disclosure/policy 等 content span；
- 一次 query/sort/filter 下的 placement snapshot 与 coverage；
- history/revision、外部 media artifact、retention/deletion。

成员保留：

- 闲置物品、经营性商品、服务及其资格/交付差异；
- eBay Inventory Item、Offer、Listing、item group、fixed price/auction/Best Offer/classified ad；
- 各自 category、condition、aspect、business/consumer policy 和 ID namespace。

### 4.2 `MarketplaceOutcome*`

共同阶段只作为 reviewed phase：`exposure`、`consideration`、`negotiation`、`commitment`、`payment`、`fulfillment`、`reversal`、`feedback`。原生 record 仍分别是 favorite/watch、view/impression、inquiry/message、bid/offer、order/line item、payment、delivery、refund/dispute 和 review/feedback。

- engagement count 不得跨定义求和；
- order/checkout 不等于 payment，payment不等于fulfillment，refund/dispute不等于负面评价；
- authored inquiry/review若被允许进入EvidenceSpan，必须固定record/content revision与authorship；身份和完整私信保留在restricted payload；
- 只有exact listing/order-line relation可连接offer与outcome；金额、标题、时间或账号相似不能 fuzzy match。

## 5. Projection 与动态物化视图

允许的默认视图：

| View | 内容 | 限制 |
| --- | --- | --- |
| `offer-language-evidence` | reviewed title/description/condition/fulfillment/guarantee spans | 只保留允许用途的最小span；seller主张不是buyer demand |
| `owned-probe-ledger` | plan、offer revision、platform receipt、listing state与真实履约结果 | 仅自有、逐revision批准；sandbox单独标记 |
| `member-coverage-health` | policy、route、sample/truncation、history、delete和conformance | blocked成员显式缺失 |
| `qualitative-demand-candidates` | inquiry/review中的complaint、failed-attempt、workaround等reviewed evidence | 需合法访问和authorship；不保存身份 |

默认禁止物化：

- 跨 eBay/闲鱼 listing count、平均/建议价格、销量、GMV、seller performance、conversion/completion/success rate；
- 从Browse消失、bid/watch/favorite/view/inquiry推断成交或愿付；
- seller/buyer identity resolution、跨平台画像或陌生人触达名单；
- 把 eBay content 与非 eBay listing 混合成未经许可的公共展示。

若未来取得 eBay 精确书面许可，新的 Channel revision 必须引用许可范围、用途、字段、展示/保存/派生、有效期和删除义务；不能修改本 revision 的 blocked 决定。

## 6. Channel Skills

### `marketplace-offer-research/v1`

- 输入：研究问题、成员Scope、官方/用户提供证据和query portfolio；
- 逐成员 resolution；blocked成员只返回missing-member；
- 输出：qualitative evidence、member coverage 和 prohibited-derivation findings；
- 禁止自动搜索网页、安装MCP、运行private API、扩展到卖家profile或生成价格模型。

### `marketplace-truthful-probe-plan/v1`

- 输入：真实自有可履约offer、目标member、价格/库存/交付/退款/权利和ProbePlan；
- 输出：成员专属preview、approval requirements、manual/sandbox/production handoff与receipt schema；
- 闲鱼当前只允许manual-package；eBay当前只形成sandbox/production design，均无execute route；
- 禁止placeholder、want ad、虚假库存、重复listing、自动消息/议价、操纵互动、广告、评价或虚假订单。

### `marketplace-channel-conformance/v1`

- 使用合成fixtures验证异构identity mapping、price role、state/phase、exact relation、coverage、rights、PII与delete；
- 强制检查eBay restricted derivation和闲鱼private route rejection；
- sandbox/live/member operational报告不能替代Channel组合验证。

## 7. Verification

### static-contract

- Channel manifest固定两个Pack refs、共同capability和ScopeRevision；
- `MarketplaceOffer*`与`MarketplaceOutcome*`只统一representation，不合并原生canonical ID；
- eBay policy decision在network/binding/materialization前执行；闲鱼manual route不得暴露execute port；
- price/currency/unit/role、listing format/state、outcome phase/definition和coverage不可缺失；
- public/owned/sandbox facts不能进入同一未标记population；
- PII、conversation、buyer/seller/profile、address/payment字段不得进入普通index或metric dimension；
- Probe批准绑定member、account、offer/listing revision、route、effect和payload hash。

### fixture-conformance

| Fixture | 预期 |
| --- | --- |
| 闲鱼商品/服务 + eBay inventory/offer/listing | 共同offer projection可查，原生链和资格差异保留 |
| eBay auction current bid + 闲鱼asking price | price role不同，不求均值/价差或建议价 |
| favorite/watch/view/bid/inquiry/order/refund | outcome phase分层，不用弱信号替代付款/履约 |
| eBay Browse blocked + 闲鱼manual sample | Channel返回mixed missing-member/sample coverage，不生成market estimate |
| eBay 10K truncation | 即便技术fixture完整也被policy/coverage gate阻断warehouse |
| 同一自有offer两平台发布 | 只用用户确认subject relation，不合并listing ID或曝光人群 |
| eBay account deletion / 闲鱼用户删帖 | 各成员删除级联，派生span/index同时失效 |
| publish timeout/人工无receipt | Probe保持unknown/prepared，不跨route重发或判成功 |
| broad MCP/private Cookie | adoption evaluator拒绝route，negative counter递增 |

### sandbox/live/operational

当前只允许运行无网络 fixtures。闲鱼manual smoke、eBay sandbox OAuth/listing或任何生产 read/write，都需要用户另行授权。未来 eBay sandbox成功只提升eBay sandbox capability；不会提升production、公共需求研究或Channel跨平台分析。Operational canary按member独立运行，Channel只消费固定VerificationReport和coverage。

## 8. 可观测性

- member knowledge/policy/approval/schema/license evidence age；
- marketplace/category/format/condition/aspect/business-policy drift；
- inventory/offer/listing identity conflict、state drift和exact relation gap；
- query/filter/sort/sample/10K truncation、manual selection bias和missing-member；
- price role/currency/unit conflict与forbidden aggregate attempts；
- outcome definition/window/attribution、order/payment/fulfillment/refund/review relation和PII quarantine；
- deletion/tombstone propagation、eBay notification ack/signature/retry和index invalidation；
- Probe preview/approval/receipt/reconcile、unknown age、fees/fulfillment guardrail；
- HTML/private API/MCP fallback、message/marketing/feedback/refund/write与cross-platform price model invocation必须为零。

## 9. 当前发布决定

- 两个成员均保持 `researched`；Channel同样不发布 callable route。
- 先发布抽象与fixture portfolio，验证系统能表达“API完整但用途受限”和“API不完整但manual仍有价值”的混合成熟度。
- eBay书面许可前不做公共需求warehouse、跨平台价格/转化比较；闲鱼不做Cookie/private API自动化。
- 真实Probe永远要求合法、真实、自有、可履约，并把发布、交易、付款、履约、退款和评价视为真实义务而非实验合成事件。
