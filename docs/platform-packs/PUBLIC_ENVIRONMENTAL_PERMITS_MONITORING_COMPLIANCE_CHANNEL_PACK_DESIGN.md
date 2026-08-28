# Public Environmental Permits, Monitoring & Compliance Channel Pack 设计

状态：`architecture-only / synthetic-conformance / zero-platform-effects`  
核验日期：2026-08-26  
Channel Pack ref：`public-environmental-permits-monitoring-compliance/v0-design`

## 1. 目标与非目标

本Channel用于发现许可办理、条件理解、监测/申报、数据质量、超限判定、检查整改和合规恢复中的需求与流程痛点。它统一`PublicEnvironmentalRegulation*` projection，但不统一jurisdiction、legal regime、program、media、permit population、parameter、method、unit、statistic、period、threshold、violation law、rights或coverage。

它不是污染者排名、设施/人员黑名单、环境风险评分、暴露/健康影响模型或法律意见系统；annual release inventory、投诉量、违规数与处罚额都不能被当作危害、因果、代表性或需求强度的无条件代理。

## 2. 共同事实模型

```text
site / facility / installation / activity
  -> application -> permit revision -> condition / limit
                                -> monitoring requirement at source/outfall/point
                                -> measurement/report
                                   [quantity + statistic + derivation + reporting basis + qualifier]
                                -> comparable? -> threshold comparison

comparison / report / inspection / incident
  -> system-generated | licensee-self-reported | authority-determined finding
  -> notice / order / enforcement / penalty
  -> corrective action / remediation -> reported or authority-verified return

annual release / transfer inventory [separate reporting population]
```

只允许source-declared exact ID/relation连线；名称、地址或坐标相似只能形成restricted duplicate candidate。九类evidence不能互相升级。

## 3. Connector能力路由

| Capability | 设计状态 | 硬边界 |
| --- | --- | --- |
| `environmental-regulation.definition.read` | knowledge/fixture | 固定member/deployment/jurisdiction/regime/program/process/revision |
| `environmental-regulation.resource-schema.read` | knowledge/fixture | exact service/file/dataset/register、schema、population、rights与known alert |
| `environmental-regulation.selected-record.read` | manual fixture | 只读approved exact span；敏感位置/身份/content先治理 |
| `environmental-regulation.conformance` | synthetic | 手写fixture，zero network/platform data |
| `environmental-regulation.public-read` | future gated | 逐member/resource capability；不存在generic provider fallback |
| `environmental-regulation.conditional-read` | future restricted | exact purpose/contract/retention expiry/field allowlist/audit |
| application/report/incident/complaint/contact/subscribe/payment/admin/write | denied | 法律、监管、公开记录、通知或财务副作用 |

首批requested=4、concept=4、exact machine/bulk route fixture=3、manual=4、callable=0、durable=0。任何OSS、MCP、Skill或generic environmental API都不能提高member成熟度。

## 4. Snapshot、分析库与动态物化

Dolt类snapshot只保存Platform Pack、definition revision、authority/program roster、subject/permit-standing/application-outcome/media/parameter/measurement-kind/unit/method/statistic/derivation/reporting-basis/qualifier/compliance/enforcement taxonomy、reporting threshold、schema/resource digest、known-data alert、purpose/privacy/rights/retention policy、opaque identity/relation、decision、lineage和tombstone。

分析库只接获准的去身份化、必要精度metadata与数值；exact coordinate/outfall、敏感基础设施、operator/natural-person/contact、complaint prose和documents默认不进入。

动态物化视图至少包括：

- `permits-by-exact-jurisdiction-program-media-status-and-revision`；
- `application-to-issued-varied-revoked-surrendered-gap`；
- `permit-condition-and-limit-revision-lineage`；
- `monitoring-requirement-to-measurement-report-or-nonreceipt-gap`；
- `measurements-by-exact-parameter-kind-method-unit-statistic-period-derivation-reporting-basis-and-qualifier`；
- `measurement-to-limit-comparability-and-comparison-audit`；
- `exceedance-to-system-self-report-authority-finding-gap`；
- `inspection-car-incident-to-finding-and-enforcement-lineage`；
- `notice-order-penalty-to-remediation-and-return-to-compliance-history`；
- `annual-release-transfer-trend-by-exact-thresholded-reporting-population`；
- `site-facility-installation-source-outfall-identity-migration-audit`；
- `known-data-alert-rights-expiry-location-identity-document-drop-audit`；
- `member-schema-program-reporting-unit-threshold-process-rights-drift`。

schema、program、reporting population/unit、permit/limit revision、measurement kind/method/unit/statistic/derivation/reporting basis、known alert、process cutover、purpose/rights/retention或privacy变化只失效受影响partition，不做全局last-write-wins。

## 5. 可观测性与验证阶梯

每次fixture/conformance按`member × exact route/resource × definition revision × program/media/population × record kind × measurement-kind/method/unit/statistic/period/derivation/reporting-basis/qualifier × comparison/compliance authority/finality/remediation × coverage × purpose/privacy/rights`记录requested/returned/retained/dropped/quarantined、missing/late/corrected/withheld/nonreceipt、kind/unit/method/statistic/period mismatch、source-vs-derived comparison、known-data alert、rights expiry、fallback rejection与effect count。

验证阶梯固定为：official evidence review → static contract → synthetic fixture conformance → 另行批准后的sandbox live → 另行批准后的operational canary。任一级失败只降级对应member/resource，不用其他member、HTML/browser、community MCP、licensee网站或相邻dataset补绿。

Conformance必须拒绝：application→permit/need、permit→operation/compliance、measurement→comparable、exceedance→legal violation、self-report→authority finding、inspection/rating→whole-site continuing compliance、enforcement→remediation、return-reported→authority-verified、annual inventory→instant emission/exposure/harm/noncompliance，以及public visibility/CC-BY metadata→全部字段长期需求画像权利。

## 6. Agent Skills与Probe

仅设计：

- `public-environmental-regulation-source-contract-research/v1`：核验official process/service/file/register、program/population、schema、measurement-kind/method/unit/statistic/derivation/reporting-basis、known alert、purpose/rights/privacy；
- `public-environmental-regulation-conformance/v1`：对合成fixture验证identity、authority、comparability、posture、coverage、drop和zero effects；
- future `approved-public-environmental-regulation-read/v1`：只有逐member/resource和purpose批准后才可存在。

本Channel没有平台Probe。主动测试必须走系统自有landing page、问卷或实验Channel；不得用许可申请、监测/不合规申报、incident/complaint、联系设施/监管机构、订阅或任何平台write来“验证需求”。

平台依据与OSS静态审计见[平台分流](./PUBLIC_ENVIRONMENTAL_PERMITS_MONITORING_COMPLIANCE_TRIAGE_2026-08-26.md)，成员见[US EPA ECHO](./US_EPA_ECHO_NPDES_PLATFORM_PACK_DESIGN.md)、[England EA](./ENGLAND_ENVIRONMENT_AGENCY_PUBLIC_REGISTERS_PLATFORM_PACK_DESIGN.md)、[EU/EEA](./EU_INDUSTRIAL_EMISSIONS_PORTAL_PLATFORM_PACK_DESIGN.md)和[NSW EPA](./NSW_EPA_POEO_PUBLIC_REGISTER_PLATFORM_PACK_DESIGN.md)。
