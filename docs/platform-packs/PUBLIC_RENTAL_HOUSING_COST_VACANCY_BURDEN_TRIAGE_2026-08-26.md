# 公共租赁住房成本、空置与负担候选分流（2026-08-26）

## 1. 结论

本轮选择四个互补的官方统计体系，补足上一轮消费价格体系明确缺失的租金水平、租赁空置和住房成本负担信号。它们不能被压成一个“租房行情API”。

| 成员 | 核心价值 | 当前成熟度 | 主要缺口 |
| --- | --- | --- | --- |
| U.S. Census ACS | 1-year/5-year housing survey estimates、gross rent、rental vacancy、rent-income distribution、MOE与细粒度geography | concept + exact API/dataset/group/variable/universe/quality fixture | 2026起API query需key；period estimate不是realtime；无listing、rent index或individual burden |
| UK ONS PIPR | private rental stock的modelled price levels、rental index/change、weights、property/geography breakdown与method history | concept + exact official dataset/edition/workbook/method fixture | current route是XLSX而非已证明API；national achieved/advertised basis不同；无vacancy或income denominator |
| Eurostat EU-SILC | private household/person population、tenure、housing-cost components、disposable income与overburden aggregate | concept + exact Statistics API/dataset/DSD/method fixture | income/cost reference periods不同；rate以persons为unit；无rent level/index/vacancy；microdata restricted |
| CMHC RMS | scoped purpose-built rental universe、occupied/vacant/turnover rents、vacancy、turnover与CV/reliability | concept + exact official table/workbook/method/licence fixture | 没有documented public API；frame排除social/affordable和小structures；October snapshot不是全市场 |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official machine route-fixture=2 / official table-or-workbook route-fixture=4 / rent-level fixture=3 / rent-index fixture=1 / vacancy fixture=2 / turnover fixture=1 / housing-cost-burden fixture=2 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。

本轮只读取官方网页、methodology、licence、公开repository页面、固定SHA文本与`git ls-remote`；没有请求统计data rows、下载XLSX/CSV/JSON-stat或microdata，没有申请API key/account，没有clone、install、build或execute OSS/MCP/Skill，也没有联系respondent/agency、订阅、提交或产生平台副作用。

## 2. 第一性原理边界

1. advertised/asking rent、achieved/paid rent、contract rent、gross rent、occupied/vacant rent、modelled price level、rent index与change rate是不同事实。
2. dwelling、structure、rental unit、renter-occupied unit、cash-rent household和person living in a household是不同observation unit。
3. rental universe、sample、occupied count、vacant count、available count、listing count和future supply分别保存。
4. vacancy必须绑定source definition和denominator；不自动等于realtime listing、可立即签约的具体房源或housing shortage。
5. turnover按source window和repeat-count policy解释；不等于unique tenant、churn、eviction、displacement或new lease count。
6. rent level不能用作pure price-change index；rent index也不能恢复currency price。
7. mean、median、quantile、band distribution和hedonic/modelled level不能互换。
8. monthly collection、October snapshot、12-month/60-month period estimate、income year、housing-cost period、index reference和publication time分别保存。
9. housing-cost burden必须固定cost components、housing allowance treatment、income denominator、threshold、population、unit和period。
10. share of persons living in burdened households不等于share of households，也不等于individual hardship。
11. rent-to-income distribution不能通过跨来源median rent÷median income随意重建。
12. ACS MOE、CMHC CV/reliability、PIPR model/imputation和Eurostat status/break分别保存；共同叫quality不代表可比较。
13. suppression、not significant、missing、null和out-of-scope不等于zero。
14. market/reduced/free/social/private tenure及各国native tenure不能按英文label盲merge。
15. preliminary/current/corrected/revised/method-break/superseded值保留lineage，新release不覆盖旧evidence。
16. national/subnational aggregate不能归因到address、property、landlord、tenant或household。
17. cross-member comparison必须逐项通过population、rent basis、measure、geography、period、method、quality和release compatibility。

## 3. 官方成员证据

### 3.1 U.S. Census ACS

[ACS 1-year API page](https://www.census.gov/data/developers/data-sets/acs-1year.html)固定year/dataset/table/geography并说明当前query需要API key；[ACS information guide](https://www.census.gov/programs-surveys/acs/library/information-guide.html)区分12-month 1-year和60-month 5-year period estimates。[B25064](https://api.census.gov/data/2024/acs/acs1/groups/B25064.html)与[B25070](https://api.census.gov/data/2024/acs/acs1/groups/B25070.html)分别固定median gross rent和gross rent as a percentage of household income的变量/universe。

[2024 subject definitions](https://www2.census.gov/programs-surveys/acs/tech_docs/subject_definitions/2024_ACSSubjectDefinitions.pdf)固定gross-rent components与comparability；[technical documentation](https://www.census.gov/programs-surveys/acs/technical-documentation.html)要求table/geography changes、errata、accuracy和release rules同行。[API Terms](https://www.census.gov/data/developers/about/terms-of-service.html)禁止identification-oriented linkage与false representation。

### 3.2 UK ONS PIPR

[PIPR monthly dataset](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics)按edition发布price level、index与annual change XLSX；[annual weights](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukannualweights)是独立product。[detailed methodology](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/priceindexofprivaterentsdetailedmethodology)固定hedonic double imputation、fixed basket、14-month validity、Jevons/Lowe、chain-link、smoothing与price-level extrapolation。

[PIPR QMI](https://www.ons.gov.uk/peoplepopulationandcommunity/housing/methodologies/priceindexofprivaterentsqmi)说明England/Wales主要achieved、Scotland自2025年9月混合、Northern Ireland advertised；同一UK headline不能抹去source-basis差异。[ONS Terms](https://www.ons.gov.uk/help/terms-conditions)固定OGL与third-party exception。

### 3.3 Eurostat EU-SILC

[information on data](https://ec.europa.eu/eurostat/web/income-and-living-conditions/information-data)固定private-household target、cross-sectional/longitudinal population、reference period与EU aggregate coverage；[methodology](https://ec.europa.eu/eurostat/web/income-and-living-conditions/methodology)固定household membership和disposable-income口径。`ilc_lvho07a`的官方dataset引用将overburden定义为住房成本超过disposable income 40%的household中person share。

[Statistics API](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)返回JSON-stat cube，必须与dataset/DSD/dimension/codelist/status一起解码。[EU-SILC microdata](https://ec.europa.eu/eurostat/web/microdata/collections-research/european-union-statistics-on-income-and-living-conditions)是有条件scientific-use access，不是公开aggregate API的fallback。

### 3.4 CMHC RMS

[RMS methodology](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-research/surveys/methods/methodology-rental-market-survey)固定population 10,000+ urban areas、privately initiated 3+ units、至少3个月、October snapshot、vacancy/turnover/rent definitions、same-sample change与CV/reliability/suppression。[Rental Market Data](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market)提供public tables，但未给documented API contract。

[CMHC Data Licence](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/cmhc-licence-agreement-use-of-data)要求准确再现和指定source/adaptation声明，并明确不构成endorsement。

## 4. 固定版本 OSS、MCP 与 Skill 审计

以下候选均未clone、install、build或execute：

| 候选 | 固定revision / license | 可借鉴 | 不可直接晋级原因 |
| --- | --- | --- | --- |
| [uscensusbureau/us-census-bureau-data-api-mcp@`5dcaa63`](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a) | CC0-1.0，Census official | dataset/geography/aggregate tools、schema tests、local catalogue database与official MCP provenance | 需要key、Docker/Postgres seed；generic aggregate tool不固定B25064/B25070/DP04 universe/MOE/burden semantics；README明确prompt是instruction而非capability constraint |
| [datamade/census@`3da5a10`](https://github.com/datamade/census/tree/3da5a1068164c27f6e83815f5d28ec300e184fdf) | BSD-3-Clause，community | ACS1/5/profile/subject client、year/geography helper与current key requirement | wrapper以latest default和raw variable calls为中心；没有住房domain allowlist、MOE sibling、universe、sentinel、table change或burden治理 |
| [ONSdigital/dp-api-clients-go@`12a8416`](https://github.com/ONSdigital/dp-api-clients-go/tree/12a841643d707974cc18d4dad9011d91d1db3bf5) | MIT，ONS official | generic dataset/dimension/download/health client patterns | 未证明PIPR workbook已映射为ONS API dataset；不拥有PIPR source basis、model、smoothing、price-level或method-break语义 |
| [eurostat/EU-SILC@`bc85e52`](https://github.com/eurostat/EU-SILC/tree/bc85e5223d01eb8320cb50cb8b9c73b1521427dc) | EUPL-1.2，Eurostat official | NSI transmission validation、R/SAS/SQL rules与XML configuration | 面向成员国microdata validation，不是public dissemination client或Agent Skill；运行需受控数据/工具，不可用于公开aggregate route |
| [eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | EUPL，Eurostat org | SDMX/DSD/codelist、bulk/cache与large-table策略 | generic Eurostat client不固定EU-SILC population、cost/allowance/income period、person-vs-household或threshold语义 |
| [cyanheads/eurostat-mcp-server@`7aa545d`](https://github.com/cyanheads/eurostat-mcp-server/tree/7aa545dca0a8848e4aa0e51a4f8265b633600d11) | Apache-2.0，community | catalogue browse、dimension discovery、decoded observations、bounded pagination与cursor snapshot | hosted/local MCP扩大任意dataset查询面；generic query/SQL/download不能代替domain allowlist、status/rights、EU-SILC method或cross-dataset join gate |
| [mountainMath/cmhc@`08705a6`](https://github.com/mountainMath/cmhc/tree/08705a6a1f25572ef1a1552a90108740196cd31d) | MIT，community | RMS series/dimension discovery、GeoUID、query builder与CMHC attribution提示 | README自称“wrapper for hack”；依赖未文档化portal接口，不是CMHC official API，schema和endpoint可漂移，不能绕过official table/manual route |
| [amkessler/nicar2026 skills@`ca4b608`](https://github.com/amkessler/nicar2026_skills_in_codex_claude/tree/ca4b608a8b841c40c97c80d61570898952eef963) | Apache-2.0，community training Skills | `state-county-rankings`与`majority-minority-change`展示fixed local ACS workflow、deterministic script和versioned instructions | 只分析已准备CSV，不提供ACS住房access或domain definitions；ranking workflow若缺MOE/significance/population gate会放大误用，不能成为本Channel Skill |

没有发现由ONS PIPR、Eurostat EU-SILC或CMHC维护、能同时固定rent basis、population、vacancy/universe、burden denominator、quality与revision的domain Agent Skill。Census官方MCP是重要authority-maintained candidate，但仍是通用取数面而非住房语义Skill；所有候选只进入versioned candidate snapshot，不进入active registry。

## 5. 晋级建议

1. 四成员先停在`selected-manual`，冻结program/population、observation unit、rent basis、measure、period、quality、release与rights。
2. 用手写synthetic fixture证明advertised/achieved/gross/modelled rent、level/index、vacancy/listing、unit/household/person和burden denominator全部拒绝误合并。
3. 另行授权后只做metadata/catalogue/file-header canary；ACS先验证一个group/variable且保存MOE，Eurostat先验证一个dataset/DSD，ONS/CMHC先验证workbook header/digest，不默认下载full history。
4. Census official MCP仍需tool allowlist、key隔离、response schema和no-identity gate；CMHC community wrapper保持blocked，直到CMHC发布official machine contract或用户批准受控研究。
5. 只有population、rent basis、measure、geography、period与quality compatibility通过，才允许cross-member view；任何ranking默认拒绝。
6. 当前不实现真实Connector，不安装或执行上述项目。
