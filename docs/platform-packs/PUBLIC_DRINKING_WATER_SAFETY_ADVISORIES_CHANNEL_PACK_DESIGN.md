# Public Drinking Water Safety, Compliance & Advisories Channel Pack 设计

状态：`architecture-only / synthetic-conformance / zero-platform-effects`  
核验日期：2026-08-26  
Channel Pack ref：`public-drinking-water-safety-advisories/v0-design`

## 1. 目标与共同事实模型

本Channel用于发现供水登记、采样/报告、standard理解、event响应、consumer communication、corrective action和return/lift流程中的需求与痛点。它统一`PublicDrinkingWaterSafety*` projection，但不统一jurisdiction、program population、supply kind、service boundary、sample stage、standard、violation law、advisory authority、aggregation denominator、security或rights。

```text
supplier -> system -> source -> treatment -> storage/distribution -> zone -> point/tap
                     \-> service area / community / reported population

requirement -> sample/result [stage + method + unit + statistic + period + qualifier]
            -> applicable standard? -> comparable? -> comparison
            -> source/system/authority violation [origin + finality + resolution basis]

event [quality | sufficiency | treatment | distribution | consumer concern]
  -> assessment -> advisory [informational | boil | do not drink | do not use]
  -> corrective/enforcement action -> confirmation result -> return/lift recommendation
  -> actual issuer rescission / service restoration
```

只有source-declared exact relation可连线；名称、postcode、service-area重叠或supplier相同最多形成restricted duplicate candidate。

## 2. Connector能力路由

| Capability | 设计状态 | 硬边界 |
| --- | --- | --- |
| `drinking-water-safety.definition.read` | knowledge/fixture | exact member/deployment/jurisdiction/regime/program/process/population/revision |
| `drinking-water-safety.resource-schema.read` | knowledge/fixture | exact bulk/report/register/resource、schema、lag、history、rights/security alert |
| `drinking-water-safety.selected-record.read` | manual fixture | approved exact span；infrastructure/location/person/document/raw value先治理 |
| `drinking-water-safety.conformance` | synthetic | 手写fixture，zero network/platform data |
| `drinking-water-safety.public-read` | future gated | 逐member/resource批准，无generic provider fallback |
| `drinking-water-safety.federated-read` | future restricted | 逐primacy/supplier/community roster、coverage、rights与field allowlist |
| sample/report/incident/advisory/lift/contact/subscribe/complaint/admin/write | denied | 公共卫生、监管、关键基础设施、通知或资源副作用 |

requested=4、concept=4、machine/bulk route fixture=2、official report/schema fixture=4、manual=4、callable=0、durable=0。OSS、MCP和Skill不提高成员成熟度。

## 3. Snapshot、分析库与动态物化

Dolt类snapshot保存Platform Pack、definition revision、authority/program/population、supply/stage/parameter/method/unit/statistic/qualifier/standard/compliance/event/advisory/action taxonomy、schema/resource digest、publication lag/known alert、boundary/security/privacy/rights/retention policy、opaque identity/relation、decision、lineage和tombstone。分析库只接获准的必要精度metadata；exact service area/component location、critical infrastructure、vulnerable facility、household/person/contact、consumer narrative、documents与raw results默认不进入。

动态物化视图至少包括：

- `supplier-system-source-treatment-network-zone-point-identity-lineage`；
- `registration-current-lapsed-withheld-deferred-and-population-coverage`；
- `monitoring-requirement-to-sample-result-or-missing-report-gap`；
- `results-by-exact-stage-parameter-method-unit-statistic-period-derivation-and-qualifier`；
- `result-to-standard-applicability-comparability-and-failure-audit`；
- `test-failure-to-originator-and-authority-violation-gap`；
- `monitoring-reporting-treatment-quality-violation-separation`；
- `event-notification-to-investigation-classification-enforcement-lineage`；
- `event-vs-unsafe-water-reached-consumers-unknown-gap`；
- `informational-boil-do-not-drink-do-not-use-scope-and-history`；
- `corrective-action-infrastructure-ready-operations-pending-confirmation-return-lineage`；
- `lift-recommendation-vs-actual-rescission-gap`；
- `resolved-archived-vs-resolution-basis-and-residual-risk-audit`；
- `tests-systems-connections-homes-buildings-population-denominator-separation`；
- `service-area-infrastructure-vulnerable-facility-person-document-raw-value-drop-audit`；
- `member-schema-standard-process-population-lag-rights-security-drift`。

schema、program population、supply/service boundary、standard applicability、violation/advisory taxonomy、authority、publication lag、security、privacy或rights变化只失效受影响partition，不做全局last-write-wins。

## 4. 可观测性与验证阶梯

每次fixture/conformance按`member × exact resource × definition revision × program/population × supplier/system/component/stage × parameter/method/unit/statistic/period/qualifier × standard/comparison × compliance origin/finality × event/advisory/action/completion × authority × coverage × security/privacy/rights`记录requested/returned/retained/dropped/quarantined、missing/federated/unknown、late/corrected、incompatible comparison、boundary drift、authority conflict、lift gap、fallback rejection、rights expiry与effect count。

验证阶梯：official evidence review → static contract → synthetic fixture conformance → 另行批准的sandbox live → 另行批准的operational canary。任一级失败只降级对应member/resource，不以HTML crawler、community MCP/Skill、supplier social post或相邻primacy source补绿。

Conformance必须拒绝：registration→potable/compliant、single result→whole-system、detection→comparable、failure→violation、monitoring violation→unsafe water、health-based flag→illness、event→consumer exposure、advisory→confirmed harm、project complete/infrastructure ready→acceptable water、lift recommendation→rescission、resolved/archived→no residual risk，以及public visibility→all-field durable profiling right。

## 5. Skills与Probe

仅设计`public-drinking-water-source-contract-research/v1`与`public-drinking-water-conformance/v1`；future read Skill只有逐member/resource/purpose批准后才可存在。本Channel没有平台Probe，主动测试必须使用系统自有实验面。

依据与OSS审计见[平台分流](./PUBLIC_DRINKING_WATER_SAFETY_ADVISORIES_TRIAGE_2026-08-26.md)，成员见[US EPA](./US_EPA_SDWIS_ECHO_PLATFORM_PACK_DESIGN.md)、[DWI](./ENGLAND_DWI_DRINKING_WATER_PLATFORM_PACK_DESIGN.md)、[Canada ISC](./CANADA_FIRST_NATIONS_DRINKING_WATER_ADVISORIES_PLATFORM_PACK_DESIGN.md)和[Taumata Arowai](./NEW_ZEALAND_TAUMATA_AROWAI_DRINKING_WATER_PLATFORM_PACK_DESIGN.md)。
