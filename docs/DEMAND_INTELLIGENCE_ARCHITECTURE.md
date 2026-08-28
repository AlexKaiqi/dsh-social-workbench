# 需求情报与主动验证系统：架构设计

状态：优化后设计草案，不代表当前运行时能力
核验日期：2026-08-26
范围：只定义领域、组件、端口和治理边界；不选择具体数据库，不实现平台连接器，不改变现有 DSH 装配。

## 1. 结论

系统的稳定核心不是“抓取多个平台”，而是两条有证据、可回放的闭环：

```text
观察闭环：外部事实 -> 原始观察 -> 规范化来源 -> 需求信号 -> 机会判断
验证闭环：机会判断 -> 可证伪假设 -> Probe 计划 -> 受控执行 -> 回执/指标 -> 学习结论
```

社交平台、招聘平台、交易市场、问答社区、采购门户和自有客户数据只是可替换边缘。核心事实、推断、批准、外部回执与学习谱系必须由系统自己持有。

现有 Social Workbench 已经有 `SourceItem`、`DemandSignal`、brief、publication plan、receipt、metric 和 review 等纵向对象。建议先在设计层把这些对象提升为通用需求情报语义；只有第二个非社交平台完成真实契约验证后，才决定是否从当前仓库提取独立 core。不能仅因名称不够通用就提前拆仓库。

## 2. 目标、成功标准与边界

### 2.1 目标

系统需要持续回答：

1. 哪类人正在什么情境下遇到什么问题？
2. 他们当前如何绕过问题，付出了什么成本？
3. 哪些证据表明问题有频率、紧迫度或预算？
4. 哪些需求只是高讨论度，哪些接近真实行动或支付？
5. 应该用哪个渠道、什么承诺和什么 CTA 做最小验证？
6. 实验结果支持、削弱还是无法判断原假设？

### 2.2 成功标准

- 每条需求信号能定位到不可变证据片段和观察时间。
- 事实、模型推断、人工判断和外部指标不互相覆盖。
- 连接器失效后，已有证据、信号、机会和实验账本仍可读。
- 同一问题能跨平台聚类，但默认不做跨平台个人身份归并。
- Probe 在执行前有明确假设、受众、变量、成功阈值、成本和守护条件。
- 任何外部副作用都有不可变 plan、批准、幂等键、回执和对账状态。
- 索引可以删除重建，不能成为唯一事实源。
- 平台只实现其真实具备的小型能力端口，不以空方法伪装成通用连接器。
- 一次端到端操作可通过 scope、correlation、run 和 attempt 从审计追到证据、遥测与成本。
- Probe 结论显式标记为定性、方向性或因果，不以不可比较的代理指标冒充实验结果。

### 2.3 非目标

- 不做万能爬虫、验证码绕过、设备指纹伪装或私有 API 逆向平台。
- 不以虚假职位、虚假商品、虚假库存或无法履约的服务测试需求。
- 不批量采集候选人、评论者、群成员等个人档案。
- 不让模型直接持有 Cookie、长期 token 或直接调用真实发布执行器。
- 不把点赞、浏览、讨论量单独解释为购买需求。
- 本设计不规定 Go 必须成为最终实现语言；Go 文件是语言无关领域边界的可编译表达。

## 3. 不变量

### 3.1 事实分层

| 层 | 对象 | 可否覆盖 | 说明 |
| --- | --- | --- | --- |
| Platform Knowledge | 平台概念、能力、接入方法 snapshot | 否 | 低频、经审阅的认知 commit；具体平台数据不进入这里 |
| Channel Knowledge | 成员 Platform Pack、roster/scope、projection/coverage/dedupe policy | 否 | 跨平台研究策略 revision；不合并成员平台身份或授权 |
| Observation | 平台一次返回、网页一次可见状态、人工导入批次 | 否 | 原始事实信封，保存采集方式、representation、内容哈希、可选原生 revision metadata 与文档 manifest |
| Canonical Source | 规范化来源对象的 revision | 否 | 相同外部对象的版本链；最新视图只是指针 |
| Derivation | EvidenceSpan、DemandSignal、Opportunity | 否 | 带模型/规则版本和输入 revision 的推断 |
| Decision | 接受/拒绝、优先级、Probe 假设 | 否 | 人工或政策决策，不能写回来源事实 |
| External Effect | Probe plan、approval、intent、receipt | 否 | 外部副作用和平台实际结果 |
| Learning | Metric、Outcome、Review | 否 | 追加式结果与对假设的判断 |

### 3.2 能力分层

`PlatformKnowledgeSnapshot` 版本化保存平台身份、概念、能力和接入方法；`AdapterDefinition` 表示代码理论上实现的 access method/route；`ConnectorInstance` 表示账号、配置与授权事实；`CapabilityResolution` 才表示某个 purpose 下当前实际可用的能力。四者必须分开。

```text
配置生命周期: registered -> configured -> disabled/retired
授权状态:     not-required/missing/pending/valid/expired/revoked
运行健康:     ready/degraded/blocked/unknown
能力成熟度:   experimental/community/verified/production/suspended
```

同一平台按 capability 分级，例如：

```text
platform=xianyu, capability=content.read.listing, mode=browser-assisted
platform=xianyu, capability=account.listing.create.owned, mode=manual-package
platform=zhihu, capability=discovery.search.answers, mode=official-api
source=boss-zhipin, capability=content.import.user-selected-job, mode=manual-evidence-package, platform-route=none
```

“平台支持”不是一个布尔值。

### 3.3 契约事实源

当前 `spec/*.schema.json` 中标为“运行切片”的版本化 Schema 继续是现有 Host/CLI/Client 的事实边界；`design/go/demandintel` 只是通用领域的可编译设计视图，不能成为第二套运行时真相。

进入通用实现前必须完成：

1. 每个持久对象和交换消息只有一个 `normative` 版本化 Schema；
2. Go、JavaScript 和其他语言类型由规范 Schema 生成，或声明为经过验证的 compatibility view；
3. 现有 social runtime 与通用契约之间用显式 mapping profile 连接，记录 `lossless/lossy/rejected`；
4. 不兼容变化发布新版本，不原地修改旧事件、receipt 或 revision 的解释；
5. 平台私有字段只能进入带 namespace、schema ref 和内容哈希的 extension payload，不能用任意 map 扩大核心契约。

因此本阶段允许 Go 名称与现有 runtime 名称暂时不同，但必须把差异视为待验证映射，不允许实现侧自行猜测。

## 4. 总体架构

平台知识、具体事实与索引投影使用三个不同事实源，详细设计见 [平台知识、事实仓库与动态投影架构](./PLATFORM_KNOWLEDGE_ARCHITECTURE.md)。

长期扩展不靠手工堆积 Connector，而由 [新平台发现与 Platform Pack 架构](./PLATFORM_DISCOVERY_LONG_TERM_ARCHITECTURE.md) 持续完成 discovery、research、model、verify、release 和 drift maintenance。

一个平台只由自己的 Platform Pack 发布；多个平台共同服务某个场域时，由 Channel Pack 引用成员 Pack，并版本化 roster、公共 projection、coverage 和 dedupe policy。Channel Pack 不能让未验证成员变得可调用。

```text
┌──────────────────────────── Workbench ────────────────────────────┐
│ Source Inbox │ Evidence │ Signals │ Opportunities │ Probe Lab     │
│ Connector Catalog │ Approval Queue │ Receipts │ Learning Reviews  │
└───────────────────────────────┬────────────────────────────────────┘
                                │ versioned application API
┌───────────────────────────────▼────────────────────────────────────┐
│                         Application Plane                         │
│ Collection Planner │ Signal Workflow │ Opportunity Review         │
│ Probe Planner │ Approval Gate │ Outbox/Reconciliation             │
└───────────────┬────────────────────┬────────────────────┬──────────┘
                │                    │                    │
┌───────────────▼──────────┐ ┌───────▼──────────┐ ┌──────▼───────────┐
│       Data Plane         │ │ Analysis Plane   │ │   Action Plane   │
│ Versioned Platform KB   │ │ Retrieval        │ │ Preview/Prepare  │
│ Analytical Fact Store   │ │ Signal Miner     │ │ Execute          │
│ Evidence Blob Store     │ │ Evidence Explain │ │ Receipt/Outcome  │
│ Canonical Revision Store│ │ Opportunity Rank │ │ Reconcile/Cancel │
│ Projection Checkpoints  │ │ Counter-evidence │ │ Metrics Ingress  │
└───────────────┬──────────┘ └───────┬──────────┘ └──────┬───────────┘
                └────────────────────┼────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────┐
│                          Control Plane                             │
│ Connector Registry │ Credentials refs │ Policy │ Rights/Retention │
│ Capability Evidence │ Audit │ Rate/Cost Budget │ Kill Switch       │
└────────────────────────────────────┬───────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────┐
│                       Observability Plane                          │
│ Domain Events │ Trace/Metrics │ Health/SLO │ Cost/Rate Limit       │
│ Experiment Integrity │ Correlation/Run/Attempt                     │
└────────────────────────────────────┬───────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────┐
│                    Replaceable Edge Adapters                       │
│ official API │ public feed │ delegated API │ browser-assisted      │
│ authorized export │ manual import/package │ unsupported            │
└────────────────────────────────────────────────────────────────────┘
```

## 5. 组件与所有权

### 5.1 Connector Registry

Connector 按六层组织，详细契约见 [Connector 期望架构](./CONNECTOR_EXPECTED_ARCHITECTURE.md)：

```text
PlatformKnowledgeSnapshot  平台概念、能力和接入方法的版本化知识
CapabilityDefinition       平台无关的稳定语义契约
AdapterDefinition          某段代码实现的 access method/route/mapping
ConnectorInstance          本机账号、配置、凭据引用和授权事实
CapabilityResolution       当前 purpose/policy/health/budget 下的可用路线
Observation                Connector 实际获取的追加式具体事实
```

`ConnectionProfile` 允许用户把同一平台/账号的 API、sidecar、浏览器和人工 connector 显式组合起来。系统不通过用户身份字段自动推断组合关系。

ConnectorInstance 不保存长期明文凭据，也不执行采集或发布；它也不内嵌会过期的 `EffectiveCapabilities`。可用性是 resolver 根据 route、授权、政策、健康、证据时效、限流和成本生成的有期快照。

Versioned knowledge 保存 `concept -> capability -> access method`；Platform Pack 另保存带证据和过期时间的 adoption decision；Registry/Catalog 保存 `access method -> adapter route -> connector -> port`。能力描述用户可获得什么结果，adoption 描述目标用途是否接受该方法，route 描述通过哪个平台/adapter/mode，port 描述最小技术接口；四者不能混为一个大接口。

```text
content.read.entry -> official-feed route -> pull-read
feedback.receive.ticket -> webhook route -> push-receive
content.import.user-selected-job -> local manual-evidence route -> manual-import
account.listing.create.owned -> manual-package route -> probe-preview + probe-prepare
account.publish.video.private -> browser route -> probe-validate + probe-preview + probe-prepare + probe-execute + probe-reconcile
```

某端口不存在就是该 route 不具备相应阶段，不要求 adapter 提供永远返回 `unsupported` 的占位方法。外部执行返回 unknown 后禁止切换 route 重发，必须先对原 attempt reconcile。

`manual-package` route 使用 `ExecutionManualHandoff`：系统只能 validate/preview/prepare，最终用户动作仍按 capability 的 `platform-write` 审批和审计。不能为了表达“代码没有点击发布”而把端到端 effect 错标成 `local-write`。

#### Channel Pack composition

`ChannelPackManifest` 引用固定 `PlatformPackRef` 与共同 capability，保存 projection mapping、coverage/dedupe/rights policy 和 Channel Skills。`ChannelRosterRevision` 固定枚举型 platform surface（例如 Greenhouse board、Lever region/site）；`ChannelScopeRevision` 固定 query-driven surface、dialect、schema-bound template、window policy 和 exclusions。公司迁移 ATS 或 query/jurisdiction 范围变化时追加相应 revision，不能改写历史来源。跨平台相似对象只形成带 evidence 的 relation candidate，原生 canonical ID 永不合并。

共同 capability 只表示成员服务同一研究目的，不要求成员拥有同一种来源对象。Channel 可以把 `PublicDiscussion*` 与 `ProductLaunch*` 等异构 representation 投影到同一机会视图，但 projection 必须保留成员类型、原生身份、证据角色与 coverage；不能为了统一查询而发明丢失平台语义的泛化 source object。

### 5.2 Collection Planner 与采集端口

`Connector` 是平台能力；`CollectionPlan` 是一次可审计的采集意图；adapter 通过小型端口组合完成读取，不再定义万能 `Collector`。

CollectionPlan 定义：

- 研究问题和允许的来源范围；
- connection 与 capability requirement，不直接绑定某个 provider；
- stream/query、窗口、limit、成本预算；
- principal、purpose 和 policy context；
- checkpoint 策略、retention 和停止条件。

采集端口至少分为：

- `StreamDiscoverer`：发现可读 stream；
- `PullReader`：游标式拉取；
- `PushReceiver`：接收 webhook/event，先持久化再 ack，并按 delivery ID 去重；
- `ChangeReconciler`：发现删除、撤权和错过的变更；
- `ManualImporter`：预览并提交用户选择的文件或 URL。

这些端口只产出 Observation/Tombstone，不直接写 DemandSignal，也不更新索引。Adapter 可以实现其中任意真实子集。

### 5.3 Observation Ledger 与 Evidence Store

Observation Ledger 是追加式事实账本。原始正文、图片、音视频、PDF 或导出文件进入 Evidence Store，并携带：内容哈希、MIME、权利依据、可见性、保留期和删除状态。

`Rights` 负责整个对象的取得、用途、可见性和保留依据；它不能证明含个人资料、internal note、custom field 或 secret 的复合 payload 已完成字段级最小化。此类 Observation 和 canonical revision 另附 `DataHandlingMetadata`：profile/version、schema selector、敏感度、retain/restrict/pseudonymize/redact/drop/quarantine disposition、`required/applied/provider-applied/unknown` 状态，以及删除传播要求。selector 只指向受 review schema，metadata 不保存字段值；`required` 不能伪装为已处理，pseudonymized 也不能自动视为匿名数据。

`EvidenceSpan` 还必须区分内容由谁陈述：`EvidenceAttribution` 使用 subject-authored、counterparty-authored、provider-generated、derived 或 unknown，并保存 schema/provenance basis，不保存作者身份。客户消息、客服人员内部 note、销售人员转述的输单理由、平台计算状态和模型分类不能拥有相同证据强度；subject-authored 也只证明“来源这样表达”，不自动证明身份或陈述为真。

平台原生谱系与采集器谱系必须分开：`NativeRevisionMetadata` 只记录 provider-declared editorial version、lifecycle notice relation 或明确标注的 observed snapshot，并通过 `SourceHistoryCoverage` 声明 complete/latest-only/partial/unknown。payload hash 变化可以产生 canonical revision，但不能反推平台完整版本链。

`SourceRepresentationMetadata` 进一步区分 provider-native、provider-projection、presentation 和 manual-extract，并固定 schema、standard/version/extensions、mapping ref 和 known losses。`PayloadSchema` 只说明 bytes 契约；它不能证明该 payload 就是平台原生 ontology，也不能让人工摘录继承完整 coverage。

平台返回统计宽表时，Observation 可附 `AggregateDatasetMetadata`：window/timezone、有序 grain、metric concept/field/unit、允许的 rollup、provider data state/watermark 和 privacy treatment。clicks/impressions 也只能在兼容且互斥的 grain 上求和；CTR 应从 numerator/denominator 重算；average/rank 等 non-additive measure 不能再次平均。`final` 只描述处理状态，完整度仍由 `CoverageAssessment` 证明。通用 provider analytics 不写入 Probe `MetricObservation`，后者必须继续绑定 experiment run、receipt、variant 与 attribution。

产品行为分析还必须附 `BehavioralDatasetMetadata`：analysis kind、不可变 definition/taxonomy/instrumentation refs、entry/step/return/activity/exclusion criteria、event/session/person/group/device counting unit、identity policy、sequence order、window/interval、event/server-received/processed time basis、timezone、numerator/denominator、cohort与completeness rule。相同 chart/metric 名称不能证明可比；任一语义变化都产生新definition revision。Aggregate metadata描述cell如何rollup，Behavioral metadata描述这些cell究竟在数什么，两者不能互相替代。

问卷 response 还必须附 `SurveyResponseMetadata` 并引用不可变 `SurveyDefinitionMetadata`：surface、题目 wording/options/scale/required/validation/logic、locale、sampling/recruitment/incentive、display/targeting/recontact、respondent mode、consent purpose/notice/withdrawal/retention与valid window。display、started、partial、submitted、disqualified/test分开；定义变化产生新revision，不能用相同survey/form/question ID重写旧回答。答案值、contact/hidden/URL/network/user-agent和文件媒体仍在question-level restricted payload，不进入metadata。

授权客户会话还必须附 `ConversationDatasetMetadata`：member-native conversation ref/revision、kind、scheduled/actual window、scope-local participant/speaker refs、role/party、speaker attribution method、consent/purpose evidence、audio/video/transcript/chat/summary/topic/tracker/scorecard 等 artifact role/revision/status、transcript origin/language/model/diarization/timestamp basis/gaps/redaction、cross-representation relation、visibility/retention/deletion 和 coverage。`EvidenceSpan.Conversation` 继续固定 artifact revision、speaker ref 与 attribution method。原始 meeting transcript 与导入 Gong 后的 transcript 是可关联但独立的 representation；只有 exact native reference 或人工确认 ledger 才可声明同一 occurrence，标题/时间/参与者相似不得触发模糊去重。identity values、完整 transcript 与 media 仍在 restricted payload。

授权邮件还必须附 `CorrespondenceMessageMetadata`：member-native mailbox copy/message revision、provider thread/conversation refs、scope-local transformed RFC message ref、direction/lifecycle、scope-local participants与header roles、folder/label containers、MIME/header/body/attachment refs、automated/classification evidence、sent/received/internal time、relations、retention/deletion与coverage。`EvidenceSpan.Correspondence`固定message/part revision、authored-body/quoted-history/forward/signature/disclaimer/automated/attachment-extract role与reviewed extraction ref。Gmail thread与Graph conversation只在成员内有效；同主题、地址、时间或body相似不得跨mailbox/platform去重。原始地址、headers、完整正文和attachment仍在restricted payload。

授权客户社区还必须先发布不可变 `CommunityDefinitionMetadata`：workspace/guild、deployment class、approved channel roster、public/private/shared/direct/thread kind与visibility、grant/scope/intent/effective-permission refs、identity/DM/content/pull/event/reaction/data-use/retention/deletion policy和valid window；平台用途权利、组织批准与技术grant是三个独立事实。每个Observation再附`CommunityMessageMetadata`，固定definition revision、space/channel/parent/thread、message/revision、kind/state、scope-local member/bot/application/webhook/system actor、available/authored-empty/permission-omitted/provider-omitted/deleted/not-collected content状态、exact reply/thread-starter/forward-snapshot/crosspost relations、attachment descriptors、history/message/reaction coverage和delete/retention。`EvidenceSpan.Community`固定message/content revision与authored/reply/system/bot/webhook/forward/embed/attachment/provider-derived role。会议transcript、mailbox copy、产品需求item与community message不能互换；原始成员profile、mentions、reaction actors、附件和完整内容仍在restricted payload。

公开软件协作还必须先发布不可变 `SoftwareWorkItemDefinitionMetadata`：host/deployment variant与版本、namespace/project/repository、item type、native state/reason、label、milestone、iteration和relation taxonomy，以及selection、identity、data-use、rights、retention、deletion policy与valid window。每个Observation再附 `SoftwareWorkItemRecordMetadata`，区分item、comment、reply、system note、resource event与reaction summary，固定平台全局ID和项目内IID、native state与reviewed lifecycle、lock/answer等正交状态、exact parent/reply/duplicate/block/relation，以及item/history/comment/reaction coverage。`EvidenceSpan.SoftwareWorkItem`固定item、record、content revision与title/body/comment/reply/system/code/log/provider-derived等role；actor identity、源码、日志、附件和完整正文仍在restricted payload，不能因repository公开而跳过rights与retention判断。

公开技术讨论还必须先发布不可变 `PublicDiscussionDefinitionMetadata`：provider/host/network/community、deployment owner与hosting class、software/version、API/schema、core/extension/site-customization capability origin与scope、thread/record/state/container/tag/relation taxonomy、container policy、ordering/ranking、answer/acceptance、engagement/moderation、endpoint/pagination/history/federation/rate、Terms/robots、selection、attribution、identity、data-use、retention/deletion policy与valid window。论坛软件品牌不是集中式authority；同为Discourse、NodeBB或Flarum的每个deployment都必须独立建definition revision和授权。每个Observation再附 `PublicDiscussionRecordMetadata`，区分question/story/root、answer、comment/reply、poll option、revision/timeline/moderation与engagement summary，固定thread/record/content revision、canonical/federated/search representation与origin、native state、participation/visibility/answered/accepted等正交事实、accepted state的exact capability来源、community/node/board/category membership与有效期、exact parent/answer/accepted/link/duplicate/migration/external-artifact relation及成员独立coverage。`PublicDiscussionPlacementMetadata`分别固定query或list definition、delivery context、selection、position与observedAt；`EvidenceSpan.PublicDiscussion`固定record/content revision与title/root-body/answer/comment/reply等role。profile、外链正文、完整内容和身份仍在restricted payload。Stack Exchange Q&A acceptance、HN ranking/thread、知乎search summary、V2EX可移动Node、Discourse Solved、NodeBB federation与Flarum extension field不能互相替代；API存在也不能跳过用途或deployment policy。

产品采用后评价必须先发布不可变 `ProductFeedbackDefinitionMetadata`：platform/marketplace/surface、API/schema version、product/version identity、record/state/rating/history/aggregate/moderation/selection、verification/incentive/collection/authorship/comparison/vendor-response、attribution/identity/data-use/rights/retention/deletion policy与valid window。每个Observation附 `ProductFeedbackRecordMetadata`，把written review、rating-only/aspect rating、developer/community reply、aggregate rating、provider summary和moderation event分开，固定canonical/latest/aggregate representation、review-title/use-case/pros/cons/problems-solved/switching-reason/recommendation content role、exact product/version/reply/supersession/resolution/compared/selected/switched relation，以及visible/latest/resolved/affects-aggregate正交状态。`ProductFeedbackCollectionBinding`只保留provider verified/vetted assertion、verification method、incentive tri-state、solicitation/moderation/authorship policy和experience context；它不证明陈述真实，也不用missing incentive推断non-incentivized。`EvidenceSpan.ProductFeedback`只定位获准的review/reply/summary内容revision；score、rank、download/users、aggregate和身份字段仍在分别治理的payload。Apple/Google owned review、AMO public feedback与G2/Capterra/TrustRadius B2B review可以共享representation，却必须保留不同Channel roster、授权、许可、population和coverage；public web、subscription API、vendor-owned export、licensed excerpt、buyer intent与competitive intelligence不得跨population补全，公开网页可见性不能生成缺失的Connector合同。

企业、门店、地点与服务体验反馈另行发布不可变 `BusinessExperienceFeedbackDefinitionMetadata`：platform/marketplace/surface、access population、API/schema、organization/business-unit/location/service-provider identity、rating/aggregate/selection/sort/translation/verification/collection/reply、provider-answer/attribution/display/source-link、data-use/AI-use/rights/retention/deletion policy与valid window。每个Observation附 `BusinessExperienceFeedbackRecordMetadata`，把review、rating-only、business reply、aggregate、provider excerpt/highlight/answer和deletion notice分开，固定owned history、provider-selected sample、excerpt、licensed feed、aggregate snapshot或provider answer representation，以及experience/visit/transaction/service/location context和exact reply/supersession/derived relation。Google Business Profile自有地点历史、Google Places最多5条相关性样本、Yelp节选/AI answer与Trustpilot Display/Insights feed不得互补为评论总体；business reply或`claims-resolved`不证明问题实际解决，verified/transaction-linked仍只是provider assertion。Reviewer profile、头像、email、order ID、精确地址/坐标和完整受限payload默认drop/restrict；技术API/MCP可用和代码license不能生成AI、索引、留存或派生内容权。

公共资助优先级与已资助研发必须另行发布不可变 `PublicFundingDefinitionMetadata`：provider/programme、call/opportunity/topic/subtopic/update、award/project/project-period/participant/result/output/aggregate taxonomy，API/schema、lifecycle、eligibility、classification、authority、representation、selection、identity、data-use、rights、attribution、retention/deletion policy与valid window。每个Observation附 `PublicFundingRecordMetadata`，固定native record/revision、programme→call→opportunity/topic、opportunity→award/project、project→period/participant/result/output等exact relation，并用 `PublicFundingAmountBinding` 区分ceiling、expected total、award obligation、current-year support、direct/indirect cost与reported total等金额角色。Grants.gov机会、NIH RePORTER award/project、EU Funding & Tenders/CORDIS call/project/result与SBIR/STTR solicitation/topic/award可以共享表示，但成员、authority、分类、更新时间和coverage必须独立；资助机会不是采购合同，award/project不是付款回执、科研成功、科学有效性、产品采用、用户痛点或市场需求。PI、program officer、联系人、participant自然人及完整abstract/result正文默认drop/restrict；provider-linked publication/output只表示来源关联，不证明成果归因或效果。

公开规则制定与政策咨询必须另行发布不可变 `PublicRulemakingDefinitionMetadata`：jurisdiction/authority/platform/surface、initiative/docket/document/submission/outcome、record/representation/lifecycle、official status、participation/duplicate、selection/history、identity、attribution、personal-data/attachment/content/data-use/AI-use/rights/retention/deletion policy与valid window。每个Observation附 `PublicRulemakingRecordMetadata`，把proposal/draft/notice/final rule、consultation/call for evidence/question、stakeholder submission/position paper、authority response/outcome/correction与aggregate分开，固定initiative→consultation、docket→document、submission→document、proposal→final、consultation→outcome、correction/supersession等exact relation。Regulations.gov docket/comment、Federal Register publication、EU Have Your Say、GOV.UK consultation和中国司法部立法意见征集可以共享表示，但法律地位、authority、comment population、language、schema、rights和coverage独立；拟议规则不是已生效法律或法律意见，正式提交不证明真实、代表性、独立创作或被采纳。姓名、地址、email、phone、signature与attachment默认drop/restrict；mass campaign/duplicate count不等于unique persons。

公开公司披露与投资优先级必须另行发布不可变 `PublicCorporateDisclosureDefinitionMetadata`：jurisdiction/publisher/surface、reporting population、entity/security、filing/document/section/fact、form/reporting taxonomy、record/representation/lifecycle、official record、issuer/regulator/auditor/provider authority、amendment/restatement、financial fact/amount/forward-looking、selection/history、identity、attribution、personal-data/attachment/content/data-use/AI-use/rights/retention/deletion policy与valid window。每个Observation附 `PublicCorporateDisclosureRecordMetadata`，固定entity→filing→document→section/exhibit、report→fact/taxonomy extension、amend/restatement/correction/supersession、alternate-language/official-rendition/common-origin等exact relation，并保留fact的QName、taxonomy version、context、unit、period、decimals和dimensions。SEC EDGAR、Companies House、EU ESEF/ESAP、HKEX IIS与CNINFO可以共享表示，但法域、filing population、official status、accounting context、audited scope、language、rights和coverage独立；监管接收不证明真值，issuer plan不证明预算或采购，risk disclosure不证明事件发生，reported amount不证明payment。签名、地址、电话、email、officer/PSC/shareholder identity与exhibit默认drop/restrict。

公开监管投诉还必须发布不可变 `RegulatoryComplaintDefinitionMetadata`：regulator/jurisdiction/program/surface、API/schema、root/row identity、subject/issue/state taxonomy、response/disposition/impact/publication/consent/redaction/deidentification/verification、selection/population/rights/retention/deletion policy与valid window。每个Observation附 `RegulatoryComplaintRecordMetadata`，把complaint root、重复subject/component row、complainant narrative、organization response、regulator disposition、publication event和aggregate分开，固定canonical/current-published/search/bulk/aggregate representation、exact subject/response/disposition/recall/investigation relation，以及published/response/timely/disputed/verified/investigation正交状态。`RegulatoryComplaintImpactAssertion`只表达来源声称的crash/fire/injury/fatality/financial loss等影响；`EvidenceSpan.RegulatoryComplaint`保留complainant/company/regulator statement authority。VIN、姓名、联系方式、细位置、数值影响和完整正文仍在受治理payload或pre-persistence drop。NHTSA、CFPB与CPSC不能共享人口分母、severity scale或法律结论。

自有产品可靠性还必须发布不可变 `ProductReliabilityDefinitionMetadata`：provider/deployment、organization/project/app roster、surface/API/schema、SDK/instrumentation、environment/release/failure/state/signal taxonomy、grouping/fingerprint、ingestion filter、sampling、session、query/report、selection、identity/scrubbing/sensitive-context、rights/retention/deletion policy与valid window。每个Observation附 `ProductReliabilityRecordMetadata`，把issue group、variant、occurrence event、lifecycle event、aggregate report、release-health snapshot和diagnostic artifact分开，固定current issue/occurrence/selected sample/aggregate/export representation、exact occurrence/variant/release/environment/regression/trace/work-item relation及成员独立coverage。event、user/installation、device和session是不同counting unit；ratio必须有exact denominator与sampling/extrapolation。stacktrace、message、breadcrumbs、logs、request、locals、source context、custom keys、attachments、replays、minidumps和identity默认restricted；`EvidenceSpan.ProductReliability`只能指向通过secret/PII review的exact diagnostic revision。

公开运行状态还必须发布不可变 `OperationalStatusDefinitionMetadata`：provider/publisher/page roster、public/private access class、surface/API/schema、timezone、component hierarchy、condition/lifecycle/impact taxonomy、computation/override、publisher mode、notification、uptime/history/selection、sanitization、rights/retention/deletion policy与valid window。每个Observation附 `OperationalStatusRecordMetadata`，把page snapshot、component/resource、incident、incident update、scheduled maintenance/update、history sample、uptime summary和postmortem分开，固定current/active/unresolved/recent/bounded representation、manual/automatic/integration/mirror provenance、computed/overridden state、exact affects/update/postmortem relation与成员独立coverage。Statuspage recent-50、Better Stack 90-day和Instatus active-only不能互相补成complete history；`EvidenceSpan.OperationalStatus`只能指向sanitized exact publisher revision，`EvidenceOperationalDisruption`不证明root cause、SLA breach、affected-user count、用户原话或独立恢复。

公开软件漏洞还必须发布不可变 `SoftwareVulnerabilityDefinitionMetadata`：provider/dataset/source roster、surface/API/schema/version、ID/alias、subject/ecosystem/package/product、version/range/resolver、advisory type、severity/risk/weakness/review/withdrawal、selection/pagination、source lineage/common-origin、reference/content safety、rights/attribution/retention/deletion与valid window。每个Observation附 `SoftwareVulnerabilityRecordMetadata`，把vulnerability、advisory、affected subject/range、severity/risk assessment、known-exploitation entry、remediation statement和dataset snapshot分开，固定native/alias/upstream/related relation、range events、CVSS/EPSS/review/KEV正交assessment、source overlap与成员/authority独立coverage。OSV导入GitHub的record不能双计authority；CISA vendor/product文本不能补成package range。`EvidenceSpan.SoftwareVulnerability`只指向通过content-safety与license review的exact publisher revision；`EvidencePublishedVulnerability`和`EvidenceKnownExploitation`都不证明本地inventory、reachability、compromise或remediation。

公开软件包生态还必须发布不可变 `SoftwarePackageEcosystemDefinitionMetadata`：provider/registry/deployment、surface/API/schema、ecosystem identity与name normalization、native version/resolver、artifact/dependency/pointer/lifecycle、search、usage metric/history/selection、source lineage、reference/content/identity handling、rights/attribution/retention/deletion与valid window。每个Observation附 `SoftwarePackageEcosystemRecordMetadata`，把package/project/crate、version/release、distribution artifact、declared dependency、mutable dist-tag/channel、lifecycle assertion、usage aggregate、search placement和dataset snapshot分开，固定registry-scoped identity、native resolver、exact lifecycle scope/reversibility、metric/window/counting semantics及API/index/feed/dump/mirror common-origin。npm dist-tag不是version，PyPI project/release/file分层，crates.io yank不删除artifact；`EvidenceSpan.SoftwarePackage`只指向reviewed exact publisher/registry revision。`EvidencePackageLifecyclePressure`不证明用户受影响，`EvidencePackageUsageProxy`不表示unique users、adoption、quality、demand或market size。

产品首发来源必须另行发布不可变 `ProductLaunchDefinitionMetadata`：平台/surface、API/schema revision、Product Page与launch/Post representation、topic、pricing/availability、ranking/featuring/promotion、engagement/moderation、selection、identity、data-use、rights、retention/deletion policy与valid window。每个Observation附 `ProductLaunchRecordMetadata`，区分product、launch、maker/hunter attribution、topic、media、comment/reply、review、rank/feature/engagement snapshot和moderation event，固定product/launch/record/content revision、native lifecycle、placement snapshot、exact parent/reply/launch-of/relaunch-of/external-artifact relation及成员独立coverage。`EvidenceSpan.ProductLaunch`固定record/content revision与name/tagline/description/maker-note/comment/reply/review等role；profile、投票者、外链正文、媒体bytes和完整内容仍在restricted payload。若官方schema未证明Product Page到多次launch的精确关系，名称、域名或URL相似只能形成待审relation candidate，不能合并canonical identity。

交易市场必须发布不可变 `MarketplaceOfferDefinitionMetadata`，固定平台/marketplace/environment/surface、API/schema revision、product/inventory/offer/listing identity、category/aspect/condition/format/state taxonomy、price/availability/search/ranking/promotion/fulfillment/return、selection/attribution/identity/data-use/rights/retention/deletion policy与valid window。每个Observation附 `MarketplaceOfferRecordMetadata`，区分catalog product、seller inventory item/group、offer、published listing、variation、media、placement与engagement snapshot，固定exact inventory→offer→listing关系、listing format、price role和active/visible/available/purchasable等正交状态。`EvidenceSpan.MarketplaceOffer`只定位title/description/condition/disclosure/policy等确切record revision；公开seller主张、媒体、身份、位置与实际金额仍在分别治理的payload。一个listing消失不能自动写成sold。

市场结果另由 `MarketplaceOutcomeDefinitionMetadata` 与 `MarketplaceOutcomeRecordMetadata` 表达。它把provider-native impression/view/watch-or-favorite/inquiry/bid/negotiated offer/order/order line/payment/fulfillment/cancellation/refund/dispute/feedback映射到reviewed `exposure/consideration/negotiation/commitment/payment/fulfillment/reversal/feedback` phase，并保留counting、attribution、transaction/payment/fulfillment/reversal/feedback定义、状态、时间和exact listing/order-line relation。`EvidenceSpan.MarketplaceOutcome`只引用获准的inquiry/review等内容revision；买卖双方身份、消息、地址、支付细节与金额留在restricted payload。公共发现、自有seller记录、sandbox事实和production Probe receipt必须处于不同population，不能因为同属一个平台而合并权限或成熟度。

服务采购市场必须另行发布不可变 `ServiceRequestDefinitionMetadata`，固定平台/marketplace/environment/surface、API/schema、request/record/state/skill/work-arrangement/format taxonomy，以及budget/search/ranking/selection/attribution/identity/data-use/rights/retention/deletion policy与valid window。每个Observation附 `ServiceRequestRecordMetadata`，区分request、brief、requirement、screening question、attachment、placement和activity summary，固定request/record revision、fixed/hourly/contest/direct-hire format、native state与open/visible/accepting-responses/filled等正交事实、scope-local client attribution、exact relation、member-specific coverage和商业金额role。`EvidenceSpan.ServiceRequest`只定位title/description/deliverable/requirement等获准内容；客户身份、附件、位置和实际金额仍在受治理payload。

服务响应与结果由 `ServiceEngagementDefinitionMetadata` 和 `ServiceEngagementRecordMetadata` 表达。它把invitation/proposal-or-bid/interview/message/offer-or-award/contract/milestone request/milestone/time record/work submission/contest entry/award/handover/invoice/payment/refund/dispute/feedback映射到reviewed `discovery/response/evaluation/offer/contract/delivery/payment/reversal/feedback` phase，并保存exact request→response→offer-or-award→accept/contract→delivery→settlement relation。`EvidenceSpan.ServiceEngagement`只引用获准的cover letter、message、submission、dispute或feedback revision；party identity、消息、contest entry/work成果、附件和支付细节默认restricted。ephemeral user-directed output可以合法存在而不产生任何Observation、SourceItem、EvidenceSpan或projection。

本地服务与反向Lead平台继续使用同一抽象，但增加两种不可混淆的入口：`matched-lead`是客户请求被匹配/交付给一个或多个服务方，`partner-booking`是合作方已有checkout/order产生的服务请求；两者都不证明public marketplace exposure。项目型服务还保留competitive tender、piecework、contest、catalog purchase和direct hire，不把provider native mode强行压成fixed-price。`ServiceRequestPlacementMetadata.SearchContextRef`把一次短期、user-directed供给搜索与query/filter/delivery context绑定，Business placement不因此成为client demand。一个Request匹配多个Business时仍是一项需求；各Business的Lead/Negotiation由lead-delivery exact relation表达。`ServiceEngagementRecordMetadata`进一步保存lead delivery/access、estimate、availability window、proposal/work submission、contract、acceptance request/outcome、quote、booking、appointment、reschedule、completion、invoice、payment和cancellation，并以exact relation关联。estimated、quoted、client-charged、lead-access-fee、invoice-amount、escrowed-amount、payment和cancellation-fee各自有金额role。Service Catalog是供给/taxonomy knowledge；地址、联系人、服务方身份、稿件、合同、支付和正文仍在restricted payload。一个partner-owned Project/Business或provider-participated list结果的coverage只能落在该partner/brand/Business/openid population，必须明确报告public market coverage为`not-applicable`或只声明exact user-directed search context。

自有站内搜索分析还必须附 `SearchIntentDatasetMetadata` 并引用不可变 `SearchIntentDefinitionMetadata`：product/site surface、index/collection、schema/query-pipeline/normalization/synonym/rule/ranking/filter/locale revision、analytics capture、typeahead pause/debounce、empty browse query、traffic/identity policy、interaction definition/计数单位/query link/attribution window。dataset明确submitted/normalized/expanded/categorized/provider-defined query representation，with-results/no-results/error/unknown outcome，total/tracked denominator、hit/zero-result rule、query-ID/session/provider/unattributed method、latency/completeness/privacy。query、filter、user token、object ID仍在restricted schema-bound payload。Search Console/Bing外部搜索曝光与Algolia/Typesense站内搜索是不同channel，只有exact dual-instrumentation ledger才可关联。

外部搜索需求与趋势必须另附 `ExternalSearchDemandRecordMetadata` 并引用不可变 `ExternalSearchDemandDefinitionMetadata`。definition固定provider/surface/API或dataset、population、subject/seed/target、geography/language/network/window/timezone、selection/ranking、normalization/scaling/sampling/approximation、auction/forecast配置、rights与valid window；record固定interest time series、regional interest、ranked trend list、keyword idea set、historical keyword metrics、traffic forecast或provider-defined representation。系统必须显式区分sampled normalized interest、cross-request consistently scaled interest、approximate historical count、provider weighted index、ranked/truncated list、provider-generated suggestion和configuration-dependent forecast，并记录measure basis、unit、denominator、scale、rank、watermark与coverage。实际数值继续进入schema-bound payload和`AggregateDatasetMetadata`；metadata只解释“这个数是什么”，不保存数值。Google Trends相对热度、Google Ads近似历史量/预测、Microsoft Advertising Ad Insight和百度加权指数不能互相换算，也不能冒充Search Console的自有曝光或站内search event。

自有产品需求板还必须附 `ProductRequestItemMetadata` 并引用不可变 `ProductRequestDefinitionMetadata`：product/feedback surface、board/forum/group/container、category/tag/custom-field schema、public/internal status taxonomy与vote/comment权限、vote/supporter/request/account/priority的counting/identity/import-on-behalf/merge/weight定义、visibility/notification/retention与valid window。item保留submission/consolidated-idea/provider-insight/delivery-feature representation、end-user/admin-on-behalf/import/integration origin、provider status+reviewed lifecycle、scope-local author与creator、parent/merge/represented-by/delivery/release relation和history/support/comment coverage。`EvidenceSpan.ProductRequest`固定title/description/portal-comment/internal-note/status-update/merge-carried/provider-insight等role。title/body/count、supporter identity、account/revenue、custom-field values和attachments仍在受治理payload。

涉及价格、预算、invoice、payment、credit/refund 或 dispute 的 payload 还可附 `MonetaryDatasetMetadata`。它按 schema selector 固定每个金额字段的 role（due/paid/refunded/credited/disputed 等）、currency selector 或 fixed currency、minor/major/provider-defined unit、sign convention、rounding 和 versioned conversion ref；metadata 只描述字段语义，不保存实际值。空 conversion ref 表示禁止跨币汇总。系统不得固定 `/100`、跨 currency 直接相加、从负号猜 refund，或把 invoice paid、cash payment、credit 和 processor outcome 互相替代。

远程附件、公告格式或资源 URL 先作为 `SourceArtifactDescriptor` 保存 manifest。descriptor 不证明内容已下载、可安全解析或拥有再利用权；retrieval 后的 bytes 仍需新的 hash、MIME、rights 和 evidence observation。这样可追溯“链接存在 → 获取尝试 → blob → 解析 projection”，也可表达 forbidden/missing/changed，而不是用一个附件字段覆盖全过程。

推荐的逻辑分层，不绑定具体数据库：

```text
Platform knowledge  平台概念、能力、接入方法；commit/diff/branch/as-of
Evidence blobs     大对象、原始响应、附件，按内容哈希寻址
Observation facts  具体平台数据的 append-first 分析事实仓库
Canonical records  SourceItem/Revision/关系/权限/状态
Event ledgers      collection、decision、approval、receipt、metric
Projections        全文、向量、时间序列、主题、分析宽表
```

版本知识、分析事实和 projection 的写入/查询语义不同，即使 MVP 共享一个物理数据库，也必须保持独立端口。Dolt 等版本数据库只作为 Platform Knowledge 的候选实现；高频事实进入分析仓库。

### 5.4 Canonicalizer

把 Observation 转成新的 SourceItem revision，负责：

- 平台外部 ID 与 canonical URL；
- 内容哈希、更新时间和删除/tombstone；
- 字段来源和规范化版本；
- 同平台对象幂等，不做跨平台个人身份合并；
- 推断字段不得伪装成来源字段。

当 source 发出 deletion、redaction 或 privacy-change 事实时，Canonicalizer 必须创建 correction/tombstone，并把移除传播到 EvidenceSpan、派生 SourceItem、索引和缓存；只保留满足审计/法定保留所需的最小 receipt。append-first 描述事实历史，不表示已被平台删除的原文可以永久留存。

### 5.5 Indexer 与 Knowledge Access

Indexer 只构建 projection：

- lexical：精确词、错误码、产品名、报价、职位技能；
- semantic：相似问题、表达差异、跨平台主题；
- facet：来源、时间、地区、受众、信号类型、权利状态；
- temporal：频率、增速、重复出现和衰减；
- optional relation：问题、替代方案、工具、组织和结果之间的关系。

Projection 按 `rebuild/incremental/continuous` 维护，并记录 source checkpoint、knowledge snapshot、定义版本与 lag。动态物化先由 `MaterializationPolicy` 和查询 telemetry 提出建议；未度量复用率、构建/维护成本、存储和 freshness SLO 前，不允许 Agent 自动创建长期索引。若成员policy禁止持久化、聚合、衍生dataset、embedding/vector index、RAG或continuous monitoring，候选视图必须在planning阶段返回blocked且零构建字节；ephemeral user-directed route不进入物化候选集合。

Retriever 必须返回 `EvidenceSpan + RetrievalTrace`，而不是只有模型答案。权限和 retention 过滤在召回阶段生效。

列表、重建和投影接口必须采用有界 page/batch 与 cursor；run 只保存计数和边界引用，不能把全部 Observation ID 或 revision 装进单个聚合对象。

### 5.6 Signal Miner

Signal Miner 从 evidence set 生成候选 DemandSignal。每个信号至少表达：

- audience/segment 与情境；
- problem、desired outcome 和现有替代方案；
- frequency、severity、urgency；
- effort/workaround、budget/payment、switching 等证据类型；
- purchase-decision 与 budget/payment 分开；CRM won/lost/no-decision 不能自动证明收款或客户确认预算；
- payment-failure 只证明某次付款未完成或需动作，不能自动证明 churn、支付能力或产品不满；
- retention-outcome 必须区分 requested/scheduled/effective 状态并保留 attribution；non-renewing/canceled/ended 不能互相代替；
- value-reversal 必须保留 refund/credit/adjustment/payment-reversal/chargeback 原生 subtype 和 cash/non-cash 语义；
- dispute 是一方主张及其处理状态，不能在裁决前改写成已证实的产品事实；
- observed-usage 只证明固定埋点、identity和analysis definition下观察到行为；它不能自动证明activation、价值、满意、痛点、因果效果或订阅留存；
- survey response 只证明受访者在固定问题、样本、consent与response state下如何回答；rating、choice、open text、partial和non-response不能自动代表总体、实际行为、支付意愿或因果效果；
- funnel drop-off与behavioral retention分别是定义窗口中的未观察下一步和repeat event，不是complaint或billing `retention-outcome`；
- absence只有在instrumentation health、identity、watermark、TTL、filters、coverage和完整周期均可审计时才有含义；否则只形成unknown/counter-evidence；
- 支持证据与反证；
- derivation profile、模型/规则版本和置信度；
- 可证伪条件。

Signal Miner 只能提案；接受、拒绝、合并和 supersede 是独立 review 事实。

主动搜索证据使用 `EvidenceSearchIntent` 与 complaint、workaround、repeated request 分开。search impression/click 可提升 action proximity，但单独不能证明痛点、购买意愿或市场规模；Opportunity synthesis 必须保留 coverage/privacy 限制与反证。

外部search-demand record也只能形成受限的`EvidenceSearchIntent`候选：趋势相对值说明固定定义下的相对关注，historical volume是近似计数，keyword idea是provider建议，forecast是账户/竞价/配置依赖的模型结果。任何单一measure都不能被提升为unique users、绝对市场规模、购买意愿、产品痛点或可实现收入；只有与主体表达、购买/预算/使用结果等独立证据形成可追溯relation后，才能提高Opportunity置信度。

站内搜索的popular/no-result/click/conversion同样只形成候选：no-result可能来自索引、过滤、typo、locale、库存或relevance配置；高搜索量可能是导航失败；低CTR/CR也可能是埋点或归因缺口。只有固定definition revision、排除这些替代解释并获得独立渠道证据后，才能提升Opportunity confidence。synthetic query/event会污染analytics，必须作为独立Probe写能力进入approval/receipt/reconcile，不得由只读Connector暗中执行。

产品需求板的单个item或support relation使用`EvidenceProductRequest`；只有identity、origin、merge和coverage足以证明独立发生，才可派生`EvidenceRepeatedRequest`。vote/supporter/request/account/priority/revenue不可相加或互换，status/changelog/feature/Jira link也只证明团队声明/关联，不证明部署、使用、满意或价值。provider AI insight与suggested merge保持derived attribution，不能覆盖subject-authored原文。

客户社区不新增泛化的`EvidenceCommunityDiscussion`：community是来源representation，不是需求语义。只有`CommunitySpanMetadata`指向的reviewed authored/reply span，才能按实际内容进入complaint、workaround、urgency、switching等证据类型；bot/system/webhook/forward/embed与reaction/reply count默认只作context或navigation。多个账号、replies或emoji不能自动变成independent recurrence。Slack deployment/Terms与Discord approved-use policy未满足时，连候选抽取和长期索引也必须在policy gate前阻断，不能用去身份化或管理员安装绕过。

公开软件工单同样不新增泛化的 `EvidenceSoftwareIssue`：`SoftwareWorkItemSpanMetadata` 只描述来源representation。只有reviewed title/body/comment/reply中的主体表达才能按内容进入complaint、workaround、urgency、switching等证据类型；system note、resource event、bot内容、reaction与计数默认只作状态、谱系或导航上下文。closed、duplicate、answered、upvote或评论数不能自动证明问题已解决、独立复现或需求规模。GitLab.com在采集、候选抽取和长期索引前必须先通过API Terms与用途policy gate；拆分query、CLI、MCP或第三方connector都不能绕过bulk/systematic collection限制。

公开技术讨论同样不新增泛化的 `EvidencePublicDiscussion`：`PublicDiscussionSpanMetadata` 只描述来源representation。只有reviewed human-authored question/story/Topic/answer/comment/reply span才可按内容进入complaint、failed-attempt、workaround、urgency、switching等证据类型。accepted answer、closed、unanswered、score/view、rank、descendants、dead/deleted、Node、thank和评论/回答数默认只作状态、container、selection或导航上下文，不能自动证明已解决、独立复现、正确性或市场规模。Stack Exchange长期AI辅助warehouse/index和HN系统性索引必须先通过用途policy gate，知乎必须先通过exact contract，V2EX必须先取得覆盖durable/index/AI用途的书面澄清；官方MCP、Algolia、community Skill、CLI、HTML或去身份化不能绕过blocked decision。

产品评价也不新增泛化的 `EvidenceProductFeedback`：`ProductFeedbackSpanMetadata` 只描述review/reply/provider-summary来源representation。只有rights允许、经过最小化且指向exact content revision的authored review/reply span，才能按实际内容进入complaint、failed-attempt、workaround、urgency或switching；rating-only没有正文span，score、aggregate、rank、downloads/users、is-latest、reply-present和resolved默认只作状态、selection或coverage上下文。provider verified/vetted不提升真值，incentive不自动降级或删除review，provider AI summary和licensed excerpt不伪装reviewer authorship或full review，text mention不伪定为exact switched-from。开发者/vendor回复不证明问题解决，评论缺失不证明删除，最新投影不证明完整历史。Owned App Reviews、Public Extension Marketplace Feedback与Public B2B Software Review分别通过authorization/contract/rights gate；AMO不采集reviewer profile，Chrome/JetBrains缺官方review contract时阻断，G2/Capterra/TrustRadius公开网页在network前blocked，合同API/export仍需在materialization前单独验证AI/storage/index/retention用途。

商业体验反馈也不新增“平台评论即痛点”的证据捷径：`BusinessExperienceFeedbackSpanMetadata`只定位获准的review/reply/excerpt/provider-answer revision。Signal Miner必须携带subject、representation、selection和coverage；aggregate评分或总数没有正文，最多5条样本或3条节选不能估计总体topic prevalence，provider answer只能按provider-derived authority进入。Google Business Profile/Places在标准政策下、Yelp普通API在AI用途下、Trustpilot未取得exact Data Solutions合同前，都必须在network或materialization gate fail closed；删除通知、合同撤销或缓存到期还必须使派生span、向量和物化视图可定位失效。

公共资助也不新增“有钱即需求”的证据捷径：`PublicFundingSpanMetadata`只能定位获准的issuer/recipient authored content revision，并保留programme、record kind、representation、authority、lifecycle、classification和coverage。开放机会的exact span最多产生带“机构公开优先方向”限定的 `EvidenceInstitutionalFundingPriority`；已资助award/project的exact span最多产生带“来源报告配置决定”限定的 `EvidenceFundedResearchActivity`。金额、截止期、award状态、项目活跃状态、publication/output链接和排名都不能单独升级为痛点、付款、成功、科学有效性、采用率、市场规模或产品机会；provider summary、aggregate与sample preview不得伪装成完整项目或完整结果。

公共采购不再只使用泛化`EvidenceProcurement`：`PublicProcurementSpanMetadata`定位exact member/authority、process/procedure/lot/award/contract/transaction、record revision、content与amount role。buyer-authored planning/tender requirement最多形成`EvidenceOfficialProcurementRequirement`；award/contract/amendment最多形成`EvidenceReportedProcurementCommitment`；transaction/outlay/performance/completion/termination最多形成`EvidenceReportedProcurementExecutionEvent`。estimated budget、award、original/current contract、amendment、obligation/deobligation、outlay和aggregate value不可互换；awarded不证明签约，outlay不自动证明supplier receipt，completed不证明acceptance/success，termination不证明fault或未满足需求。natural-person、contact、bid/complaint narrative在普通projection前拒绝。

公开规则制定也不新增“proposal即法律”或“comment count即需求”的证据捷径：`PublicRulemakingSpanMetadata`只能定位获准的issuer、stakeholder或authority-response authored content revision，并保留jurisdiction、record kind、representation、official status、authority、lifecycle、campaign/duplicate与coverage。issuer proposal/consultation exact span最多产生带“可能变化”限定的 `EvidenceRegulatoryChangePressure`；published stakeholder submission exact span最多产生 `EvidenceFormalStakeholderResponse`。只有reviewed authored burden/alternative span才能另按实际内容进入complaint、workaround或urgency；proposal/final/official edition、comment/submission/outcome、provider aggregate与machine translation不得互换。评论数量、deadline、RIN/CFR引用、open/closed或agency response不能单独升级为法律适用、支持率、代表性、采纳、市场规模或产品机会。

公开公司披露也不新增“法定披露即事实”或“管理层计划即需求”的证据捷径：`PublicCorporateDisclosureSpanMetadata`只定位获准的issuer、auditor或authority authored filing/document/section/fact revision，并保留form、representation、authority、official status、forward-looking/historical/audited与coverage。reviewed issuer strategy span最多形成`EvidenceCorporateStrategicPriority`，risk/constraint span最多形成`EvidenceCorporateOperationalRisk`；只有historical、exact period/unit/context/dimensions/amount role且非forecast的fact或reviewed span才能形成`EvidenceReportedCorporateInvestment`。accepted/published/audited、planned amount、risk factor、customer-demand claim、XBRL label或跨上市地重复文件不能单独升级为监管认定、预算、payment、procurement、客户需求、市场规模、投资建议或独立证据。

公开技术标准与平台演进也不新增“proposal即标准”或“标准即采用”的捷径：`PublicTechnicalStandardSpanMetadata`只定位获准的body/group/editor/implementer/commenter authored edition、commit、issue、decision或test revision，并保留process revision、native lifecycle、normativity、authority、representation与coverage。正式draft/proposal/requirement span最多形成`EvidenceTechnicalStandardizationPressure`；只有exact compatibility/deprecation/removal/migration span满足相应native状态和authority门时才可形成`EvidenceCompatibilityMigrationPressure`；implementer issue/report/test span最多形成`EvidenceFormalImplementationFeedback`。IETF Standards Track、W3C Recommendation、WHATWG Living Standard、TC39 Stage 4与OpenJDK Delivered不可跨流程排序；issue、test、implementation interest、integration、published edition或同名mirror也不能单独升级为committee consensus、全生态shipping、法律义务、客户需求或市场规模。

公开产品召回与纠正行动也不新增“recall即事故真相”或“terminated即全部修复”的捷径：`PublicProductRecallSpanMetadata`只定位获准的regulator、operator、manufacturer或follow-up authority authored event/campaign/product/range/action revision，并保留native status/class、risk/source assertion、mandate、representation、language/common-origin与coverage。exact recall/remedy/measure span最多形成`EvidenceRegulatoryCorrectiveAction`；exact defect/noncompliance/hazard/class/incident assertion span最多形成`EvidenceReportedProductSafetyHazard`。recall、enforcement report、campaign、alert、advisory和complaint不可互换；hazard class、incident/injury/death count、quantity、distribution、open/completed/terminated/archived、API success或同源JSON/CSV/PDF不能单独升级为因果、发生率、完整回收、消费者触达、需求规模、医疗建议或法律结论。

公开科研文献也不新增“被收录/引用即科学真理”或“论文限制即市场需求”的捷径：`PublicResearchLiteratureSpanMetadata`只定位获准的author、editor或review authority在exact work/version/expression/record/section中的content，并固定representation、language、licence和purpose。exact limitation/failure/assumption/uncertainty/validity-threat span最多形成`EvidenceReportedResearchLimitation`；exact unresolved-question/missing-method-data-evidence/replication/future-work span最多形成`EvidenceReportedUnmetResearchNeed`。Crossref deposit、OpenAlex work/topic/citation、PubMed index/MeSH、Europe PMC annotation/OA和arXiv preprint/version都保留native/provider authority；它们不能单独升级为peer review、科学有效性、普遍性、影响力、用户痛点、购买意愿或市场规模。metadata、abstract和full text的availability/licence/purpose独立，多个provider的common-origin projection只算同一来源claim。

公开临床研究注册也不新增“registered/completed即真实成功”或“terminated即产品失败”的捷径：`PublicClinicalStudySpanMetadata`只定位获准的registry、sponsor、responsible party、regulator或results submitter在exact study/protocol/record revision中的content，并固定native status、authority、outcome/arm、representation、licence和purpose。plan/status/milestone/results-posting record最多形成`EvidenceRegistryDeclaredClinicalStudyActivity`；exact suspension/termination/withdrawal/recruitment/amendment/missing-results/why-stopped span最多形成`EvidenceReportedClinicalStudyConstraint`。NCT/UTN/EU/ISRCTN/DRKS identity、anticipated/actual enrollment、authorized/recruiting/completed/results-posted、outcome definition和aggregate results都保持正交；它们不能单独升级为actual recruitment、scientific validity、efficacy/safety、patient demand、market size或医疗建议。contacts、sites、participants/IPD和patient matching在普通projection前拒绝。

公开药品供应短缺也不新增“shortage即需求规模”或“resolved即处处有货”的捷径：`PublicMedicineSupplySpanMetadata`只定位获准的regulator、national authority或regulated notifier在exact event/product/presentation/jurisdiction/record revision中的content，并固定native state/availability/impact、authority、representation、licence和purpose。exact anticipated/current/limited/unavailable/discontinued span最多形成`EvidenceRegulatorReportedMedicineSupplyConstraint`；exact allocation/import/expedite/alternative/substitution-instrument span最多形成`EvidenceReportedMedicineSupplyMitigation`。原因仍是来源声明，预计结束日期不是承诺，alternative不证明临床可替代，official notification aggregate也不等于unique shortage/product/patient或market demand。contact、patient/prescription、local inventory和医疗建议在普通projection前拒绝。

公共监管执法同样不新增“被执法即已经违法”的证据捷径：`PublicRegulatoryEnforcementSpanMetadata`只定位exact authority、matter/case/proceeding、instrument、record revision、content role和assertion posture，并与case lifecycle、final/effective/stayed/appeal及obligation status分开。exact complaint/charge/finding/admission span最多形成`EvidenceOfficialRegulatoryComplianceAssertion`，仍须携带alleged/agency/tribunal/court/admission/no-admission/vacated姿态；exact order/judgment/settlement/undertaking span最多形成`EvidenceOfficialRegulatoryRemedialObligation`，仍不证明已支付、已追回或已履行。complaint、settlement、closed、release、penalty amount和case count不能单独升级为违法事实、代表性、风险率、市场规模或respondent profile；natural-person、victim、witness、contact和personal identifier在普通projection前拒绝。

公共申诉专员裁决也不新增“已支持投诉即普遍成立”的证据捷径：`PublicDisputeDecisionSpanMetadata`只定位exact member/authority、case/decision revision、investigator/preliminary/final stage、native outcome、binding和content role，并与remedy、appeal/stay/variation、reported compliance及publication population分开。exact final finding/outcome span最多形成`EvidenceOfficialDisputeDetermination`；exact award/direction/order/recommendation span最多形成`EvidenceOfficialDisputeRemedy`。investigator view或preliminary不是final；published final不自动accepted/binding；upheld/maladministration不证明发生率、代表性或普遍法律；ordered/recommended amount不证明implemented、completed或paid。settled、withdrawn、outside jurisdiction、withheld、publication lag和database absence也不能当negative outcome；complainant/resident name、initial、address、contact、personal ref和confidential detail在普通projection前拒绝。

公共审计也不新增“官方审计提到即为组织普遍事实”的证据捷径：`PublicAuditFindingSpanMetadata`只定位exact publisher、engagement/report revision、objective/scope/criteria/method、finding/recommendation、posture/assurance、implementation authority和content role，并与auditee response、action/update、auditor confirmation/follow-up、selected population及benefit role分开。exact final auditor span最多形成`EvidenceOfficialAuditFinding`；exact recommendation span最多形成`EvidenceOfficialAuditRecommendation`；exact auditor follow-up span最多形成`EvidenceReportedAuditFollowUp`。draft、auditee assertion、provider summary不能升级为final finding；recommendation或agreed不证明implementation；auditee self-report不等于auditor confirmation；closed/no-longer-valid不等于implemented；potential/estimated benefit不等于realized或received。natural-person、contact、whistleblower/witness与敏感working-paper内容在普通projection前拒绝。

公共311也不新增“每条报修就是一个独立且未解决痛点”的证据捷径：`PublicCivicServiceRequestSpanMetadata`只定位exact jurisdiction、request/case revision、content role、native lifecycle、source-declared disposition、authority、representation和approved coarse location scope，并与origin、classification、assignment、duplicate relation、current-state/history及published population分开。exact public row/record最多形成`EvidencePublishedCivicServiceRequest`；exact authority status/update/closure span最多形成`EvidenceReportedCivicServiceDisposition`。row不证明unique person/incident、verified defect、agency fault或independent recurrence；closed/resolved不证明现场解决、SLA、满意或持续效果；相似时间/位置/category不形成exact duplicate。natural-person/contact、exact address/coordinates、media、unit/premise和unreviewed free text在普通projection前拒绝。

公共请愿也不新增“签名数就是民意或需求规模”的证据捷径：`PublicPetitionSpanMetadata`只定位exact jurisdiction/legislature/process revision、petition/record revision、content role、lifecycle/moderation/response/deliberation posture、authority、representation和language，并与support counting、threshold、actual follow-up及common-origin分开。approved petitioner action/background最多形成`EvidencePublishedPetitionRequest`；exact mutable aggregate最多形成`EvidencePlatformAcceptedPetitionSupport`；exact government/committee/chamber action最多形成`EvidenceOfficialPetitionResponse`。publication不证明truth/endorsement，support不证明unique people/representative opinion，threshold不保证回应或辩论，responded/debated不证明采纳、实施或效果。creator/signer identity、contact/address/postcode/IP、精细地域、special-category profile与未审查敏感文本在普通projection前拒绝。

公共参与式预算同样不新增“票数、winner或completed就是需求规模、拨款或效果”的捷径：`PublicParticipatoryBudgetSpanMetadata`只定位exact deployment/process/round/scope、proposal/project/record revision、content role、lifecycle/evaluation/selection/execution posture、authority、representation和language，并与proposal/ballot roster、priority/final-vote measure、weighting/ballot/envelope rule、amount role、allocation及implementation coverage分开。approved proposer span最多形成`EvidencePublishedParticipatoryBudgetNeed`；exact aggregate最多形成`EvidenceParticipatoryBudgetPriorityAggregate`；exact selected/budgeted/appropriated record最多形成`EvidenceReportedParticipatoryBudgetAllocation`；exact authority milestone/status最多形成`EvidenceReportedParticipatoryBudgetExecution`。proposal不证明truth/representativeness，support不等于final vote或people，selection不等于budget inclusion/appropriation/spend，source-declared completion不等于独立验收、质量或效果。identity、contact、exact location、demographics/political profile、comments/attachments与未审查敏感文本在普通projection前拒绝。

公共信息公开请求同样不新增“请求、成功状态或发布附件就是事实、过错或完整披露”的捷径：`PublicInformationAccessSpanMetadata`只定位exact member/deployment/jurisdiction/legal regime、request/message/event/release revision、content role、native lifecycle/disposition、classification authority、representation和language，并与public-body roster/legal coverage、delivery/authentication、deadline、fee、withholding、visibility/embargo、release/redaction及review lineage分开。approved request span最多形成`EvidencePublishedInformationAccessRequest`；exact public-body correspondence最多形成`EvidenceAttributedPublicBodyCorrespondence`；带source与classifier authority的状态最多形成`EvidenceReportedInformationAccessDisposition`；exact approved release span最多形成`EvidencePublishedInformationAccessRelease`。它们分别只证明公开提出了哪些records/data、某机关归属的通信、某authority报告的分类和公开了哪些材料；不证明request allegation、机关过错、法律有效性/合规、unique person、representative opinion、完整披露、released-content truth或reuse rights。requester/natural-person/contact/address/signature/ID/IP/annotation、private/embargo记录和未审查attachment/text在普通projection前拒绝。

公共规划申请同样不新增“申请、反对数、建议或批准就是事实、民意、最终权力或实施”的捷径：`PublicPlanningApplicationSpanMetadata`只定位exact member/deployment/jurisdiction/process revision、application/action/site/document/exhibition/representation/assessment/recommendation/decision/condition/review revision、content role、lifecycle、representation/assessment/decision posture、authority与representation，并与authority roster、published population、window/renotification、decision finality、spatial precision、history/common-origin及implementation coverage分开。approved requested-change span最多形成`EvidencePublishedPlanningApplication`；approved public/organisation/agency span最多形成`EvidencePublishedPlanningRepresentation`；exact applicant/agency/officer/advisory span最多形成`EvidenceReportedPlanningAssessment`；exact competent-authority/review/court span最多形成`EvidenceReportedPlanningDecision`。application不证明need/truth/feasibility，count不证明unique people/representative opinion，recommendation不等于competent decision，approval不证明built/occupied/compliant/effective。natural-person/contact/donation、exact address/coordinate/parcel/BBL/UPRN、submission body/attachment与未审查document在普通projection前拒绝。

公共建筑监管同样不新增“申请、许可、检查通过、违法、整改或证书就是施工/合规/安全/入住真相”的捷径：`PublicBuildingRegulationSpanMetadata`只定位exact member/deployment/jurisdiction/code/process、application/permit/work item/inspection/complaint/violation/order/adjudication/correction/certificate revision、content role、lifecycle、authorization/result/finding/compliance/certificate posture、authority与representation，并与population、origin/history、fee/effective rule、partial scope、relation、location/privacy/rights coverage分开。approved filing span最多形成`EvidencePublishedBuildingWorkApplication`；exact permit authority record最多形成`EvidenceReportedBuildingPermitAuthorization`；exact stage/discipline inspection最多形成`EvidenceReportedBuildingInspectionResult`；exact complaint/finding/order/adjudication/correction record最多形成`EvidenceReportedBuildingCodeFinding`；exact CC/OC/TCO/partial/final/LOC/BIC record最多形成`EvidenceReportedBuildingCertificate`。permit不证明commencement/completion，one pass不证明whole-project/continued compliance，complaint/violation不证明liability/current condition，certificate不证明current safety或actual occupancy。natural-person/contact/professional ID、exact address/unit/coordinate/parcel/PIN/BBL/BIN/GeoID、complaint narrative、inspector comment、plan/photo/document在普通projection前拒绝。

公共职业/经营许可进一步把“被监管主体获准从事活动”从项目permit中拆出：`PublicRegulatedLicenseSpanMetadata`只定位exact member/deployment/jurisdiction/process/authority/board、subject/application/license/inspection/complaint/investigation/charge/finding/order/adjudication/appeal/remediation revision、content role、lifecycle、standing/application outcome/inspection result/finding posture/finality/sanction/remediation与representation，并与subject population、authority roster、publication/suppression、history、purpose/privacy/rights coverage分开。approved application、authority authorization、inspection、allegation、finding、sanction和remediation分别形成`EvidencePublishedRegulatedLicenseApplication`、`EvidenceReportedRegulatedLicenseAuthorization`、`EvidenceReportedRegulatedActivityInspection`、`EvidencePublishedRegulatedLicenseAllegation`、`EvidenceReportedRegulatedLicenseFinding`、`EvidenceReportedRegulatedLicenseSanction`与`EvidenceReportedRegulatedLicenseRemediation`。current不证明competence/reputation/actual practice，pass不证明continued compliance，complaint/charge不证明finding，condition不必然disciplinary，reinstatement不清除历史。自然人姓名/ref、license number、address/contact、exact establishment、complaint/health narrative与document在普通projection前拒绝；public visibility不能替代purpose与reuse rights。

公共环境监管进一步把环境permit、condition/limit、monitoring requirement、measurement、threshold comparison、legal compliance finding、enforcement与remediation拆成独立证据层：`PublicEnvironmentalRegulationSpanMetadata`固定exact member/deployment/jurisdiction/regime/program、site/facility/installation/source/outfall/point、permit/condition/limit、parameter/measurement kind/method/unit/statistic/period、value derivation/reporting basis/qualifier、comparison/compliance/finality/authority与revision。申请、授权、测量、年度release/transfer、比较、检查、合规认定、执法和整改分别形成九种`Evidence*Environmental*`；permit不证明operation/compliance，value不自动comparable，exceedance不自动是legal violation，licensee self-report不等于authority finding，annual inventory不等于instant emission/exposure/harm，reported return不等于authority verification。exact location/outfall、敏感设施、operator/natural-person/contact、complaint prose与documents在普通projection前拒绝，known-data alert和conditional-rights expiry先于物化执行。

污染场地与修复不能退化为环境许可的一个status：`PublicContaminationRemediationSpanMetadata`另行固定site/parcel/operable-unit/source-area/medium的版本边界、notification/observation/assessment/designation、hazard-pathway-receptor与use-specific risk、custodian/owner/operator/potential party/liability、remedy decision/action/completion/control、closure/reuse、cost role及各自authority。十一种`Evidence*Contamination*`只由approved exact span形成；notification不升级为法定认定，detection不升级为exposure/harm，ownership不升级为liability，construction complete不升级为cleanup goals或whole-site complete，deletion/reuse不抹除long-term controls。exact location/parcel/boundary、敏感设施/社区、party/contact、documents与raw sampling values在普通projection前按字段治理。

饮用水安全也不是环境许可或污染场地的一个媒体字段：`PublicDrinkingWaterSafetySpanMetadata`固定supplier/system/source/treatment/storage/network/zone/point/service-area、result的stage/method/unit/statistic/period/qualifier、applicable standard与comparison、violation origin/finality/resolution、event、advisory kind/scope/issuer、corrective action、confirmation、lift recommendation与actual rescission。十二种`Evidence*DrinkingWater*`只由approved exact span形成；registration不证明potability，single result不证明whole-system，test failure不自动成为violation，health-based flag不证明illness，event/advisory不证明consumer exposure，infrastructure ready与lift recommendation都不证明actual restoration。关键基础设施、精确service area/point、vulnerable facility、household/person/contact、documents和raw result先按字段治理。

环境空气质量也不能被压成一个跨平台的“AQI数字”：`PublicAmbientAirQualitySpanMetadata`固定network/station/monitor/reporting-area/grid、pollutant/method/unit/statistic/averaging period、production kind、preliminary/verified/validated/corrected lifecycle、index definition/value/completeness/special mode、forecast issue/amendment/validity、event与attribution、issuer advisory/health guidance、standard comparison/compliance和aggregate denominator。十二种`Evidence*AmbientAir*`只由approved exact span形成；站点观测不代表邮编、区域或个人暴露，相同单位不自动可比，model/downscale/interpolation/gap-fill不冒充measurement，单污染物subindex不冒充complete index，US AQI、UK DAQI、European AQI与Canada AQHI不横向换算，forecast/trigger不冒充observation/issued alert，高指数不等于法律超标，episode不证明cause，health guidance不证明diagnosis、exposure或harm。精确站点、敏感位置、人员、私有传感器、原始文档和高精度轨迹先按字段治理。

公共食品安全也不能被压成跨辖区“卫生分”或商户声誉：`PublicFoodSafetySpanMetadata`分别固定establishment/premises/permit、inspection occurrence/type/scope、citation/violation与scheme-specific severity、rating definition/value/standing、enforcement、closure/reinspection/reopening、operator-reported与authority-verified correction、complaint origin、outbreak/mode/setting、etiology posture、vehicle/ingredient attribution以及illness/hospitalization-known/death-known等不同denominator。十二种`Evidence*Food*`只由approved exact span形成；一次pass不证明持续安全，critical/crucial或citation不证明疾病，NYC grade、FHRS 0–5、FHIS与DineSafe notice不横向换算，closure不证明永久失败或暴发，reopening不清除历史或证明未来安全，complaint-origin不证明投诉成立，NORS setting/vehicle/etiology不建立exact premises因果关系。精确地址、电话、owner/operator、permit ID、complaint/inspector/patient和自由文本默认drop，缺失值、active/current/latest population与公开可见性都不能升级为无问题、完整历史或长期索引权利。

公共交通也不能被压成一个“实时到站/可靠性分数”：`PublicTransitServiceSpanMetadata`固定member、agency/operator/mode/feed product、service day/timezone、route/direction/pattern、stop/station/platform/pathway、service/trip/vehicle/stop event、schedule relationship、prediction/actual time posture、alert cause/effect/standing与informed entity、facility topology/status、accessibility condition以及performance definition/population/numerator/denominator/threshold。十二种`Evidence*Transit*`只由approved exact span形成；schedule不证明operated，prediction不冒充actual，missing/stale realtime不变成cancelled，alert不证明measured impact或root cause，alert expiry不证明restored，static wheelchair/pathway属性不证明current journey accessible，一个lift outage也不自动等于whole station inaccessible。同名on-time/headway/wait/service-delivered/facility-availability指标不跨method比较；exact live vehicle coordinate、vehicle/employee/rider/journey identity、security infrastructure和自由文本先按字段drop或降精度。

公共道路安全也不能被压成一个“事故数/危险分”：`RoadSafetySpanMetadata`固定member、jurisdiction/publisher、dataset/product/resource、population/reporting threshold、release/vintage/standing、collision/traffic-unit/road-user/casualty/outcome grain、severity与basis、factor reporter/posture、location/CRS/precision、exposure definition、aggregate/risk posture和active-hazard validity。十二种`Evidence*RoadSafety*`只由approved exact span形成；fatal census不冒充all crashes，police registry不证明完整发生总体，crash severity不覆盖person outcome，factor不成为cause/fault/liability，provisional不成为final，count无兼容exposure不成为risk，hotspot只保留candidate，active hazard不成为historical collision。姓名、地址、plate/VIN/licence、free text、medical/toxicology、contact、敏感factor、rare exact point和small-cell demographic先按字段drop、quarantine、coarsen或suppress。

公共消费价格同样不能被压成一个“价格/通胀/生活成本数”：`PublicConsumerPriceSpanMetadata`固定member/publisher、program/population、dataset/product/series/PID/cube、classification/item/segment、quote/average/weight/index/adjustment/release/denominator grain、currency/unit/package/tax/discount/geography、measure/change、base/price/weight/reference/publication period、seasonal/missing/availability/revision与rights。十二种`Evidence*ConsumerPrice*`只由approved exact span形成；quote不成为average/index，average不成为pure inflation，index point不成为currency/percent，weight不成为quantity/demand，rebase不成为price shock，missing/imputed/suppressed quote不成为stockout，CPI无兼容income/earnings/expenditure denominator不成为affordability，national aggregate不成为individual hardship。restricted outlet/scanner/transaction/provider identity在持久化前drop或quarantine。

公共租赁住房成本、空置与负担也不能压成一个“租房行情”：`PublicRentalHousingSpanMetadata`固定member/publisher、program/population/observation unit、dataset/table/group/variable/DSD/workbook、tenure、rent basis、level/index/vacancy/turnover/universe/burden grain、geography、survey/rent/income/index/publication period、estimate/MOE/CV/significance/suppression/model、release/revision与rights。十三种`Evidence*RentalHousing*`只由approved exact span形成；advertised不成为achieved，gross不成为contract，level不成为index，vacancy不成为listing，turnover不成为unique tenant/churn，rental universe不成为demand/supply，person/household aggregate不成为individual hardship。address、respondent、tenant/household、landlord/agent/manager、restricted microdata和credential在持久化前drop或quarantine。

公共劳动力需求、职位空缺与周转统计也不能压成一个“招聘热度”：`PublicLaborDemandSpanMetadata`固定member/publisher、program/population/statistical unit、dataset/table/group/variable/series/PID/DSD/workbook、vacancy definition、stock/flow timing、numerator/denominator/scale、SA/NSA/weighted/calibrated/aligned/modelled/imputed、industry/occupation/geography revision、estimate/SE/CV/confidence/response/significance/suppression/status与release lineage。十四种`Evidence*LaborDemand*`只由approved exact span形成；posting不成为vacancy，vacancy stock不成为hire/separation flow，hire不成为filled opening，rate不丢denominator，offered wage不成为actual pay，aggregate characteristic不成为individual requirement。respondent、business contact、person identity、restricted microdata和credential在持久化前drop或quarantine。

公共企业形成、人口学与存续统计不能压成一个“新增/倒闭企业数”：`PublicBusinessDemographySpanMetadata`固定member/publisher、program/population/statistical unit/activity test、dataset/table/group/variable/series/PID/DSD/workbook、lifecycle definition、cohort/horizon、measure/numerator/denominator/scale、actual/projected/spliced、SA/NSA/reactivation/exit model/classification hold/noise/suppression、industry/geography/size/legal-form revision、quality与release lineage。十六种`Evidence*BusinessDemography*`只由approved exact span形成；application不成为business/birth，registration不成为statistical birth，opening不成为entrant，closure不成为death/exit/bankruptcy，employer transition不成为enterprise lifecycle，survival/high-growth不成为identified business成功，job flow不成为hire/separation。EIN/company/legal-unit/address/owner/employee/respondent、restricted register/LBD/IDBR/LEAP microdata与credential在持久化前drop或quarantine。

公共企业破产、清算与重组统计也不能压成“企业失败数”：`PublicBusinessInsolvencySpanMetadata`固定member/jurisdiction/legislation、program/population/statistical unit、publication/dataset/table/resource/series/DSD/workbook、proceeding/event/authority、measure/numerator/denominator/scale、count/rate/index/amount、window/base/weight/SA/NSA、matching/dedup/migration/confidentiality、classification/quality与release lineage。十五种`Evidence*BusinessInsolvency*`只由approved exact span形成；petition不成为order/declaration，filing不成为cessation/death，Chapter 7不成为liquidation complete，Chapter 11/administration/proposal/CCAA不成为rescue success，terminated不成为discharge/payment，declared assets/liabilities不成为verified valuation/recovery。debtor/company/person、case number、SSN/TIN/EIN、address、creditor、attorney、trustee/practitioner、docket/document/free text、account/token与fee-bearing route在持久化前drop、quarantine或policy-block。

公共企业信贷需求与融资条件也不能压成一个“融资难度指数”：`PublicBusinessCreditSpanMetadata`固定member/jurisdiction、survey/program/panel/respondent population、publication/dataset/resource/table/series/question/revision、loan category/borrower segment、standard/availability/demand/price/non-price/approval/performance/driver measure、response scale/direction/balance、weighting/denominator、past/current/expected/historical-range role、quality与release lineage。十六种`Evidence*BusinessCredit*`只由approved exact span形成；lender-reported supply不成为borrower demand或actual volume，standard不成为term/approval，positive value不采用全局方向，net percentage不成为diffusion index，expectation不成为outturn，reported factor不成为cause，default/LGD direction不成为count/amount/insolvency。respondent institution、individual response、market share、borrower/application/loan/facility/open text、credential和未授权observation/file在持久化前drop、quarantine或policy-block。

公共企业经营状况、约束与预期不能压成一个“企业信心指数”：`PublicBusinessConditionsSpanMetadata`固定member/jurisdiction、program/population/statistical unit、publication/dataset/resource/table/series/question/revision、measure/question role、response scale/direction/weighting、recent/current/near-term/6-month/12-month/plan time role、estimate/quality/release/program standing与lineage。十九种`Evidence*BusinessConditions*`只由approved exact span形成；respondent view不成为published estimate、publisher composite、administrative outturn或audited business fact，enterprise/establishment/reporting unit/local unit不互换，selected obstacle不成为most challenging，response share/balance/diffusion/quantitative/composite不互换，expectation不成为outturn/forecast/commitment，planned action不成为approved/funded/started/completed。respondent/business identity、individual response、free text、restricted microdata、credential和未授权observation/file在持久化前drop、quarantine或policy-block；programme处于final collection、final release、transition或discontinued时必须保留独立lifecycle evidence，不能仅因route仍可访问而声明active。

公共企业数字技术采用、能力与障碍必须另附`PublicBusinessDigitalAdoptionSpanMetadata`并引用不可变definition：member/programme/lifecycle、population/frame/statistical unit、questionnaire/question/routing/scale、technology/taxonomy revision、adoption stage、measure、survey/collection/reference time、business/employee/turnover/money/count/intensity/composite representation、weight/estimator/denominator、quality/release/rights均为独立键。二十二种`Evidence*BusinessDigital*`只由approved exact span形成；reported use不成为installed inventory、verified deployment、successful implementation或value realised，online order不成为payment/fulfilment，barrier不成为cause/pain/lead，external support或financing plan不成为procurement/application，security control不成为effectiveness，incident不成为verified breach，DII不替代raw adoption且component-set跨年变化必须隔离。programme active、questionnaire published、results published和machine route current分别记账；respondent/business identity、microdata、credential、未授权cell/file在持久化前drop、quarantine或policy-block。

公共企业创新活动、约束与协作必须另附`PublicBusinessInnovationSpanMetadata`并引用不可变definition：member/programme/lifecycle、Oslo/innovation definition、population/frame/unit、question/routing/scale、product/process kind、introduced/completed-not-implemented/ongoing/abandoned/no-activity status、novelty、multi-year/single-year time、share/count/money/turnover/importance representation、weight/estimator/denominator、quality/release/rights均为独立键。二十三种`Evidence*BusinessInnovation*`只由approved exact span形成；idea/invention/R&D/technology acquisition/activity不成为introduced innovation，innovation-active不成为success/growth/value，cooperation不由information source/outsourcing补齐，barrier不成为cause/lead，public support不成为application/award/payment，protection filing不成为valid right，reported objective/benefit/environmental contribution不成为causal outcome。programme、questionnaire、result和route standing分别记录；identity、microdata、credential和未授权cell/file在持久化前drop、quarantine或policy-block。

公共数字接入、技能与线上参与必须另附`PublicDigitalAccessParticipationSpanMetadata`并引用不可变definition：member/programme/lifecycle、household/individual/respondent/proxy/internet-user population、question/routing/scale、access/use/device/barrier/skill/activity/concern/composite、current/3-month/12-month time、household/person/user share/count/frequency/ordinal representation、weight/replicate-weight/denominator、quality/release/rights均为独立键。二十四种`Evidence*DigitalAccess*`及相关activity/concern evidence只由approved aggregate span形成；household access不成为individual use，availability不成为subscription/reliability/affordability，self-report不成为tested skill，activity不成为completion/benefit，concern不成为incident，incident不成为verified harm，barrier不成为cause/WTP/vulnerability/lead。programme、proposed/fielded questionnaire、result和route standing分别记录；microdata、respondent/household identity、rare/sensitive cell、credential和未授权file在持久化前drop、quarantine或policy-block。

公共家庭支出、消费与预算配置必须另附`PublicHouseholdExpenditureSpanMetadata`并引用不可变definition：member/programme/lifecycle、consumer-unit/household/reference-person/reporting-unit population、Interview/Diary/integrated instrument、question/recall/annualisation、expenditure/consumption/non-consumption/income、classification/category、amount/share/percent-reporting/aggregate/equivalised representation、nominal/real/PPS value basis、weight/denominator、quality/release/rights均为独立键。二十二种`Evidence*HouseholdExpenditure*`只由approved aggregate span形成；expenditure不成为use/need/preference/satisfaction/demand，zero不成为no need，share不成为market share，aggregate不成为market size，nominal/real change不自动成为quantity，income不成为wealth/affordability，sensitive breakdown不成为household profile。programme、instrument、fielded questionnaire、result和route standing分别记录；microdata、diary/respondent/household identity、rare cell、credential和未授权file在持久化前drop、quarantine或policy-block。

公共时间使用、照护、流动与日常活动配置必须另附`PublicTimeUseSpanMetadata`并引用不可变definition：member/programme/lifecycle、population/respondent/diary-day/episode/slot、diary boundary/mode、primary/secondary/secondary-childcare role、activity classification/category、duration/participation/episode-count/share/time-of-day representation、weekday/weekend/average-day/wave、weight/denominator、quality/release/rights均为独立键。二十四种`Evidence*TimeUse*`及activity-role evidence只由approved aggregate span形成；diary day不成为usual routine，duration不成为burden/productivity/preference/outcome/demand，population mean不成为participant mean，travel time不成为trip/reliability，sleep time不成为quality/health，zero不成为never/no need，aggregate breakdown不成为个人schedule/profile。programme、collection、questionnaire、result、file/API和microdata standing分别记录；respondent diary、precise schedule、identity、rare cell、credential和未授权file在持久化前drop、quarantine或policy-block。

公共医疗服务可及性、未满足需求与患者报告障碍必须另附`PublicHealthCareAccessSpanMetadata`：member/programme/lifecycle、population/registration、service、instrument/question、self-reported need/outcome、barrier/main-or-any reason、window、population/needed/user/registered denominator、weight/quality/release/rights均为独立键。二十四种`Evidence*HealthCare*`只由approved aggregate span形成；need不成为clinical necessity/diagnosis，delay/nonreceipt不成为provider denial，cost不成为verified affordability，experience不成为objective quality/outcome，breakdown不成为health profile。response、microdata、identity、rare cell和未授权file在持久化前drop、quarantine或policy-block。

公共家庭能源可负担性、能源不安全与服务连续性必须另附`PublicHouseholdEnergySpanMetadata`：member/programme/authority/lifecycle、housing-unit/household/person/account population、energy service、instrument/indicator/model/guideline、condition/event、amount role、window、denominator、weight/quality/release/rights均为独立键。二十九种`Evidence*HouseholdEnergy*`只由approved aggregate span形成；price不成为bill/expenditure/debt/gap，self-report不成为verified poverty/temperature/harm，LILEE不成为跨成员定义，notice不成为disconnection，disconnection不成为outage，reconnection不成为resolution，account不成为household/person，breakdown不成为individual vulnerability。respondent/customer/account、bill/meter/interval、medical/family-violence/life-support record、microdata、rare cell和未授权file在持久化前drop、quarantine或policy-block。

监管投诉同样不新增更高等级的 `EvidenceRegulatoryComplaint`：来源仍按实际内容派生既有 `EvidenceComplaint` 等类型。complainant narrative是未核验claim，organization response是被投诉方声明，regulator disposition/finding只有exact官方record才能获得对应authority；published、sent-to-company、timely、closed、investigation或recall都不能反向证明每条投诉真实、违法、因果成立或已解决。crash/fire/injury/death等source flags没有exposure denominator时不能计算风险率。NHTSA的root/row/PII gate、CFPB narrative-retirement drift gate与CPSC contract gate必须先于采集、span抽取、索引和动态物化；去身份化、FOIA、HTML或community MCP不能绕过。

产品可靠性也不新增泛化的“用户投诉”证据：issue是provider grouping，event是受instrumentation/sampling/filter/upload选择的系统观测，exception/stacktrace/provider summary不是用户原话。resolved/closed/muted/acknowledged不证明修复或恢复，new/fresh/early/escalating/regressed/repetitive保持provider-derived attribution。只有reviewed failure record可形成`observed-product-failure`候选上下文；要形成complaint、urgency或switching仍需exact support/review/conversation evidence。没有session/exposure denominator时不能计算失败率；没有稳定grouping definition时不能比较issue trend。Sentry/Crashlytics的MCP、Skill、CLI和production test crash不能绕过privacy、effect与zero-write gate。

产品首发同样不新增泛化的 `EvidenceProductLaunch`：`ProductLaunchSpanMetadata` 只描述来源representation。maker/hunter撰写的定位、tagline和首发说明是自述主张；只有reviewed community-authored comment/reply/review span可按实际内容进入complaint、failed-attempt、workaround、urgency或switching等证据类型。featured、daily/weekly/monthly/yearly rank、vote/comment/review count和rating默认只作平台selection、placement或engagement上下文，不能自动证明市场规模、采用、满意、收入或因果效果。Product Hunt API商业批准与当前schema验证必须先于采集、候选抽取和长期索引；HTML、cookie endpoint、社区MCP/Skill或外部CLI不能绕过。

交易市场也不新增泛化的 `EvidenceMarketplaceDemand`。listing title、description、condition、asking/current-bid/Best Offer price首先是seller供给主张；placement、view、watch/favorite、inquiry、bid或negotiated offer只处于不同漏斗阶段，不能单独证明购买、愿付、成交或履约。order line可证明完成checkout，仍需与payment、fulfillment、refund/dispute和feedback分别解释；Browse结果消失可能是ended、removed、out-of-stock、权限或抓取缺口。跨成员价格、市场规模、seller performance或conversion视图只有在各成员精确rights/data-use允许时才能构建；eBay目标用途的书面许可未满足前，policy gate必须在credential、network、PortBinding、候选抽取和materialization之前阻断，HTML/MCP/SDK/manual导入不能绕过。

服务请求也不新增泛化的 `EvidenceServiceDemand`。client-authored job/brief/contest可以提供问题、交付、技能和advertised budget/prize证据，但open/visible不证明仍在积极hire，proposal/bid/entry/interview count不证明独立需求或成功概率。advertised budget不是proposal rate，proposal/offer或bid/award不是accepted contract，milestone request不是funded/released milestone，logged time/invoice也不是payment。只有精确rights允许的reviewed request span才能进入需求证据；响应和结果用于校准行动接近度，不能覆盖原始请求或成为自主人才评分输入。Upwork用途门与Freelancer.com书面许可/storage gate都必须在credential、network、PortBinding、持久Observation、候选抽取、index和materialization之前阻断；即时输出或sandbox事实不得因技术上可读而进入动态物化候选。

### 5.7 Opportunity Synthesizer

Opportunity 是多个 DemandSignal 的可决策聚合，不等于“热门主题”。建议按维度评分，不在核心契约中固化单一公式：

- pain severity；
- independent recurrence；
- budget/payment evidence；
- urgency/timing；
- current workaround cost；
- audience reachability；
- probeability；
- strategic fit；
- evidence diversity 与 counter-evidence penalty。

分数必须保存每个维度和解释，不能只保存总分。

### 5.8 Probe Planner

Probe 是主动验证，不是普通 publication 的别名。一个有效 ProbePlan 必须绑定：

- hypothesis：要证伪什么；
- target segment 和 channel rationale；
- offer、message、CTA；
- 一个主要变量及可选 control；
- exposure window、cost budget、sample constraints；
- primary metric、guardrail metric 和决策阈值；
- truthful/fulfillable 声明；
- connection、capability requirement 和不可变 plan hash；
- preview 时解析并冻结的 resolution、route、account、adapter/capability version。

Probe 类型可以是 landing page、问卷、内容 CTA、真实商品/服务报价、公开 demo、广告或人工访谈邀请。虚假招聘和不可履约商品不是有效 Probe 类型。

服务采购Probe必须存在真实hire/pay意图、合法的定制数字服务、预算、deadline、acceptance标准和履约负责人。draft、publish/update/close、invite、proposal、message、offer、contract、milestone、time、payment与feedback是不同外部效果；ghost job、free work、spam/duplicate、自动proposal/message、Agent自主ranking/selection、binding agreement和fund/withdraw/pay均不能由需求研究能力执行。timeout保持unknown并先reconcile，禁止跨route重发。

本地服务Probe必须来自真实客户授权和可履约订单。资格/估价是携带地址和潜在quota/cost的外部compute；availability或Search Context是短期capacity/匹配claim；filtered search若由平台外部模型处理free text，还需独立disclosure/consent；quote/bid可能锁价并保留真人时段；Request、booking、appointment、message、job-status、reschedule、cancel会形成Lead、协议、沟通、平台统计、付款、通知、退款或取消费。每一步都独立preview/approval/idempotency/receipt/reconcile，不能因同属一个checkout或Negotiation自动连续执行。平台数据在AI/warehouse/index用途未获精确授权时不得进入Agent prompt；webhook也必须按已固定auth contract验真、幂等接收，再与自有Project/Negotiation pull状态对账。

问卷 Probe 还必须固定 sample frame/recruitment、instrument revision、consent/withdrawal、anonymous/recontactable mode、display/recontact/fatigue、response lifecycle、non-response coverage 与 deletion plan。创建 response 不是安全测试手段：某些平台会触发 webhook、integration 或 follow-up；live conformance 使用本地 fixtures 或经授权的人工 synthetic respondent。draft、publish、close、delete、webhook配置和invite/reminder是不同副作用能力。

人工访谈/客户会话 Probe 还必须把 recruitment/invitation、calendar scheduling、meeting join、recording start、transcription、media acquisition、follow-up/recontact 和 deletion 分为不同 effect。默认只允许 proposal/manual handoff；没有参与者 notice/consent、purpose、host policy、retention/delete plan 与人工 operator 时，不得自动邀请、加入 bot 或开始录音。会后分析只能引用 exact transcript revision 的最小 span，speaker/role unknown 时不得生成 customer quote。

读取已有客户邮件不授权发送新邮件。email invitation、reply、reply-all、forward、draft、send、sequence enrollment、unsubscribe handling与delivery/reply metrics是独立Probe effects；必须固定已有关系/consent、truthful content、recipient roster、frequency、unsubscribe/suppression、owner、preview/approval/outbox/receipt/reconcile。采集credential或read-onlySkill不得持有任何send/modify/delete route。

读取客户社区不授权发帖、reply、reaction、join、invite、创建/唤醒thread或moderation。Slack/Discord community Probe必须固定真实受众、truthful message、mention/notification范围、频率、moderation owner、retention/delete/reconcile与平台用途权利；Discord archived thread上的send还可能自动unarchive/join。默认只允许proposal/manual handoff，且policy-blocked成员连synthetic live Probe也不能执行。

读取公开软件工单不授权create、comment/reply、reaction、label、assign、close/reopen、move、link/unlink、merge、quick action、webhook配置或任何repository/project写入。这类平台上的主动Probe默认只允许proposal/manual handoff，并必须由独立写能力、目标项目owner、truthful内容、通知范围、频率、moderation与reconcile计划重新授权；GitLab.com的policy-blocked采集能力也不能借Probe或synthetic account变相验证。

读取公开技术讨论不授权question/story/Topic/comment/reply、vote、thank、accept、flag、edit、delete、sticky、boost或moderation。Stack Exchange写入需独立能力与平台用途审查；当前Pack全部拒绝。HN Guidelines明确不接受generated或AI-edited text，且反对主要推广和索取投票/评论/提交，因此系统不得生成HN Probe后用manual handoff绕过。V2EX当前无公开Topic/Reply create API，community rules还限制AI-generated text、无关回复、推广和link spam；sandbox/create/promotions Node都不是Agent Probe捷径。所有blocked/gated成员都不能通过synthetic account、MCP、Skill或第三方CLI执行live conformance。

读取公开早期采用者渠道不授权post/comment/reply、message、vote、review、feature或moderation。Reddit 当前没有获批 route，全部写入和 synthetic live Probe 都拒绝。Product Hunt 未来只可为真实、可用、自有且可履约的产品生成 `manual-package`，由真实个人账号人工核验并发布；API 写入继续拒绝，系统不得生成或代发 maker/community 评论、索取或操纵投票、批量私信。manual handoff 不能绕过平台商业批准、社区规则、preview、人工确认与 receipt/reconcile。

交易市场 Probe 只能发布合法、自有、真实可履约的商品或服务 offer，不能用want ad、placeholder、虚假库存、诱导价、重复listing或人工订单占位测点击。inventory、offer、publish、update、withdraw、send offer/message、marketing、order、refund、fulfillment和feedback是不同effect；sandbox只验证协议与状态机，不产生需求证据。每个production publish都要固定seller/marketplace、商品权利、category/format、price role、库存、费用、shipping/return/fulfillment义务、listing payload hash和一次性批准；成功必须由平台ID与read-back receipt证明，timeout/5xx后先reconcile，禁止跨route或盲目重发。eBay当前无execute route，闲鱼只保留manual-package设计。

产品内受控实验需要更强的稳定契约。`ExperimentPhase` 必须不可变地固定 eligibility、millionth allocation weights、assignment unit/method/hash/seed revision、sticky/reassignment、namespace/layer/holdout、真实 exposure trigger、metric definitions、MDE/sample/duration、analysis/correction/variance-reduction 与 stopping rule。assignment 不是 exposure；改 audience、allocation、treatment、metric 或 analysis definition 会追加 phase/iteration，默认不跨 phase pooling。

平台动词不能直接成为能力。`ExperimentLifecycleIntent` 分别声明 serving、analysis、notification 与 definition-transition effect；create draft、publish config、start allocation、stop assignment、stop analysis、serve treatment 与 rollback 是不同 capability。GrowthBook/LaunchDarkly 的“stop”可能把某个 treatment 服务给全部匹配用户，因此不得映射成 generic cancel。只有 exact phase、真实 exposure、完整 metric window 以及 SRM/crossover/pre-exposure bias/definition drift 等 integrity checks 通过时，才允许 causal inference；否则降级为 directional/inconclusive/invalidated。

### 5.9 Probe Action、Outbox 与 Reconciliation

副作用端口固定拆分：

```text
validate -> preview -> approve -> prepare -> enqueue -> execute
        -> submitted/processing -> reconcile -> terminal outcome
```

- `preview` 无外部副作用并产生 payload hash。
- 批准绑定 plan hash、resolution/route、账号、adapter/capability version 和到期时间。
- `prepare` 产生不可变 execution intent。
- `execute` 只能由 outbox worker 调用，不能由模型工具直接调用。
- 超时或连接断开返回 `unknown`，必须先 reconcile，禁止盲目重发。
- `manual-package` 也是正式 adapter：回执由用户提交的平台 URL、截图或外部 ID 构成，可信度显式标记。
- experiment lifecycle 的 unknown 必须同时 reconcile serving config、analysis state、notification 与 provider iteration；不得仅凭 HTTP timeout 推断未生效，也不得换 route 重发。

可靠执行由下列独立事实组成：

| 对象 | 责任 |
| --- | --- |
| `ProbeRun` | 一次计划执行的聚合状态，使用 state version 做 CAS |
| `ExecutionIntent` | 经批准冻结的 payload hash 与 idempotency key |
| `ProbeOutboxItem` | 可调度工作、重试时间和是否必须对账 |
| `WorkLease` | worker 的有期所有权，不代表外部动作成功 |
| `OperationAttempt` | 一次真实尝试及其开始、结束、错误分类 |
| `ProbeReceipt` | 平台返回或人工提交的外部事实 |
| `ReconciliationObservation` | 对 unknown/not-found/confirmed 的独立反查事实 |

状态更新必须绑定 lease token 与 state version；lease 过期只允许其他 worker 接管账本工作，不自动证明此前外部调用没有成功。`unknown` 只能进入 reconcile 队列；只有能证明未提交且错误被标记为 retryable 时才允许重试执行。长期无法判断的项目进入 `suspended`，由用户处理，而不是无限重试。

Probe adapter 也按最小端口拆分：validator、previewer、preparer、executor、reconciler、canceller。手工交接通常只实现 previewer/preparer；没有 cancel 能力的平台无需实现伪取消。

### 5.10 Metrics 与 Learning Review

指标统一为带语义和质量信息的 observation：

- exposure、click、save、reply、inquiry、qualified lead、deposit、purchase、refund；
- metric window、source、collection mode、aggregation 和 uncertainty；
- variant/cohort、sample size、exposure count、numerator/denominator；
- mapping version、attribution model、dedupe rule、data watermark 和 missing rate；
- 不能把不同平台的“播放”“浏览”“曝光”直接相加；
- 不能把代理指标升级为付费结论。

LearningReview 对假设的判断只有：`supported`、`weakened`、`inconclusive`、`invalidated`。它引用 Probe revision、收据、指标和偏差说明，并可提出下一版假设。

每个 Probe 必须声明推断等级：

- `qualitative`：评论、访谈、私信、人工反馈，只形成主题和反例；
- `directional`：非随机渠道对比，可说明方向，不能声称因果；
- `causal`：必须保存 assignment unit/method、control、exposure、attribution 和停止规则。

当平台不给出可靠分母、曝光或分配事实时，即使计划写了多个 variant，也必须降级为 `directional` 或 `qualitative`。

### 5.11 可观测性与运行语义

可观测性是跨切面，不是某个 adapter 后面的数据库。一次操作从入口创建同一个 `OperationContext`，在异步边界继续传播：

```text
scope + correlation + causation + trace/parent span
+ principal + connection/connector + adapter/capability version
+ knowledge snapshot + resolution/route + run + attempt + policy decision
```

同步调用中的取消、deadline 和当前 span 通过语言运行时的 request context 传播；`OperationContext` 是需要跨队列、进程、人工交接和持久事实继续保留的稳定关联字段。两者职责不同，不能只依赖进程内 context，也不应把整个 `OperationContext` 塞进无约束日志字段。

四条记录链各自回答不同问题：

| 记录链 | 回答的问题 | 核心对象 |
| --- | --- | --- |
| Domain lineage | 状态如何变化、由什么输入产生 | `DomainEvent`、revision、evidence、derivation |
| Governance audit | 谁基于什么授权做了什么 | `AuditEvent`、PolicyDecision、Approval |
| Operational telemetry | 哪里慢、哪里错、是否积压和超支 | span、measurement、health、SLO、cost、rate limit |
| Experiment integrity | 结果是否可比较、数据是否完整 | experiment design、exposure/sample、metric quality、bias |

Audit、日志和 trace 不能保存正文、个人标识、Cookie、token、完整 URL 或平台外部 ID。metric dimensions 必须是受控的低基数字段；需要调试的原始响应进入受权 Evidence Store，遥测只保存 blob/evidence ref。

最低运行指标：

| 组件 | 必须观测 |
| --- | --- |
| Platform Knowledge | proposal age、review backlog、CAS conflict、evidence expiry、snapshot drift |
| Connector | 调用量、延迟、错误分类、限流余量、凭据/证据过期、单位成本 |
| Collection | checkpoint age、source lag、yield、duplicate rate、coverage status、schema/normalize failure |
| Repository | append latency、CAS conflict、tombstone/retention/correction backlog、data-handling required-vs-applied gap、monetary/behavior/conversation/community/public-discussion/product-launch/external-search-demand semantic rejection |
| Projection/Retrieval | queue age、projection lag、失败率、召回延迟、空结果率、命中率、build/maintenance cost、storage bytes |
| Product analytics integrity | instrumentation heartbeat/lag、invalid/quota/drop、definition/taxonomy drift、identity split/merge correction、partial-period exposure、TTL/deletion gap、illegal unique/ratio rollup |
| Customer conversation integrity | recording/transcript readiness lag、artifact revision/language drift、speaker unknown/role conflict、ASR gap/overlap、derived-without-source、private/restricted coverage、consent/redaction/retention/delete propagation |
| Customer correspondence integrity | metadata/body scope gap、mailbox/folder/label roster drift、history/delta reset、watch/subscription gap、immutable-ID coverage、quoted-span duplicate、content/participant-role unknown、attachment quarantine、trash/delete/retention/hold propagation |
| Customer community integrity | platform-use/org/technical authority gap、deployment/policy drift、channel visibility/roster/permission drift、content omitted-vs-empty、thread/relation/actor-role conflict、Slack event retry/disabled/late gap、Discord sequence/resume/0-N delivery gap、edit/delete/retention propagation、zero-write conformance age |
| Software work-item integrity | host/deployment/version/schema与data-use policy drift、project/repository roster、ID/IID和item/record/content-role conflict、native state/reason与reviewed lifecycle drift、label/milestone/iteration/relation taxonomy、pagination/search/truncation coverage、permission/404/delete传播、webhook signature/template/duplicate/reconcile gap、MCP/CLI/Skill negative-write conformance age |
| Public discussion integrity | member policy/contract/purpose/evidence expiry、surface/taxonomy/container/selection/ranking/acceptance/moderation drift、thread/record/representation/content-role与exact relation conflict、Stack Exchange site/filter/page/backoff/revision-license、HN list-rank/updates/tree/dead-deleted/external-artifact、知乎query/summary/excerpt/HasMore/Artifact、V2EX legacy-v2/Beta/schema/pagination/rate/PAT/Node-move/list-placement coverage、MCP/Algolia/HTML/Skill fallback rejection、zero-write conformance age |
| Product feedback integrity | Channel/member/population/contract/rights evidence expiry、API/export/tool/schema drift、review/rating/aspect/reply/summary/excerpt representation conflict、verification/incentive/solicitation missingness、content-role coverage、exact-vs-candidate comparison/switching relation、vendor-response/resolution claim、identity/firmographic drop、license/retention/deletion propagation、HTML/browser/scraper/MCP fallback rejection、zero-review-write conformance age |
| Product launch integrity | member policy/evidence/schema expiry、Product Page/launch/Post mapping、topic/pricing/availability/ranking/featuring/promotion drift、product/launch/record/content-role与exact relation conflict、placement snapshot和history/comment/review coverage、identity merge candidate backlog、HTML/cookie/MCP/Skill/CLI fallback rejection、AI-comment/vote-manipulation/zero-write conformance age |
| Site search intent integrity | surface/index/rule roster drift、schema/ranking/synonym/filter/locale definition drift、total-vs-tracked/captured denominator、typeahead pause/empty query、submitted-vs-expanded representation、zero/null/late、flush/retention lag、event/query attribution、internal/bot/synthetic exclusion、query PII quarantine |
| External search demand integrity | provider/surface/API/dataset/methodology valid window、population/subject/seed/target drift、geography/language/network/window/timezone、sampling/normalization/scaling/approximation、relative/count/index/rank/suggestion/forecast representation conflict、BigQuery top-list truncation、account/auction/config dependence、coverage/watermark、rights/entitlement/token/tool drift、cross-member arithmetic rejection、zero-write conformance age |
| Product request integrity | board/forum/group/status roster drift、representation/author-vs-on-behalf、support measure definition、merge/parent/delivery lineage、public/internal role leak、cursor/offset/page gap、history/support/comment coverage、broad credential negative-write、PII/monetary quarantine、delete/unvote/tombstone propagation |
| Public petition integrity | member/jurisdiction/process/schema/privacy drift、eligibility/admissibility/moderation/rejection、support count regression/invalidation/paper-online reconciliation、threshold-to-actual-response/debate gap、authority/status/relation conflict、language/common-origin coverage、creator/signer/contact/geo/special-category drop、HTML/community/sibling fallback rejection、zero political-participation write age |
| Participatory budgeting integrity | member/deployment/process/round/schema/privacy drift、scope与proposal/ballot roster coverage、admissibility/feasibility/costing/merge lineage、support-vs-vote与online-paper reconciliation、measure/weighting/ballot/envelope rule conflict、selection-to-budget-to-appropriation gap、amount-role conflict、winner-only/stale coverage、execution lag/status conflict、identity/contact/exact-location/demographic/political-data drop、provider/member fallback rejection、zero political-budget write age |
| Public information access integrity | member/deployment/provider/version/customization/jurisdiction/law/body-roster/schema/privacy/rights drift、public/private/embargo/hidden/deleted visibility、message/delivery/authentication lineage、native status/classifier-authority conflict、deadline/calendar/clarification/extension、fee/withholding/release/redaction/review coverage、requester/natural-person/contact/address/signature/ID/IP/annotation drop、unreviewed attachment quarantine、provider/member fallback rejection、zero formal-request/write age |
| Analysis | derivation latency、模型 route/version、token/cost、解析失败、证据覆盖率、authority conflict、duplicate economic-event candidate |
| Probe | approval invalidation、queue age、attempt count、unknown age、reconcile latency |
| Learning | missing metric、mapping drift、sample/exposure ratio、bias flag、结论等级 |

Health snapshot 是有过期时间的当前判断，不能替代时间序列指标；capability maturity 是产品完成度，也不能替代 live health。SLO 至少覆盖采集新鲜度、投影延迟、Probe unknown 对账时长和 ledger 持久化成功率。底层可以映射 OpenTelemetry，但本契约不绑定具体 backend。

## 6. 两条关键时序

### 6.1 观察闭环

```text
ResearchQuestion
  -> OperationContext + CollectionPlan + PolicyDecision
  -> resolve capability + bind typed port
  -> PullReader.read(binding, cursor) / PushReceiver.receive(binding, delivery)
  -> append Observation
  -> advance checkpoint
  -> Canonicalizer proposes SourceItem revision
  -> repository CAS commit
  -> Indexer projects revision
  -> Retriever returns EvidenceSpan
  -> Signal Miner proposes DemandSignal
  -> reviewer accepts/rejects
  -> Opportunity Synthesizer updates opportunity revision
```

必须先持久化 Observation 再推进 checkpoint，保证 at-least-once；canonicalizer 负责幂等。

### 6.2 验证闭环

```text
Opportunity revision
  -> ProbeHypothesis
  -> ProbePlan revision
  -> capability requirement + policy/health resolution
  -> bind typed preview/prepare/execute ports
  -> immutable preview + payload hash
  -> one-time approval
  -> ProbeRun + execution intent + outbox
  -> claim lease + OperationAttempt
  -> external action/manual handoff
  -> receipt
  -> unknown ? reconciliation : terminal outcome
  -> metric observations
  -> LearningReview
  -> next signal/opportunity/hypothesis revision
```

## 7. 接入模式与降级

可靠性从高到低：

1. `official-api`
2. `official-feed-export`
3. `authorized-export`
4. `delegated-api`
5. `public-feed`
6. `browser-assisted`
7. `manual-import` / `manual-package`
8. `private-api-cookie`（默认拒绝）
9. `unsupported`

降级是连接器契约的一部分，但不能跨越 adoption decision。例如知乎官方搜索被合同阻止或暂不可用时，只能接受用户主动提供且有权使用的本地URL/摘录作为`manual-import`，并标`selected-only`；它不能补成知乎search population、自动打开原文、调用private API、安装community MCP或建立长期索引。V2EX Node roster不可用或用途未澄清时，也不能退到HTML、第三方search/scraper/MCP、旧API未正式列出的endpoint或另一Channel成员；用户主动提供的本地摘录只能保留其自身selection provenance，不能冒充Node/list coverage。闲鱼自动执行被拒绝时只能生成真实商品交接包，不能退到private mtop/Cookie；BOSS自动化被拒绝时只能保留本地、用户主动提供的最小职位evidence intake候选，不能把它写成平台Connector。猎聘即使存在官方用户Agent/CLI，也只能按用户本人、exact capability和即时目的建route；它不能降级到网页抓取，也不能升级成公共市场数仓、招聘者自动化或向量索引。

## 8. 控制面与安全

- 外部内容永远是不可信数据，正文不能触发工具、修改政策或扩大查询范围。
- 密钥只由 DSH Credentials 持有；领域对象仅保存 credential ref 或短期 lease ref。
- 浏览器会话由共享 Browser/Computer capability 持有，连接器不能把 Cookie 复制给模型。
- 权利元数据与内容一起传播到 chunk、embedding、brief 和 probe variant。
- 删除/撤权先产生 tombstone，再按 retention 策略清理 blob 与 projection；审计历史保留最小事实。
- 每个连接器实例有速率、费用、条数和外部动作预算。
- 任何平台可由 kill switch 独立暂停，不影响核心仓库和其他 connector。
- 默认去标识化；作者标识只有在引用、去重或权利要求确有必要时保留。
- 所有持久对象属于显式 `ScopeRef`；即使当前是单人 local-first，也不使用隐式全局命名空间。
- 自由扩展必须是带 namespace/schema/hash 的 extension payload；policy、audit 和 telemetry 不接受未声明的任意敏感 map。

## 9. DSH 组合边界

- `dsh-social-workbench`：在当前阶段继续拥有来源、信号、内容/Probe 和结果领域设计；现有 social adapter 是第一个 channel pack。
- DSH Credentials/Settings：分别拥有 secret 与普通配置；本系统只保存引用。
- `dsh-progressive-formulation-worksurface`：可承载长周期研究和 revision DAG，但不取代领域事实仓库。
- Browser/Computer capability：持有可见浏览器与本机 UI 会话；本系统只申请有界操作。
- `dsh-multi-model-provider`：拥有模型 route；derivation 只记录 route/version。
- 模型工具：只允许 staging、读取去身份化证据和生成候选对象；批准、真实采集、执行、对账与反馈写入保留在用户控制面。

## 10. Go 设计契约

`design/go/demandintel/` 是本架构的设计态表达，不进入 `package.json`、Cordis bundle、CLI 或当前测试基线。

| 文件 | 抽象 |
| --- | --- |
| `doc.go` | 包边界与禁止事项 |
| `types.go` | scope、稳定 ID、typed ref、revision、operation context、page、evidence 和错误分类 |
| `contract.go` | 规范契约、状态和现有 runtime compatibility mapping |
| `platform_knowledge.go` | 平台概念、能力、接入方法、snapshot 与 Agent proposal/review/commit |
| `platform_discovery.go` | 平台候选、外部 artifact、Platform Skill、验证阶梯、Pack 与 drift |
| `channel_pack.go` | 多 Platform Pack 组合、Channel Skill、显式 source roster/query scope 与组合发布边界 |
| `connector.go` | adapter catalog、connection/connector、route 与动态 resolution |
| `ingress.go` | collection plan、pull/push/manual/reconcile 小型端口、coverage、normalizer，以及 `JobPosting*`/`RecruitingEngagement*` 等来源语义抽象 |
| `repository.go` | observation/evidence/canonical revision 与分析事实仓库端口 |
| `index.go` | projection、materialization policy/telemetry、indexer、retriever 与 retrieval trace |
| `analysis.go` | signal miner、opportunity synthesizer、review |
| `probe.go` | hypothesis、experiment、approval、run/outbox/attempt、receipt/reconcile、metric/learning |
| `governance.go` | policy、credential lease ref、audit、capability verification |
| `observability.go` | domain event、span/metric、health/SLO、cost/rate limit |

这些文件只包含类型和 interface，不包含构造器、网络调用、持久化、goroutine、重试或平台代码。

## 11. 演进顺序

### Phase 0：设计与证据目录

- 固定通用对象、端口和接入模式。
- 固定规范 Schema 的所有权、版本和兼容映射规则。
- 完成平台价值/官方能力/开源候选调研。
- 用 fixture 审查契约能否同时表达 RSS pull、CRM webhook、知乎 API、闲鱼人工 Probe、招聘公开 API 和现有社媒闭环。
- 用契约场景验证重复 webhook、checkpoint 崩溃、lease 过期、execute unknown、对账 not-found、指标缺失和撤权删除。

### Phase 1：第二场域验证

- 不增加通用运行时；选择一个非社交场域做契约级 spike。
- 首选：官方知乎搜索、公开 ATS 招聘 API 或 manual-import。
- Probe 首选：自有 landing page/manual-package；闲鱼仅做真实可履约方案的人工交接。

### Phase 2：决定是否提取 core

只有出现以下证据才拆分通用 core：

- 至少两个场域共享相同 repository/index/signal/probe 语义；
- 差异能稳定收敛在 edge adapter；
- Social Workbench 的内容发布对象不再适合承载通用 Probe；
- 拆分不会产生第二套凭据、仓库或批准真相。

### Phase 3：Platform Pack 工厂

- 用真实需求数据和 channel gap 生成有界 discovery campaign；
- 只读扫描官方门户、GitHub、connector/MCP/skill 目录，形成 candidate/dossier；
- Agent 只生成 knowledge proposal，review 后提交 snapshot；
- 每个平台按 evidence、contract、fixture、sandbox 和 canary 阶梯验证；
- capability 通过后发布 Pack，并持续监控 docs、API、license、schema 和 runtime drift。
- 多平台场域在成员 Pack 独立验证后发布 Channel Pack；组合验证不能替代成员验证。

## 12. 未决问题

- 首个业务垂直是消费、本地服务、开发者工具还是企业软件；这会改变平台优先级。
- 当前默认单人 local-first，但所有对象已有显式 scope；是否启用多租户与团队审批仍会改变 policy 和 UI，不改变对象身份边界。
- 原始证据的默认 retention、删除请求和跨境数据边界。
- Opportunity 评分由用户配置、垂直模板还是模型建议。
- 主动 Probe 是否允许付费广告、订金或真实交易；分别需要单独预算与授权门。
- 何时启用 Dolt 类版本知识库、何时把分析事实迁移到独立 OLAP；在协作 diff/merge 需求和真实规模数据出现前不绑定产品。
