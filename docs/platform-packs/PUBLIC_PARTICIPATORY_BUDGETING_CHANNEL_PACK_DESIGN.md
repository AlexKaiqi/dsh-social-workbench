# Public Participatory Budgeting Proposals, Priority & Execution Channel Pack 设计

状态：`researched`；4个concept-fixture成员，2个official data route-fixture成员，2个provider-schema candidate成员，4个selected/manual成员，0个callable成员，0个durable-approved成员
核验日期：2026-08-26
Channel Pack ref：`public-participatory-budgeting/v0-design`

## 1. 目标、成员与分母

本Channel发现居民提出的公共资源用途、程序筛选、优先级aggregate、budget-constrained selection与官方执行回报。它统一`PublicParticipatoryBudget*` projection，但不统一jurisdiction、process/round、scope、eligible population、proposal/ballot roster、admissibility、feasibility、costing、merge、support、vote/grade、weighting、selection、envelope、budget approval、appropriation、implementation、completion、online/offline、language、privacy或rights。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| Barcelona | [Pack](BARCELONA_PARTICIPATORY_BUDGETS_PLATFORM_PACK_DESIGN.md) | concept + Decidim provider-schema candidate + selected/manual |
| Madrid | [Pack](MADRID_PARTICIPATORY_BUDGETS_PLATFORM_PACK_DESIGN.md) | concept + CONSUL provider-schema candidate + selected/manual |
| Paris | [Pack](PARIS_PARTICIPATORY_BUDGET_PLATFORM_PACK_DESIGN.md) | concept + official winner/implementation route fixture |
| NYC | [Pack](NYC_PARTICIPATORY_BUDGETING_PLATFORM_PACK_DESIGN.md) | concept + official historical route fixture + current selected/manual |

process、proposal、evaluation、priority、ballot、vote、selection、allocation与execution分别报告coverage。Paris winner-only、NYC stale historical和provider default都不能补齐别的stage/member。

## 2. 共同证据与关系

- `EvidencePublishedParticipatoryBudgetNeed`只来自approved exact proposer-authored span；publication不是truth、endorsement或representativeness review；
- `EvidenceParticipatoryBudgetPriorityAggregate`必须绑定eligibility/channel/verification/weighting/ballot/observedAt；support、vote、positive/negative、net score、majority grade、participant和rank分型；
- `EvidenceReportedParticipatoryBudgetAllocation`必须携带selection/amount role/authority；selected、budgeted、appropriated与reported spend互不替代；
- `EvidenceReportedParticipatoryBudgetExecution`只证明authority声明的milestone/status；不证明physical delivery、acceptance、quality、impact或satisfaction；
- proposal→evaluation→developed ballot project→selection→allocation→implementation必须使用exact source-declared relations；similar title/topic不能自动merge；
- duplicate/grouped proposals不自动相加support；一个participant可选择多个project，action count不是people或independent needs；
- list/detail/export、online/paper、language rendition与historical tracker可为common-origin projections，不能重复计数；
- winner-only或selected-record population的缺失项目是unknown，不是rejected、infeasible、not-selected或no-demand。

## 3. 动态物化与知识数仓

- `proposals-by-exact-round-scope-category-and-lifecycle`：检索用，不做popularity ranking；
- `proposal-evaluation-ballot-lineage-and-merge`：展示source-declared转换与coverage gap；
- `prioritization-support-versus-final-vote`：不同stage与denominator永不合并；
- `selection-under-envelope-and-budget-fit`：解释rank与剩余预算导致的选择/跳过；
- `selected-to-budget-inclusion-to-appropriation-gap`：避免把winner当funded/spent；
- `implementation-status-and-milestone-history`：保留stale coverage、delay与cancellation；
- `estimate-ballot-selected-appropriated-spend-role-conflicts`：不猜amount语义；
- `online-offline-language-common-origin`：防重复且保留channel policy；
- `member-deployment-schema-process-vote-privacy-rights-drift`：逐member失效，不跨部署升级；
- 禁止cross-city popularity、district political propensity、proposer/voter profile与“最值得投”leaderboard。

Dolt只保存Pack、definition、process/round/scope、eligibility/rosters、phase/rule/amount/status/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage与tombstone。分析库只接获准的opaque project/scope/category/lifecycle、aggregate measure和amount role；不接identity、contact、comments、attachments、exact locations、demographics/political profile或未审查敏感文本。

materialization key固定`member × deployment/process/round revision × scope/roster × proposal/project/revision × record kind/stage/authority × measure/rule/observedAt × amount role × representation/language × history/rights/purpose`。process、deployment/schema、eligibility、roster、weighting、selection、envelope、status、privacy、rights或history变化使对应partition invalidation/rebuild。

## 4. Capability、Skill与副作用边界

共同read vocabulary包括definition/process/round、selected proposal/project、evaluation、priority aggregate、ballot/result、selection/allocation和implementation milestone。它们是capability vocabulary，不是当前可调用Connector。

`public-participatory-budget-source-contract-research/v1`只产生versioned knowledge proposal；`public-participatory-budget-conformance/v1`只运行synthetic fixtures。未来read binding必须逐member限定exact deployment/process/round/scope/phases/fields/purpose/retention/deletion。没有exact route的stage保持selected/manual；禁止HTML/browser自动fallback。

本Channel没有Probe。proposal、support、vote/unvote/grade、comment、follow、share/campaign、evaluation、selected flag、milestone/status与budget/admin mutations全部拒绝，平台写入恒为零。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| published proposal含错误事实 | proposer need；不生成verified fact/endorsement |
| duplicate/grouped proposals | exact relation；不自动加support或need count |
| support与final vote均有值 | 两个stage/measure；不得相加或替换 |
| email/SMS/resident register verification | 记录policy；不声称系统独立验证unique person |
| online + paper aggregate | 按member policy common-origin；不得盲加 |
| 一人选择多个项目 | actions不是participants或independent needs |
| Madrid正负票与fractional net score | exact weighting；不得转成普通票数 |
| Paris majority grade | grade distribution/median rule；不得跨城排名 |
| Barcelona至少2项目且受budget max | exact ballot rule；不推广至其他member |
| 高rank项目超出remaining envelope | skipped-under-envelope；不得声明低支持 |
| selected但budget approval pending | selection与allocation gap |
| budgeted/appropriated但无procurement/spend | 只保留已有amount role |
| tracker写completed/opened | source-declared execution；非独立验收 |
| cancelled | 不抹除original published need |
| Paris winner-only dataset无某项目 | unknown outside population；非negative evidence |
| NYC 2017/2018 datasets | historical/stale；不得声明current/full |
| exact address/coordinate | drop/coarsen；普通projection为零 |
| Decidim/CONSUL provider schema | candidate；不能升级Barcelona/Madrid deployment |
| 任何create/support/vote/comment/admin mutation | policy拒绝；zero external effects |

Telemetry按`Channel × member/deployment/process/round × scope/roster × record kind/stage/authority × lifecycle/evaluation/selection/execution × measure/rule/observedAt × amount role × representation/language × schema/privacy/rights/history revision`记录requested/concept-fixture/provider-schema-candidate/route-fixture/selected-manual/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、common-origin/identity/relation conflict、各stage coverage、stale/winner-only gap、selection-to-allocation gap、allocation-to-execution lag、PII/location/content drop、rights block、schema/process drift与zero writes。

至少一个exact member/stage经用户批准完成metadata-only canary后才可`modeled-partial`。proposal、evaluation、aggregate、result、allocation、implementation与durable materialization分别另审；一个stage、member、provider或representation成功不提升其他成员。
