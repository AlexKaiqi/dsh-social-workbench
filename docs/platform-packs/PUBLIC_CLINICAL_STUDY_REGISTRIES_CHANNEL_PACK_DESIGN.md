# Public Clinical Study Registries & Reported Constraints Channel Pack 设计

状态：`researched`；5个concept-fixture成员，3个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-clinical-study-registries/v0-design`

## 1. 目标、成员与真实分母

本Channel发现registry/sponsor/regulator声明的study plan、protocol/status/results-posting和执行约束，补足研究发表前及未发表活动。它统一`PublicClinicalStudy*` projection，但不统一legal regime、registration scope、study population、status taxonomy、results obligation、scientific authority、content rights或clinical meaning。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| ClinicalTrials.gov | [Pack](CLINICALTRIALS_GOV_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md) | concept+native API v2 route fixture |
| WHO ICTRP | [Pack](WHO_ICTRP_CLINICAL_STUDY_PLATFORM_PACK_DESIGN.md) | concept+CSV/XML download / contract-gated web-service route fixture |
| ISRCTN | [Pack](ISRCTN_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md) | concept+XML API/CSV route fixture；API docs draft |
| EU CTIS | [Pack](EU_CTIS_CLINICAL_TRIAL_PLATFORM_PACK_DESIGN.md) | concept+selected public-record fixture；machine contract missing |
| DRKS | [Pack](DRKS_CLINICAL_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md) | concept+official manual-export fixture；versioned API missing |

requested=5、concept-fixture=5、route-fixture=3、callable=0、durable-approved=0。route maturity只证明metadata候选路径；aggregate results、documents和历史revision仍逐成员/字段/rights另审。

## 2. 共同契约与禁止推断

共同projection固定registry/jurisdiction/population definition、study/protocol/record/revision、arm/intervention/condition/population、outcome definition/results representation、native lifecycle、authority、schedule、anticipated/actual enrollment、exact relations、history/coverage、rights和valid window。

- registration、authorization、recruiting、active、completed和results-posted是正交声明；任何一个都不证明实际执行、study success、treatment approval、clinical benefit或scientific validity；
- suspended、terminated、withdrawn、early-ended和why-stopped必须保留native definition/source authority，不自动证明产品失败、patient harm、causality或用户痛点；
- outcome measure、aggregate result、participant flow和adverse event按arm/time frame/unit/analysis population及source revision解释，不自动生成疗效/安全结论或医疗建议；
- anticipated/actual enrollment、country/site count、eligibility和recruitment status没有目标/暴露分母时不物化recruitment rate、patient demand或market size；
- NCT、UTN、EU number、ISRCTN、DRKS、sponsor protocol/secondary ID不混为一个ID；UTN不是registration number；
- WHO bridge、provider dedupe或同一trial跨registry投影建立common-origin relation，不按member/CSV/XML/page数重复计数；
- registry/sponsor/responsible party/regulator/results submitter/provider authority分开；quality-control review不等于peer review或source truth；
- contacts、PI identity、email/phone、facility/site address、participant/IPD和patient profile在持久化前drop；不做eligibility matching、trial recommendation、recruitment referral或contact；
- record、document、aggregate results和IPD-sharing statement分别做rights；IPD statement不等于IPD access。

只有exact record revision和source span可形成`EvidenceRegistryDeclaredClinicalStudyActivity`或`EvidenceReportedClinicalStudyConstraint`，两者仍只是source-declared evidence。

## 3. 动态物化与知识数仓

- `new-and-updated-study-plans-by-condition-intervention-and-design`：按exact study/record revision，不按registry重复；
- `suspended-terminated-withdrawn-and-early-ended-by-native-reason`：保留source wording/authority，不做failure ranking；
- `anticipated-vs-actual-enrollment-and-recruitment-status`：只展示声明值，不推断患者需求；
- `completed-with-results-posted-missing-or-late`：按registry obligation/coverage，不自动标违规；
- `protocol-amendment-status-and-results-history`：revision/tombstone可追溯；
- `cross-registry-secondary-id-and-common-origin-conflicts`：exact relation与candidate review分层；
- `registry-route-schema-rights-and-contact-drop-drift`：成员独立coverage与rights cohort。

Dolt保存Pack、definition、TRDS/schema/terms/license digest、identity/relation review、view、decision、lineage和tombstone；获准的去身份化metadata/aggregate spans未来才进入分析库。未获准documents/results content、contacts/sites/participants/IPD不进入。materialization key固定`member × population × study × protocol/record revision × representation × rights purpose`；status/amendment/correction、provider bridge、schema/terms/license变化触发partition invalidation/rebuild。

## 4. Skills、Probe 与高风险边界

`public-clinical-study-source-contract-research/v1`只读官方docs和固定GitHub source，输出Pack/drift proposal；不调用API/export/MCP，不安装或执行代码。

`public-clinical-study-conformance/v1`只用synthetic fixtures验证identity、native status、authority、anticipated/actual enrollment、outcome/results分层、history/common-origin、rights cohort、PII/IPD drop和zero effects。

未来`approved-public-clinical-study-read/v1`只调度用户批准的exact member/resource/field/query/window/budget/purpose；当前返回`no-authorized-public-clinical-study-binding`。禁止HTML/browser/internal endpoint、community MCP/Skill/client、patient matching或另一个member fallback。

本Channel没有Probe。trial registration、protocol update、results upload、withdrawal、contact、participant recruitment、referral或enrollment会改变真实科研/监管/医疗流程，不能作为需求测试。患者匹配和医疗建议不在未来普通Probe升级路径内。

## 5. Fixture、可观测性和晋级

| 场景 | 必须结果 |
| --- | --- |
| one trial appears in NCT + WHO + ISRCTN | exact common-origin；一项source-declared activity |
| UTN exists without registry record | identity hint；不标registered/recruiting |
| recruiting → suspended → terminated | native revision history + constraint span；不标product failure |
| completed without posted results | coverage gap candidate；不标study failed/violated law |
| aggregate outcome/adverse event present | source-attributed aggregate；no efficacy/safety/causal conclusion |
| anticipated changes to actual enrollment | distinct basis/revision；不算recruitment performance without definition |
| CTIS authorized in one country, refused in another | country authority states separated；no global status |
| DRKS pre-2025 vs 2025-updated | distinct rights cohort；old content blocked unless separately permitted |
| route unavailable | missing-member degradation；no HTML/community/member fallback |
| contact/IPD/patient-match/register request | policy拒绝；zero external effect |

Telemetry按`Channel × member/population × study/protocol/record revision × native status/authority × representation × schema/terms/license revision`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/common-origin conflict、history/status/results completeness、rights cohort、contact/site/participant/IPD drop、rate/lag drift和zero writes。

至少一个成员经用户批准完成metadata-only canary才可`modeled-partial`；results/document span、history/bulk、rights和durable materialization逐成员另审。某成员成功不提升其他成员。
