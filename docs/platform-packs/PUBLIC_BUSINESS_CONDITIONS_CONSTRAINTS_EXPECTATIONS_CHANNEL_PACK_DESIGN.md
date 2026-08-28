# Public Business Conditions, Constraints & Expectations Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现企业直接报告的经营活动、需求/订单、成本/价格、人员与供应链约束、韧性、信心、未来预期和planned response，补齐business lifecycle、credit supply与formal insolvency之间的operating-pressure signal。它统一`PublicBusinessConditions*` projection，但不统一programme、population、statistical unit、question、response scale、measure、time role、weighting、estimate representation、quality、release、lifecycle或rights。

可比较partition至少固定：

```text
member + jurisdiction + publisher + programme/standing + population/frame/unit
+ questionnaire/question/revision/role/routing + response scale/category
+ measure + recent/current/outlook/plan + reference window/horizon/comparison basis
+ response share/balance/diffusion/composite/quantitative representation + direction
+ design/nonresponse/calibration/count/turnover/employment/country/sector weighting
+ geography/industry/size + denominator + SA/NSA/imputation/suppression/quality
+ release/vintage/correction/backcast + route/distribution standing + rights
```

`PublicBusinessCredit*`保留lender-reported supply/demand；`PublicLaborDemand*`保留official vacancy stock/flow；`PublicConsumerPrice*`保留price indexes；`PublicBusinessInsolvency*`保留formal procedures。它们只能与本Channel形成aggregate hypothesis relation，不能回填question、outturn、lead或causality。

## 2. 成员与能力矩阵

| 成员 | Current/recent activity | Demand/constraints | Price/workforce | Outlook/action | Quality/lifecycle | Exact official access |
| --- | --- | --- | --- | --- | --- | --- |
| U.S. Census BTOS | performance/revenue/employees/hours/status | demand、hiring/supply topics | input prices/employment | six-month outlook、supplements | experimental、panel/population breaks | dedicated BTOS API + XLSX |
| UK ONS BICS | turnover/trading/financial performance | concerns/trade/supply topics | prices/workforce | wave-specific expectation | CI、per-question weights、question drift | versioned wave XLSX；无BICS API |
| EU Commission BCS | production/activity/order books | factors limiting production | selling prices/employment | expectations、capacity、investment | balance/composite、SA/backcast/partner method | Redisstat SDMX family + ZIP/XLSX |
| Statistics Canada CSBC | reported conditions/recent topic results | explicit/most challenging obstacles | sales/prices/employment outlook | 3/12-month outlook、selected plans | calibrated/reliability/correction；final cycle | WDS PIDs + official tables |

成熟度：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / current-activity fixture=4 / demand-or-order fixture=2 / price-cost fixture=4 / workforce fixture=4 / supply-chain-or-input-constraint fixture=4 / explicit-obstacle fixture=4 / resilience-or-liquidity fixture=2 / confidence-or-uncertainty fixture=4 / capacity-utilisation fixture=1 / investment-intention fixture=1 / expectation fixture=4 / planned-action fixture=2 / response-quality fixture=4 / programme-lifecycle fixture=4 / selected-manual=4 / callable=0 / durable=0`。generic API、MCP、parser、HTTP 200或同名indicator不会提高domain maturity。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存member/programme/standing、population/frame/unit、question/scale/route、measure/time/horizon、weight/estimator/representation/direction、quality/release/correction/lifecycle/rights、fixed OSS/Skill revision、adoption decision与verification lineage；不保存credential、未授权observations/files、respondent/business identity、microdata、open text或restricted attributes。

未来获得durable授权后，分析数据库只接field-approved aggregate cells。动态物化视图至少包括：

- `respondent-view-vs-weighted-estimate-vs-composite-vs-administrative-outturn`；
- `business-enterprise-establishment-reporting-unit-local-unit-manager-series-grain`；
- `invitation-response-weighted-response-estimate-index-release-grain`；
- `operating-status-performance-revenue-demand-employment-hours-price-inventory-resilience`；
- `selected-obstacle-most-challenging-impact-duration-planned-response`；
- `recent-current-near-term-six-month-twelve-month-plan-time-role`；
- `expectation-vs-outturn-vs-publisher-forecast-vs-commitment`；
- `plan-vs-approved-funded-started-completed-action`；
- `response-share-unweighted-share-balance-diffusion-quantitative-composite`；
- `measure-specific-positive-direction-and-neutral-band`；
- `design-nonresponse-calibrated-count-turnover-employment-country-sector-weight`；
- `national-regional-single-site-country-eu-euro-area-population`；
- `core-rotating-supplement-ad-hoc-monthly-quarterly-biannual-annual-suspended`；
- `question-wording-routing-option-reference-window-revision`；
- `sa-nsa-imputed-backcast-corrected-development-experimental-suppressed`；
- `null-na-dont-know-not-applicable-not-asked-suppressed-unreliable`；
- `active-transition-final-collection-final-release-discontinued-archive-route`；
- `member-question-estimator-quality-rights-and-comparability-gate`。

跨成员pressure view默认只发布member-native response/trend与explicit comparability label，不发布未经population/question/estimator gate的country rank或global confidence index。物化按knowledge/release revision可重建；index缺失时回退canonical scan，不回退republisher、generic MCP、another member或网页抓取。

## 4. 可观测性

每次request/fixture/canary记录：

```text
member × jurisdiction/publisher × programme/standing × population/frame/unit
× publication/dataset/resource/table/series/question/revision/role/scale
× measure/time-role/reference-window/horizon/comparison-basis
× representation/direction/weight/denominator × geography/industry/size
× estimate/quality/release/correction/backcast × route/rights/access
```

Counters与gauges至少包括：

- requested/returned/retained/dropped/quarantined/suppressed questions、series、cells与files；
- unknown programme/population/unit/question/scale/measure/time/weight/denominator/quality/lifecycle；
- response-as-outturn、expectation-as-forecast、plan-as-action、constraint-as-cause rejection；
- operating/revenue/demand/workforce/price/inventory/resilience measure conflict；
- selected/most-challenging/impact/duration/plan question or denominator conflict；
- response-share/balance/diffusion/composite/quantitative representation mismatch；
- measure-specific sign/direction/neutral-band mismatch；
- national/regional/single-site/country/EU aggregate and weighting conflict；
- core/rotating/supplement/question wording/routing/option/reference-window drift；
- SA/NSA/imputation/backcast/correction/method break and quality standing drift；
- null/NA/don't-know/not-applicable/not-asked/suppressed/unreliable-as-zero rejection；
- BTOS population/API coverage、BICS wave/workbook、Redisstat DSD/key、CSBC PID/correction drift；
- programme final-collection/final-release/discontinuation/archive and distribution-route drift；
- licence/attribution/third-party/no-endorsement/anti-identification/retention drift与zero effects。

Health分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`。client connected、workbook present、HTTP 200或数字返回不替代domain readiness。

## 5. 合成 conformance

Synthetic fixtures至少证明：

1. respondent view不当audited result、administrative outturn或transaction；
2. aggregate estimate不反推identified business、manager、employee、customer或supplier；
3. employer business、enterprise、establishment、reporting/local unit和series不合并；
4. invitation、respondent、response、weighted response、estimate、index和release分开；
5. current activity不当future outlook，outlook不当official forecast或commitment；
6. planned action不当approved、funded、started、completed或successful action；
7. reported obstacle不当cause、severity、loss或universal constraint；
8. selected obstacle不当most challenging；most challenging不补selected population；
9. expected impact、duration和planned response不从obstacle label推断；
10. revenue/turnover/sales不当demand/order book或profit；
11. demand/orders不当customer request、transaction volume或lender credit demand；
12. employment/hours/hiring difficulty不当vacancy、hire、separation或person fact；
13. input/output price response不当quote、CPI、margin或verified ledger cost；
14. supply delay/inventory assessment不当shipment、stock level或supplier event；
15. liquidity/cash horizon不当insolvency、bank balance、verified runway或credit decision；
16. response percentage、unweighted share、balance、diffusion index和composite不互换；
17. positive balance按question direction解释，不统一成“better”；
18. design、nonresponse、calibrated、count、turnover、employment、country和sector weights不互换；
19. national weighted、regional unweighted、single-site、country与EU aggregate不比较；
20. same question label跨wording/routing/response options/reference window变化不join；
21. core question不由supplement/ad-hoc补齐，suspended question不由相似series续接；
22. previous two weeks、calendar month、three/six/twelve months与publication period不互换；
23. SA、NSA、imputed、backcast、corrected与raw partner result不互换；
24. standard error、CI、reliability grade、suppression和response count不丢失；
25. null/NA/don't know/not applicable/not asked/suppressed/unreliable不当zero/no change；
26. BTOS pre/post-September-2023 population和size bins形成method break；
27. BICS pre-Wave-7 unweighted、later national weighted和single-site regional分开；
28. EU harmonised question不证明partner sample/mode相同；composite不当single response；
29. CSBC March-2020 crowdsourced iteration不与later probability sample直连；
30. CSBC final collection/scheduled release不当final data已发布或history unavailable；
31. generic API/MCP/client/parser成功不升级question/estimator/quality/lifecycle maturity；
32. route失败不得回退republisher、another member、HTML scraping、latest install或write surface。

## 6. 隐私、权利与安全

- 默认只保留publisher aggregate与semantic metadata；respondent/business identity、address/contact、local site、microdata、owner attributes、employee/customer/supplier、free text和rare cell全部pre-gate drop。
- public aggregate、public endpoint与durable commercial reuse是不同rights conclusion。Census terms、ONS OGL、EU CC BY与Statistics Canada Open Licence分别保存，third-party exceptions独立处理。
- credential只以Host reference存在；API key、MCP OAuth、cookies、account与restricted-research metadata不进入snapshot/chat/log/fixture/Git。
- 不提供company scoring、distress lead generation、credit/investment advice、economic forecast或对脆弱企业的定向profiling。

## 7. Probe与副作用边界

本Channel没有平台Probe。survey invitation/response/submission、API key registration、subscription/contact、restricted research application、data download、MCP install/connect、full-history mirror、materialization/index或任何business/financial/admin write均保持zero effect。主动验证需求只能走自有landing page、问卷、访谈或获批产品/销售实验，不能冒充企业参与official survey或制造统计信号。

## 8. 晋级顺序

1. evidence review：固定四成员programme/lifecycle、population/unit、question/scale、measure/time、weight/estimate、quality/route/rights；
2. static contract：编译`PublicBusinessConditions*`并验证EvidenceSpan/Observation/SourceItemCandidate承载；
3. synthetic fixture conformance：先证明32项拒绝边界；
4. route/schema fixture：只验证BTOS route envelope、BICS landing/workbook envelope、Redisstat dataflow/DSD/key和CSBC PID/cube/correction metadata，不取observation；
5. sandbox live：逐成员approved single-question/small-cell read，固定period/question/cell/byte/TTL/no-fallback；
6. operational canary：监控question/scale/weight/schema/quality/licence/programme/distribution drift并自动降级；
7. 用户另行授权后，才可能发布`callable`和`durable`成员revision。
