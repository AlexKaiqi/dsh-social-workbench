# Public Planning Applications, Representations & Decisions Channel Pack 设计

状态：`researched`；4个concept-fixture成员，3个exact-member route-fixture成员，4个selected/manual成员，0个callable成员，0个durable-approved成员
核验日期：2026-08-26
Channel Pack ref：`public-planning-applications-representations-decisions/v0-design`

## 1. 目标、成员与分母

本Channel发现公开提出的土地/建筑变化、正式参与中出现的具体痛点，以及申请人、officer、advisory body与competent authority如何响应。它统一`PublicPlanningApplication*` projection，但不统一jurisdiction、legal/process revision、authority chain、application/action taxonomy、public population、exhibition eligibility/window、representation publication/moderation、decision finality、appeal、spatial precision、history、privacy或rights。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| England Planning Data | [Pack](ENGLAND_PLANNING_DATA_APPLICATIONS_PLATFORM_PACK_DESIGN.md) | concept + exact API/bulk route fixture；incomplete/synthetic-derived origin |
| NSW Planning Portal | [Pack](NSW_PLANNING_PORTAL_DEVELOPMENT_APPLICATIONS_PLATFORM_PACK_DESIGN.md) | concept + catalogue/schema + selected exhibition/manual；exact API route missing |
| NYC ZAP/Open Data | [Pack](NYC_ZAP_LAND_USE_APPLICATIONS_PLATFORM_PACK_DESIGN.md) | concept + exact Socrata dataset fixture；multi-authority ULURP |
| Ireland NPAD | [Pack](IRELAND_NATIONAL_PLANNING_APPLICATIONS_PLATFORM_PACK_DESIGN.md) | concept + exact ArcGIS route fixture；participating-authority/catalogue drift |

application、site/action、document, exhibition、representation、assessment/recommendation、decision/condition、review和implementation分别报告coverage。一个member、provider、route或representation成功不能提升其他成员；selected list不能补成全jurisdiction population。

## 2. 共同证据、authority与lineage

- `EvidencePublishedPlanningApplication`来自approved exact requested-change span；application不是need/feasibility/truth/entitlement/approval evidence；
- `EvidencePublishedPlanningRepresentation`绑定exact application revision、window、role、support/object/comment posture与published population；不做people/representative-opinion count；
- `EvidenceReportedPlanningAssessment`绑定author authority与assessment/recommendation posture；applicant response、agency advice、officer recommendation和advisory board action分别保存；
- `EvidenceReportedPlanningDecision`只来自exact competent-authority/review/court record；finality、modification、conditions与appeal另绑；
- application→site/parcel/action/document、version/amendment、exhibition、representation、response、assessment、recommendation、decision、condition、appeal、implementation使用exact relation；文本或地址相似只能形成possible-duplicate candidate；
- HTML、JSON/GeoJSON、CSV/Parquet、Socrata、ArcGIS、PDF和map是representation，必须有common-origin和revision；
- native lifecycle、public status、decision posture、authority和physical implementation正交，禁止last-write-wins。

## 3. 动态物化与知识数仓

- `applications-by-exact-jurisdiction-process-authority-type-and-stage`：固定roster/population，不做跨法域直接排名；
- `requested-land-use-change-by-action-and-approved-site-scope`：只用approved coarse area；
- `application-amendment-document-timeline-lineage`：显示revision与missing document coverage；
- `exhibition-window-and-renotification-coverage`：按exact calendar/process解释；
- `representations-by-approved-topic-posture-and-fixed-published-population`：不物化unique people或民意；
- `applicant-response-and-amendment-after-representation`：sequence只证明程序相邻，不证明因果；
- `advisory-recommendation-to-competent-decision-gap`：保留authority与waiver/no-action；
- `decisions-conditions-contributions-and-appeal-history`：不同amount/condition role不混算；
- `approval-to-expiry-certificate-implementation-gap`：不以approval推断built/occupied/success；
- `public-withheld-not-assessed-document-history`：visibility变更触发局部失效；
- `exact-location-and-personal-data-drop-audit`：只暴露drop/quarantine统计，不暴露敏感值；
- `member-provider-dataset-schema-process-privacy-rights-drift`：逐member失效。

Dolt只保存Pack、definition、member/deployment/jurisdiction/process、authority/status/decision/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage和tombstone。分析库只接获准的opaque application/action/coarse-area/stage/posture/aggregate/decision/condition metadata；不接exact address/coordinate/parcel/BBL/UPRN、自然人、contact、donation profile、submission body/attachment、unreviewed document，也不物化truth、representative opinion、legal correctness、build/occupation/compliance或impact。

materialization key固定`member × deployment/jurisdiction/process revision × authority roster × application/site/action/revision × exhibition/window/population × record/content role/authority/posture × lifecycle/decision/finality × representation/language × spatial/privacy/rights/history revision × purpose`。process/schema、authority roster、public population、window/renotification、visibility、decision/finality、location、privacy/rights/history变化触发partition invalidation/rebuild。

## 4. Capability、Skill与副作用边界

共同read vocabulary包括definition、dataset/schema、selected public application/action/site-area、exhibition window、representation metadata/approved span、assessment/recommendation、decision/condition、review与implementation metadata。它们只是knowledge/fixture capability，不是当前Connector。

`public-planning-source-contract-research/v1`只产生versioned knowledge proposal；`public-planning-conformance/v1`只消费synthetic fixtures。未来`approved-public-planning-read/v1`逐member固定exact deployment/jurisdiction/process/authority roster/public-only surface/routes/fields/window/site precision/purpose/retention/deletion；没有route的NSW保持selected/manual，禁止browser、scraper、community MCP/Skill、provider sibling或跨member fallback。

本Channel没有Probe。application、support/object/comment、public testimony、political donation declaration、document upload、applicant amendment、payment、appeal/review、contact/subscription、status/admin/edit全部拒绝；任何法律、行政、财务、通知或公开记录effects恒为零。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| application含未证实benefit/impact claim | requested-change + applicant claim；不生成verified need/fact |
| source标completed/public | native lifecycle/visibility；不自动approve |
| support/object/comment有多个records | fixed published population；不生成unique people/民意率 |
| name withheld但body/attachment可识别 | quarantine/drop；不得先持久化再清理 |
| amendment在exhibition后出现 | new revision + renotification coverage；不覆盖旧representation |
| applicant submissions report归纳objections | applicant-authored assessment；不替代原representation或authority finding |
| Community Board/Council committee建议通过 | advisory recommendation；非competent decision |
| competent authority approve with conditions | decision与conditions分开；不生成implementation |
| appeal overturn/remand | new decision/review relation；不改写原decision snapshot |
| application/decision/implementation来源不同 | exact relation或unknown；不得按地址文本强合并 |
| England synthetic-derived origin | route fixture retained；authority/origin confidence不升级 |
| NSW catalogue无exact route | manual fixture；HTML/community fallback拒绝 |
| NYC public subset与private CRM | public dataset only；private credential route拒绝 |
| Ireland catalogue起始年份/roster冲突 | drift record + degraded coverage；不择一静默覆盖 |
| JSON/CSV/GeoJSON/map同一record | common-origin；只计一次程序事实 |
| exact address/coordinate/parcel/BBL/UPRN | restricted/drop；普通projection只保留coarse area |
| 任何application/comment/upload/payment/appeal/admin mutation | policy拒绝；zero external effects |

Telemetry按`Channel × member/deployment/jurisdiction/process revision × authority roster × population × application/action/revision × record/content role/authority/posture × lifecycle/decision/finality × representation × schema/spatial/privacy/rights/history revision`记录requested/concept-fixture/catalogue-schema/route-fixture/selected-manual/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、coverage gap、common-origin/relation/status/authority conflict、window/renotification drift、exact-location/privacy quarantine、fallback rejection与zero writes。

至少一个exact member/public metadata capability经用户批准完成canary后才可`modeled-partial`。application metadata、representation approved spans、documents、decisions、exact location和durable materialization分别另审；任何单一路由成功都不能让整个Channel变绿。
