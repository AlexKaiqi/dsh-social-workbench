# Upwork Service Work Platform Pack 设计样本

状态：`researched` 设计候选；未连接官方 MCP、未申请 API key、未登录、未采集、未发布或提交  
核验日期：2026-08-26  
目标：区分即时用户指向的工作流、长期需求研究、服务请求、响应、合同结果和 Agent 外部动作，并把 Upwork API & MCP Terms v2.3 转成可验证的采用边界。

## 1. Pack 摘要

```text
pack ref             upwork-service-work-demand/v0-design
platform             upwork-marketplace
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

Upwork 同时提供 GraphQL/REST API、官方 hosted MCP、ChatGPT/Claude 集成和完整的服务交易链，但这些能力不等于允许建立自由职业需求数仓。2026-08-13 生效的 API & MCP Terms v2.3 只允许具体、已记录、用户指向的任务；明确禁止 bulk/systematic enumeration或持续监控，并保留对aggregation、derivative dataset、embedding、vector index、training corpus和model artifact的权利。AI训练、fine-tune、RAG、evaluation与benchmark还需单独书面training license。

因此本 Pack 发布两个相反但兼容的知识结论：

- 官方 MCP/API 可作为用户本人即时完成 Upwork 工作流的候选 access method；
- 本系统的长期需求采集、索引、跨平台分析和Agent候选评分在取得精确书面许可前为 `blocked-before-binding`。

当前不建立任何 ConnectorInstance。官方 MCP 现阶段授权完整scope集合，包含消息、附件、proposal、合同和财务相关读取/动作，不能直接成为需求研究的最小权限 route。

## 2. 平台、主体与用途边界

| Profile | 目的 | 当前决定 |
| --- | --- | --- |
| `freelancer-user-directed` | 本人搜索具体工作、查看邀请、准备proposal | `ephemeral-user-directed-candidate`；必须用户给定criteria/object，禁止系统持续监控或自主评分 |
| `client-user-directed` | 本人准备真实job post、查看proposal、管理已有contract | read/draft为`ephemeral-user-directed-candidate`；每个write独立审批 |
| `agency-user-directed` | agency team范围内的本人工作流 | `deferred-restricted`；团队、成员、收益和消息不得进入需求仓库 |
| `durable-demand-research` | 保存job posts、建立索引、跨平台聚合与机会挖掘 | `policy-blocked`；需Upwork精确书面许可和适用的数据/AI许可 |
| `commercial-developer-app` | 向第三方提供产品 | `partner-written-permission-required` |

API key、OAuth principal、company/team context与MCP account authorization不能互换。普通API key资格、商业partner许可、研究/聚合许可、AI training license和某个用户的OAuth consent是五个独立事实。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `upwork.account/v1` | restricted principal | account + role | freelancer/client/agency context不同；不能跨角色共享authority |
| `upwork.company-team/v1` | restricted scope | company/team ID或reference | API permission相对team/company；ID与reference不是同一字段 |
| `upwork.job-posting/v1` | client-authored mutable entity | marketplace job posting ID + revision | 问题、deliverable、skill、预算和条件；预算是估计且可协商 |
| `upwork.job-posting-placement/v1` | ephemeral observation | query/filter/sort + posting + observedAt | 用户指向search结果；不得持续枚举或长期保存 |
| `upwork.invitation/v1` | restricted engagement | account + invitation ID | client邀请freelancer响应；不是proposal或offer |
| `upwork.proposal/v1` | restricted authored engagement | freelancer/agency scope + proposal ID | freelancer对job的cover letter、rate/bid与terms；消耗Connects时另有经济效果 |
| `upwork.interview-message/v1` | restricted communication | room/thread/message revision | 沟通与协商；完整内容和附件默认禁止进入研究索引 |
| `upwork.offer/v1` | restricted mutable agreement proposal | client + offer ID | scope、rate、milestones；接受后才形成contract |
| `upwork.contract/v1` | restricted agreement | party scope + contract ID | legally/economically significant；fixed-price与hourly不同 |
| `upwork.milestone/v1` | restricted contract unit | contract + milestone ID | fixed-price deliverable、due date、funded/submitted/released状态 |
| `upwork.work-diary/v1` | restricted activity/billing | hourly contract + time period/entry | hourly logged time与billing；不是fixed-price milestone |
| `upwork.transaction/v1` | restricted monetary outcome | account/contract + transaction ID | invoice、charge、release、earnings等role必须分开 |
| `upwork.dispute-refund/v1` | restricted reversal | contract/milestone + case/transaction ID | payment/contract逆转，不自动等同需求不成立 |
| `upwork.feedback/v1` | restricted authored outcome | contract + feedback side/revision | 双方反馈；不得用于自动人才评分或跨平台画像 |
| `upwork.connects-effect/v1` | economic effect | principal + proposal/boost + receipt | proposal提交/boost可能消耗Connects；draft不等于已消耗 |

`Project Catalog` 是seller预定义服务供给，概念上更接近 `MarketplaceOffer*`，不属于本Pack的client-authored `ServiceRequest*`。Talent profile/search也不作为需求来源；尤其不能由Agent独立ranking/scoring后做contract award决策。

主要关系：

```text
client ── publishes ──> job-posting
job-posting ── receives ──> invitation / proposal
proposal or direct selection ── may-lead-to ──> offer
offer ── accepted-as ──> contract
fixed-price contract ── contains ──> milestone ── submitted/released
hourly contract ── records ──> work-diary ── billed
contract/milestone/time ── settles-through ──> transaction
transaction/contract ── may-have ──> refund/dispute/feedback
```

## 4. Capability 与 adoption decision

| Capability | 官方面 | Adoption | 设计边界 |
| --- | --- | --- | --- |
| `discovery.search.service-work-requests/v1` | MCP/API marketplace job search | `ephemeral-user-directed-only` | 具体用户criteria；不连续监控、不枚举、不长期保存、不自主rerank |
| `content.read.service-work-request/v1` | MCP/API job detail | `ephemeral-user-directed-only` | exact user-selected posting；任务完成即删，禁止RAG/index |
| `content.read.owned-service-requests/v1` | client account postings | `deferred-restricted` | 自有并不自动授权需求仓库；需purpose/retention/consent与书面范围 |
| `engagement.read.owned-service-responses/v1` | proposals/invitations/messages | `rejected-default` | 高敏、影响人才决策；不进入需求研究Connector |
| `commerce.read.owned-service-outcomes/v1` | contracts/milestones/time/transactions | `deferred-restricted` | 可证明自有采购结果，但需field-level minimization与用途批准 |
| `account.service-request.draft/v1` | official MCP/API | `deferred-high-impact` | 只为真实工作生成draft；draft无平台发布事实 |
| `account.service-request.publish-update-close/v1` | official MCP/API | `deferred-high-impact` | publish/update/close分开；ghost/free/spam/duplicate禁止 |
| `account.proposal.draft-submit-withdraw/v1` | official MCP/API | `rejected-default` | draft/submit/withdraw与Connects effect分开；不自动投递 |
| `account.message.send/v1` | official MCP/API | `rejected-default` | 通知真人、可能AI disclosure；采集route不得持有 |
| `account.offer-contract.manage/v1` | MCP + Upwork网页确认 | `rejected-agent-binding` | Agent不得接受binding agreement；具体Principal在网页完成 |
| `account.milestone-payment.manage/v1` | MCP + Upwork网页确认 | `rejected-agent-financial` | Agent不得fund/withdraw/payment；不能映射generic execute/cancel |

durable research的policy decision必须在credential、MCP OAuth、network、PortBinding、Observation写入、Signal extraction和materialization之前执行。浏览器、搜索引擎缓存、网页手工复制、第三方MCP、SDK或去身份化都不能绕过。

## 5. Access Methods

### 5.1 `upwork-hosted-mcp/v1`

- official hosted remote MCP：`https://mcp.upwork.com/mcp`；OAuth 2.1 dynamic client registration；无需本地安装；
- 2026-08-10发布，覆盖client/freelancer/agency的search、job/proposal/message/offer/contract/milestone/time/financial/profile等广泛能力；
- write先draft并需确认，binding offer/contract acceptance和资金动作回到Upwork网页；
- 当前连接授予完整scope集合，不满足需求研究Connector的最小authority；
- MCP output只为认证用户即时任务授权，默认任务完成即删除；不得借30天上限建立缓存或数仓；
- current decision：官方能力证据与未来ephemeral route候选；当前`no-binding`。

### 5.2 `upwork-approved-graphql/v1`

- OAuth 2.0；application permission与user/team/company permission双重约束；
- key申请需真实账户、身份与付款验证、good standing及官方列明的业绩/支出条件；普通用途为personal/internal，商业用途需prior written permission；无第三方sandbox/test account；
- 公共support文档给出10 requests/second/IP，申请说明另给40,000/day；两者和响应动态限制都要观测，不能只固定一个quota；
- GraphQL错误可在HTTP 200的`errors`数组返回；transport success不等于capability success；
- API内容通常最多缓存24小时；不得通过刷新延长timer；
- current decision：schema/reference候选；durable demand research `blocked-before-binding`。

### 5.3 `upwork-chatgpt-claude-hosted-integration/v1`

官方ChatGPT/Claude集成可找talent/job并生成job-post draft；正式job post仍在Upwork完成。它证明Upwork支持purpose-specific Agent交互，不提供本系统可复用的Connector、bulk export或长期保存许可。当前只作为UX与manual handoff证据，不安装、不连接。

## 6. Platform Skills

### `upwork-pack-research/v1`

- 固定API/MCP Terms version、official MCP surface、API help/schema、Marketplace Standards和OSS revisions；
- 输出KnowledgeProposal、adoption decision、expiry与drift trigger；
- 禁止连接MCP、申请key、登录、访问job/profile或安装/执行SDK。

### `upwork-ephemeral-user-task/v1`

- 输入必须包含authenticated principal、明确用户问题、用户给定filter/object与即时任务结束条件；
- 只允许provider排序或用户明确criteria，不得由Agent自行补充评分/淘汰维度；
- 输出只在即时session显示，保留Upwork attribution/AI provenance；默认不写Observation/SourceItem/EvidenceSpan/index；
- 当前无route，仅为未来在精确Terms审查与最小scope可行后验证的Skill contract。

### `upwork-truthful-service-request-probe/v1`

- 输入：用户真实问题、定制数字deliverable、实际选择/支付意图、合法权利、预算、deadline、success/acceptance标准和履约负责人；
- 首阶段只生成本地preview、policy findings、field gaps、人工Upwork handoff和receipt/reconcile计划；
- block：ghost job、free/低于最低要求、重复/spam、外部推广、虚假身份、不可交付、违法/侵权/歧视、要求违反第三方条款或无真实hire intent；
- 不默认publish/invite/message/decline/proposal/offer/contract/milestone/payment/feedback。

### `upwork-conformance/v1`

- 只使用本地合成fixtures，无MCP、无OAuth、无账号；
- 验证对象链、budget role、ephemeral retention、policy-before-binding、no-bulk/no-index/no-RAG、Principal direction、consequential-decision和negative writes；
- sandbox live不存在；任何授权用户canary需另行批准且只能提升精确ephemeral capability。

## 7. 数据、推断与 Probe 边界

- job description、skills、budget首先是client-authored request；advertised budget是估算，可由proposal与offer协商，不是最终contract/payment金额；
- visible/open job不证明client仍在积极hire，proposal count/interviewing/last-viewed/hire-rate也不能自动证明需求强度；
- proposal是服务方响应，不是独立buyer demand；多个proposal不能派生`EvidenceRepeatedRequest`；
- offer不等于contract，contract不等于milestone funded，funded不等于submitted/released，hour logged不等于approved/paid；
- feedback与dispute是关系和交付结果，不得用于跨平台身份画像或Agent人才淘汰；
- Upwork内容不得进入embedding/vector index、RAG、模型evaluation、训练、跨平台dataset或自动Opportunity Miner，除非新的Pack revision引用精确书面许可；
- 真实job-post Probe会消耗服务方注意力与Connects并可能形成实际合同义务，只能在确实准备hire/pay时进行；不能用ghost job测标题、价格或点击。

## 8. 固定官方、SDK、MCP 与开源证据

以下代码revision仅通过官方页面、raw manifest和`git ls-remote`只读核验；未clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [Upwork hosted MCP](https://www.upwork.com/ai/mcp)，Terms v2.3 | Upwork官方托管；非开源artifact | 当前真实Agent概念、OAuth2.1、draft-confirm、网页binding/financial boundary | `official-access-evidence`；完整scope过宽且durable用途blocked，当前不连接 |
| [upwork/python-upwork-oauth2](https://github.com/upwork/python-upwork-oauth2) `v3.2.0` / `9136e004821d458a80d3736e6ab8a2d7bebe5c5c`；observed HEAD `9bee35bdf1545051db1fc268691843332c1b9b71` | Upwork官方；Apache-2.0 | OAuth2与GraphQL transport参考 | `reference-only`；tag与HEAD分开固定；下载SDK本身接受API & MCP Terms；不安装、不执行、不形成route |
| [upwork/powerbi-connector](https://github.com/upwork/powerbi-connector) `7e3f20db667265936451ab2651a9c32cfbae7de1` | Upwork官方；仓库未发现license文件 | owned organization contract/reporting schema与权限参考 | `evidence-only`；未认证connector且示例要求本地嵌入secret，不复用 |
| [tryAGI/Upwork](https://github.com/tryAGI/Upwork) `cf40772c67e0935781fab0c459ad3bd4ca60b820` | community；MIT | 当前GraphQL job-search names、cursor/429/missing-scope样本 | `reference-only`；community schema不证明官方scope/用途，且不得运行introspection绕过文档 |
| [muhammedaksam/upwork-node](https://github.com/muhammedaksam/upwork-node) `54a020e79f685f156318368359b4733623f6a7c2` | community；MIT | 广泛GraphQL query/mutation与schema drift样本 | `rejected-as-connector`；宽写面、schema inference与目标最小权限/Terms不兼容 |
| [furkankoykiran/upwork-mcp](https://github.com/furkankoykiran/upwork-mcp) `v1.2.2` / `9ed7b44b9fc5f7cde2cbe75ecb1cc016015a94c1` | community；MIT | 18-tool official-GraphQL MCP、dry-run与proposal effects反例 | `rejected-as-connector`；profile/proposal/contract/earnings宽面且Agent评分/提交风险高 |
| [zcrossoverz/upwork-mcp](https://github.com/zcrossoverz/upwork-mcp) `75ddc01a25f4311d7cd4e9469e1b9198bf7d00c8`，package `1.0.0` | community；README称MIT但未发现license文件 | browser/CDP/cookie/stealth与自动proposal/message反例 | `rejected`；明确违反official-tool、no-scraping、credential和zero-write边界 |

代码许可证、官方ownership或MCP协议都不授予Upwork内容的research/index/AI用途，也不替代应用、Principal、scope和书面许可。

## 9. Verification Plan

### evidence-review

- 固定API & MCP Terms `2.3`、effective date、官方MCP surface/OAuth/write boundary、API key资格/limits/no-sandbox与Marketplace Standards；
- 固定official/community artifact owner/revision/license/access/effect；
- `publicly visible`、`official MCP`、`OAuth success`和`user consent`均不能替代durable research许可。

### static-contract

- employment job、service request、seller catalog offer、proposal、offer、contract和payment identity不可互换；
- durable research在credential/network/binding/storage/index前返回policy-blocked；
- ephemeral route不得实现cursor checkpoint、background schedule、Observation/SourceItem/EvidenceSpan持久写或materialization；
- API cache最多24小时且不refresh延长；MCP output默认即时删除，30天是上限不是默认retention；
- Agent不得自主ranking/scoring/recommend人才、job、proposal或contract，也不得执行binding/financial动作；
- principal、agent、scope、user-directed criteria/object与每个write confirmation必须可审计；
- full-scope MCP不能绑定只读research capability；browser/cookie/search-engine/community fallback拒绝。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| fixed-price + hourly job posts | request format、advertised budget/hourly range与contract/payment role分开 |
| edited/open/closed/removed posting | revision/state保留；closed/removed不自动推断filled |
| job post + Project Catalog service | `ServiceRequest*`与`MarketplaceOffer*`不合并 |
| 20 proposals + 2 interviews | provider context不变成20个独立需求或成功概率 |
| proposal → offer → contract | exact relation保留；相邻阶段不可替代 |
| fixed milestone funded/submitted/released | 三状态与payment receipt分开 |
| hourly diary/bill/payment | time、invoice、approval、payment分别解释 |
| API cache age >24h / refreshed timer | 必须销毁；刷新不能延长旧内容retention |
| MCP output task complete | 内容删除且普通warehouse/index bytes=0 |
| paginated/background monitor plan | 在network前因Bulk Access/systematic monitoring拒绝 |
| Agent-added ranking criteria | consequential-decision gate拒绝；仅用户明确filter/provider order可返回 |
| publish/proposal/message timeout |保持unknown并reconcile；不自动重发或跨routefallback |
| official full-scope/community MCP/browser cookie | resolver拒绝生成需求研究PortBinding，negative counter递增 |

### sandbox-live / operational-canary

Upwork不提供第三方sandbox/test account。只有用户另行授权、用途/retention/AI许可匹配、最小scope可行并完成安全审查后，才可用真实用户账号做一个具体user-directed read canary；不得枚举、保存、索引或形成DemandSignal。真实job publish还需独立业务批准和hire/pay意图，当前不执行。

## 10. 可观测性

- knowledge：Terms/API/MCP/schema/Marketplace Standards版本、evidence age、written-permission scope与expiry；
- resolution：principal/account role、company/team、approved use case、OAuth grant、full-vs-minimum scope和revocation；
- ephemeral data：task/object/criteria、provider order、cache/output age、deletion watermark、persistent/index/vector bytes必须为零；
- policy：bulk/systematic/background、RAG/training/eval/index/derivative dataset、third-party aggregation、browser/cookie fallback尝试；
- decision integrity：Agent-added rank/filter、candidate/proposal scoring、solely automated consequential decision必须为零；
- action：draft hash、principal contemporaneous direction、confirmation、Connects/notification effect、attempt/unknown/reconcile；
- binding/financial：offer acceptance、contract、fund/withdraw/pay route invocation必须为零并回到Upwork网页；
- privacy/security：sensitive field quarantine、AI disclosure/provenance、deletion/correction/opt-out propagation、credential rotation和security-incident audit readiness；
- audit：每个Agent action关联Principal、Agent、scope并满足官方请求时可导出的machine-readable log。

## 11. 当前结论

1. Upwork是高价值需求信号源，但当前不能进入本系统长期数仓、索引、RAG或跨平台分析。
2. 官方MCP是最权威的Agent能力样本，却因完整scope和广泛敏感/写入面不能直接成为需求Connector。
3. 未来最早可验证的是“具体用户指向、即时显示、任务后删除”的窄read，而不是后台采集。
4. Upwork Probe只能发布确实准备hire和pay的真实工作；ghost job不是合法测试。
5. 本Pack已作为[Service Work Demand Channel](SERVICE_WORK_DEMAND_CHANNEL_PACK_DESIGN.md)成员发布；Channel当前仍无durable/callable member。不连接 `mcp.upwork.com`、不申请key、不运行SDK/MCP。

## 12. 官方证据

- [Upwork API & MCP Terms of Use v2.3](https://upwork.pactsafe.io/)
- [Upwork MCP Server](https://www.upwork.com/ai/mcp)、[发布公告](https://investors.upwork.com/news-releases/news-release-details/upwork-talent-now-everywhere-ai-works)
- [How to use Upwork in ChatGPT](https://support.upwork.com/hc/en-us/articles/48662546612883-How-to-use-Upwork-in-ChatGPT)
- [API key申请](https://support.upwork.com/hc/en-us/articles/115015857647-How-to-request-an-API-key-from-Upwork)、[OAuth安全](https://support.upwork.com/hc/en-us/articles/115015933448-API-authentication-and-security)、[scopes](https://support.upwork.com/hc/en-us/articles/115015857607-API-scopes-and-permissions)、[request limits](https://support.upwork.com/hc/en-us/articles/115015933428-What-are-the-API-requests-limits)
- [Post a job](https://support.upwork.com/hc/en-us/articles/211063408-Post-a-Job)、[hourly与fixed-price](https://support.upwork.com/hc/en-us/articles/211063418-How-hourly-and-fixed-price-contracts-are-different-on-Upwork)、[fixed-price milestones](https://support.upwork.com/hc/en-us/articles/44564821903763-Understanding-milestones-on-fixed-price-contracts)
- [禁止的工作](https://support.upwork.com/hc/en-us/articles/1500007578942-What-kind-of-jobs-aren-t-allowed-on-Upwork)、[自动化规则](https://support.upwork.com/hc/en-us/articles/43342677368467-Use-bots-and-other-automation-properly)
