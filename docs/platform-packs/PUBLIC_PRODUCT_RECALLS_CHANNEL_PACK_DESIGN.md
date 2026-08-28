# Public Product Recalls & Corrective Actions Channel Pack 设计

状态：`researched`；5个concept-fixture成员，4个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-product-recalls/v0-design`

## 1. 目标、成员和分母

本Channel发现正式产品安全风险与纠正行动，并解释受影响产品/范围和处置方式。它统一`PublicProductRecall*` projection，但不统一监管authority、法律门槛、product population、risk scale、recall lifecycle、incident denominator、language、license或coverage。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| FDA openFDA Enforcement Reports | [Pack](FDA_OPENFDA_ENFORCEMENT_PLATFORM_PACK_DESIGN.md) | concept+native-route fixture；endpoint populations separated |
| NHTSA Recalls | [Pack](NHTSA_RECALLS_PLATFORM_PACK_DESIGN.md) | concept+native-route fixture；API/bulk separated |
| CPSC Recalls | [Pack](CPSC_RECALLS_PLATFORM_PACK_DESIGN.md) | concept+native-route fixture；Recall REST only |
| EU Safety Gate | [Pack](EU_SAFETY_GATE_PLATFORM_PACK_DESIGN.md) | concept+manual-export fixture；official API contract missing |
| Canada Recalls and Safety Alerts | [Pack](CANADA_RECALLS_SAFETY_ALERTS_PLATFORM_PACK_DESIGN.md) | concept+official-feed route fixture；JSON/CSV bilingual |

requested=5、concept-fixture-eligible=5、route-fixture-eligible=4、callable=0、durable-approved=0。某成员官方machine surface不会提升Safety Gate route，也不会让一个regulator的class/status可与另一个直接比较。

## 2. 共同契约与禁止推断

共同projection固定publisher/jurisdiction/surface/population definition、event/report/campaign/product/range、record/representation/native lifecycle、authority、risk/source assertion、measure/mandate、exact relation、history/coverage、rights和revision。

- complaint/incident report不等于recall；recall/enforcement report/campaign/alert/advisory也不互换；
- campaign/event可对应多个product/lot/action，flattened rows保留common origin，不能重复计为独立recall；
- hazard/defect/noncompliance/classification证明source如何报告或分类，不证明因果、发生率、暴露、法律责任或所有unit危险；
- incident/injury/death数量是source assertion，不是完整分母或独立验证；
- voluntary、authority-requested和ordered/required逐measure保存，不能从regulator publication反推强制；
- announced/open/completed/terminated/closed/archived保持native meaning；不得推断全部回收、owner触达、修复完成或残余风险为零；
- recall quantity、distribution和potential population不等于销量、installed base、recovered units或market size；
- API/bulk/JSON/CSV/PDF/page、语言版本和provider projection可能common-origin，不是独立证据；
- manufacturer/operator/retailer是机构authority或supply relation，不进入person、lead或customer graph；VIN和消费者身份排除；
- recall signal可以形成问题假设，但不自动成为用户痛点、购买意愿、需求规模、医疗建议或法律结论。

## 3. 动态物化视图

- `new-and-expanded-corrective-actions-by-product-domain-and-jurisdiction`：按exact event/campaign/product/range/action和revision展示；
- `hazard-defect-noncompliance-by-authority-and-native-class`：保持native class/source assertion，不跨authority排名；
- `voluntary-requested-ordered-measures-by-action-kind`：以measure为分母，不从event继承；
- `amended-withdrawn-terminated-and-follow-up-lineage`：current失效但保留历史；
- `affected-lot-batch-model-and-distribution-scope`：只索引source列明范围，未知不外推；
- `representation-language-schema-rights-and-coverage-drift`：跟踪API/bulk/export/language/common-origin、lag和blocked member。

Dolt保存Pack、definition、schema/license digest、native taxonomy mapping、view definition、review decision、lineage和tombstone；获准的record/span未来才进入分析库。视图固定member/product/representation/authority/native taxonomy/rights purpose/watermark；correction/withdrawal、schema/status/route/license/translation变化触发partition invalidation/rebuild。

## 4. Skills、Probe 与降级

`public-product-recall-source-contract-research/v1`只读官方docs和固定GitHub source，输出Pack/drift proposal；不安装/执行、不调用API/MCP、不下载feed/export/recall corpus。

`public-product-recall-conformance/v1`只用手写synthetic fixtures验证event/campaign/product/range/action、authority、native state/class、incident assertion、mandate、relation/common-origin、alternate language、PII drop、coverage和zero effects。

未来`approved-public-product-recall-read/v1`只调度用户批准的exact member/product/resource/field/window/budget binding；当前返回`no-authorized-public-product-recall-binding`。不得fallback到HTML/browser/internal endpoint/community wrapper/MCP/Skill/scraper、VIN或另一个成员。

本Channel没有Probe。报告安全问题、联系企业、订阅alert、创建/更新recall、修改status或发布warning会改变真实安全/监管流程，不是需求测试；若未来需要，只能由独立高影响工作流和用户逐effect授权处理。

## 5. Fixture、可观测性和晋级

| 场景 | 必须结果 |
| --- | --- |
| one event → multiple product reports | shared event relation；不重复算独立event |
| campaign product row有remedy | action evidence；不标VIN受影响或remedy completed |
| hazard class + injury count | source-attributed risk/assertion；不算incidence/causality |
| voluntary recall published by authority | operator action + regulator publisher；不升级ordered |
| alert has compulsory and voluntary measures | 每项measure独立mandate；不挂全局bool |
| status terminated/archived | native publication/lifecycle state；不标all units recovered |
| correction expands lots | new revision/range；旧current projection失效，历史保留 |
| English/French or JSON/CSV | alternate/common-origin relation；不独立计数 |
| route unavailable | missing-member/coverage degradation；no HTML/community fallback |
| VIN/contact/report/submit请求 | policy拒绝；zero external effect |

Telemetry按`Channel × member/product × jurisdiction/authority × event/campaign/product/range/action × schema/license revision × representation/language`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、native-state/risk/authority/mandate completeness、relation/revision conflicts、common-origin、PII drop、rights/rate/lag drift和zero writes。至少一个成员经用户批准完成metadata-only canary才可`modeled-partial`；正文、附件、identity和durable materialization逐成员/字段/用途另审。
