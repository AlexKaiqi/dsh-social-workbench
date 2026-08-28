# Public Contaminated Sites, Responsibility & Remediation Channel Pack 设计

状态：`architecture-only / synthetic-conformance / zero-platform-effects`  
核验日期：2026-08-26  
Channel Pack ref：`public-contaminated-sites-remediation/v0-design`

## 1. 目标与共同模型

本Channel用于发现污染识别、场地调查、风险沟通、责任厘清、修复交付、长期控制、closure/reuse和成本追踪中的需求与流程痛点。它只统一`PublicContaminationRemediation*` projection，不统一jurisdiction、legal regime、program population、site boundary、classification、liability law、cleanup standard、accounting basis、rights或coverage。

```text
incident / notification / suspected site
  -> sample or observation [medium + method + unit + qualifier + authority]
  -> assessment [hazard + pathway + receptor + use scenario]
  -> designation or listing [competent authority + legal basis]

site -> parcel / operable unit / source area / affected medium [versioned boundaries]
  -> responsibility assertion -> liability finding or settlement [separate authority]
  -> remedy decision -> design -> action -> operation/monitoring
  -> phase/construction/goals/whole-site milestones [separate scopes]
  -> control/review/stewardship -> closure/deletion/reuse
  -> estimate/funding/obligation/expenditure/liability/recovery [separate amount roles]
```

只有source-declared exact relation可连接事实；相似名称、地址、parcel或重叠geometry最多形成restricted duplicate candidate。

## 2. Connector能力路由

| Capability | 设计状态 | 硬边界 |
| --- | --- | --- |
| `contamination-remediation.definition.read` | knowledge/fixture | exact member/deployment/jurisdiction/regime/program/process/revision/population |
| `contamination-remediation.resource-schema.read` | knowledge/fixture | exact search/file/register/document surface、schema、history、rights、data alert |
| `contamination-remediation.selected-record.read` | manual fixture | 仅approved exact span；location/party/document/raw value先治理 |
| `contamination-remediation.conformance` | synthetic | 手写fixture，zero network/platform data |
| `contamination-remediation.public-read` | future gated | 逐member/resource批准；无generic provider fallback |
| `contamination-remediation.federated-read` | future restricted | 逐local-authority roster、coverage、rights、retention与field allowlist |
| notification/report/sample/contact/subscribe/complaint/appeal/payment/admin/write | denied | 监管、法律、隐私、公开记录、财务或资源副作用 |

首批requested=4、concept=4、machine/bulk route fixture=4、manual=4、callable=0、durable=0。OSS、MCP或Skill不会提升成员成熟度。

## 3. Snapshot、分析库与动态物化

Dolt类snapshot保存Platform Pack、definition revision、authority/program/population、process/taxonomy、schema/resource digest、boundary/identity policy、rights/privacy/retention、opaque identity/relation、decision、lineage与tombstone。分析库只接获准的必要精度metadata；exact coordinate/parcel/boundary、敏感设施/社区、owner/operator/responsible natural person、contact、documents与raw sampling values默认不进入。

动态物化视图至少包括：

- `notification-to-assessment-to-designation-gap`；
- `potential-notified-detected-authority-confirmed-significant-posture`；
- `site-parcel-operable-unit-source-area-medium-boundary-revision`；
- `contaminants-by-exact-medium-method-unit-statistic-qualifier-without-risk-inference`；
- `hazard-pathway-receptor-risk-assessment-coverage`；
- `listing-proposal-final-partial-delete-termination-history`；
- `custodian-owner-operator-potential-party-accepted-liability-settlement-authority-gap`；
- `remedy-decision-design-action-construction-operation-monitoring-lineage`；
- `action-phase-complete-vs-whole-site-goals-authority-verified-gap`；
- `institutional-engineering-control-selected-in-place-verified-released-history`；
- `deletion-closure-reuse-vs-residual-stewardship-gap`；
- `estimate-funding-obligation-expenditure-liability-recovery-role-separation`；
- `exact-location-party-document-raw-sample-drop-audit`；
- `population-schema-process-status-boundary-rights-drift`。

definition、population、process、site boundary、status semantics、authority、cleanup standard、amount role、rights或privacy变化只失效受影响partition，不做全局last-write-wins。

## 4. 可观测性与验证阶梯

每次fixture/conformance按`member × exact resource × definition revision × program/population × site/parcel/operable-unit/medium × contamination/risk/listing/responsibility × action/completion/control × cost role × authority × coverage × rights/privacy`记录requested/returned/retained/dropped/quarantined、missing/federated/unknown、boundary drift、phase conflict、control gap、stale/missing、fallback rejection、rights expiry与effect count。

验证阶梯：official evidence review → static contract → synthetic fixture conformance → 另行批准的sandbox live → 另行批准的operational canary。任一级失败只降级对应member/resource，不以别的member、HTML/browser、community MCP或商业proximity screener补绿。

Conformance必须拒绝：notification→confirmed contamination、detection→risk/exposure/harm、priority class→universal risk、owner/custodian→liability、remedy selected→implemented、phase/construction complete→goals/whole-site complete、deletion/reuse→no residual control、settlement→admission、funding/obligation→expenditure/payment，以及public visibility→all-field durable profiling right。

## 5. Skills与Probe

仅设计`public-contamination-source-contract-research/v1`与`public-contamination-conformance/v1`；future read Skill只有逐member/resource/purpose批准后才可存在。本Channel没有平台Probe，所有主动验证都必须使用系统自有实验面。

依据与OSS审计见[平台分流](./PUBLIC_CONTAMINATED_SITES_REMEDIATION_TRIAGE_2026-08-26.md)，成员见[US EPA](./US_EPA_SUPERFUND_SEMS_PLATFORM_PACK_DESIGN.md)、[Canada](./CANADA_FCSI_FCSAP_PLATFORM_PACK_DESIGN.md)、[England](./ENGLAND_PART_2A_CONTAMINATED_LAND_PLATFORM_PACK_DESIGN.md)和[NSW](./NSW_CONTAMINATED_LAND_RECORD_PLATFORM_PACK_DESIGN.md)。
