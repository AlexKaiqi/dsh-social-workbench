# Public Medicine Supply Shortages & Availability Constraints Channel Pack 设计

状态：`researched`；5个concept-fixture成员，4个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-medicine-supply-shortages/v0-design`

## 1. 目标、成员与真实分母

本Channel发现regulator、national authority或regulated notifier公开声明的medicine product/presentation supply constraint及management action。它统一`PublicMedicineSupply*` projection，但不统一jurisdiction、reporting obligation、product population、status/availability/impact/cause taxonomy、medical meaning或rights。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| FDA Drug Shortages/openFDA | [Pack](FDA_DRUG_SHORTAGES_PLATFORM_PACK_DESIGN.md) | concept+native API/bulk route fixture |
| Health Product Shortages Canada | [Pack](HEALTH_PRODUCT_SHORTAGES_CANADA_PLATFORM_PACK_DESIGN.md) | concept+public API/export route fixture；2026 migration gate |
| EMA catalogue/ESMP | [Pack](EMA_MEDICINE_SHORTAGES_PLATFORM_PACK_DESIGN.md) | concept+selected public-record fixture；ESMP reporting restricted |
| TGA Medicine Shortage Reports | [Pack](TGA_MEDICINE_SHORTAGE_REPORTS_PLATFORM_PACK_DESIGN.md) | concept+active/archive extract route fixture |
| UK DHSC statistics | [Pack](UK_DHSC_MEDICINE_SUPPLY_STATISTICS_PLATFORM_PACK_DESIGN.md) | concept+official aggregate route fixture |

requested=5、concept-fixture=5、route-fixture=4、callable=0、durable-approved=0。英国aggregate不是逐产品事件；EMA ESMP report API不是public read route。成员成功不提升其他成员。

## 2. 共同契约与禁止推断

共同projection固定product/presentation/jurisdiction/event/notification identity、native state/availability/impact、schedule、cause authority、mitigation instrument、revision/history、representation/common origin、rights和valid window。

- anticipated/current/resolved/discontinued与available/limited/unavailable是独立来源声明；native impact不跨辖区排名；
- shortage不等于recall、defect、noncompliance、harm或liability；resolved不等于每个location恢复供应；
- expected start/end/resupply date不是承诺；manufacturer/MAH原因不是verified root cause；
- ingredient、brand、product、strength、form、package、authorization和jurisdiction粒度不混淆；alternative不表示clinical interchangeability；
- management/import/substitution信息只形成source-attributed mitigation evidence，不生成治疗、剂量、处方、患者适用性或法律建议；
- public company contact、phone/email、patient/prescription、facility inventory和local pharmacy availability默认drop；
- notification count、event count、product count、presentation count和official aggregate保持各自分母，不物化market size、患者数或unmet units；
- API/bulk/CSV/page/feed/notice若来自同一原始记录，建立representation/common-origin relation，不重复计数。

只有exact record revision和source span可形成`EvidenceRegulatorReportedMedicineSupplyConstraint`或`EvidenceReportedMedicineSupplyMitigation`；两者仍只是source-declared evidence。

## 3. 动态物化与知识数仓

- `anticipated-current-resolved-discontinued-by-exact-presentation-and-jurisdiction`：保留native state/availability；
- `duration-and-expected-end-revision-drift`：reported estimate与actual resolution分开；
- `reported-causes-by-authority-and-native-taxonomy`：不做cross-jurisdiction root-cause ranking；
- `reported-mitigation-import-and-substitution-instruments`：只展示authority/instrument，不做临床建议；
- `product-ingredient-strength-form-package-identity-conflicts`：candidate relation需review；
- `event-notification-representation-and-common-origin-conflicts`：防API/CSV/page重复；
- `member-route-schema-terms-rights-and-contact-drop-drift`：成员独立coverage；
- `official-aggregate-trends-with-denominator-definitions`：只接aggregate成员，不回填event rows。

Dolt保存Pack、definition、schema/terms/licence digest、identity/relation review、view、decision、lineage和tombstone；用户批准后的最小metadata/aggregate才可进入分析库。contact、patient/prescription/local inventory、医疗建议content不进入。materialization key固定`member × population × jurisdiction × event/product/presentation × revision × representation × rights purpose`；status/update/correction/archive、schema/terms/licence和identity mapping变化触发partition invalidation/rebuild。

## 4. Skills、Probe与高风险边界

`public-medicine-supply-source-contract-research/v1`只读官方docs和固定GitHub source，输出Pack/drift proposal；不调用shortage API/export/MCP，不安装或执行代码。

`public-medicine-supply-conformance/v1`只用synthetic fixtures验证presentation identity、native state/availability/impact、authority、cause/mitigation分层、history/common-origin、aggregate denominator、rights、contact/clinical-advice drop和zero effects。

未来`approved-public-medicine-supply-read/v1`只调度用户批准的exact member/resource/field/query/window/budget/purpose；当前返回`no-authorized-public-medicine-supply-binding`。禁止HTML/internal endpoint、community MCP/Skill、restricted reporting API或另一个member fallback。

本Channel没有Probe。shortage/discontinuation report、update、withdraw、subscription/contact或对外发布会影响监管、供应和医疗流程，不能用来测试需求。患者找药、替代建议和医疗咨询不在未来普通Probe升级路径内。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| same ingredient, different strength/form/package | distinct presentations；不自动替代/合并 |
| anticipated → current → resolved | revision history；不证明local stock或按预计日期恢复 |
| status=current, availability=limited | 保留两个维度；不压成单一severity |
| manufacturer reason + regulator publication | distinct authorities；cause仍为reported assertion |
| alternative/import/substitution text | mitigation relation；clinical advice excluded |
| one record appears in API + bulk + page | common-origin；一个source event |
| UK monthly notification count | aggregate denominator；不生成product/event rows |
| EMA public catalogue vs ESMP submission | public read和restricted report ports分开；write拒绝 |
| Canada host/schema migration | quarantine until route revision conformance |
| route unavailable | missing-member degradation；no HTML/community/member fallback |
| contact/patient/prescription/report request | policy拒绝；zero external effect |

Telemetry按`Channel × member/population × jurisdiction × event/product/presentation × native state/availability/impact × representation × schema/terms/licence revision`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/common-origin conflicts、history/status/cause/mitigation completeness、aggregate denominator、contact/clinical-advice drop、rate/lag drift和zero writes。

至少一个成员经用户批准完成metadata-only canary才可`modeled-partial`；cause/mitigation text、bulk/history、aggregate、rights和durable materialization逐成员另审。某成员成功不提升其他成员。
