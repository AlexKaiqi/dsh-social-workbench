# 本地服务 / 反向需求市场候选分流

状态：`researched` 候选分流；未注册合作方、未创建账号、未取得凭据、未调用 API/MCP、未购买 Lead、未采集或发布  
核验日期：2026-08-26  
目标：寻找能表达“客户需要什么、何时何地需要、谁响应、是否预约和完成”的本地服务平台，同时避免把合作方结账、单个商家 Lead、公开需求大厅和普通商家挂牌误称为同一种数据源。

## 1. 从目标重新定义场域

本地服务的稳定事实链是：

```text
customer need + location + service item
  -> eligibility / estimate
  -> matched lead or availability
  -> quote / bid
  -> booking / agreement
  -> appointment / reschedule
  -> performance / completion
  -> invoice / payment / cancellation / refund / review
```

平台通常只暴露其中一段，而且面向不同 authority population：

- `public-market`：平台公开需求或服务商目录；
- `provider-owned-leads`：只给某个已授权服务商的新 Lead、协商和消息；
- `partner-owned-checkout`：合作方用自己的商品订单发起估价、预约和履约；
- `provider-owned-operations`：只管理自己的订单、售后、退款和评价；
- `marketplace-wide-research`：允许系统性发现、长期保存、聚合、索引和 AI 分析全市场需求。

前四种存在不证明第五种存在。能创建预约也不意味着能发现外部需求；能查看自己收到的 Lead 也不意味着能枚举市场。

## 2. 候选比较

| Candidate | 独特信号 | 当前官方接入证据 | Durable research / Probe 边界 | 决策 |
| --- | --- | --- | --- | --- |
| Taskrabbit Home Services | 真实地址下的资格、估价、可用时段、正式报价、预约、改期、取消与完成；适合检验从 Probe 到履约的完整事实链 | 官方 Partner Platform API，OpenAPI `3.1.0` / version `2025-12`；estimate/availability/bid/book/project/appointment/reschedule/cancel/webhook；合作方 onboarding，认证文档仍有 API key 与 OAuth2 冲突 | 只面向合作方自有 checkout/project，不是公开需求 feed；AUP 禁止 mining/crawling/indexing 与把平台信息提交给 AI，除非精确合作协议另有授权；任何 booking 都是真实合同/费用/通知效果 | 首个 Pack；`researched/no-route`。价值是 truthful fulfillment Probe，不是 demand discovery |
| Thumbtack Partner Platform | Marketplace surface 按地点/类目/项目细节匹配 Pros/Businesses，并可提交真实 Project Request；Pro surface 提供已授权 Business 的 Lead/Negotiation、Message、Review 与 job status | 当前官方 Partner Platform 明确 Marketplace 与 Pro integrations；v4 docs 覆盖 Find Pros、Categories、Requests、Negotiations、Messages、self-serve webhooks 与 staging testing | Business search 是供给匹配，不是客户需求；Request create 会为 Pros 生成 Lead/通知/潜在费用；Pro list/webhook 只覆盖授权 Business，历史完整性未知；API Terms 未自动覆盖跨 Pro 长期 warehouse/index/AI | 第二 Pack已完成；`researched/no-route`，按Marketplace discovery、真实Request effect、Business-owned operations拆分 |
| 猪八戒开放平台 | 雇主需求、招标/比稿/计件/众包/雇佣、投标/稿件、合同、赏金托管、验收、支付、退款和评价 | 官方目录仍在线；需求API仅按已知taskId读取详情，可分页list的是openid服务商已参与交易；OAuth2 authorization code、method-version scope、签名、测试工具与旧Java SDK入口 | `获取所有需求类目`只是taxonomy；无public demand search/list；开放协议将数据限定于获权特定应用、最小必要并要求退订/停用立即删除，长期跨用户warehouse/index/AI需书面批准；HTTP-only docs与schema/SDK漂移待解决 | 第三Pack已完成；`researched/no-route`。最现实候选是provider-owned participation复盘，不是全市场采集 |
| Bark | 客户回答结构化问题后生成已筛查 Lead；服务商可见 urgency/intent/credit cost，付费后取得联系方式并可标记 hired | 官方网站、Help Center 和 Lead dashboard；本轮未发现面向第三方开发者的官方 API/SDK/MCP | Lead 是 service/location/scope 强信号，但购买会立刻扣 Credits 并暴露个人联系资料；Bark 只促成介绍，最终服务合同在客户与 Professional 之间；没有官方自动化 route 时拒绝浏览器抓取 | `manual/product-research only`；官方 API/partner/export 出现前不形成 Connector 候选 |
| 58 同城本地服务 | 本地生活服务供给、订购、预约/签约与线下服务；覆盖广但业务面高度异构 | 58 开放平台当前宣称服务 API、消息通知和本地服务合作方入驻；公开首页未给出可审计的本地服务 endpoint/schema/权限清单 | 通用协议禁止未经书面同意商业利用展示数据，并禁止非授权第三方工具接入；开放平台存在不等于需求读取或研究许可；更像合作方发布上门服务与管理自有闭环 | `deferred-partner`；获得具体合作文档、scope 和用途权之前不形成 Pack route，不使用网页/私有接口 fallback |

## 3. 为什么先做 Taskrabbit

Taskrabbit 不是这一轮最强的“需求发现”成员，却是最强的架构反例和 Probe 样本：

1. 它有当前、机器可读、版本化的官方 OpenAPI 与 `llms.txt`，但 access 仍由 partnership manager/onboarding 控制。
2. API 从合作方已有商品/订单出发，生成 Estimate、Availability、Bid、Draft Project、Booking 和 Appointment；这是 `partner-owned-checkout`，不能虚构成市场 discovery。
3. Bid 会锁定价格并临时保留时段，Book 会确认付款、发送通知并形成 live project；“读报价”与“外部效果”不能按 HTTP GET/POST 粗分。
4. 官方 AUP 同时禁止平台 mining/indexing 与将平台信息提交给 AI。文档为 AI 提供 `llms.txt`，并不自动授权把客户、Tasker 或 Project 数据送进 Agent/warehouse/index。
5. Webhook 有签名、重试、重放和乱序/重复治理需求，并存在 `project.rescheduled.timestamp = new_start_time` 这种字段语义陷阱，适合验证 schema drift 与 reconciliation。

完整设计见 [Taskrabbit Partner Home Services Platform Pack](./TASKRABBIT_PARTNER_HOME_SERVICES_PLATFORM_PACK_DESIGN.md)。

## 4. 共同抽象结论

现有 `ServiceRequest*` / `ServiceEngagement*` 可以承载本场域，但要补充：

- `partner-booking` request format，避免把合作方结账请求误当公开 marketplace post；
- estimate、availability window、quote、booking、appointment、reschedule、completion、cancellation 与 lead purchase engagement；
- estimated price、quoted price、client charged、lead fee 与 cancellation fee 金额 role；
- estimate/availability/quote/booking/appointment/reschedule/completion/cancellation 的 exact relation。

平台的 Service Catalog 属于供给/平台知识；客户地址、电话、支付与 Tasker 身份属于受限制 payload，不进入通用元数据或指标 label。

## 5. 下一步顺序

1. 用本地 fixtures 验证 Taskrabbit estimate → availability → quote → booking → appointment → outcome，不连接 sandbox。
2. Thumbtack独立Pack已固定Marketplace/Pro双表面、OAuth/scope候选、unknown-history coverage、webhook ordering、费用、external LLM与消息/状态效果；下一步只做本地fixture，不申请access。
3. 猪八戒独立Pack已固定需求known-ID、服务商参与人口、OAuth/协议/删除门与交易链；下一步只做本地fixture，不注册应用或调用测试工具。
4. Bark 与 58 只保留 drift trigger：官方 developer API、partner contract、用户自有 export 或明确书面数据用途出现后重审。

组合审查结果：Taskrabbit与Thumbtack进入[Local Service Intent & Truthful Fulfillment Probe Channel Pack](./LOCAL_SERVICE_INTENT_FULFILLMENT_CHANNEL_PACK_DESIGN.md)；猪八戒因稳定对象是数字服务采购与比稿/计件/招标，进入[Service Work Demand Channel](./SERVICE_WORK_DEMAND_CHANNEL_PACK_DESIGN.md)，不因发现批次被硬归为location-first本地服务。

## 6. 主要官方证据

- Taskrabbit：[Home Services API Overview](https://developer.taskrabbit.com/docs/overview-taskrabbit-home-services-api)、[OpenAPI Estimate endpoint](https://developer.taskrabbit.com/reference/projectestimate)、[Webhooks](https://developer.taskrabbit.com/docs/webhooks-1)、[Platform AUP](https://support.taskrabbit.com/hc/en-gb/articles/46260475390107-Taskrabbit-Platform-Acceptable-Use-Policy)
- Thumbtack：[Partner Platform Overview](https://developers.thumbtack.com/docs/overview)、[Find Pros](https://developers.thumbtack.com/docs/marketplace/businesses-search)、[Requests](https://developers.thumbtack.com/docs/marketplace/requests)、[Negotiations](https://developers.thumbtack.com/docs/pro-integrations/negotiations)、[API Terms](https://developers.thumbtack.com/docs/terms)
- 猪八戒：[开放平台](https://open.zbj.com/)、[API目录](https://open.zbj.com/api/apiIndex)、[开放平台文档中心](https://open.zbj.com/wiki/getWikiCategoryAll)、[平台交易规则](https://rule.zbj.com/ruleshow-0?categoryId=278&pid=716)、[付费投标规则](https://rule.zbj.com/ruleshow-0?categoryId=278&pid=512)
- Bark：[How Bark works](https://help.bark.com/hc/en-us/articles/13342669635484-What-is-Bark-and-how-does-it-work)、[Lead screening](https://help.bark.com/hc/en-us/articles/26980550854940-How-Bark-screens-your-leads)、[Lead pricing](https://help.bark.com/hc/en-us/articles/18043745477788-Understanding-lead-pricing)、[Professional Terms](https://www.bark.com/en/us/terms/)
- 58：[开放平台](https://open.58.com/)、[58 同城使用协议](https://help.58.com/home/announcement.html)、[生活服务第三方服务使用协议](https://help.58.com/home/news/167.html)
