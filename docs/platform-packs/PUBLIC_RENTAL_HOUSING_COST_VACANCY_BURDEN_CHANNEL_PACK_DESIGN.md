# Public Rental Housing Cost, Vacancy & Burden Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现租金压力、租赁市场可得性、统计覆盖/质量摩擦、住房成本负担与方法解释中的需求和痛点。它统一`PublicRentalHousing*` projection，但不统一survey population、observation unit、tenure、rent basis、rent statistic、index model、vacancy/universe、turnover rule、housing-cost components、income denominator、threshold、geography、period、quality或rights。

最小事实链：

```text
program + population + observation unit + tenure + method revision
      -> rent level estimate (basis + geography + period + quality)
      -> rental price index (separate model/reference/change measure)

rental universe + source vacancy definition
      -> vacancy/availability aggregate (not a listing)

housing-cost components + allowance treatment + income denominator
      -> burden definition + published numerator/denominator
      -> burden aggregate for exact household/person population
```

所有关系必须由member-native identity、definition、release和quality证明。同名地区、相同currency/percentage、相邻period或共同使用JSON/Excel只生成review candidate。

## 2. 成员与能力矩阵

| capability | Census ACS | ONS PIPR | Eurostat EU-SILC | CMHC RMS | 当前发布 |
| --- | --- | --- | --- | --- | --- |
| `rental-housing.program.read` | ACS1/5 fixture | PIPR fixture | EU-SILC fixture | RMS fixture | knowledge/fixture only |
| `rental-housing.population.read` | renter unit/household universe | private rental stock/model sample | private household/person | eligible structure/unit universe | knowledge/fixture only |
| `rental-housing.tenure.read` | renter/cash-rent fixture | private rental | market/reduced/free/owner | private purpose-built, social excluded | knowledge/fixture only |
| `rental-housing.rent-level.read` | median gross rent | modelled price level | not asserted | all/occupied/vacant/turnover average rent | 3 member fixtures |
| `rental-housing.rent-index.read` | not asserted | hedonic PIPR index/change | not asserted in this Pack | same-sample change only, not index | 1 member fixture |
| `rental-housing.vacancy.read` | DP04 rental vacancy | not measured | not measured | source-defined vacancy/immediate availability | 2 member fixtures |
| `rental-housing.turnover.read` | not asserted | not published as turnover aggregate | not asserted | 12-month unit turnover | 1 member fixture |
| `rental-housing.burden.read` | B25070 distribution | denominator absent | overburden/cost-share | denominator absent | 2 member fixtures |
| `rental-housing.estimate-quality.read` | estimate/MOE/annotation | model/imputation/QMI | status/break/quality | CV/reliability/significance/suppression | 4 member fixtures |

成熟度：`requested=4 / concept-fixture=4 / exact official machine route-fixture=2 / official table-or-workbook route-fixture=4 / rent-level fixture=3 / rent-index fixture=1 / vacancy fixture=2 / turnover fixture=1 / housing-cost-burden fixture=2 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。generic API、MCP、Excel或percentage不会提高成员成熟度。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存Platform/Channel Pack、program/population/observation-unit/tenure、dataset/table/group/variable/DSD/workbook、rent/vacancy/turnover/burden definition、method/model、geography/period、estimate-quality、release/revision、rights、fixed OSS/Skill revision、decision、verification、lineage与tombstone；不保存API key、未授权data rows/workbooks、restricted microdata、address、respondent、landlord/agent/manager或household identity。

未来获得durable授权后，分析数据库只接field-approved aggregates。动态物化视图至少包括：

- `member-publisher-program-product-route-roster`；
- `dwelling-structure-unit-household-person-observation-grain`；
- `target-eligible-sampled-published-population-and-exclusions`；
- `market-reduced-free-private-social-owner-tenure-lineage`；
- `advertised-achieved-contract-gross-occupied-vacant-turnover-modelled-rent-basis`；
- `mean-median-quantile-band-level-index-point-and-rate-separation`；
- `rent-index-model-basket-weight-reference-link-smoothing-and-method-break`；
- `rental-universe-vacant-available-listing-and-future-supply-separation`；
- `turnover-window-repeat-count-and-non-unique-tenant-posture`；
- `housing-cost-components-allowance-income-denominator-threshold`；
- `household-vs-person-burden-numerator-denominator`；
- `survey-rent-income-index-publication-and-revision-periods`；
- `estimate-moe-cv-significance-suppression-model-and-status`；
- `current-corrected-revised-method-break-superseded-lineage`；
- `schema-table-dsd-workbook-api-key-licence-and-publication-drift`；
- `restricted-property-household-respondent-and-address-drop-audit`。

每个view携带member/program/product/release、population/unit/tenure、rent basis、measure、geography/period、quality、rights、input snapshot和rebuild reason。method、table、geography或release变化只重建受影响partition，不改写旧evidence。

## 4. 可观测性

Telemetry维度至少为：

`member × publisher/jurisdiction × program/population/observation-unit × dataset/product/table/group/variable/DSD/workbook × release/vintage × tenure/rent-basis × level/index/vacancy/turnover/burden measure × geography/dwelling/bedroom/furnishing × survey/rent/income/index/publication period × estimate/MOE/CV/significance/suppression/model/status × rights/access`

记录：

- requested/returned/retained/dropped/quarantined/suppressed；
- fetch/parse/schema/dimension/code/sheet错误、pagination/truncation、file size/digest和format drift；
- API key/rate/registration posture、retry/fallback rejection与credential redaction；
- dataset/table/group/variable/DSD/workbook replacement、dimension/category/geography drift；
- estimate/MOE/annotation pairing、sentinel、null/zero/missing/suppressed区分；
- advertised→achieved、gross→contract、mean→median、level→index、index point→currency的拒绝计数；
- rental unit→household→person grain promotion拒绝；
- vacancy→listing、turnover→unique tenant/churn、universe→demand/supply的拒绝计数；
- rent/income/cost/index/reference/publication period mismatch；
- burden denominator missing/incompatible、allowance/threshold/population mismatch和个体化拒绝；
- preliminary/current/corrected/revised/method-break/superseded delta与release lag；
- licence/attribution/confidentiality/retention/method drift与zero effects。

告警按member/program/product/release隔离。ACS API健康不能掩盖variable universe/MOE drift；ONS workbook健康不能掩盖source-basis或method变化；Eurostat dataset健康不能掩盖DSD/threshold/population变化；CMHC table可下载不能掩盖frame/reliability/licence变化。

## 5. 合成 conformance

至少验证：

1. advertised/asking rent不物化为achieved/paid rent；
2. contract rent不物化为gross rent；
3. occupied、vacant、turnover、non-turnover和all-unit rent分开；
4. observed、imputed、predicted和extrapolated rent分开；
5. mean、median、quantile和band distribution不互换；
6. rent level不物化为rental price index；
7. index point不解释为currency或percent；
8. rate/change必须固定window、base与method；
9. dwelling、structure、unit、household和person不按相邻关系合并；
10. market/reduced/free/private/social/owner tenure不按label merge；
11. 1-year、5-year、monthly、October snapshot和annual reference不互换；
12. rental universe不解释为current listing supply或occupied demand；
13. vacancy rate不解释为具体unit可租；
14. available-immediate aggregate不解释为platform listing；
15. turnover不解释为unique tenant、eviction、displacement或churn；
16. rent-to-income burden不通过不兼容median quotient重建；
17. household burden rate与person-in-household rate分开；
18. gross/net housing cost与allowance treatment分开；
19. income、housing-cost和survey reference periods分别绑定；
20. estimate与MOE、CV、reliability、significance、suppression分别保存；
21. missing/null/sentinel/`**`/not-significant不解释为zero；
22. PIPR/IPHRP method break、table change和revised release保留lineage；
23. cross-member comparison缺任一population/basis/measure/period/quality compatibility时拒绝；
24. address、respondent/property/household identity、restricted microdata和credential全部drop/quarantine；
25. generic client/MCP/Skill成功不升级domain maturity或authority。

## 6. 隐私、权利与安全

- 默认drop/quarantine address、exact property、respondent、tenant/household、landlord/agent/manager、contact、API key和可重识别small-cell组合；
- ACS API Terms identification prohibition、ONS OGL/third-party exception、Eurostat reuse exception和CMHC Data Licence分别绑定，OSS licence不能覆盖data licence；
- aggregate统计不得用于individual tenant screening、credit、insurance、employment、benefit、rent-setting或歧视性决策；
- correction、suppression、method break、geography/table replacement和withdrawal必须传播到derived view，同时保留合法evidence lineage。

## 7. Probe 与副作用边界

本Channel没有平台Probe。申请/注册API key、请求restricted microdata、下载full history、联系统计机构/respondent/landlord/tenant、提交survey、订阅、分享dashboard、配置MCP、抓取未文档化portal endpoint或任何admin/write action都保持zero effect。主动需求测试只能走系统自有landing page、问卷、访谈或产品实验Channel，不得冒充统计机构、房东、经纪或真实可租房源。

## 8. 晋级顺序

1. 冻结member/program/product、population/unit/tenure、rent basis、measure、geography/period、quality、release与rights；
2. 先用synthetic fixture验证所有不可推断项和sensitive-field drop；
3. 另行授权后只做metadata/catalogue/file-header canary，再做一个variable/dataset/workbook的最小read；
4. 验证API key/rate、dimension/sheet、sentinel/flag、MOE/CV、revision/method-break和licence drift；
5. 只有population、basis、measure、period与quality对账通过才允许aggregate materialization；
6. burden view必须使用source-published denominator/definition，不默认跨成员派生；
7. operational canary必须能因population、method、table/DSD、quality、release、access、licence或confidentiality drift自动fail closed。
