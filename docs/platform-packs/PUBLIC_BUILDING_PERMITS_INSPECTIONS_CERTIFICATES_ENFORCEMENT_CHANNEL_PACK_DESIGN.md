# Public Building Permits, Inspections, Certificates & Enforcement Channel Pack 设计

状态：`researched`；4个concept-fixture成员，3个exact-member route-fixture成员，1个restricted integration API/schema成员，4个selected/manual成员，0个callable成员，0个durable-approved成员
核验日期：2026-08-26
Channel Pack ref：`public-building-permits-inspections-certificates-enforcement/v0-design`

## 1. 目标、成员与分母

本Channel用于发现什么建筑工作被提出和授权、检查在哪个阶段出现失败/返工/no-entry、违法或命令如何进入裁决与整改，以及项目停留在permit、inspection、temporary/partial certificate或final certificate的哪个缺口。它统一`PublicBuildingRegulation*` projection，但不统一jurisdiction、code/process revision、authority/certifier、application/permit/work taxonomy、inspection stage/result、violation/adjudication/compliance、certificate legal effect、population、history、spatial precision、privacy或rights。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| NYC DOB NOW / Open Data | [Pack](NYC_DOB_BUILDING_REGULATION_PLATFORM_PACK_DESIGN.md) | application/permit/violation/CO exact Socrata fixtures；general inspection route missing |
| Chicago | [Pack](CHICAGO_BUILDING_PERMITS_VIOLATIONS_PLATFORM_PACK_DESIGN.md) | valid-issued permits + violation-linked inspection subset；application/revoked/certificate missing |
| Toronto | [Pack](TORONTO_BUILDING_PERMITS_PLATFORM_PACK_DESIGN.md) | active/cleared permit exact CKAN metadata/resource fixtures；individual inspection/enforcement/certificate missing |
| NSW Post-Consent | [Pack](NSW_POST_CONSENT_CERTIFICATES_PLATFORM_PACK_DESIGN.md) | CC/OC/BIC/CSI/WDN concept + restricted integration schema；public exact record route missing |

application、permit、work item、plan review、inspection、complaint、violation、order、adjudication、correction、certificate与property coverage分别报告。一个成员的route、provider或证书成功不能提升其他成员；permit list、violation subset或cleared list都不能冒充whole-regime denominator。

## 2. 共同证据、authority与lineage

- `EvidencePublishedBuildingWorkApplication`只来自approved exact filing/work span；不是need、truth、authorization或implementation；
- `EvidenceReportedBuildingPermitAuthorization`绑定exact authority、work item、issue/effective/expiry、fee/condition与revision；不推断开工/完工；
- `EvidenceReportedBuildingInspectionResult`绑定exact stage、discipline、partial scope、result、authority和reinspection；一次pass不升级whole project；
- `EvidenceReportedBuildingCodeFinding`保留complaint-unverified、observation、violation/citation、order、liable/not-liable、stay、correction与compliance的独立posture；
- `EvidenceReportedBuildingCertificate`绑定certificate type/status、partial/final scope、legal use/classification、certifier与supersession；BIC、CC、OC、TCO、partial/final CO和LOC不互换；
- application→permit→work item、inspection-of、reinspection-of、complaint-triggered、violation-from-inspection、order-from-violation、adjudication-of、correction-of、certificate-of/supersedes使用source-declared exact relation；
- Socrata、CKAN、HTML、JSON、tabular bulk、OpenAPI、PDF与map是representation；同origin只计一次程序事实，跨系统迁移与duplicate只能保留lineage/candidate；
- lifecycle、authorization、inspection result、finding posture、compliance和certificate status正交，禁止provider native `active/closed/completed`一列覆盖全部维度。

## 3. 动态物化与知识数仓

- `work-applications-by-exact-jurisdiction-authority-type-and-stage`：固定application population，不当需求量真相；
- `application-to-issued-valid-permit-gap`：区分approved、issued、conditional、fee-invalid、expired、revoked与missing；
- `permit-work-type-discipline-and-revision-lineage`：one project/permit的多work item不误去重；
- `issued-to-inspection-evidence-gap`：没有inspection event时保留unknown，不由permit/violation/CO补齐；
- `inspection-result-by-exact-stage-discipline-and-partial-scope`：不跨stage/discipline汇总为whole-project pass rate；
- `failed-no-entry-waived-reinspection-lineage`：result/posture正交并展示reinspection；
- `complaint-to-inspection-to-violation-authority-gap`：sequence不证明complaint属实或因果；
- `violation-order-adjudication-compliance-correction-history`：issued、liable、open、complied、stayed分别保存；
- `permit-expiry-revocation-void-current-validity`：结合member-specific fee/effective rules；
- `certificate-request-temporary-partial-final-loc-lineage`：不把temporary/partial/LOC映射final；
- `permit-to-final-certificate-gap`：不将certificate缺失解释为未完工，也不将证书解释为当前安全；
- `active-vs-cleared-and-legacy-vs-current-system-coverage`：population/system split明确；
- `exact-location-person-professional-id-comment-document-drop-audit`：只暴露drop/quarantine统计；
- `member-dataset-resource-schema-code-process-license-privacy-drift`：逐partition失效。

Dolt只保存Pack、definition、member/deployment/jurisdiction/code/process、authority/status/result/finding/certificate/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage与tombstone。分析库只接获准的opaque application/permit/work item、coarse area、stage/auth/result/finding/compliance/certificate metadata及aggregate；不接exact address/unit/coordinate/parcel/PIN/BBL/BIN/GeoID、自然人/contact/professional ID、complaint narrative、inspector comments、plans/photos/documents，也不物化truth、legal correctness、current safety、actual occupancy或market success。

materialization key固定`member × deployment/jurisdiction/code/process revision × authority roster × application/permit/work item × inspection/complaint/violation/order/adjudication/correction/certificate identity × lifecycle/authorization/result/finding/compliance/certificate posture × population/origin/representation × schema/location/privacy/rights/history revision × purpose`。schema/resource、code/process、roster、population、effective/fee rule、inspection taxonomy、finding/adjudication、certificate legal effect、location、privacy/rights/history变化触发对应partition invalidation/rebuild。

## 4. Capability、Skill与副作用边界

共同read vocabulary包括definition、dataset/package/resource/schema、selected public application/permit/work item、inspection metadata/result、complaint/finding/order/adjudication/correction metadata、certificate metadata和exact relation。它们只是knowledge/fixture capability，不是当前Connector。

`public-building-regulation-source-contract-research/v1`只产生versioned knowledge proposal；`public-building-regulation-conformance/v1`只消费synthetic fixtures。未来`approved-public-building-regulation-read/v1`逐member固定exact deployment/jurisdiction/code/process/authority roster/public-only surface/dataset/package/resource/fields/location precision/purpose/retention/deletion。没有公共route的NSW保持manual/schema，禁止browser、login、community MCP/Skill、provider-default、sibling dataset或跨member fallback。

本Channel没有平台Probe。permit application/renewal、inspection request/schedule/result、complaint/referral、correction filing、certificate application、document upload、payment、contact/subscription、status/admin/edit全部拒绝；任何法律、行政、执法、财务、通知或公开记录effects恒为零。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| application描述声称安全/价值/必要 | applicant-published work claim；不生成verified fact/need |
| permit approved但未issued或fee invalid | authorization posture + validity gap；不生成commencement |
| permit在当前dataset缺失 | population unknown/excluded；不自动denied/revoked |
| one project→multiple permits/work items | exact relations；按问题选择denominator |
| inspection pass只覆盖一个stage/discipline | partial result；不生成whole-project compliance |
| no-entry/waived/partial | distinct result；不映射failed/passed |
| complaint后出现inspection/violation | sequence + exact relation if source declared；不证明claim truth/causality |
| violation issued但not liable | finding与adjudication分开；不覆盖原history |
| status Complied但dataset警告非current condition | reported compliance + current-state unknown |
| TCO/partial OC后出现final certificate | supersession lineage；两条evidence都保留 |
| BIC与OC共享building | distinct certificate legal types；不得合并 |
| NYC legacy/current violation重叠 | duplicate candidate/common origin；不双计 |
| Chicago one inspection多violation | one inspection + N findings；不按rows计inspection |
| Toronto只读取cleared | denominator degraded；不得代表active/whole city lifecycle |
| Toronto package license未指定 | rights conflict + durable blocked；不静默继承portal default |
| NSW只有integration API schema | concept/schema/manual；public read、login/provider fallback拒绝 |
| exact location/person/license/comment/document | restricted/drop/quarantine before ordinary persistence |
| 任何application/inspection/complaint/payment/certificate/admin mutation | policy拒绝；zero external effects |

Telemetry按`Channel × member/deployment/jurisdiction/code/process revision × authority roster × dataset/package/resource/population × application/permit/work item × inspection/result × finding/adjudication/compliance × certificate type/status × origin/representation × schema/location/privacy/rights/history revision`记录requested/concept-fixture/restricted-schema/route-fixture/selected-manual/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、coverage gap、relation/duplicate/status/authority conflict、resource/schema/license drift、sensitive-field quarantine、fallback rejection与zero writes。

至少一个exact member的public metadata capability经用户批准完成canary后才可`modeled-partial`。application、permit、inspection、finding、certificate、exact location、document content和durable materialization分别另审；任一单一路由成功都不能让整个Channel变绿。
