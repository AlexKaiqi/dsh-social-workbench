# 平台知识、事实仓库与动态投影架构

状态：设计草案，不代表当前运行时能力
核验日期：2026-08-26
范围：只定义知识、事实和派生索引的边界与抽象；不选择或实现具体数据库。

平台候选如何被发现、外部 skill/开源项目如何审计、知识如何通过验证形成可发布 Platform Pack，见[新平台发现与 Platform Pack 长期架构](./PLATFORM_DISCOVERY_LONG_TERM_ARCHITECTURE.md)。

## 1. 核心判断

“抖音是什么、有哪些概念、理论上有哪些能力和接入方法”与“今天采到了哪些视频、评论和指标”不是同一类数据。

```text
平台知识：我们在某个 commit 对平台的理解是什么？
观测事实：某个 connector 在某时刻实际看到了什么？
查询投影：为了当前检索/分析，哪些派生结果值得持续维护？
```

三者必须分别拥有事实源：

| 层 | 典型对象 | 更新特征 | 合适的存储语义 |
| --- | --- | --- | --- |
| Platform Knowledge | 视频、创作者、评论、指标等概念；搜索、读取、发布等能力；官方 API、浏览器、导出等接入方法 | 低频、Agent 整理、需审阅、会被新证据修订 | append commit、branch、diff、merge、as-of snapshot |
| Observation Facts | 视频 revision、评论、职位、商品、指标采样、采集回执 | 高频、append-first、按事件时间与维度分析 | 分区、列式扫描、去重、时间窗、OLAP |
| Derived Projections | 搜索倒排、embedding、facet、聚合、关系视图、热查询结果 | 可删除重建、受查询负载驱动 | 显式或增量物化、checkpoint、freshness SLO |

索引和物化视图永远不是事实源；Connector 也不拥有平台知识。Connector 只把一个已经版本化的接入方法绑定到本机 adapter、账号、凭据引用和运行状态，然后获取事实。

## 2. 平台知识模型

一个 `PlatformKnowledgeSnapshot` 是对单个平台的一次可追溯“认知提交”，包含：

- `PlatformDefinition`：平台身份、资源命名空间、账号类型和条款证据；
- `CapabilityDefinition`：平台无关的稳定操作语义；
- `PlatformConceptDefinition`：平台概念、字段、生命周期和概念关系；
- `PlatformCapabilityDefinition`：某能力作用于哪些概念、返回哪些概念及其语义；
- `AccessMethodDefinition`：官方 API、公开 feed、授权导出、浏览器辅助或人工导入等接入方法；
- 证据、作者、提交说明、父 snapshot 和 merge parents。

以抖音为例，概念知识可以包括：

```text
creator ── publishes ──> video ── has ──> comment
   │                       │                 └── reply
   │                       ├── metric-sample(view/like/share/...)
   │                       ├── topic/hashtag
   │                       └── audio
   └── owns/operates ──> account
```

这张图描述的是类型与关系，不存储任何具体用户、视频或评论。平台能力则把稳定操作映射到这些概念：

```text
discovery.search.videos/v1
  subject: video
  result: video
  access methods: official-open-api/vN, browser-public-search/vN

engagement.read.comments/v1
  subject: video
  result: comment, comment-reply
  access methods: official-open-api/vN, browser-public-detail/vN
```

“存在接入方法”只表示有证据支持的理论表面，不表示本机有授权、健康 adapter 或可调用账号。

AMO 之类的产品反馈平台也遵循同一分层：add-on、version、rating/review、developer reply、aggregate/latest projection及其关系属于版本化 Platform Knowledge；某条具体 review/reply 属于 Observation Facts；按产品版本聚合的兼容性回归、未解决主张与迁移候选属于 Derived Projections。Chrome/JetBrains 缺 official review route 也是知识 snapshot 中的可追溯 capability gap，不应通过 materialization 或 HTML fallback 补成事实。

监管投诉进一步展示知识与事实不能混合：NHTSA的ODINO/CMPLID root policy、2021空值cutover、2026字段新增，CFPB的2026-08 narrative retirement，以及CPSC的publication eligibility属于版本化Platform Knowledge；某条投诉、component row、叙述或企业回应属于Observation Facts；reported-problem、response-gap和schema-drift视图属于Derived Projections。知识更新可以让capability局部degrade，但不能删除旧snapshot或让FOIA/HTML/MCP自动成为新route。

## 3. Agent 整理与提交

Agent 可以采集资料并生成 `KnowledgeProposal`，但 proposal 不是知识事实。建议流程是：

```text
官方文档/条款/SDK/合规 live probe
                │
                ▼
        原始 evidence / observation
                │
                ▼ Agent 提取与对齐
      KnowledgeProposal(base snapshot + diff)
                │
          人工/政策 review
                │ accepted + compare-and-swap
                ▼
        PlatformKnowledgeSnapshot
```

关键约束：

- 每个 proposal 指明 base snapshot，提交时校验 head，防止并发覆盖；
- 结论必须引用 evidence 或 observation，记录 curator/prompt/version；
- 纠错使用 supersede/deprecate 和新 commit，不原地改写历史解释；
- credential、Cookie、账号授权、当前健康和限流不进入知识 snapshot；
- 具体视频、评论、指标样本不进入知识 snapshot。

## 4. Connector 的位置

Connector 是执行层，不再负责定义平台概念。调用路径应为：

```text
PlatformKnowledgeSnapshot
  capability + concepts + access method
                  │
                  ▼ adapter 声明实现哪个 access method
AdapterCapabilityRoute
                  │ bind local config/account/credential refs
                  ▼
ConnectorInstance / CapabilityRoute
                  │ resolve policy/auth/health/cost
                  ▼
CapabilityResolution / PortBinding
                  │
                  ▼
Observation(knowledge snapshot + concept ref + raw payload)
```

`CapabilityResolution`、`PortBinding`、`CollectionPlan`、`Observation` 和规范化 revision 都记录 snapshot ID。这样平台知识升级后，历史运行仍能解释“当时按哪个概念和接入定义执行”。

Adapter route 必须同时声明：

- 它实现的 `AccessMethodRef`；
- 它映射的 `CapabilityRef`；
- 输入/输出 mapping 与最小 typed ports；
- 该声明完成 conformance 时校验所依据的 knowledge snapshot；
- adapter 自身的版本、证据和 conformance suite。

## 5. 存储边界

### 5.1 版本化平台知识

设计端口是 `VersionedPlatformKnowledge`，而不是 `DoltRepository`。它要求 snapshot、head、diff、proposal、decision 和 CAS commit 语义。

Dolt 是候选实现，因为它给 SQL 表提供 Git 风格 commit graph、branch、diff 和 merge，并可通过系统表查询历史与差异：[Dolt Version Control](https://www.dolthub.com/docs/sql-reference/version-control/)、[Dolt System Tables](https://www.dolthub.com/docs/sql-reference/version-control/dolt-system-tables/)。

但采用条件应是：

- 平台知识已稳定为关系表；
- 多 Agent/多人分支、diff、merge 和 SQL as-of 查询确有价值；
- 运维一个独立版本数据库的收益高于成本。

在规模很小、主要是 Schema/Markdown 且由 Git review 管理时，Git-backed 文件也可以先满足同一抽象。业务层不得依赖 Dolt 特有 SQL。

### 5.2 分析事实仓库

`AnalyticalFactWarehouse` 接收 append-first `Observation`。每条事实带：

- platform concept ref 与 knowledge snapshot；
- connector/route/run、外部 ID、event/source-updated/observed time；
- payload schema/hash/blob ref、rights 与 retention；
- 原始 payload 指针，而不是把不可控大对象复制进所有投影。

具体 OLAP 产品留到数据量、查询模式和部署约束明确后决定。版本知识和事实仓库可以在本地小规模阶段共享物理数据库，但逻辑端口、迁移和保留策略仍需分开。

## 6. 动态物化视图与索引

### 6.1 统一抽象

`ProjectionSpec` 描述“从哪些事实源、通过什么版本化定义，生成哪种查询投影”；`ProjectionMaterialization` 记录实际构建物、source checkpoint、snapshot、lag 和状态。

产品反馈可定义 `post-adoption-frictions-by-product-version`、`compatibility-regression-candidates`、`switching-reason-candidates`、`verification-incentive-and-solicitation-context`、`vendor-response-and-resolution-claim` 与 `missing-marketplace-members` 等 projection；它们必须固定 `ProductFeedbackDefinitionMetadata` revision、member binding/population、contract/rights purpose、verification/incentive missingness、schema/tool digest、coverage 和 watermark。exact provider switching relation与text-derived candidate分开，full review、licensed excerpt与provider summary按lineage去重但不互补。rating scale、selection/solicitation population 或许可不一致时，不生成跨市场总分、rank或market share。review 删除/许可撤回使相关 spans、摘要和索引失效，但不改写原 knowledge commit；knowledge snapshot只保留可审计的decision/lineage/tombstone，不保留已撤权内容。

商业体验反馈可定义 `experience-frictions-by-subject-location-and-service`、`business-response-and-resolution-claims`、`representation-and-sample-gap`、`verification-origin-and-incentive-context` 与 `business-experience-rights-schema-and-deletion-drift`；每个projection固定 `BusinessExperienceFeedbackDefinitionMetadata` revision、member/product/population/representation、subject/location、selection/sort、rights purpose、coverage与watermark。owned history、licensed full feed、latest/relevance sample、excerpt、aggregate和provider answer不能互补；aggregate=1000而返回5条时只记录5/1000 sample gap，不按topic外推。cache expiry、合同撤销、review deletion或deletions feed都会产生按record/contract可寻址的invalidation，重建派生索引；Dolt只保留Pack、contract/schema digest、view definition、decision和tombstone，不保留已撤权正文。

公共资助可定义 `open-funding-priorities-by-programme-topic-and-window`、`funded-rd-activity-by-classification-period-and-authority`、`opportunity-to-award-project-lineage`、`funded-project-result-claims` 与 `public-funding-rights-schema-and-refresh-drift`；每个projection固定 `PublicFundingDefinitionMetadata` revision、member/product/representation、classification、amount role、authority、selection/coverage和watermark。current opportunity、search placement、annual support、bulk snapshot、linked-data与provider-classified record不能互补；机会金额、award obligation、current-year/direct/indirect support和reported total不可相加成“市场规模”。定义/schema/Terms/license、分类体系、API/bulk差异、项目修订或结果权利变化都会失效相关派生索引并触发重建；Dolt只保留Pack、definition、schema/license digest、view definition、decision、lineage与tombstone，分析数据库保存获准的版本化记录和数值事实。provider-linked publication/output仅进入带authority的claim view，不进入validated-result view。

公共采购可定义`open-requirements-by-buyer-lot-classification-and-deadline`、`requirement-to-award-to-contract-lineage`、`original-current-potential-amendment-obligation-outlay-by-exact-role`、`contract-change-option-and-deobligation-history`、`reported-milestone-completion-performance-and-termination-by-authority`、`prime-award-subaward-and-framework-call-up-relations`与`member-route-schema-terms-rights-threshold-privacy-drift`；每个projection固定`PublicProcurementDefinitionMetadata` revision、member/population/regime/threshold、process/procedure/lot/award/contract/transaction revision、amount role/status、representation、rights purpose和coverage。late/correction/history、schema/terms/licence、identity/relation或privacy变化触发partition invalidation/rebuild；Dolt保存Pack、definition、procedure/amount/classification taxonomy、digest、review、view、decision、lineage与tombstone。分析库只接获准的最小organization/process metadata；natural-person、contact、bid/complaint narrative和confidential documents不进入，也不跨amount role物化总市场规模或vendor ranking。

公开规则制定可定义 `open-regulatory-change-windows-by-jurisdiction-authority-and-topic`、`proposed-obligations-and-implementation-questions`、`formal-stakeholder-frictions-and-alternatives`、`proposal-to-final-and-consultation-outcome-lineage`、`common-origin-register-docket-publication-graph` 与 `rulemaking-rights-schema-identity-and-coverage-drift`；每个projection固定 `PublicRulemakingDefinitionMetadata` revision、member/product/representation、official status、authority、campaign/duplicate counting、rights purpose、coverage与watermark。public-inspection、informational rendition、official edition、current docket、published submission、outcome summary、aggregate和machine translation不能互补；comment=100000而published/campaign-dedup未知时只记录population gap，不生成支持率或unique demand。withdrawal/correction、field visibility、anonymization、license/privacy/schema、proposal→final relation或source common-origin变化都会使相关span/index失效并触发重建；Dolt只保留Pack、definition、schema/terms/privacy digest、view、decision、lineage与tombstone，不保留已撤权身份或附件正文。

公开公司披露可定义 `issuer-stated-strategic-priorities-by-industry-period`、`reported-corporate-investment-by-role-and-accounting-context`、`risk-and-operational-constraint-change-by-filing-lineage`、`filing-amendment-restatement-and-correction-lineage`、`cross-registry-and-exchange-common-origin-graph` 与 `corporate-disclosure-rights-schema-taxonomy-and-coverage-drift`；每个projection固定 `PublicCorporateDisclosureDefinitionMetadata` revision、member/product/representation、entity/form/report period、authority/official status、taxonomy/context/unit/dimensions、historical/forecast/forward-looking/audited、amount role、rights purpose、coverage与watermark。regulator JSON、official archive、iXBRL、extracted fact、registry metadata/document、licensed feed、PDF与issuer copy不能互补；同label但context或dimension不同只记录mapping conflict。amendment/restatement/correction、taxonomy/schema、entity mapping、license/Terms、PII或content right变化会使相关span/index失效并触发重建；Dolt只保留Pack、definition、schema/taxonomy/terms/license digest、view、decision、lineage与tombstone，不保留人员身份、签名或未获权exhibit正文。

公开技术标准可定义 `emerging-normative-requirements-by-ecosystem-and-process-stage`、`compatibility-deprecation-removal-migration-by-target-version`、`proposal-regression-withdrawal-obsolescence-and-supersession-lineage`、`formal-implementation-feedback-and-test-evidence-by-work-item`、`living-versus-immutable-edition-drift` 与 `standards-process-schema-rights-and-coverage-drift`；每个projection固定 `PublicTechnicalStandardDefinitionMetadata` revision、member/product/process revision、native lifecycle、normativity、authority、edition/commit、compatibility role、provider/source authority、rights purpose、coverage与watermark。W3C/TC39流程升级、WHATWG latest commit、IETF正交state、OpenJDK index taxonomy、supersession/withdrawal或license变化会使相关span/index可定位失效并触发重建。Dolt保存Pack、process/schema/license digest、taxonomy mapping、view、decision、lineage与tombstone；未获准的规范全文、issue/comment与test corpus不进入分析库。

公开产品召回可定义 `new-and-expanded-corrective-actions-by-product-domain-and-jurisdiction`、`hazard-defect-noncompliance-by-authority-and-native-class`、`voluntary-requested-ordered-measures-by-action-kind`、`amended-withdrawn-terminated-and-follow-up-lineage`、`affected-lot-batch-model-and-distribution-scope` 与 `recall-representation-language-schema-rights-and-coverage-drift`；每个projection固定 `PublicProductRecallDefinitionMetadata` revision、member/product/jurisdiction、event/campaign/product/range/action、native state/class、authority/mandate、incident assertion、representation/language common-origin、rights purpose、coverage与watermark。correction/withdrawal、status/schema/route/license/translation变化使相关projection/span失效并触发重建；Dolt只保存Pack、definition、schema/license digest、view、decision、lineage与tombstone，未获准的recall正文、附件、VIN和身份不进入分析库。没有exposure/recovered denominator不物化风险率或完成率，没有独立用户证据不把recall物化成痛点规模。

公开科研文献可定义`reported-limitations-by-domain-method-population-and-work-version`、`failure-cases-assumptions-and-validity-threats-by-context`、`unmet-research-needs-future-work-and-replication-gaps`、`correction-retraction-withdrawal-and-version-lineage`、`cross-provider-common-origin-and-identity-conflicts`与`metadata-abstract-fulltext-rights-coverage-and-route-drift`；每个projection固定`PublicResearchLiteratureDefinitionMetadata` revision、member/corpus/query、work/version/expression/record、native lifecycle、authority/classification、representation、licence/purpose/entitlement与coverage。version/correction/retraction/withdrawal、provider merge/delete、schema/DTD/protocol/taxonomy/licence变化使相关partition/span失效并重建；Dolt只保存Pack、definition、schema/license digest、identity/relation review、view、decision、lineage与tombstone。未获准论文正文、作者身份和credential不进入分析库；provider annotation不物化为author-reported limitation，citation/OA/index count不物化为scientific impact或需求规模。

公开临床研究注册可定义`new-and-updated-study-plans-by-condition-intervention-and-design`、`suspended-terminated-withdrawn-and-early-ended-by-native-reason`、`anticipated-vs-actual-enrollment-and-recruitment-status`、`completed-with-results-posted-missing-or-late`、`protocol-amendment-status-and-results-history`、`cross-registry-secondary-id-and-common-origin-conflicts`与`registry-route-schema-rights-and-contact-drop-drift`；每个projection固定`PublicClinicalStudyDefinitionMetadata` revision、member/registry/population、study/protocol/record revision、native lifecycle/authority、outcome/results representation、rights purpose和coverage。status/amendment/correction、WHO bridge、schema/TRDS/terms/license变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、schema/terms digest、identity/relation review、view、decision、lineage与tombstone。未获准results/documents、contact/site/participant/IPD不进入分析库；没有registry-specific obligation/denominator不物化compliance、recruitment rate、efficacy、安全性或患者需求。

公开药品供应短缺可定义`anticipated-current-resolved-discontinued-by-exact-presentation-and-jurisdiction`、`duration-and-expected-end-revision-drift`、`reported-causes-by-authority-and-native-taxonomy`、`reported-mitigation-import-and-substitution-instruments`、`product-presentation-identity-and-common-origin-conflicts`、`official-aggregate-trends-with-denominator-definitions`与`member-route-schema-rights-and-contact-drop-drift`；每个projection固定`PublicMedicineSupplyDefinitionMetadata` revision、member/population/jurisdiction、event/product/presentation revision、native state/availability/impact、authority、cause/mitigation、representation、rights purpose和coverage。status/correction/archive、schema/terms/licence、identity mapping和aggregate methodology变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、schema/terms digest、identity/relation review、view、decision、lineage与tombstone。未获准cause/mitigation content、contact、patient/prescription/local inventory不进入分析库；没有exact denominator不物化shortage rate、patient impact、market size或医疗建议。

公共监管执法可定义`allegations-vs-findings-vs-admissions-by-exact-legal-basis`、`proposed-vs-entered-final-effective-obligations`、`complaint-order-judgment-appeal-vacatur-remand-history`、`remedy-penalty-redress-by-exact-amount-role-and-currency`、`repeated-conduct-patterns-by-exact-authority-and-posture`、`document-release-feed-case-common-origin-conflicts`与`member-route-schema-terms-rights-privacy-drift`；每个projection固定`PublicRegulatoryEnforcementDefinitionMetadata` revision、member/authority/jurisdiction、matter/case/proceeding/instrument revision、posture/finality/obligation status、representation、rights purpose和coverage。case/document/history、schema/terms/licence、identity/relation或privacy policy变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、taxonomy/licence digest、identity/relation review、view、decision、lineage与tombstone。分析库只接获准的最小organization/case metadata；natural-person、victim/witness、contact和原始敏感document不进入，也不物化guilt、risk或respondent ranking。

公共申诉专员裁决可定义`issues-by-domain-and-exact-native-outcome`、`investigator-or-preliminary-to-final-decision-history`、`final-to-acceptance-binding-and-appeal-history`、`remedies-by-exact-type-amount-role-binding-and-compliance-status`、`repeated-reported-failure-patterns-with-publication-lag-and-withholding-caveat`、`page-document-feed-common-origin-conflicts`与`member-route-schema-terms-rights-anonymisation-publication-drift`；每个projection固定`PublicDisputeDecisionDefinitionMetadata` revision、member/authority/jurisdiction/domain、case/decision revision、stage/native outcome/binding/remedy/appeal、representation、rights purpose和各自coverage。definition、publication policy、schema/terms/licence、identity/relation或history变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、procedure/outcome/remedy/binding taxonomy digest、licence/terms digest、identity/relation review、view、decision、lineage和tombstone。分析库只接获准的最小case/domain/respondent-organization/outcome metadata；complainant identity、initial、address、contact、personal ref和原始敏感decision content不进入，也不物化投诉率、普遍责任、payment/completion或respondent ranking。

公共审计可定义`findings-by-exact-scope-criteria-authority-and-topic`、`finding-to-recommendation-response-and-implementation-history`、`auditee-reported-vs-auditor-confirmed-status-gaps`、`recommendations-by-exact-native-status-and-age`、`follow-up-selection-and-confirmation-gaps`、`potential-vs-reported-realized-benefit-by-method`、`report-page-document-feed-tracker-dataset-common-origin`与`member-route-schema-process-rights-methodology-status-drift`；每个projection固定`PublicAuditFindingDefinitionMetadata` revision、member/publisher/jurisdiction、report revision、scope/criteria/method/selection、finding/recommendation、response/implementation authority、representation、rights purpose和各自coverage。definition、methodology、status taxonomy、schema/terms/licence、identity/relation或history变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、process/report/finding/recommendation/status taxonomy digest、licence/methodology digest、identity/relation review、view、decision、lineage和tombstone。分析库只接获准的最小organization/report/finding/recommendation/status metadata；natural-person、contact、whistleblower/witness、raw sensitive report/working-paper content不进入，也不物化organization performance/risk ranking或跨method benefit总额。

公共311可定义`requests-by-exact-service-type-origin-and-coarse-area`、`open-age-and-source-declared-disposition-by-native-status`、`request-assignment-and-routing-history`、`possible-repeat-patterns-with-duplicate-uncertainty`、`service-type-roster-and-participating-agency-coverage`、`current-state-vs-observation-history-gaps`、`annual-temporal-partition-and-common-origin-conflicts`、`location-coarsening-and-privacy-drop-audit`与`member-schema-refresh-rights-privacy-drift`；每个projection固定`PublicCivicServiceRequestDefinitionMetadata` revision、member/jurisdiction、dataset/resource/partition、request revision、service taxonomy、origin、native status/disposition authority、history、approved coarse location、representation、rights purpose和coverage。definition、taxonomy、partition、privacy/location、schema/terms/licence、identity/relation、history或refresh contract变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、service/status/disposition/source taxonomy digest、dataset/resource manifest、licence/privacy/refresh digest、identity/relation/location review、view、decision、lineage和tombstone。分析库只接获准的jurisdiction/service/category/agency/native-status/coarse-location metadata；natural-person/contact、exact address/coordinates、media、raw description/status note不进入，也不物化people/incident count、physical resolution、neighbourhood/agency performance ranking。

公共请愿可定义`petitions-by-exact-jurisdiction-topic-action-and-lifecycle`、`support-snapshot-history-with-invalidation-coverage`、`threshold-to-actual-response-and-debate-gap`、`moderation-and-rejection-reason-by-process-revision`、`official-response-committee-debate-report-history`、`bilingual-and-multilingual-common-origin`、`dissolution-election-withdrawal-and-closure`与`member-route-schema-process-threshold-privacy-rights-drift`；每个projection固定`PublicPetitionDefinitionMetadata` revision、member/jurisdiction/legislature/process、petition revision、support counting snapshot、member threshold、authority/status、representation/language、rights purpose和各自coverage。process/threshold/counting/schema/privacy/language/rights/history或parliament term变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、process/threshold/counting/status/language/privacy/rights/schema digest、identity/relation/revision、view、decision、lineage和tombstone。分析库只接获准的opaque petition/topic/lifecycle/support aggregate/threshold与official-action metadata；creator/signer identity、contact/address/postcode/IP、精细地域、special-category profile和未审查敏感全文不进入，也不物化代表性民意、constituency/topic政治排名、采纳或实施。

公共参与式预算可定义`proposals-by-exact-round-scope-category-and-lifecycle`、`proposal-evaluation-ballot-lineage-and-merge`、`prioritization-support-versus-final-vote`、`selection-under-envelope-and-budget-fit`、`selected-to-budget-inclusion-to-appropriation-gap`、`implementation-status-and-milestone-history`、`estimate-ballot-selected-appropriated-spend-role-conflicts`、`online-offline-language-common-origin`与`member-deployment-schema-process-vote-privacy-rights-drift`；每个projection固定`PublicParticipatoryBudgetDefinitionMetadata` revision、member/deployment/process/round/scope、proposal/ballot roster、stage/authority、measure/weighting/ballot/envelope rule、amount role、representation/language、rights purpose和各stage coverage。process/deployment/schema、eligibility/roster、weighting/selection/envelope、status、privacy/rights/history变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、rules/status/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage和tombstone。分析库只接获准的opaque project/scope/category/lifecycle、aggregate measure和amount role；identity/contact、comments/attachments、exact location、demographics/political profile和未审查敏感文本不进入，也不物化cross-city popularity、拨款/支出/客观完成或政治倾向排名。

公共信息公开请求可定义`records-sought-by-exact-jurisdiction-law-body-and-lifecycle`、`request-message-disposition-release-review-lineage`、`target-body-transfer-consolidation-and-duplicate-history`、`classification-authority-and-native-status-conflicts`、`full-partial-refused-not-held-no-response-fee-by-fixed-published-population`、`deadline-extension-clarification-and-overdue-by-exact-calendar`、`withholding-basis-to-review-outcome`、`release-metadata-redaction-privacy-and-rights-coverage`、`public-embargo-hidden-deleted-history`与`member-provider-deployment-schema-law-privacy-rights-drift`；每个projection固定`PublicInformationAccessDefinitionMetadata` revision、member/deployment/provider/customization、jurisdiction/legal regime/public-body roster、published population、request/message/event/release revision、classification authority、deadline calendar、visibility/embargo、fee/withholding/review、representation/language、rights purpose和各自coverage。deployment/schema、law/body roster、status authority、visibility/privacy、deadline/fee/withholding/review rules、rights/history变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、provider/deployment/law/body/status/deadline/fee/withholding/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage和tombstone。分析库只接获准的opaque request/body/topic/lifecycle/disposition/deadline/fee/release-review metadata；requester/natural-person/contact/address/signature/ID/IP/annotation、private/embargo记录、未审查attachment/text不进入，也不物化truth、fault、legal compliance、unique people、representative opinion、full disclosure或content truth/reuse right。

公共规划申请可定义`applications-by-exact-jurisdiction-process-authority-type-and-stage`、`requested-land-use-change-by-action-and-approved-site-scope`、`application-amendment-document-timeline-lineage`、`exhibition-window-and-renotification-coverage`、`representations-by-approved-topic-posture-and-fixed-published-population`、`applicant-response-and-amendment-after-representation`、`advisory-recommendation-to-competent-decision-gap`、`decisions-conditions-contributions-and-appeal-history`、`approval-to-expiry-certificate-implementation-gap`、`public-withheld-not-assessed-document-history`、`exact-location-and-personal-data-drop-audit`与`member-provider-dataset-schema-process-privacy-rights-drift`；每个projection固定`PublicPlanningApplicationDefinitionMetadata` revision、member/deployment/jurisdiction/process、authority roster、application/action/site/revision、exhibition/window/population、role/posture/finality、representation、spatial/privacy/rights purpose和各stage coverage。process/schema、roster/population、window/renotification、visibility、decision/finality、location、privacy/rights/history变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、authority/status/decision/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage和tombstone。分析库只接获准的opaque application/action/coarse-area/stage/posture/aggregate/decision/condition metadata；exact address/coordinate/parcel/BBL/UPRN、自然人/contact/donation、submission body/attachment和未审查document不进入，也不物化truth、民意、法律正确、built/occupied/compliance或impact。

公共建筑监管可定义`work-applications-by-exact-jurisdiction-authority-type-and-stage`、`application-to-issued-valid-permit-gap`、`permit-work-type-discipline-and-revision-lineage`、`issued-to-inspection-evidence-gap`、`inspection-result-by-exact-stage-discipline-and-partial-scope`、`failed-no-entry-waived-reinspection-lineage`、`complaint-to-inspection-to-violation-authority-gap`、`violation-order-adjudication-compliance-correction-history`、`permit-expiry-revocation-void-current-validity`、`certificate-request-temporary-partial-final-loc-lineage`、`permit-to-final-certificate-gap`、`active-cleared-legacy-current-coverage`、`exact-location-person-professional-id-comment-document-drop-audit`与`member-dataset-resource-schema-code-process-license-privacy-drift`；每个projection固定`PublicBuildingRegulationDefinitionMetadata` revision、member/deployment/jurisdiction/code/process、authority roster、application/permit/work item、inspection/result、finding/adjudication/compliance、certificate type/status/scope、population/origin/representation及location/privacy/rights purpose。schema/resource、code/process、roster/population、effective/fee rule、inspection/finding/certificate taxonomy、location/privacy/rights/history变化触发partition invalidation/rebuild；Dolt只保存Pack、definition、authority/status/result/finding/certificate/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage和tombstone。分析库只接获准的opaque application/permit/work item/coarse-area/stage/posture/certificate metadata与aggregate；exact address/unit/coordinate/parcel/PIN/BBL/BIN/GeoID、自然人/contact/professional ID、complaint narrative、inspector comments、plans/photos/documents不进入，也不物化truth、commencement/completion、法律正确、current safety、actual occupancy或success。

公共职业/经营许可可定义`licenses-by-exact-jurisdiction-authority-category-subject-kind-and-standing`、`application-to-issued-license-gap`、`renewal-change-supersession-lineage`、`inspection-result-by-exact-activity-scope-and-subject-kind`、`complaint-investigation-charge-finding-authority-gap`、`finding-to-sanction-to-appeal-stay-variation-history`、`sanction-to-monitoring-remediation-removal-reinstatement-history`、`current-register-vs-disciplinary-history-coverage`、`business-entity-establishment-professional-identity-separation-audit`、`person-license-address-contact-sensitive-condition-document-drop-audit`与`member-board-schema-process-status-publication-privacy-rights-drift`；每个projection固定`PublicRegulatedLicenseDefinitionMetadata` revision、member/deployment/jurisdiction/process、authority/board roster、subject population/kind、license category、standing/result/finding/finality/sanction/remediation、publication/suppression及purpose/privacy/rights。schema/file/contract、roster/population、status mapping、process、publication/removal、purpose/privacy/rights/history变化触发partition invalidation/rebuild；Dolt只保存Pack、definition/taxonomy、contract/schema digest、opaque identity/relation/revision、view、decision、lineage和tombstone。分析库只接获准的organization/business/establishment或去身份化coarse aggregate metadata；natural-person ref/name、license number、address/contact、exact establishment、complaint/health narrative与document不进入，也不物化competence、reputation、actual practice、continued compliance、discipline或erased history。

公共环境监管可定义`permits-by-exact-jurisdiction-program-media-status-and-revision`、`application-to-issued-varied-revoked-surrendered-gap`、`permit-condition-and-limit-revision-lineage`、`monitoring-requirement-to-measurement-report-or-nonreceipt-gap`、`measurements-by-exact-parameter-kind-method-unit-statistic-period-derivation-reporting-basis-and-qualifier`、`measurement-to-limit-comparability-and-comparison-audit`、`exceedance-to-system-self-report-authority-finding-gap`、`inspection-car-incident-to-finding-and-enforcement-lineage`、`notice-order-penalty-to-remediation-and-return-to-compliance-history`、`annual-release-transfer-trend-by-exact-thresholded-reporting-population`、`site-facility-installation-source-outfall-identity-migration-audit`、`known-data-alert-rights-expiry-location-identity-document-drop-audit`与`member-schema-program-reporting-unit-threshold-process-rights-drift`。每个projection固定`PublicEnvironmentalRegulationDefinitionMetadata` revision、exact member/resource/program/population、permit/limit revision、measurement kind/method/unit/statistic/period/derivation/reporting basis/qualifier、comparison/compliance authority、known alert与purpose/privacy/rights。Dolt只保存Pack、definition/taxonomy、schema/resource digest、known alert、opaque identity/relation/revision、view/decision/lineage/tombstone；分析库只接获准的必要精度metadata/value，不接exact coordinate/outfall、敏感设施、operator/natural-person/contact、complaint prose或document，也不物化operation、automatic comparability、legal violation、exposure/harm或verified recovery。

污染场地与修复可定义`notification-to-assessment-to-designation-gap`、`potential-notified-detected-confirmed-significant-posture`、`site-parcel-operable-unit-source-area-medium-boundary-revision`、`contaminants-by-exact-medium-method-unit-statistic-qualifier-without-risk-inference`、`hazard-pathway-receptor-risk-assessment-coverage`、`responsibility-to-liability-authority-gap`、`remedy-decision-design-action-construction-operation-monitoring-lineage`、`action-phase-vs-whole-site-completion-gap`、`control-selected-in-place-verified-released-history`、`deletion-closure-reuse-vs-residual-stewardship-gap`、`cost-role-separation`与`location-party-document-raw-sample-drop-audit`。每个projection固定`PublicContaminationRemediationDefinitionMetadata`、exact program/population/resource、boundary/process revision、authority、coverage、rights与privacy；Dolt保存稳定定义和lineage，分析库只接获准metadata，不自动物化risk、harm、liability、clean closure或payment。

饮用水安全可定义`supplier-system-component-zone-point-identity-lineage`、`registration-current-lapsed-withheld-deferred-coverage`、`requirement-to-sample-result-or-missing-report-gap`、`results-by-exact-stage-parameter-method-unit-statistic-period-and-qualifier`、`result-standard-applicability-comparability-audit`、`test-failure-to-originator-authority-violation-gap`、`monitoring-reporting-treatment-quality-violation-separation`、`event-notification-to-investigation-classification-enforcement-lineage`、`advisory-kind-scope-history`、`project-ready-operations-pending-confirmation-return-lineage`、`lift-recommendation-vs-rescission-gap`、`resolved-archived-resolution-basis-audit`、`denominator-separation`与`security-location-person-document-raw-value-drop-audit`。每个projection固定`PublicDrinkingWaterSafetyDefinitionMetadata`、exact member/resource/program/population、standard/process/schema/lag revision、authority、coverage、security/privacy/rights；不自动物化whole-system safety、exposure、illness、actual lift或zero residual risk。

环境空气质量可定义`network-station-monitor-area-grid-identity-lineage`、`observation-by-pollutant-method-unit-statistic-period`、`preliminary-verified-validated-corrected-history`、`measured-vs-modelled-downscaled-interpolated-gap-filled-audit`、`member-index-definition-breakpoint-completeness-special-mode`、`forecast-issue-amendment-validity`、`event-attribution-gap`、`issuer-advisory-standing-history`、`health-audience-horizon`、`standard-comparison-compliance-separation`、`station-area-grid-person-denominator-separation`与`location-person-private-sensor-document-drop-audit`。每个动态projection固定`PublicAmbientAirQualityDefinitionMetadata`、exact member/product/resource/network/population、method/index/forecast/alert/schema revision、authority、coverage、privacy/rights与valid window；不跨AQI/DAQI/European AQI/AQHI换算，不把nearest station、model fill、forecast、trigger或health guidance自动物化为个人暴露、issued alert、法律违规、cause、diagnosis或harm。

公共食品安全可定义`establishment-premises-permit-identity-lineage`、`inspection-occurrence-type-scope-to-citation`、`scheme-specific-violation-severity`、`member-rating-definition-and-history`、`enforcement-closure-reinspection-reopening-lineage`、`operator-reported-vs-authority-verified-correction-gap`、`complaint-origin-vs-finding-gap`、`outbreak-mode-setting-etiology-vehicle-attribution`、`illness-hospitalization-known-death-known-denominator-separation`、`active-current-latest-vs-history-coverage`与`merchant-person-complaint-inspector-patient-free-text-drop-audit`。每个动态projection固定`PublicFoodSafetyDefinitionMetadata`、exact member/resource/population、native rating/severity/process revision、authority、history、coverage、privacy/rights与valid window；Dolt只保存Pack、稳定定义/taxonomy、route/schema digest、opaque identity/relation/revision、view decision、lineage和tombstone，分析库只接获准的最小结构化事实。projection不跨评分体系换算，不把pass、citation、closure、reopening、complaint origin或outbreak attribution自动物化为持续安全、疾病、永久失败、历史清除、投诉成立或exact premises因果关系。

公共交通可定义`agency-operator-mode-feed-product-roster`、`schedule-revision-service-day-route-pattern-trip-stop-lineage`、`prediction-revision-to-source-reported-actual-event`、`missing-stale-no-data-cancelled-separation`、`alert-active-window-informed-entity-cause-effect-history`、`alert-to-observed-impact-gap`、`station-pathway-required-facility-topology`、`facility-outage-restoration-current-journey-candidate`、`performance-by-exact-population-threshold-numerator-denominator-period`、`cross-member-metric-non-comparability`与`vehicle-employee-rider-journey-security-free-text-drop-audit`。每个动态projection固定`PublicTransitServiceDefinitionMetadata`、exact member/feed/product/service-day/schema/extension、identity/freshness、authority、coverage、privacy/rights与valid window；Dolt只保存Pack、稳定定义、feed/schema digest、opaque identity/relation/revision、view decision、lineage和tombstone，分析库不保留逐秒车辆轨迹。projection不把schedule、prediction、missing entity、alert、static accessibility、outage/restoration或同名百分比自动物化为actual、cancellation、measured impact、current accessible journey或可比绩效。

公共道路安全可定义`member-jurisdiction-publisher-dataset-release-roster`、`population-reporting-threshold-road-scope-fatality-window`、`release-vintage-schema-codebook-table-grain-key-lineage`、`collision-unit-road-user-casualty-linked-outcome`、`severity-basis-separation`、`provisional-final-correction-history`、`factor-assertion-to-confirmed-cause-gap`、`coordinate-crs-snap-coarsen-suppress`、`count-to-compatible-exposure-rate`、`fixed-grid-or-segment-hotspot-candidate`、`active-hazard-vs-historical-collision`与`sensitive-field-small-cell-drop-audit`。每个动态projection固定`RoadSafetyDefinitionMetadata`、exact member/dataset/release/schema/population、geography/precision、coverage、suppression、privacy/rights和valid window；Dolt只保存Pack、稳定定义、resource/schema/codebook digest、opaque relation/revision、view decision、lineage和tombstone。projection不把fatal census、police report、coded factor、preliminary value、collision count、spatial cluster或active hazard自动物化为all crashes、cause/fault、final value、risk、causal hotspot或collision。

公共消费价格可定义`member-publisher-program-product-route-roster`、`program-population-household-consumption-scope`、`classification-version-item-segment-lineage`、`quote-average-weight-index-change-separation`、`currency-unit-package-tax-discount-outlet-geography`、`base-price-weight-reference-publication-period`、`quality-replacement-imputation-seasonal-tax-treatment`、`missing-vs-explicit-availability`、`first-current-revised-rebased-backcast-history`、`compatible-denominator-only-affordability`与`restricted-outlet-transaction-drop-audit`。每个动态projection固定`PublicConsumerPriceDefinitionMetadata`、exact member/program/product/release/classification/method、measure/change、period、coverage、rights和valid window；Dolt只保存Pack、稳定定义、route/schema/classification/method digest、opaque relation/revision、view decision、lineage和tombstone。projection不把quote、average、weight、index、missing value、rebase或national CPI自动物化为representative price、pure inflation、demand、stockout、price shock或individual affordability。

公共租赁住房可定义`member-program-product-route-roster`、`dwelling-structure-unit-household-person-grain`、`eligible-sampled-published-population-exclusion`、`tenure-classification-lineage`、`advertised-achieved-contract-gross-occupied-vacant-turnover-modelled-rent-basis`、`mean-median-distribution-level-index-change-separation`、`rental-universe-vacancy-available-listing-future-supply`、`turnover-window-repeat-policy`、`housing-cost-allowance-income-denominator-threshold`、`household-vs-person-burden`、`estimate-MOE-CV-significance-suppression-model`与`release-method-break-history`。每个projection固定`PublicRentalHousingDefinitionMetadata`、exact population/unit/basis/measure/geography/period/quality/rights和valid window；Dolt只保存Pack、稳定定义、route/schema/table/DSD/workbook/method digest、opaque relation/revision、view decision、lineage和tombstone。projection不把rent level、vacancy、turnover、universe或aggregate burden物化为price index、listing supply、unique tenant churn、market demand或individual hardship。

公共劳动力需求可定义`member-program-product-route-roster`、`posting-vs-statistical-vacancy-isolation`、`establishment-enterprise-location-post-employee-person-grain`、`vacancy-definition-and-reference-date`、`stock-moving-average-quarter-distinct-flow-separation`、`vacancy-occupied-employment-hire-separation-measure`、`numerator-denominator-scale`、`SA-NSA-weighted-calibrated-aligned-modelled-imputed`、`offered-lower-bound-converted-vs-actual-paid-wage`、`industry-occupation-geography-classification-revision`、`estimate-SE-CV-confidence-response-significance-suppression-status`与`release-benchmark-method-break-history`。每个projection固定`PublicLaborDemandDefinitionMetadata`、exact population/unit/definition/measure/timing/denominator/adjustment/classification/quality/rights和valid window；Dolt只保存Pack、稳定定义、route/schema/series/PID/DSD/workbook/method digest、opaque relation/revision、view decision、lineage和tombstone。projection不把posting、vacancy stock、hire/separation flow、offered wage或aggregate characteristic物化为同一“招聘热度”、filled opening、actual pay、unique people或individual job requirement。

公共企业形成与人口学可定义`member-program-product-route-roster`、`application-registration-birth-formation-opening-isolation`、`legal-unit-enterprise-firm-establishment-employer-job-person-grain`、`activity-test-and-population-window`、`opening-entrant-reopening-first-employee`、`closure-temporary-extended-death-exit-shutdown`、`actual-projected-spliced-four-eight-quarter-cohort`、`birth-cohort-survival`、`high-growth-threshold-window-age`、`employment-job-flow-vs-labor-flow`、`SA-NSA-reactivation-exit-model-classification-hold-noise-suppression`与`release-confirmation-method-break-history`。每个projection固定`PublicBusinessDemographyDefinitionMetadata`、exact population/unit/activity/lifecycle/cohort/measure/denominator/estimate/adjustment/classification/quality/rights和valid window；Dolt只保存Pack、稳定定义、route/schema/series/PID/DSD/workbook/method digest、opaque relation/revision、view decision、lineage和tombstone。projection不把application、registration、enterprise/employer lifecycle、opening/entrant/reopening、closure/death/exit、survival/high-growth或job flow物化为同一“企业新增/倒闭”、identified company state、成功或hire/separation。

公共企业破产与重组可定义`member-legislation-program-route-roster`、`distress-petition-filing-order-declaration-commencement-isolation`、`case-proceeding-filing-debtor-company-business-legal-unit-person-grain`、`business-nonbusiness-consumer-individual-business-classification`、`native-liquidation-reorganisation-receivership-moratorium-procedure`、`filed-terminated-pending-flow-stock`、`formal-outcome-vs-commercial-effect`、`procedure-vs-business-death-exit-dissolution-gap`、`count-rate-index-amount-and-denominator`、`base-weight-SA-NSA-match-dedup-migration`、`declared-financial-vs-verified-recovery-payment`与`release-correction-method-break-history`。每个projection固定`PublicBusinessInsolvencyDefinitionMetadata`、exact legislation/population/unit/proceeding/event/measure/denominator/adjustment/quality/rights和valid window；Dolt只保存Pack、稳定定义、route/table/resource/DSD/workbook/method digest、opaque aggregate relation/revision、view decision、lineage和tombstone。projection不保存case/docket/company/person identity，也不把formal procedure物化成企业死亡、失败原因、重组成功、债权回收或销售lead。

公共企业信贷条件可定义`member-survey-panel-route-roster`、`lender-supply-borrower-demand-actual-volume-isolation`、`respondent-response-weighted-response-question-series-grain`、`standard-availability-term-approval-margin`、`native-loan-category-and-borrower-segment`、`measure-specific-positive-direction`、`net-percentage-diffusion-index-balance-mean`、`unweighted-market-share-loan-stock-national-share-weighting`、`past-current-expected-historical-level`、`price-non-price-term`、`performance-direction-vs-event-level-amount`、`reported-driver-vs-causality`与`question-panel-sign-weight-schema-rights-release-history`。每个projection固定`PublicBusinessCreditDefinitionMetadata`、exact panel/question/loan/borrower/measure/direction/balance/weight/time/quality/rights和valid window；Dolt只保存Pack、稳定定义、route/schema/DSD/workbook/question/method digest、opaque aggregate relation/revision、view decision、lineage和tombstone。projection不保存respondent/borrower/application/loan identity，也不把survey opinion物化成identified lead、approval、credit volume、default event、融资建议或因果。

公共企业经营状况可定义`member-program-route-roster`、`respondent-view-published-estimate-composite-administrative-outturn-audited-fact-isolation`、`employer-business-enterprise-establishment-reporting-unit-local-unit-grain`、`invitation-respondent-response-weighted-response-estimate-index-release-grain`、`core-rotating-supplement-ad-hoc-question-lineage`、`activity-demand-price-cost-workforce-supply-chain-constraint-resilience-confidence-capacity-investment-measure`、`selected-vs-most-challenging-obstacle`、`recent-current-near-term-six-twelve-month-plan-time-role`、`response-share-balance-diffusion-quantitative-composite-separation`、`measure-specific-positive-direction`、`design-nonresponse-calibrated-count-turnover-employment-country-sector-weighting`与`programme-release-quality-history`。每个projection固定`PublicBusinessConditionsDefinitionMetadata`、exact population/unit/question/scale/direction/weight/time/quality/lifecycle/rights和valid window；Dolt只保存Pack、稳定定义、route/schema/questionnaire/method digest、opaque aggregate relation/revision、view decision、lineage和tombstone，具体高频估计进入分析数据库。projection不保存respondent/business identity，也不把reported condition物化成audited fact、identified lead或因果，把composite当raw response，把expectation当outturn/forecast/commitment，或把plan当approved/funded/started/completed。question、population、weight、programme standing、schema或rights变化只使受影响partition失效并触发correction/rebuild，不改写旧snapshot。

公共企业数字技术采用可定义`technology-taxonomy-and-question-roster`、`applicable-tested-current-intensity-planned-stage`、`internet-presence-ecommerce-software-cloud-ai-analytics-iot-automation-security-skills`、`ai-vs-generative-ai-by-taxonomy-revision`、`online-order-payment-fulfilment-separation`、`business-employee-turnover-money-count-composite-representation`、`internal-external-expertise-and-support-intent`、`non-use-reason-barrier-denominator`、`control-vs-incident-vs-verified-security-fact`、`ict-specialist-training-hard-to-fill-workforce-impact`与`programme-questionnaire-result-route-lifecycle`视图。Dolt只保存`PublicBusinessDigitalAdoptionDefinitionMetadata`、programme/question/taxonomy/stage/method/release/rights、fixed OSS/Skill revision、view decision与lineage；approved aggregate cells进入分析数据库。dynamic materialization按knowledge/release revision重建，taxonomy、question、denominator、DII component set、population、schema、quality或rights变化只使对应partition失效；失败回退canonical scan，不回退republisher、generic MCP、other member或HTML scraping。

公共企业创新可定义`idea-invention-randd-activity-introduced-innovation`、`product-goods-service-business-process`、`new-to-business-market-world`、`introduced-completed-not-implemented-ongoing-abandoned-no-activity`、`three-year-activity-vs-single-year-amount`、`internal-joint-adapted-external-development`、`cooperation-information-outsourcing`、`active-vs-noninnovator-barrier-denominator`、`support-application-award-payment`、`protection-filing-grant-enforceability`与`reported-benefit-vs-independent-outcome`视图。Dolt只保存`PublicBusinessInnovationDefinitionMetadata`、programme/Oslo/question/status/novelty/method/release/rights、fixed OSS/Skill revision、view decision与lineage；approved aggregate cells进入分析数据库。definition、status、question、denominator、population、country optional scope、schema、quality或rights变化只失效对应partition并按revision重建；不改写旧snapshot或回退generic client/republisher。

公共数字接入与线上参与可定义`household-access-vs-individual-use-vs-routed-user`、`availability-access-subscription-reliability-affordability`、`device-access-ownership-use-smartphone-only`、`non-use-reason-vs-cause-wtp-lead`、`self-report-activity-vs-tested-skill-vs-composite`、`activity-vs-completion-benefit-satisfaction`、`concern-action-incident-verified-harm`、`self-vs-proxy-and-mode`、`three-vs-twelve-month-window`与`sensitive-aggregate-small-cell`视图。Dolt只保存`PublicDigitalAccessParticipationDefinitionMetadata`、programme/population/question/composite/method/release/rights、fixed OSS/Skill revision、view decision与lineage；approved aggregate cells进入分析数据库。question/routing、component set、population、weight、denominator、mode、schema、quality或rights变化只失效对应partition并按revision重建；不改写旧snapshot或回退microdata、generic MCP、HTML scraper或其他成员。

公共家庭支出可定义`consumer-unit-household-reference-person-reporting-unit`、`interview-diary-integrated-source`、`purchase-acquisition-payment-liability-consumption-use`、`consumption-vs-tax-transfer-saving-debt-asset`、`all-unit-vs-reporter-mean-vs-percent-reporting`、`weekly-quarterly-annualised`、`nominal-real-PPS`、`amount-share-aggregate-market-size-rejection`、`zero-missing-not-collected-suppressed-unreliable`、`housing-component`、`gift-reimbursement-business-expense`与`versioned-classification-correspondence`视图。Dolt只保存`PublicHouseholdExpenditureDefinitionMetadata`、programme/population/instrument/definition/classification/question/method/release/rights、fixed OSS/Skill revision、view decision与lineage；approved aggregate cells进入分析数据库。classification、instrument、window、weight、price reference、population、schema、quality或rights变化只失效对应partition并按revision重建；不改写旧snapshot或回退microdata、generic MCP、republisher或其他成员。

公共时间使用可定义`diary-day-vs-usual-routine`、`person-respondent-diary-day-episode-slot`、`primary-secondary-simultaneous-secondary-childcare`、`population-vs-participant-mean-vs-participation-rate`、`duration-episode-count-share-time-of-day`、`paid-work-vs-employment-output`、`unpaid-work-care-vs-burden-demand`、`travel-vs-trip-delay-reliability`、`sleep-vs-quality-health`、`media-classification-vs-app-telemetry`、`weekday-weekend-season-wave`、`zero-never-missing-suppressed`与`versioned-activity-classification-correspondence`视图。Dolt只保存`PublicTimeUseDefinitionMetadata`、programme/population/diary/classification/question/method/release/rights、fixed OSS/Skill revision、view decision与lineage；approved aggregate cells进入分析数据库。diary rule、activity role、classification、weight、denominator、time、schema、quality或rights变化只失效对应partition并按revision重建；不改写旧snapshot或回退respondent diary、microdata、generic MCP、republisher或其他成员。

公共医疗可及性可定义`self-reported-need-vs-clinical-necessity`、`delay-nonreceipt-nonseeking-contact-appointment-attendance`、`main-vs-any-reason`、`cost-wait-distance-availability-time-fear-information`、`population-needed-user-registered denominator`、`service-type`、`window`、`experience-vs-quality-outcome`与`preliminary-final`视图。Dolt只保存`PublicHealthCareAccessDefinitionMetadata`、programme/population/service/question/method/release/rights、fixed OSS/Skill revision、view decision与lineage；approved aggregate cells进入分析库。question、denominator、service、sample/mode、geography、quality或rights漂移只失效对应partition；不回退health response、microdata、generic client或其他成员。

公共家庭能源可定义`price-expenditure-required-bill-debt-gap`、`self-reported-modelled-regulatory-reported`、`housing-unit-household-person-account`、`tradeoff-temperature-equipment-warmth`、`arrears-debt-hardship-plan-concession`、`notice-disconnection-reconnection-outage`、`fuel-end-use`、`LILEE-affordability-threshold-EU-SILC-item-AER-schedule`与`preliminary-final-projected-corrected`视图。Dolt只保存`PublicHouseholdEnergyDefinitionMetadata`、programme/authority/population/service/indicator/model/guideline/release/rights、fixed OSS/Skill revision、view decision与lineage；approved aggregate cells进入分析库。question、model、guideline、template、denominator、jurisdiction、quality或rights漂移只失效对应partition；不回退respondent/customer record、microdata、generic MCP、CDR product API或其他成员。

监管投诉可定义 `reported-problems-by-product-component`、`publication-and-narrative-coverage`、`response-and-disposition-gaps` 与 `member-contract-and-schema-drift`；必须固定 `RegulatoryComplaintDefinitionMetadata`、claim/company/regulator authority、population/exposure缺口、PII policy和watermark。没有exposure denominator时不物化风险率；publication policy、redaction或rights变化会使相关span/index失效，但旧evidence snapshot仍可审计。

产品可靠性可定义 `failure-regressions-by-release-environment`、`issue-to-occurrence-coverage`、`crash-free-session-trends`、`grouping-and-instrumentation-drift` 与 `high-impact-unexpressed-pain-candidates`；必须固定 `ProductReliabilityDefinitionMetadata`、member/app roster、grouping/fingerprint、SDK/instrumentation、sampling/filtering、session denominator、privacy policy和watermark。Grouping或instrumentation变化重建projection而不改写旧snapshot；没有denominator不物化rate，没有exact用户证据不把系统错误物化成用户痛点规模。受污染diagnostic span失效/隔离，但schema与drift evidence继续可审计。

公开运行状态可定义 `publisher-acknowledged-disruptions-by-service-window`、`incident-communication-lifecycle-latency`、`status-component-and-owned-telemetry-correlation-candidates`、`maintenance-versus-unplanned-disruption` 与 `public-history-and-edit-gap`；必须固定 `OperationalStatusDefinitionMetadata`、member/page roster、component taxonomy、representation/window/cap、publisher mode、computation/override、sanitizer/rights和watermark。active-only、recent-50与90-day history只在各自边界内增量维护；页面状态更正、incident编辑/消失或rights变化使相关projection/span失效并触发rebuild/correction，但不改写旧snapshot。没有exact service bridge不跨页merge，没有独立遥测不把publisher resolved物化成已验证恢复。

公开软件漏洞可定义 `published-vulnerabilities-by-approved-package-version`、`known-exploited-intersection`、`fix-and-mitigation-gap-candidates`、`advisory-source-conflicts-and-overlap`、`withdrawal-and-revision-drift` 与 `security-remediation-opportunity-candidates`；必须固定 `SoftwareVulnerabilityDefinitionMetadata`、source/authority/common-origin、subject/resolver、representation/query、license/attribution、content/reference policy和watermark。source modified/withdrawn、alias/range/resolver、KEV snapshot或license变化触发correction/rebuild而不改写旧snapshot；OSV/GitHub同源record不重复增量计数。没有approved inventory不物化asset exposure，没有独立需求证据不把安全风险物化成用户痛点规模。

公开软件包生态可定义 `package-lifecycle-pressure-by-exact-scope`、`mutable-channel-and-recommended-version-drift`、`release-and-artifact-continuity-candidates`、`registry-usage-proxy-by-fixed-definition`、`migration-opportunity-candidates` 与 `representation-schema-and-policy-drift`；必须固定 `SoftwarePackageEcosystemDefinitionMetadata`、registry/ecosystem identity、name normalization、native resolver、package/version/release/file/artifact scope、representation/common-origin、metric/window/counting semantics、rights与watermark。Dolt snapshot保存Pack、definition、schema、resolver、metric和policy revision；高频package/version/usage records进入分析存储。API/index/feed/dump或lifecycle revision触发correction/rebuild而不改写旧snapshot；没有独立issue/support/interview/owned usage evidence不物化“用户痛点”，不同registry的download值不物化共同total或rank。

公开产品支持论坛可定义 `support-friction-by-product-and-capability`、`unresolved-and-stale-thread-candidates`、`workaround-and-reproduction-candidates`、`solution-capability-and-resolution-drift`、`cross-surface-problem-corroboration` 与 `deployment-schema-policy-and-roster-drift`；必须固定deployment definition、owner/host/software/version、extension/plugin capability origin与scope、representation/origin、thread/post/relation、accepted/solved state、pagination/coverage、Terms/robots/rights与watermark。Dolt snapshot保存software template、deployment Pack、schema、capability roster和policy revision；高频thread/post/placement进入分析存储。动态view可重建，software/plugin/schema/permission漂移产生correction而不改写旧snapshot；solved不物化为fixed，federated/search copy不增加independent authority，没有独立reviewed span不物化用户痛点。

外部搜索需求可定义 `relative-interest-by-subject-and-region`、`ranked-rising-trends-by-surface-window`、`approximate-search-volume-by-keyword`、`keyword-idea-candidates`、`configuration-scoped-traffic-forecast` 与 `methodology-entitlement-and-coverage-drift`；必须固定 `ExternalSearchDemandDefinitionMetadata`、member/population/representation、subject/seed/target、geo/language/network/window、sampling/normalization/scaling/approximation、auction/forecast config、rights与watermark。Dolt snapshot保存methodology、alpha/contract entitlement、schema、definition与adoption decision；高频time-series/list/idea/metric records进入分析存储。methodology、scale、subject binding、top-list roster、account/config、schema或rights变化使物化结果失效并按受影响partition correction/rebuild；relative value、approximate count、weighted index、rank和forecast之间禁止join后算总量、share或统一score。没有独立痛点/购买/结果证据，不把搜索兴趣物化成市场规模或已验证需求。

维护模式分三类：

1. `rebuild`：按需/定时全量重建，适合知识量小或定义常变；
2. `incremental`：消费 append/change 批次维护聚合或索引；
3. `continuous`：常驻数据流，按 freshness SLO 持续更新。

Materialize 的普通 view、index 和 materialized view 明确区分了重算、内存增量维护和持久增量维护；其增量模型基于 differential dataflow：[Views](https://materialize.com/docs/concepts/views/)、[Indexes](https://materialize.com/docs/concepts/indexes/)、[Incremental updates](https://materialize.com/docs/get-started/arrangements/)。RisingWave 也提供持续增量更新和级联 streaming materialized views：[CREATE MATERIALIZED VIEW](https://docs.risingwave.com/sql/commands/sql-create-mv)。DBSP 则给出了覆盖关系代数、聚合和递归查询的通用增量视图维护方法：[DBSP 论文](https://www.vldb.org/pvldb/vol16/p1601-budiu.pdf)。

这些路线适合事实流及其派生视图，不替代 Dolt 类知识 commit graph。

对于 append-first 分析仓库，ClickHouse 的 incremental materialized view 可把聚合成本移到 insert 时，但它只处理新插入的数据块，不会因源表 mutation/merge 自动重算；需要修订、删除传播或复杂 join 时必须设计 correction/rebuild，或采用 change-stream IVM：[ClickHouse materialized-view caveats](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。因此“知识基本 append”不能推导出所有索引都只处理 insert；知识 supersede、事实 tombstone 和权利删除仍需显式语义。

### 6.2 Workload-assisted，而非 Agent 任意建索引

动态物化可借鉴两类研究：DynaMat 根据查询负载、空间和维护窗口选择物化粒度；Database Cracking 通过真实查询逐步重组数据：[DynaMat](https://pages.aueb.gr/users/kotidis/Publications/Sigmod99/)、[Database Cracking](https://stratos.seas.harvard.edu/publications/database-cracking)。

本系统先抽象 `MaterializationPolicy` 和 `ProjectionTelemetry`：

- admission：explicit 或 workload-assisted；
- 最低查询复用次数、最大 build/maintenance cost、最大存储；
- freshness SLO、lag、命中率、节省延迟和 last-used；
- eviction：manual 或 least-useful；
- 任何 materialization 都必须可停用、删除和从 source checkpoint 重建。

建议演进顺序：

```text
Phase 0  直接查询 + 必要的普通索引
Phase 1  为已知用户路径显式定义 projection
Phase 2  有 lag/成本数据后采用增量维护
Phase 3  telemetry 提出 admission/eviction 建议，人工或策略批准
```

不要在 MVP 自动创建任意 SQL/向量索引。自动推荐只有在查询复用、构建成本、维护成本和数据新鲜度都可度量后才有意义。

## 7. 一致性与重放

一次可重放分析至少固定：

```text
knowledge snapshot
+ observation/fact checkpoint
+ projection spec version
+ materialization/checkpoint
+ model/normalizer version
+ policy decision
```

知识 snapshot 更新不会自动重解释旧事实。若新概念版本需要迁移，创建新的规范化 revision 或 projection，并保留 `derivedFrom` 和旧 snapshot；查询者可以选择 historical-as-interpreted 或 reinterpreted-under-new-snapshot。

## 8. 本阶段不做

- 不实现 Dolt、分析数据库、CDC 或 streaming runtime；
- 不迁移当前 Social Workbench 的运行时存储；
- 不允许 Agent 绕过 review 直接提交平台知识；
- 不把动态物化当作自动 DBA 或事实修复机制；
- 不承诺跨数据库强事务，先用 snapshot/checkpoint 构成可重放边界。

对应 Go 抽象见：

- `design/go/demandintel/platform_knowledge.go`
- `design/go/demandintel/connector.go`
- `design/go/demandintel/repository.go`
- `design/go/demandintel/index.go`
