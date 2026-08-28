# Thumbtack Partner Platform Pack 设计样本

状态：`researched` 设计候选；未申请 Partner access、未创建 app/credential、未连接 staging/production、未注册 webhook、未搜索 Business、未读取 Lead、未发送 Message、未创建 Request 或写入 Job Status  
核验日期：2026-08-26  
目标：固定 Thumbtack Marketplace 与 Pro integration 两类稳定概念、authority population 和外部效果，避免把服务商搜索结果、客户 Project Request、商家收到的 Lead/Negotiation 以及合作方写回的状态误当成同一类“需求数据”。

## 1. Pack 摘要

```text
pack ref             thumbtack-partner-platform/v0-design
platform             thumbtack
surfaces             marketplace-integration + pro-integration
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

Thumbtack 当前 Partner Platform 明确分为两套表面：Marketplace integrations 帮助合作方的用户按地点、类目和项目细节寻找 Pros/Businesses，或代表真实客户提交 Project Request；Pro integrations 则让已经授权的 Business/Pro 把自己的 Leads/Negotiations、Messages、Profile、Reviews、电话和 post-job status 接入 CRM/FSM。

两套表面均不是无需约束的全市场需求 feed。`businesses/search` 返回供给匹配，并创建短期 Search context；`requests` 才创建真实客户请求，并会为匹配 Pros 生成 Lead；`negotiations` 是这些客户联系在某个获权 Business 视角下的业务关系记录。Request 与 Negotiation 可以相关，但不能双重计作两个独立客户需求。

当前 API Terms 将 API Data 约束在 Professional 的 CRM/customer-acquisition workflow 与相应 controller/processor 关系中，并规定停止 API 使用或应合法要求时的删除义务。它没有自动授予跨 Pro 长期需求数仓、索引、RAG、模型训练或派生数据集权利。因此当前所有真实 route 都保持关闭，durable research 为 `policy-blocked`；未来也必须逐 Business、app、purpose、environment 和 data class 决议。

## 2. 平台面与 authority population

| Profile | 真实 population | 当前决定 |
| --- | --- | --- |
| `marketplace-category-discovery` | Thumbtack 当前地点下的 category recommendation、home-care task 与 request-form taxonomy | `partner-restricted-read-candidate`；provider-derived popularity、active services 和 average cost 不是 raw demand observation |
| `marketplace-business-search` | 某次用户 query/location/category/request form 下匹配的 Pros/Businesses | `partner-restricted-user-directed-candidate`；返回 supply placement，不提供公开客户需求；Search context 短期有效 |
| `marketplace-filtered-search` | 用户自然语言问题经 Thumbtack LLM 抽取后的 Business 匹配 | `deferred-external-model-processing`；必须披露外部模型处理、最小化 free text，并固定 consent/purpose |
| `marketplace-project-request` | 合作方代表真实 customer 提交的项目请求，以及由此生成的 Pro leads | `deferred-high-impact`；会通知真人、创建业务关系并可能产生 Pro contact charge，不得用 ghost request 做测试 |
| `pro-owned-negotiations` | 一个 OAuth 授权 Business 收到的 Leads/Negotiations | `business-owned-read-candidate`；不等于全市场，历史深度/回填窗口当前未知 |
| `pro-owned-messages` | 已授权 Business 的 lead 对话、系统消息与快速回复 | `read/write-deferred`；发送消息是外部沟通，正文与 customer identity 高敏感 |
| `pro-job-status-sync` | partner 对该 Business lead 写回的 appointment/completion/cancel/invoice signal | `deferred-high-impact`；会改变 Thumbtack Messenger label 和 Pro Performance Dashboard hire 统计 |
| `pro-self-serve-webhooks` | 单 Business 在 Thumbtack UI 配置的 negotiation/message/review events | `deferred-config-effect`；可与 OAuth API webhook 并存，必须去重 |
| `durable-demand-research` | Observation、分析数仓、Dolt、全文/语义/vector index、RAG/AI | `policy-blocked`；需书面用途、角色、AI/派生、保存、索引、保留与删除证据 |
| `consumer-web/private-graphql` | Thumbtack 网站 SSR、匿名 GraphQL、cookie/browser automation | `rejected`；不作为 Partner API fallback，也不安装非官方 MCP/Skill |

Partner legal principal、Partner account、app/client、environment、Thumbtack user/customer、Professional、Business、Business owner 与 webhook subscription 是不同 authority。PortBinding 必须固定其 exact combination，不能因为一个 Business 授权而访问另一个 Business，也不能用 Marketplace Partner access 冒充 Pro controller 权限。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `thumbtack.partner/v1` | restricted principal | partner agreement + account/app | 获批使用 Partner Platform 的法律主体，不是 customer 或 Pro |
| `thumbtack.customer/v1` | restricted demand principal | user/customer ref + purpose | 寻找服务并提交真实 Project Request 的 homeowner/customer；PII 不进入通用索引 |
| `thumbtack.business/v1` | professional supply principal | Business ID + revision | API 称 Pro 为 Business；可有 profile、service、review、lead 和授权用户 |
| `thumbtack.category/v1` | provider taxonomy | category ID + revision/location | 服务类目；推荐/activeServices 是 provider-derived，不是客户需求计数 |
| `thumbtack.request-form/v1` | category question schema | category + form revision | 描述客户项目的 question/answer contract；schema drift 会改变兼容性 |
| `thumbtack.search-context/v1` | ephemeral user-directed computation | Search ID + request hash + expiry | 由 zip/category/details 或 free-form query 创建的短期上下文；不是需求实例 |
| `thumbtack.business-placement/v1` | supply search result | Search ID + Business ID + rank/observedAt | 给定上下文中的匹配 Pro；starting quote/rating/hires 是供给画像，不是客户 outcome |
| `thumbtack.project-request/v1` | client-authored demand | Request ID + revision | 真实 customer 项目请求；包含类目、描述、时间、地点、Q/A、附件与 travel preference |
| `thumbtack.negotiation/v1` | provider-scoped matched lead | Negotiation ID + Business ID + revision | customer 联系某个 Pro 时创建；是 Request 在 Business 关系中的 lead，不是新独立需求 |
| `thumbtack.message/v1` | restricted communication | Negotiation + message ID/revision | customer、Pro 或系统消息；webhook 可能先于 Negotiation webhook |
| `thumbtack.lead-type/v1` | provider taxonomy | version + native value | CONTACT、BOOKING、REQUEST_A_QUOTE 等 native 类型；不同 API 版本不可静默合并 |
| `thumbtack.lead-charge/v1` | commercial access term | Negotiation/lead + price revision | `leadPrice` 非空并配合 `chargeState=Charged` 表示 contact/lead charge，不是项目成交价 |
| `thumbtack.quote/v1` | professional commercial proposal | Negotiation + quote revision | Pro 的报价；不可与 search starting quote、lead fee、invoice amount 或 payment 互换 |
| `thumbtack.appointment/v1` | scheduled performance signal | Negotiation + schedule revision | `appt_scheduled` 是 partner 写入的状态信号；需保留来源和有效时间 |
| `thumbtack.job-status/v1` | partner-authored provider state | Negotiation + native status + effectiveAt | not_scheduled、appt_scheduled、job_complete、invoice_paid、customer_cancel、pro_cancel；写入会影响平台下游 |
| `thumbtack.invoice/v1` | financial claim | Negotiation + invoice revision | `invoiceAmountInCents` 是 invoice amount，不自动证明付款、无退款或客户满意 |
| `thumbtack.review/v1` | customer feedback | review ID + Business + revision | legacy `verified` 表示存在对应 lead，不证明 job completed、invoice paid 或服务成功 |
| `thumbtack.webhook-subscription/v1` | external configuration | environment + Business/user + endpoint + revision | UI self-serve 与 API/OAuth 可并存；创建、暂停、编辑、删除都是外部配置效果 |
| `thumbtack.webhook-delivery/v1` | at-least-once event evidence | event/delivery ID + observedAt | 需 dedupe、乱序处理与 pull reconcile；当前签名/HMAC/retry契约仍待官方证据补全 |

主要关系：

```text
customer query + zip/category/request-form answers
  -> short-lived Search Context
  -> ordered Business placements (supply)
  -> real Project Request (demand; external effect)
  -> one or more Business-scoped Leads / Negotiations
  -> messages / quote / appointment signal
  -> partner-authored job status
  -> invoice / payment / cancellation / review
```

核心 invariant：

- Business placement 只是一次 search context 下的供给匹配，不是 Project Request；
- 一个 Request 给多个 Business 生成 Negotiation 时，需求 population 仍是一项 Request，Negotiation 是 provider-scoped relationship；
- 一个 Negotiation 的 webhook、list/get response、Message 和后续 lead-price update 是同一关系的不同记录/修订，不得重复计数；
- `job_complete` 和 `invoice_paid` 是 partner 写回给 Thumbtack 的状态，不是系统独立观察到的客观履约/支付事实；
- `verified review` 只证明与 lead 的平台关联，不证明满意、付款或无争议。

## 4. Capability 与 adoption decision

| Capability | 官方面 | Adoption | 设计边界 |
| --- | --- | --- | --- |
| `taxonomy.read.service-categories/v1` | Categories、recommendations、homecare、request form | `partner-only/deferred` | category/average cost/active services 按 provider-derived knowledge 保存；不推断 raw demand volume |
| `supply.search.local-businesses/v1` | `POST /api/v4/businesses/search` | `partner-only/deferred-user-directed` | location/category/details 最小化；保存短期 Search context、query definition 与 incomplete coverage |
| `supply.search.filtered-natural-language/v1` | `POST /api/v4/businesses/search-filtered` | `deferred-external-llm` | free text/project metadata 会由 Thumbtack LLM 提取；需 disclosure/consent 与敏感字段阻断 |
| `demand.create.project-request/v1` | `POST /api/v4/requests` | `rejected-default/deferred-binding` | 只允许真实 customer intent；可能创建多个真人 Lead/通知/费用；preview、approval、receipt、reconcile |
| `content.read.owned-negotiations/v1` | business-scoped list/get Leads | `business-only/deferred` | OAuth Business scope；历史 completeness 未知，不能标记 `all-history` 或 `forward-only` |
| `events.read.owned-negotiations/v1` | NegotiationCreated webhook | `business-only/deferred` | webhook full payload受限；乱序/重复/price update与pull reconcile |
| `content.read.owned-messages/v1` | paged negotiation messages | `business-only/deferred` | identity/body隔离；Lead Description和Quick Reply可作为系统/重复内容过滤，但保留审计依据 |
| `account.send.negotiation-message/v1` | message POST | `deferred-external-communication` | 必须用户批准 exact recipient/body；timeout不可盲重发；禁止自动说服/骚扰 |
| `account.write.job-status/v1` | negotiation job-status POST | `deferred-platform-write` | 要求 `supply::negotiations.write`；保留 actual external transition time、invoice amount和平台下游变化 |
| `events.configure.business-webhook/v1` | self-serve UI / API webhook | `deferred-config-effect` | endpoint/basic-auth secret、环境、event set、pause/delete、dual-path dedupe与回滚 |
| `research.materialize.thumbtack-demand/v1` | 无覆盖本用途的明确授权证据 | `policy-blocked` | zero durable raw/customer/lead/message data、cross-Pro aggregation、semantic/vector index、RAG/training/eval |

任何 capability route 都必须经过：evidence revision → legal principal → app/environment → auth/scope → exact population → purpose/data class → controller/processor role → AI/index/retention/deletion → effect approval。HTTP `GET` 不自动等于低风险，HTTP `POST` 也可能只是计算，但 Request、Message、Job Status 和 webhook configuration 已被明确归入外部效果。

## 5. Access Methods

### 5.1 `thumbtack-partner-platform-v4/v1`

- 当前官方 Overview 把 Marketplace integrations 和 Pro integrations 明确分开；API calls 将 Pros 称为 Businesses；
- Marketplace surface 覆盖 Find Pros、Categories、autocomplete、Requests、Reviews、User Accounts 和 on-demand order/booking related flows；
- Pro surface 覆盖 authorized Businesses 的 Negotiations、Messages、Profiles、Reviews、business phone numbers 与 job status；
- 接入是 partner-restricted，不存在当前可直接匿名调用的 public demand API；本设计没有提交申请或创建 credential；
- 当前文档中的 `/api/v4/...` 是候选 contract；在官方 API reference/export schema 未固定前，不使用第三方转录 OpenAPI 代替正式 schema。

### 5.2 `thumbtack-pro-oauth-and-staging/v1`

- official testing 文档提供独立 staging Partner environment；测试 credential 由 Account Manager 提供；
- staging 流程可以创建测试 customer/Pro、走 OAuth、注册 webhook、提交测试 request、接收 `NegotiationCreatedV4`、读取 lead、发送 message 并接收 `MessageCreatedV4`；
- staging 能验证 auth/schema/order/idempotency，但不能证明 production approval、market coverage、历史 coverage、durable data rights 或真实 Probe 合法性；
- test card、synthetic identity、测试 phone 和 event namespace 必须与 production 严格隔离。本轮未连接 staging。

### 5.3 `thumbtack-self-serve-pro-webhooks/v1`

- Professional 可在 UI 中为一个 Business 配置 negotiation/message/review events，不需要 OAuth integration；
- API/OAuth integration 可服务多个 Pros，并可与 self-serve webhook 同时运行；同一业务事件因此可能从两条订阅路径到达；
- UI create/edit/pause/delete subscription 是外部配置变化，不能由研究 Agent 自动执行；
- official testing 页面展示 Basic auth 配置，但本轮未找到足以固定签名/HMAC、retry、delivery ID 与 replay 的完整 current contract，因此保持 `webhook-auth-retry-gap`。

### 5.4 `thumbtack-legacy-pro-api/v1`

旧官方 Pro API reference 位于独立域名，描述 Supply Partner 的 lead transfer 和 two-way messaging，并包含 OAuth2、test/production client、messages/availability/bookings/targeting scopes，以及旧 v1/v2/v3 lead/message/review payload。它可作为历史概念和 migration evidence，不能替代当前 Partner Platform v4：

- old lead type、lead price/charge state 和 webhook payload 只按 exact version 建模；
- old auth code/access/refresh token TTL 只绑定 legacy surface；
- legacy push-to-partner 与 current Business-scoped v4 pull/webhook 不自动等价；
- current/legacy 字段冲突必须 fail closed，不能由名称相似自动映射。

### 5.5 manual / browser / MCP

用户在 consumer web 中看到的 Business、Review 或搜索结果不构成允许自动采集、长期保存或 AI 分析的 route。浏览器、SSR、cookie、匿名 GraphQL 和第三方代理不会在官方 access 失败时自动启用。

当前未发现 Thumbtack 官方 Partner API SDK、MCP Server 或 Agent Skill。官方 GitHub organization 的一般工程项目不证明存在官方 connector。社区 MCP/Skill 的能力只能作为供应链反例，不参与可调用路由。

## 6. Platform Skills

### `thumbtack-pack-research/v1`

- 固定 official overview、Marketplace/Pro docs、API Terms、testing、自助 webhook、legacy reference、press announcement 与 OSS evidence revision；
- 输出 surface、authority population、concept/capability revision、rights decision、expiry、conflict 与 drift trigger；
- 禁止申请 access、接受协议、创建 app/credential、连接 staging/production或安装社区代码。

### `thumbtack-partner-access-resolution/v1`

- 输入必须包含 legal principal、partner agreement/app、Marketplace或Pro surface、Business/customer authority、environment、OAuth/scopes、approved purpose、data classes、controller/processor角色、external LLM/AI、storage/index/derivative、retention/deletion与费用；
- 输出 exact PortBinding 或 `partner-contract-missing` / `policy-blocked`；
- 不允许由 API 可访问性推断跨 Business、跨 customer、production、historic coverage 或 durable rights。

### `thumbtack-marketplace-pro-discovery/v1`

- 只接受当前用户明确提出的真实 service/location/project context；
- 区分 category recommendation、request-form、Search context 和 Business placement；
- filtered search 必须先说明 Thumbtack 会用 LLM 处理 query/project metadata，并移除身份、联系方式、健康/财务等非必要内容；
- 结果只用于当前用户选择 Pro，不落 durable demand warehouse，不自动创建 Request。

### `thumbtack-owned-lead-research/v1`

- 只读取 exact authorized Business 的 Negotiation/Message/Review；
- RequestRef 可用时用于 dedupe，一个 Request 的多个 Business Negotiations 不计为多个客户需求；
- message body、customer identity/contact、address、attachment、phone和invoice amount默认与模型、日志、指标、通用索引隔离；
- list coverage 在官方 conformance 前标记 `unknown-history`，webhook只声明delivery window。

### `thumbtack-truthful-project-request-probe/v1`

- 输入：真实 customer、真实 service need/location/time/details、当前找 Pro 的明确意图、可履约预算、customer consent、人工 owner 与撤回/沟通方案；
- preview 必须显示被联系的 Business 数量/selection、可能的 Pro lead/contact charge、将发送的数据、通知与无法完全撤回的效果；
- block：ghost/fake project、虚假身份/地址/电话、为了测试市场而向 Pros 制造付费 Lead、重复/spam Request、无意聘用、诱导站外绕费、自动 Message/Review/Job Status；
- 每个 create/send/status operation 独立 approval、idempotency intent、receipt 和 reconcile；本轮无执行 route。

### `thumbtack-staging-conformance/v1`

- 未来只在正式获批 staging principal 下运行 synthetic fixture；
- 验证 OAuth、Business binding、Request→Negotiation、message/webhook乱序、dual subscription dedupe、lead price update、job-status effect 和 deletion workflow；
- staging pass 不提升 production、history、coverage、rights 或 durable research maturity。

这些是本系统拟定义的 Skill contract，不是已安装能力，也不是 Thumbtack 官方发布的 Agent Skills。

## 7. 数据、推断与 Probe 边界

- Categories API 的 popular、homecare average cost 与 activeServices 是 Thumbtack 计算/策展结果；它们可成为版本化平台知识，但不是原始客户需求数量。
- Search 是供给 discovery；`searchID` 只固定一次短期 query context。结果数量、排序、starting quote、rating、hires 与 response 指标不能拼成长期市场需求人口。
- filtered search 对 free-form query/project metadata 使用 Thumbtack LLM；这是外部模型处理，需要独立 disclosure/consent，而非“普通搜索”默认包含的内部细节。
- Request create 是真实平台写入。它可为多个相关 Pros 生成 Lead，造成通知、业务机会和潜在费用，不能用于无意购买服务的 demand probe。
- Negotiation 是 Business-scoped lead relationship。没有 RequestRef 时也不能假定每个 Negotiation 都是独立客户需求；dedupe policy需按 provider schema和证据执行。
- 官方 current docs 提供 Business lead list/get，但未固定历史回填起点、完整性或窗口；因此既不写 `all-history`，也不沿用旧社区说明硬写 `forward-only`。
- Message webhook 可先于 Negotiation webhook；Lead Description Message 可能复制 Negotiation description，Quick Reply 是自动系统响应。处理器必须接受 dangling ref、后补父记录和可审计去重。
- legacy lead price 可能在 Lead 后异步产生 update；`leadPrice`/`chargeState` 是 Lead access fee，不是 customer quote、invoice amount、payment 或 platform GMV。
- Job Status POST 是 partner 对 platform 的写入。`partnerStatusChangedAt` 是实际外部业务状态转变时间，不是 API 调用时间；写入会更新 Messenger labels 和 Performance Dashboard hires。
- `invoiceAmountInCents` 是 invoice claim；只有独立 payment evidence 才能建立 payment-for-invoice，不能因为 `invoice_paid` label 反推金额、结算或不可逆成功。
- Review `verified` 只表示 review 对应平台 lead；不证明完成、付款、无 refund/dispute或质量成功。
- API Data/非公开资料需按 Professional controller 与 API CRM processor/agent 角色处理；停止 API 使用或 Thumbtack为合法合规提出要求时，适用数据应尽快且至迟五个工作日删除。每个 materialization 必须能定位 owner、purpose、deletion class 与 receipt。
- 在用途权明确前，真实 API Data 不进入 Observation、SourceItem、EvidenceSpan、Dolt、分析数仓、全文/semantic/vector index、RAG、training、evaluation或通用 Agent prompt。

## 8. 官方与开源证据审计

以下只通过官方网页、GitHub API 与固定 revision raw 文件只读核验；未 clone、安装、构建或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [Thumbtack Partner Platform docs](https://developers.thumbtack.com/docs/overview) 与 current API Terms | Thumbtack 官方 | Marketplace/Pro surfaces、v4 endpoint、testing、data role/retention与effect语义的 canonical evidence candidate | `canonical-contract-candidate`；仍需 partner agreement、reference schema与conformance，不产生route |
| [Thumbtack GitHub organization](https://github.com/thumbtack) | Thumbtack 官方；repo-specific | 官方 ownership 发现入口 | `no-current-partner-sdk-mcp-skill-found`；通用工程 repo 不冒充 Partner connector |
| [chrischall/thumbtack-mcp](https://github.com/chrischall/thumbtack-mcp) HEAD `f8246e808ac914e383d447825bbf7487707f13d8` | community；README/manifest称MIT，但固定revision无LICENSE文件 | search/profile/review/GraphQL tool和Agent Skill风险样本 | `rejected-as-connector-and-skill`；README自称unofficial并承认可能违反ToS，依赖consumer SSR/anonymous GraphQL，含任意GraphQL逃生口和过宽identity/review数据 |
| [markswendsen-code/mcp-thumbtack](https://github.com/markswendsen-code/mcp-thumbtack) HEAD `b9686b69066ba9894d3290b28dae43841a638ec3` | community；package称MIT，固定revision无LICENSE/README | browser automation风险样本 | `rejected-as-connector`；Playwright、来源/发布信息不足、schema和session drift高 |
| [api-evangelist/thumbtack](https://github.com/api-evangelist/thumbtack) HEAD `e34fa89f65861fd8cdb4374141f75d370c0cb3ec` | independent；固定revision无LICENSE | 第三方文档索引和部分machine-readable转录 | `evidence-index-only`；README承认非Thumbtack且路径可能是建模结果，不能作canonical OpenAPI/schema |
| [lulzasaur9192/marketplace-search-mcp](https://github.com/lulzasaur9192/marketplace-search-mcp) HEAD `bcff36a41a5227686a03207f470659f94626e813` | community；无license | generic marketplace/Thumbtack tool风险样本 | `rejected`；无正式授权依据、提交依赖/构建产物、供应链和surface边界不清 |
| [McDonnies/thumbtack-proxy-public](https://github.com/McDonnies/thumbtack-proxy-public) HEAD `caf58c872d1a86e3c2ae32e96d60637a640975bd` | community；MIT | token/proxy架构风险样本 | `rejected-as-trust-boundary`；引入非官方credential broker/proxy，无必要且不授予API用途或平台授权 |

第三方代码许可证只约束其代码，不授予 Thumbtack API、consumer website、客户数据、Business 数据、商标、自动化、AI、storage或derivative use。维护活跃度也不能越过官方 access 与用途门。

## 9. Verification Plan

### evidence-review

- 固定 overview、Find Pros、Categories、Requests、Negotiations、Messages、self-serve webhooks、testing、API Terms 和 legacy reference 的 updatedAt/hash/observedAt；
- 获得 partner 文档后固定 legal principal、app、surface、environment、OAuth/scope、Business/customer authority、data fields、LLM processing、pricing、webhook auth/retry、AI/index/storage/retention/deletion；
- 固定 OSS owner/revision/tag/license/docs/auth/session/effects/escape hatch，不安装执行。

### static-contract

- Marketplace 与 Pro、current v4 与 legacy Pro API、staging 与 production 不合并；
- Category、request form、Search context、Business placement、Project Request、Negotiation、Message、Job Status、Invoice、Payment与Review不互换；
- Request→多个Negotiation不增加独立client demand count；
- Business授权不能扩大为跨Business或market-wide；unknown history不能变为complete或forward-only；
- filtered search在network前检查external-LLM disclosure/consent；
- Request、Message、Job Status与webhook config均需effect approval；
- community SSR/GraphQL/browser/proxy/MCP/Skill 不得作为fallback；
- data-use/deletion gate发生在credential/network/binding/persistence/AI之前。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| category recommendation with popularity/cost | provider-derived taxonomy/metric，不生成raw demand Observation |
| request form schema revision | question/answer绑定exact form revision，旧答案不能静默套新schema |
| business search → expiring searchID | Search context、query/filter/location/observedAt齐备；过期后placement不可当current coverage |
| filtered free-form search | external LLM disclosure/consent为真才可route；敏感free text在network前阻断 |
| search results only | Business placement是supply，不创建Request/Lead或需求计数 |
| one Request → three Negotiations | 一个client demand、三个provider-scoped relationships；不四重计数 |
| Request timeout | state unknown；按request/search/customer idempotency evidence reconcile，禁止盲重发 |
| business list/get with no history contract | coverage=`unknown-history`；不声称all-history/forward-only |
| Message webhook before Negotiation | 接受dangling parent并后补，不丢失或伪造parent |
| Lead Description + Quick Reply | 标注provider system/duplicate semantics；去重不删除原始审计evidence |
| self-serve + OAuth duplicate webhook | exact event/business/revision幂等，两个delivery receipt都保留 |
| lead created then price update | 同一Negotiation revision链；lead fee不变成quote/invoice/payment |
| `chargeState=Charged` + leadPrice | 映射`lead-access-fee`，不推断customer paid/hired |
| job status with partnerStatusChangedAt | external transition time与API call/observedAt分离；记录平台下游effect |
| invoice amount + `invoice_paid` | invoice claim与payment relation分开；缺少payment evidence不生成精确结算 |
| customer/pro cancellation | actor与cancellation reason/status分开，不当refund或失败质量结论 |
| verified review | 只建立review-for-lead/contract候选，不证明completion/payment/satisfaction |
| legacy/current same field name conflict | version-aware mapping或fail closed，不自动合并 |
| API cessation/deletion request | 适用API Data在五个工作日上限内删除，生成scope/count/receipt且清理派生索引 |
| blocked durable route | zero raw payload、warehouse row、Dolt commit、index/vector/RAG/eval residue |

### sandbox-live（未来，当前不执行）

- 仅在正式 staging credential、Account Manager 文档和批准测试主体下运行；
- 创建独立测试 customer/Pro，验证 OAuth、webhook、Request→Negotiation、GET、Message round-trip 和 job-status effect；
- 只使用官方测试标识/card/phone，禁止混入 production customer或真实Pros；
- 所有 effect 必须有 idempotency、receipt、timeout reconcile 和 teardown；
- sandbox pass 不自动提升 production、durable rights 或market coverage。

### operational-canary（未来，当前不执行）

- 只在 production partner approval、真实用户任务和逐效果批准后小流量启用；
- 先 read-only owned Business，再按需开放 user-directed Business search；Request/Message/Job Status/webhook config分别升级；
- 监测 auth/scope、schema、search expiry、coverage、webhook lag/duplicate/out-of-order、lead charge、external LLM consent、effect receipt、deletion SLA 和 rights drift；
- schema/policy/terms/partner principal/Business binding改变时自动 degrade 到 evidence-review 或 no-route。

## 10. Observability Contract

允许进入通用 metrics/log 的低基数字段：

```text
pack_ref
surface_ref
contract_revision
environment_class
authority_class
capability_ref
verification_level
coverage_class
rights_decision
external_llm_disclosure_state
effect_class
webhook_path_class
schema_outcome
policy_outcome
reconcile_outcome
deletion_sla_outcome
```

专用 audit/trace（受限访问、retention-bound）还需：evidence snapshot、partner/app/Business/customer opaque refs、OAuth scope、searchID expiry、query/category/request-form refs、Request/Negotiation/Message/event revision、webhook delivery path、lead charge role、job-status effectiveAt、approval/receipt/reconcile 和 deletion receipt。

禁止放入普通 telemetry label/log：customer/Pro姓名、电话、email、地址、message/query/description正文、附件、OAuth/token/basic-auth、Business/Profile URL、Request/Negotiation ID、invoice amount或原始 webhook payload。指标不得用 `success` 同时表达 HTTP成功、Request创建、Pro hired、job complete、invoice paid和customer满意。

关键 SLO/alert：

- docs/terms/schema revision age 与 unresolved contract gap；
- Search context expiry misuse、unknown-history被错误提升、Request/Negotiation dedupe冲突；
- filtered search disclosure/consent block率与敏感字段阻断；
- webhook auth gap、duplicate、out-of-order、orphan parent、pull reconcile mismatch；
- Request/Message/Job Status timeout unresolved、lead charge surprise、downstream status drift；
- controller/processor purpose drift、retention expiry、API cessation/request deletion五工作日SLA；
- private GraphQL/browser/cookie/community MCP/proxy route attempt 必须产生 negative-path audit。

## 11. 发布与退化条件

本 Pack 当前只能发布为：

```text
research state            researched
route state               no-route
marketplace discovery     partner-restricted / disabled
pro-owned read            partner-restricted / disabled
external writes           disabled
durable research          policy-blocked
official SDK/MCP/Skill     not found
```

未来 capability 只有在 exact partner contract、principal、surface、environment、auth/scope、population、purpose、data role、AI/index/storage/retention/deletion与conformance全部通过时独立升级。任一证据过期、terms/schema变化、Business授权撤销、history/coverage未知被误用、webhook auth失效、删除SLA失败或未授权route尝试，立即退化相应 capability；不得以consumer web、private GraphQL、browser、proxy或community MCP补位。

## 12. 主要官方证据

- [Partner Platform Overview](https://developers.thumbtack.com/docs/overview)
- [Marketplace Find Pros](https://developers.thumbtack.com/docs/marketplace/businesses-search)
- [Marketplace Categories](https://developers.thumbtack.com/docs/marketplace/categories)
- [Marketplace Requests](https://developers.thumbtack.com/docs/marketplace/requests)
- [Pro Leads / Negotiations](https://developers.thumbtack.com/docs/pro-integrations/negotiations)
- [Pro Messages](https://developers.thumbtack.com/docs/pro-integrations/messages)
- [Message troubleshooting](https://developers.thumbtack.com/docs/marketplace/messages/troubleshooting)
- [Self-serve webhooks](https://developers.thumbtack.com/docs/pro-integrations/self-serve-webhooks)
- [Pro integration testing](https://developers.thumbtack.com/docs/pro-integrations/testing)
- [API Terms](https://developers.thumbtack.com/docs/terms)
- [Legacy Pro API reference](https://pro-api.thumbtack.com/docs/)
- [Official Pro API launch announcement](https://press.thumbtack.com/announcements/thumbtack-launches-new-pro-api-to-help-service-professionals-grow-sustainably/)
- [Official OpenAI partnership announcement](https://press.thumbtack.com/announcements/thumbtack-partners-with-openai-to-power-home-services-in-chatgpt/)

OpenAI partnership announcement 只证明 Thumbtack 在特定合作中用现有 API 支持用户找、联系和雇佣 Pro；它不授予任意第三方通用 AI、跨 Business 数据聚合、长期索引或模型用途权。
