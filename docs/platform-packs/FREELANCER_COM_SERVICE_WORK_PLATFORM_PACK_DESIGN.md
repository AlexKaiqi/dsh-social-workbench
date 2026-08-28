# Freelancer.com Service Work Platform Pack 设计样本

状态：`researched` 设计候选；未注册应用、未生成token、未登录sandbox/production、未采集、未发布、未投标或付款  
核验日期：2026-08-26  
目标：固定 Freelancer.com 的Project/Contest、Bid/Award、Milestone和服务交易概念，分离“API可自动化”“已获书面许可”“允许缓存”“允许长期需求研究”四类事实。

## 1. Pack 摘要

```text
pack ref             freelancer-com-service-work-demand/v0-design
platform             freelancer-com-marketplace
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

Freelancer.com 当前官方开发者门户提供 REST API `0.1`、OAuth2、Python/Android SDK和独立sandbox，并明确宣传project、contest、bid、message、milestone等自动化能力。但当前User Agreement第33节同时要求：通过API进行任何robot/spider/scraper或其他自动访问，必须取得Freelancer的明确书面许可。API Terms允许的缓存只为性能目的，要求至少每24小时刷新，并原则上禁止复制、保存Data或保存其hash/transform等表达；终止时还要求删除API Data。

因此“公开endpoint”“OAuth token”“sandbox成功”和“书面自动访问许可”不能互换；即使取得自动访问许可，也仍需获得覆盖长期保存、聚合、索引、AI分析和跨平台研究的精确书面例外。当前所有production和sandbox route均为`no-binding`，durable demand research为`policy-blocked`。

## 2. 主体、用途与authority population

| Profile | 目的 | 当前决定 |
| --- | --- | --- |
| `public-project-discovery` | 搜索公开active/all projects | `policy-blocked`；缺明确书面自动访问许可，且长期保存与派生用途未获准 |
| `buyer-owned-workflow` | 读取/管理本人Project、Bid、Milestone | `deferred-restricted`；OAuth不替代书面许可、用途与storage exception |
| `seller-owned-workflow` | 搜索Project、提交Bid、管理履约 | read为`deferred-restricted`；所有bid/message/payment effect默认拒绝 |
| `sandbox-protocol-conformance` | 合成账号验证OAuth/API映射 | `sandbox-candidate`；需用户另行授权、注册sandbox应用和平台许可核对 |
| `durable-demand-research` | Observation、warehouse、index、跨平台机会分析 | `policy-blocked`；API Terms当前不提供足够存储依据 |
| `enterprise-workforce-automation` | 企业按需采购与履约 | `written-commercial-scope-required`；不能从landing page宣传推断授权 |

Buyer/Seller账号、OAuth client、access token、sandbox principal、production principal与企业合同是不同authority。任何route resolution必须同时固定principal、environment、approved application、书面许可、purpose和data-handling例外。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `freelancer.user/v1` | restricted principal | user ID + role context | 同一User可为Buyer和Seller；不得跨平台解析真实身份 |
| `freelancer.project/v1` | buyer-authored mutable request | project ID + observed revision | fixed/hourly/local/hire-me等工作请求；title/description/skills/budget是发布主张 |
| `freelancer.project-placement/v1` | query observation | environment + query/filter/order + project + observedAt | `active/all`与筛选结果；不证明完整市场或持续hire |
| `freelancer.job-skill/v1` | provider taxonomy | job/skill ID + taxonomy revision | 平台把skills称为jobs；不能与Project/job request混淆 |
| `freelancer.bid/v1` | seller response | project + bid ID + revision | amount、period、description与proposed milestones；不是award或contract |
| `freelancer.project-award/v1` | agreement proposal | project + bid + award state | Buyer award后仍需Seller accept；award与accept分别产生效果 |
| `freelancer.user-contract/v1` | agreement | accepted project terms + parties | User Agreement把awarded-and-accepted Project terms纳入User Contract |
| `freelancer.milestone-request/v1` | payment request | project/bid + request ID | Seller请求Buyer创建/释放；request不等于funded payment |
| `freelancer.milestone-payment/v1` | funded/released value unit | project + milestone ID + revision | requested、funded、release-requested、cancel-requested、released、cancelled、disputed等状态不可合并 |
| `freelancer.hourly-time-billing/v1` | activity/billing | hourly project + billing period/entry | tracked hours、automatic milestone、invoice与paid状态分开 |
| `freelancer.message-thread/v1` | restricted communication | thread/message revision | 可能包含协商、身份、附件；默认不进入需求研究 |
| `freelancer.contest/v1` | buyer-authored crowdsourcing request | contest ID + revision | prize型请求；与fixed/hourly Project不同 |
| `freelancer.contest-entry/v1` | seller-authored delivery candidate | contest + entry ID/revision | entry不是Bid，也不是Buyer需求复现 |
| `freelancer.contest-award/v1` | selection/economic event | contest + entry + award revision | 可多winner；award后进入handover，不能直接等同付款完成 |
| `freelancer.contest-handover/v1` | delivery/IP transfer phase | award + handover revision | 与entry提交、award、prize settlement分别解释 |
| `freelancer.review-feedback/v1` | restricted authored outcome | project/party + review revision | 官方Terms限制feedback用途；不得导出做人才画像或自动评分 |
| `freelancer.service-offer/v1` | seller-authored supply | service/listing ID + revision | 预定义seller service属于`MarketplaceOffer*`，不是client `ServiceRequest*` |

主要关系：

```text
buyer ── publishes ──> project ── receives ──> bid
project + selected bid ── award ──> seller acceptance ──> user contract
contract ── contains/receives ──> milestone request / milestone payment
hourly contract ── records ──> time/billing ──> milestone/invoice/payment
buyer ── publishes ──> contest ── receives ──> entry
entry ── selected-as ──> contest award ── proceeds-to ──> handover/payment
contract/payment ── may-have ──> dispute / feedback
```

## 4. Capability 与 adoption decision

| Capability | 官方面 | Adoption | 设计边界 |
| --- | --- | --- | --- |
| `discovery.search.service-work-requests/v1` | REST active/all project search | `policy-blocked` | 书面自动访问许可与storage/derivative用途例外缺失；不得network/bind |
| `content.read.service-work-request/v1` | REST project detail | `policy-blocked` | 公开可见不等于可复制/保存；manual/HTML不得绕过 |
| `taxonomy.read.service-skills/v1` | REST jobs/skills | `deferred-reference` | taxonomy revision/locale/coverage未固定，不形成生产route |
| `engagement.read.owned-service-responses/v1` | bids/messages/milestones API | `rejected-default` | 包含竞争者、协商和财务数据，超出需求研究最小字段 |
| `account.service-request.create-update/v1` | project/contest create | `deferred-high-impact` | 只允许真实hire/pay工作；Project和Contest分开 |
| `account.service-response.bid/v1` | place/retract/highlight bid | `rejected-default` | 会通知Buyer、消耗配额/费用并影响市场；不自动投递 |
| `account.service-award.accept/v1` | award/revoke/accept bid | `rejected-binding` | award与accept改变User Contract；Agent不得自主选择或接受 |
| `account.message.send/v1` | thread/message API | `rejected-default` | 不因MCP显示tool call就视为有效业务批准 |
| `account.milestone.request/v1` | milestone request API | `rejected-financial` | request也会通知并改变支付工作流 |
| `account.milestone.create-release-cancel/v1` | milestone payment API | `rejected-financial` | create/fund/release/cancel/request-release分别建模；generic execute/cancel禁止 |
| `account.contest.entry-award-handover/v1` | contest workflow | `rejected-binding-financial` | entry、award、handover和prize settlement不可合并 |
| `account.feedback.write/v1` | reviews API | `rejected` | 会永久改变声誉；官方限制feedback外部用途 |

Policy decision位于credential读取、OAuth/sandbox注册、network、PortBinding、Observation、candidate extraction和materialization之前。公开网页、用户手工复制、official/community SDK、MCP、Apify scraper或“只存embedding/hash”都不能绕过API Terms。

## 5. Access Methods

### 5.1 `freelancer-rest-api-0.1/v1`

- official REST API，资源域包含projects、bids、milestones、milestone requests、messages、users、contests与reviews；
- OAuth2 client/token；官方SDK也支持直接access token；production和sandbox host必须分区；
- 当前developer portal asset `main.fe069412.js`仍展示`/api/projects/0.1/...`等路径，但没有在本轮获得可版本化下载的OpenAPI/schema artifact；asset名只作observed surface evidence，不等于正式schema revision；
- 没有找到可固定的当前公开rate-limit、pagination完整性或webhook delivery contract，均保留为conformance gap；
- current decision：能力/schema evidence，所有route `no-binding`。

### 5.2 `freelancer-official-sandbox-0.1/v1`

官方门户与OAuth demo证明存在`freelancer-sandbox.com`/`accounts.freelancer-sandbox.com`，可测试而不触碰production data。sandbox只提升协议和effect-mapping证据：

- 不证明production权限、数据权利、真实市场coverage或operational readiness；
- 不允许用虚假production project测试；sandbox synthetic entities必须与production namespace隔离；
- 注册sandbox应用、创建账号、OAuth或API调用仍需用户另行授权，本轮未执行。

### 5.3 manual / browser / unofficial MCP

当前没有安全的manual fallback。User Agreement对网页复制/衍生内容和自动访问另有限制，API storage restriction也不能通过导出成CSV、hash、embedding或MCP对话规避。manual只可用于用户本人提供且有独立权利的自有原始brief，不可宣称为Freelancer Observation。

未找到Freelancer.com官方Marketplace MCP或官方Agent Skill。`freelancer/phabricator-mcp`属于该公司的Phabricator工具，与Freelancer marketplace API无关，不能列为接入候选。

## 6. Platform Skills

### `freelancer-com-pack-research/v1`

- 固定User Agreement、API Terms、developer portal/API version、support semantics和OSS revisions；
- 输出KnowledgeProposal、permission/storage decision、expiry与drift trigger；
- 禁止接受Terms、注册应用、生成token、访问sandbox/production或执行SDK。

### `freelancer-com-permission-first-resolution/v1`

- 输入必须包含Freelancer明确书面自动访问许可、approved application/environment、principal、purpose、允许对象/字段、缓存/存储/派生/AI用途、retention/deletion与expiry；
- 任一缺失即在credential/network/PortBinding前返回`policy-blocked`；
- OAuth成功、公开endpoint、sandbox成功或企业营销页面不能补全缺失许可。

### `freelancer-com-truthful-project-probe/v1`

- 输入：真实client问题、可交付scope、实际hire/pay意图、合法内容、budget/prize、deadline、acceptance标准和人工owner；
- 首阶段只生成本地preview、policy findings、manual handoff草稿和receipt/reconcile计划；
- block：ghost/fake/inaccurate project、广告/spam、free work、违法/侵权、虚假身份、站外导流、操纵feedback/engagement、不可履约；
- project、contest、invite、bid、message、award、accept、milestone、release、handover和review逐effect审批。

### `freelancer-com-conformance/v1`

- 默认只用本地合成fixtures，无OAuth、无账号、无网络；
- 验证Project/Contest分层、Bid/Award/Accept、Milestone Request/Payment、金额role、policy-before-binding、zero durable storage/index和negative writes；
- sandbox-live仅在新的书面范围与用户批准后验证最小协议，不产生production maturity。

以上是本系统拟定义的Skill contract，不是已安装或平台官方发布的Agent Skill。

## 7. 数据、推断与 Probe 边界

- Project title/description/skills/budget首先是Buyer主张；active/visible不证明当前仍准备award；
- Bid是Seller response；bid count、average bid、sealed/omitted bid不能变成独立需求数、市场规模或成功概率；
- advertised budget、bid amount、winning bid、User Contract term、funded/released milestone、hourly billed value、invoice和payment分别建模；
- award不等于Seller accept，accept不等于delivery，Milestone Request不等于funded，funded不等于released；
- Contest Entry是供方交付候选，不是需求；award、handover和prize payment仍需exact relation；
- feedback仅可按官方允许用途处理，不进入跨平台人才画像、ranking、训练或营销；
- 当前任何Freelancer Data不得写入Observation/SourceItem/EvidenceSpan、Dolt snapshot、分析数仓、lexical/semantic/vector index、RAG或模型评测；
- production Probe会消耗Seller注意力并可能引发Bid、award、合同与费用，只能为真实采购目的，不能把ghost project当标题/预算实验。

## 8. 固定官方 SDK、OAuth、MCP 与开源证据

以下revision仅通过官方页面、raw文件与`git ls-remote`只读核验；未clone、下载release、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [freelancer/freelancer-sdk-python](https://github.com/freelancer/freelancer-sdk-python) tag `0.1.20` / `e09034936d6f13b3909a9464ee329c81c1834941`；observed HEAD `17b8969d7480f3b9ea38d32e499e6c9bb3dd28b8` | Freelancer官方；LGPL-3.0，仓库同时含GPL文本 | API 0.1 resource/operation和sandbox host参考 | `reference-only`；latest release为2019，setup仍声明Python 2.7/3.6并含文档主题依赖；不作为当前schema或生产adapter |
| [freelancer/freelancer-oauth-demo-app](https://github.com/freelancer/freelancer-oauth-demo-app) `c75f80390808056c9b7c9b69477dcef3e37643f0` | Freelancer官方；LGPL-3.0/GPL文本 | sandbox OAuth client registration与redirect流程证据 | `evidence-only`；示例要求本地配置client secret，不复用、不运行 |
| [freelancer/freelancer-sdk-android](https://github.com/freelancer/freelancer-sdk-android) `fee572ea763a04dbb041d897bc69a2f04e275dab` | Freelancer官方；LGPL-3.0 | OAuth/JSON model与移动端surface参考 | `reference-only`；README仍依赖已退役JCenter与`compile`配置，不能证明当前server contract |
| [godesigntech/freelancer-mcp-server](https://github.com/godesigntech/freelancer-mcp-server) `0cb241848f0c2f3ad8d95b3fc06cf95854321b28`，package `2.0.0`，无tag | community；MIT | 多账号、project/bid/message/milestone/profile tool taxonomy与Agent风险样本 | `rejected-as-connector`；token面过宽，含bid/message/profile writes和自主项目评分；客户端显示tool call不等于业务approval或平台书面许可 |
| [Apify Freelancer.com Scraper MCP](https://apify.com/unfenced-group/freelancercom-scraper/api/mcp) | 第三方托管scraper；本轮未固定可审计源码revision/license | scraping/MCP fallback风险样本 | `rejected`；非官方自动访问且无书面许可/storage basis，不能进入供应链候选 |

代码许可证只约束代码，不授予Freelancer Data、feedback、账号或平台自动访问权。官方SDK身份也不等于当前维护、安全、least privilege或用途批准。

## 9. Verification Plan

### evidence-review

- 固定User Agreement与API Terms页面hash/observedAt、developer portal bundle/API `0.1`、sandbox、support状态语义和Code of Conduct；
- 固定书面许可主体、application、environment、用途、字段、storage/derivative/AI例外、expiry与终止删除；
- 固定SDK/MCP owner、revision、release age、license、auth/effect与maintenance signal。

### static-contract

- Project、Contest、seller Service offer、Bid、Award、Accept/User Contract、Milestone Request、Milestone Payment、Entry、Handover和Feedback不可互换；
- 无明确书面自动访问许可或storage exception时，network、binding、Observation和materialization全部为零；
- cache只为性能且按官方interval刷新，不能成为append warehouse；termination触发delete propagation；
- sandbox/production principal、host、credential、namespace、receipt和maturity严格隔离；
- community MCP、scraper、HTML、manual、hash/embedding fallback均拒绝；
- read credential不能绑定任何bid/message/award/accept/milestone/review write；
- feedback export、Agent-added freelancer/project ranking和自动selection拒绝。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| fixed/hourly/local/hire-me Project | format/work-arrangement/state分离，budget不变成contract/payment |
| active/closed/cancelled/removed Project | revision保留；不可仅凭消失推断filled |
| Project + seller Service offer | `ServiceRequest*`与`MarketplaceOffer*`不合并 |
| 50 bids，其中sealed/omitted | response coverage unknown/partial；不生成50个需求 |
| bid → award → accept | proposal、selection与User Contract分别形成exact relation |
| milestone request → funded → release requested → released | request、资金保留、通知和支付阶段分开 |
| hourly time → automatic milestone → invoice → payment | hours、billing、invoice、payment不互换 |
| Contest → entries → multi-award → handover | `contest-entry/award/handover`与Project bid链不混用 |
| feedback record | 外部用途policy拒绝，zero identity/profile index |
| no written permission | credential/network/PortBinding/warehouse bytes均为零 |
| permission without storage exception | ephemeral协议候选可独立评估，durable route仍blocked |
| cache refresh / termination | 不把刷新当append history；删除穿透cache/canonical/index |
| sandbox success | 只提升sandbox exact capability，不提升production/coverage/rights |
| timeout on project/bid/milestone write | unknown + reconcile；不得跨route重发 |
| official SDK/community MCP/scraper | resolver不生成research binding，negative counter递增 |

### sandbox-live / operational-canary

只有用户另行授权、Freelancer书面许可与storage/purpose范围可验证、sandbox application完成安全审查后，才可执行一个合成Project的最小sandbox canary。每个write需独立preview/approval/receipt/reconcile和cleanup；不得使用production、真人Seller或真实payment。production operational canary还需单独批准和真实hire/pay目的，当前不执行。

## 10. 可观测性

- knowledge：User Agreement/API Terms hash与observedAt、API `0.1`、portal asset `main.fe069412.js`、SDK age、support semantics、evidence expiry；
- permission：written permission ref、legal principal、application、sandbox/production、purpose、objects/fields、storage/derivative/AI exception与expiry；
- resolution：OAuth principal、token source、host/environment、route/mode、candidate rejection reason和no-fallback；
- data：cache purpose/age/refresh、persistent/canonical/index/vector bytes、termination/deletion watermark和propagation lag；
- coverage：active/all、query/filter/order/offset/limit、sealed/omitted bid、partial/unknown、taxonomy revision与selection bias；
- semantics：Project/Contest/Service、Bid/Award/Accept、Milestone Request/Payment、Entry/Award/Handover和amount-role conflict；
- action：draft/preview/approval/intent/attempt/unknown/reconcile、principal、notification/fee/payment effect和payload hash；
- negative：HTML/scraper/MCP/SDK fallback、multi-account confusion、feedback export、Agent ranking/selection、unapproved write和production/sandbox crossover；
- security/privacy：token age/rotation、secret exposure、message/profile/location/payment quarantine、incident notice与deletion readiness。

高基数user/project/bid/message ID、URL、正文、token和金额不能进入通用metrics label，只在受控审计中使用opaque ref。

## 11. 当前结论

1. Freelancer.com与Upwork共享足够稳定的`ServiceRequest*`/`ServiceEngagement*`概念，但接入许可必须成员独立。
2. 官方API和sandbox使其比无API平台更适合做协议conformance；现行书面许可与storage条款仍阻断本系统的长期需求研究。
3. 官方Python SDK可作API 0.1历史schema/effect参考，不能证明2026生产contract；community MCP与scraper不采用。
4. Contest要求核心抽象新增entry/award/handover，Milestone Request必须独立于funded/released payment。
5. 当前发布`researched/no-route` Pack；不注册应用、不连接sandbox、不运行SDK/MCP、不产生平台副作用。

## 12. 官方证据

- [Freelancer API Developer Portal](https://developers.freelancer.com/)
- [Freelancer API Terms and Conditions](https://www.freelancer.com/about/apiterms)
- [Freelancer User Agreement](https://www.freelancer.com/about/terms)
- [Freelancer Code of Conduct](https://www.freelancer.com/info/codeofconduct)
- [Fixed-price vs hourly projects](https://www.freelancer.com/support/Project/fixed-price-vs-hourly-projects)
- [Milestone Payment Statuses](https://www.freelancer.com/support/payments/milestone-payment-status)
- [Paying my freelancer](https://www.freelancer.com/support/freelancer/payments/how-do-i-pay-the-freelancer)
- [Giving project reviews / feedback](https://www.freelancer.com/support/project/feedback-option)
- [Awarding contests](https://www.freelancer.com/support/Contest/awarding-the-contest-prize)
- [Projects violating Terms](https://www.freelancer.com/support/employer/Project/projects-violating-our-terms-and-conditions)
