# Public Household Expenditure, Consumption & Budget Allocation Triage — 2026-08-26

## 1. 选择结论

本轮选择“公共家庭支出、消费与预算配置”。价格指数只能说明价格变化，不能说明家庭把多少预算配置到哪一类；评论和搜索也不能替代实际发生的aggregate expenditure。该Channel用于发现预算刚性、品类替代和可能需要进一步验证的消费摩擦，不把支出直接解释成需求、偏好、满意、福利或支付能力。

入选成员：

1. U.S. Bureau of Labor Statistics Consumer Expenditure Surveys（CE）；
2. UK ONS Living Costs and Food Survey / Family Spending；
3. Eurostat Household Budget Survey（HBS）；
4. Statistics Canada Survey of Household Spending（SHS）。

四者统一到`PublicHouseholdExpenditure*`，但consumer unit/household、Interview/Diary、classification、recall window、annualisation、nominal/real、mean/share/reporting prevalence、weight、quality、release和rights保持独立。

## 2. 第一性边界

- expenditure不自动等于consumption、quantity、use、need、preference、satisfaction、welfare或market demand；
- household/consumer unit/reference person/member/reporting unit不可互换；
- purchase/acquisition、payment、liability、use和service flow是不同事件；
- Interview与Diary有不同sample、coverage、recall、weight和overlap；integrated estimate必须保留source-selection rule；
- weekly/2-week/monthly/quarterly/12-month observation与annualised/calendar/financial-year estimate不可互换；
- mean across all units、mean among reporters、aggregate、share、percent reporting、median、per-capita和adult-equivalent分别建模；
- zero expenditure可能只是reference window内未买，不证明没有产品、没有使用或没有需要；
- nominal change不能拆成price/quantity/quality/substitution；publisher-deflated real value也不自动给出quantity；
- category share不是market share、priority或price elasticity；aggregate不是merchant revenue或market size；
- income before/after tax、disposable income、wealth、asset/debt和affordability不是同一概念；
- rent、mortgage principal/interest、owner cost、utilities和imputed rent分别建模；
- gifts given/received、third-party paid、reimbursement、business expense、tax/transfer/saving/debt/asset flow不得混入普通消费；
- COICOP/ECOICOP、CE UCC/integrated stub和SHS classification只能经固定revision correspondence映射；
- income、age、tenure、region等breakdown仅允许approved aggregate，不形成家庭画像、贫困判断、credit/insurance/housing等consequential input或Probe audience；
- official survey response、diary submission、special tabulation request和microdata申请都不是Probe。

## 3. 成员增量与生命周期

| 成员 | 独特增量 | Population / instrument | 官方发布面 | 当前状态 |
| --- | --- | --- | --- | --- |
| BLS CE | Interview+Diary integrated category estimates、CU means/shares/SE/RSE/percent reporting | U.S. consumer units；3-month Interview、two 1-week Diary | HTML/XLSX/PDF/tables + PUMD | active annual；latest published 2024 |
| ONS LCF / Family Spending | weekly household spend、nominal/real COICOP、income/region/household breakouts | UK private households；annual cross-sectional interview+diary | bulletin + five XLSX workbooks + technical report | active annual；latest FYE 2025，2026 corrections must retain lineage |
| Eurostat HBS | output-harmonised cross-country household consumption and PPS/equivalised views | private households；national interview/diary designs | Eurobase `hbs_exp_*` aggregate tables + restricted scientific-use files | latest completed comparable wave 2020；2026 first regulated wave/transition |
| StatsCan SHS | questionnaire+diary、current consumption/non-consumption、income/tenure/geography | private households in provinces for national totals；distinct questionnaire/diary weights | tables 11-10-0222-01…0227-01 + WDS/SDMX + PUMF/RDC | 2023 results current；2025 questionnaire fielded, results not assumed |

## 4. Agent Skill、MCP、SDK与OSS

| 候选 | 固定版本 | 决策 |
| --- | --- | --- |
| [kovashikawa/bls_data](https://github.com/kovashikawa/bls_data/tree/6d1320872dccba3703e44026758714778d3b5c93) | `6d1320872dccba3703e44026758714778d3b5c93` / MIT | BLS time-series API/MCP；CE publication tables不是该API domain，且key rotation有policy风险，`rejected-for-route` |
| [ONSdigital/dp-dataset-api](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6) | `8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6` / MIT | authority-org内部publication lifecycle service，含private/write dependencies；不是Family Spending public client，`reference-only` |
| [eurostat/restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | `a0bce063c60aef1033ea696d91d26e1158c2c4b0` / EUPL | authority-org SDMX/TSV transport；不含HBS national-method/classification/2020→2026 semantics，`reference-only` |
| [eurostat/statistics-coded](https://github.com/eurostat/statistics-coded/tree/ca58d8cad5a33ed5a6e5c97dd0cb1cfb29fbede3) | `ca58d8cad5a33ed5a6e5c97dd0cb1cfb29fbede3` / license未在静态审计中确认 | authority-org reproduction scripts；可能涉及microdata/derived methods，`static-method-witness-only` |
| [Aryan-Jhaveri/mcp-statcan](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33) | `ff34ecd7462000ac4e23b7b2f1076d93e22b3f33` / MIT | generic WDS/SDMX/MCP，hosted processor、download和SQLite越界；不拥有SHS语义，`fixture-reference-only` |
| [warint/statcanR](https://github.com/warint/statcanR/tree/d21b8bf905f32e4ccb8a7d604e24a2e92c184fef) | `d21b8bf905f32e4ccb8a7d604e24a2e92c184fef` / MIT | table discovery/full download与optional LLM search；不固定SHS instrument/weight/window，`reference-only` |

未发现由四个programme authority维护、固定本Channel全部语义的Agent Skill或MCP。本轮只读官方网页和固定revision的README/license-like evidence；未clone、install、execute或调用候选。

## 5. 晋级与成熟度

evidence review → static contract → synthetic conformance → table/schema fixture → approved aggregate-only sandbox live → operational canary → callable → durable。微数据、respondent/household identity、rare cells、special tabulation和survey diary始终在独立高风险门外。

成熟度：`requested=4 / concept-fixture=4 / programme-fixture=4 / current-questionnaire-or-instrument-fixture=4 / latest-published-result-fixture=4 / exact-official-machine-route-fixture=2 / official-table-or-workbook-route-fixture=4 / interview-fixture=3 / diary-fixture=4 / integrated-estimate-fixture=3 / consumption-expenditure=4 / non-consumption-flow=2 / income=4 / housing=4 / durable=3 / gift-in-kind=2 / mean/share=4 / percent-reporting=2 / aggregate=3 / nominal=4 / real-or-PPS=2 / equivalised=2 / estimate-quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0`。
