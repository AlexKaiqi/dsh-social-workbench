# Public Regulated Licenses, Inspections & Discipline Channel Pack 设计

状态：`architecture-only / synthetic-conformance / zero-platform-effects`  
核验日期：2026-08-26  
Channel Pack ref：`public-regulated-licenses-inspections-discipline/v0-design`

## 1. 目标与非目标

本Channel用于发现哪些受监管活动存在进入门槛、许可状态变化、检查失败/返工、指控到认定的程序缺口、限制/处分与恢复路径。它统一`PublicRegulatedLicense*` projection，但不统一jurisdiction、authority/board、subject population、license category、application/renewal rules、standing、inspection taxonomy、discipline law、publication window、privacy或rights。

它不是人员背景调查、信用评分、黑名单、营销名单或法律意见系统；不把公开自然人记录用于需求画像，不建立跨平台人物身份图谱，也不评价个人能力或风险。

## 2. 共同事实模型

```text
regulated subject
  -> application / renewal / scope change
  -> issued license / registration / endorsement
  -> current standing + validity (orthogonal)

inspection -> result -> charge/allegation
complaint/notification -> investigation -> charge/allegation
charge -> finding/adjudication -> sanction/restriction
                         -> appeal/stay/variation
sanction -> monitoring/remediation -> removal/reinstatement
```

只允许source-declared exact ID/relation连线；名称、地址、license号码相似只能形成restricted duplicate candidate。application、authorization、inspection、allegation、finding、sanction和remediation分别形成七种evidence，不能互相升级。

## 3. Connector能力路由

| Capability | 设计状态 | 硬边界 |
| --- | --- | --- |
| `regulated-license.definition.read` | knowledge/fixture | 固定member/deployment/jurisdiction/board/process/population/revision |
| `regulated-license.dataset-schema.read` | knowledge/fixture | exact dataset/file/register/contract；不读data row |
| `regulated-license.selected-record.read` | manual fixture | 只读approved exact span；identity/content先治理 |
| `regulated-license.conformance` | synthetic | 手写fixture，zero network/platform data |
| `regulated-license.public-read` | future gated | 逐member capability，不存在generic provider fallback |
| `regulated-license.contract-read` | future restricted | exact purpose、contract、credential、field allowlist与audit |
| application/renewal/inspection/complaint/appeal/reinstatement/write | denied | 法律、就业、监管、财务或公开记录副作用 |

首批requested=4、concept=4、exact route/file fixture=3、restricted contract/API fixture=1、manual=4、callable=0、durable=0。任何MCP、Skill或generic Socrata client都不能提高member成熟度。

## 4. Snapshot、分析库与动态物化

Dolt类snapshot只保存Platform Pack、definition revision、authority/board roster、subject/license/status/inspection/finding/sanction/remediation taxonomy、schema/file/contract digest、purpose/privacy/rights policy、opaque identity/relation、decision、lineage和tombstone。

分析库只接获准的organization/business/establishment或去身份化coarse aggregate metadata；自然人ref、姓名、license number、address/contact、精确场所、complaint/health narrative、documents默认不进入。

动态物化视图至少包括：

- `licenses-by-exact-jurisdiction-authority-category-subject-kind-and-standing`；
- `application-to-issued-license-gap`与`renewal-change-supersession-lineage`；
- `inspection-result-by-exact-activity-scope-and-subject-kind`；
- `complaint-investigation-charge-finding-authority-gap`；
- `finding-to-sanction-to-appeal-stay-variation-history`；
- `sanction-to-monitoring-remediation-removal-reinstatement-history`；
- `current-register-vs-disciplinary-history-coverage`；
- `business-entity-establishment-professional-identity-separation-audit`；
- `person-license-address-contact-sensitive-condition-document-drop-audit`；
- `member-board-schema-process-status-publication-privacy-rights-drift`。

schema/file、authority roster、status mapping、process、publication/suppression、contract/purpose、privacy/rights或history变化触发受影响partition失效与重建，不做全局last-write-wins。

## 5. 可观测性与验证阶梯

每次fixture/conformance按`member × exact route/resource × definition revision × subject population × record kind × lifecycle/standing/result/finding/finality/sanction/remediation × authority × coverage × purpose/privacy/rights`记录requested/returned/retained/dropped/quarantined、missing/withheld/removed、relation orphan、schema/status mapping drift、rights/purpose denial、fallback rejection与effect count。

验证阶梯固定为：official evidence review → static contract → synthetic fixture conformance → 另行批准后的sandbox live → 另行批准后的operational canary。任一级失败只降级对应member/capability，不用其他member、HTML/browser、community MCP或sibling dataset补绿。

Conformance必须拒绝：application→approval/demand、current→competent/reputable/working、expired→revoked、pass→continued compliance、complaint/charge→finding、condition→disciplinary、finding→current standing、reinstatement→历史被清除，以及public visibility→bulk demand profiling right。

## 6. Agent Skills与Probe

仅设计：

- `public-regulated-license-source-contract-research/v1`：核验官方process/dataset/file/register/API/contract、population、authority、schema、publication、purpose、rights与privacy；
- `public-regulated-license-conformance/v1`：对合成fixture验证身份、posture、relation、coverage、drop和zero effects；
- future `approved-public-regulated-license-read/v1`：只有逐member route和purpose批准后才可存在。

本Channel没有平台Probe。主动测试必须走系统自有landing page、问卷或实验Channel；不得用许可申请、续期、投诉、检查、申诉、联系监管机构或监控自然人来“验证需求”。

平台依据与OSS静态审计见[平台分流](./PUBLIC_REGULATED_LICENSES_INSPECTIONS_DISCIPLINE_TRIAGE_2026-08-26.md)，成员见[NYC](./NYC_DCWP_REGULATED_BUSINESS_LICENSE_PLATFORM_PACK_DESIGN.md)、[Chicago](./CHICAGO_BUSINESS_LICENSE_PLATFORM_PACK_DESIGN.md)、[California DCA](./CALIFORNIA_DCA_PROFESSIONAL_LICENSE_PLATFORM_PACK_DESIGN.md)和[Ahpra](./AHPRA_PRACTITIONER_REGISTER_PLATFORM_PACK_DESIGN.md)。
