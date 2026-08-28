# 公共企业形成、人口学与存续统计候选分流（2026-08-26）

## 1. 结论

下一统计型Channel选择U.S. Census BFS/BDS、UK ONS Business Demography、Eurostat Business Demography与Statistics Canada MBOC。它们补足企业披露、招聘、采购和职位空缺无法证明的business-population变化：谁提交了business application、哪些employer formations被观察/预测、enterprise/establishment何时birth/open/close/die、cohort是否survive、何种企业high-growth。它们不提供identified company lead，也不证明市场需求、创业成功或退出原因。

| 成员 | 独特价值 | 官方接入 | 本轮成熟度 | 主要边界 |
| --- | --- | --- | --- | --- |
| U.S. Census BFS/BDS | application→employer formation cohort；firm/establishment entry/exit与job flow | keyed Census Data API、tables/bulk | exact official machine route + selected manual | application/actual/projected/spliced、firm/establishment和job flow分开 |
| UK ONS Business Demography | registered active enterprise births/deaths、employer demography、five-year survival | versioned annual XLSX | official workbook route + selected manual | annual active非March snapshot；death受reactivation adjustment且近两年provisional |
| Eurostat Business Demography | enterprise/employer birth/death/survival、employment、high growth及regional breakdown | Statistics API/SDMX、current/historical datasets | exact official machine route + selected manual | enterprise可含多个legal units；country source/quality/revision不完全一致 |
| Statistics Canada MBOC | monthly opening/closure/continuing/active、entrant/reopening、temporary closure/exit | WDS/SDMX/full-table PID 33100270 | exact official machine route + selected manual | employment transition非legal event；exit近期为model projection |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / application fixture=1 / active-population fixture=4 / birth-formation-opening fixture=4 / death-closure-exit fixture=4 / reopening-or-temporary-closure fixture=1 / survival fixture=2 / high-growth fixture=1 / employment-dynamics fixture=2 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。

本轮只读official webpages、methodology、licence、static API metadata、Eurostat navtree catalogue metadata、fixed-SHA repository text与`git ls-remote`；没有请求statistical observation/data row、CSV/XLSX/SDMX/bulk file、账号或key，没有clone/install/build/execute Skill/MCP/OSS，也没有联系business/agency、订阅、提交survey/register application或产生平台副作用。

## 2. 第一性原理边界

1. business/tax-ID application、legal registration、statistical enterprise birth、employer formation、establishment opening和firm startup是不同事件。
2. application、legal unit、enterprise、firm、establishment/local unit、employer business、job与person是不同unit；一个enterprise可含多个legal units，一个firm可含多个establishments。
3. active可表示reference year任一时点有turnover/employment、reference month有payroll employment或point-in-time registered；必须固定activity test与window。
4. opening可能是entrant或reopening；closure可能是temporary、extended或最终exit。只观察相邻两月不能宣称permanent exit。
5. enterprise birth/death通常排除merger、takeover、break-up、ownership/change-of-activity等restructuring；legal incorporation/dissolution不自动满足该条件。
6. employer birth可由既有non-employer首次雇人产生；employer death可由仍经营的enterprise不再雇人产生。
7. BFS actual formation、model projected formation与spliced series必须分开；4-quarter与8-quarter cohort horizon不能合并。
8. weekly application series不含formation且NSA；monthly/annual、SA/NSA与cohort observation不能按同一time label聚合。
9. birth/death/opening/closure count、rate、percentage change与net change不同；rate必须携带exact numerator、denominator、scale与population。
10. survival是exact birth/employer-birth cohort在age horizon下满足activity test，不是identified business健康、盈利、owner persistence或未来概率。
11. high growth要求exact start-size、growth variable、threshold、annualisation、window与age；不是startup success、revenue/valuation growth或product adoption。
12. job creation/destruction是business dynamics flow，不是hire/separation、vacancy或unique worker flow。
13. NAICS、SIC、NACE、geography、size与legal-form revisions不能按label直接join；classification held constant也不表示business未变更。
14. administrative/register-derived、survey-derived、projected、spliced、reactivation-adjusted、exit-modelled、noise-infused和suppressed是不同estimate standings。
15. preliminary/provisional/current/revised/corrected/reclassified/final/superseded必须形成lineage；current API/table不是revision archive。
16. missing/null/suppressed/noise flag/low comparability不等于zero；aggregate不得反推、link或identify business/person。

## 3. 官方成员证据

### 3.1 U.S. Census BFS/BDS

- [BFS methodology](https://www.census.gov/econ/bfs/methodology.html)固定EIN application subsets、actual/projected/spliced employer formations、4Q/8Q horizon与duration；weekly series不产生formation。
- [BFS API metadata](https://api.census.gov/data/timeseries/eits/bfs.html)固定`timeseries/eits/bfs` family；所有data query需key，本轮未请求。
- [BDS about](https://www.census.gov/programs-surveys/bds/about.html)固定firm/establishment、opening/closing、startup/shutdown与job flows；[BDS methodology](https://www.census.gov/programs-surveys/bds/documentation/methodology.html)固定longitudinal revisions与noise infusion。
- [BDS API](https://www.census.gov/data/developers/data-sets/business-dynamics.html)固定`timeseries/bds`及indicator/geography/NAICS/age/size surface。

### 3.2 UK ONS Business Demography

- [QMI](https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/methodologies/businessdemographyqmi)固定VAT/PAYE active population、annual reference、enterprise/employer concepts、reactivation adjustment与two-year provisional death。
- [annual dataset](https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/datasets/businessdemographyreferencetable)发布versioned XLSX、previous editions和amendment notice；generic ONS API/client不证明exact route。
- [ONS terms](https://www.ons.gov.uk/help/terms-conditions)固定OGL主规则、third-party exceptions和current-site authority。

### 3.3 Eurostat Business Demography

- [information on data](https://ec.europa.eu/eurostat/web/business-demography/information-data)固定enterprise/employer populations、birth/death/survival/rates、employment、高增长threshold、coverage与transmission/revision timing。
- current datasets包括`bd_size`、`bd_l_form`、`bd_salge1_size`、`bd_hg`等；2004–2020 historical dataset codes保留但不作为current fallback。
- [2025 methodological manual](https://ec.europa.eu/eurostat/en/web/products-manuals-and-guidelines/w/ks-01-25-016)固定EBS compilation/validation framework；Statistics API、SDMX、country metadata仍须逐dataset/member验证。
- [reuse](https://ec.europa.eu/eurostat/help/copyright-notice)要求source/access date/changes与exceptions。

### 3.4 Statistics Canada MBOC

- [program metadata](https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&Id=1582307)固定employer population、opening/closure/continuing/active、entrant/reopening、exit model、revision、confidentiality与non-sampling quality。
- [table 33-10-0270-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3310027001)固定monthly SA product/PID及correction lineage。
- [WDS](https://www.statcan.gc.ca/en/developers/wds/user-guide)固定metadata/vector/coordinate/change/full-table/delta shapes；[Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)禁止identification linkage并要求exact attribution/adaptation。

## 4. 固定版本 OSS、MCP 与 Agent Skill 审计

| 候选 | 身份/许可 | 有价值能力 | 不能证明/风险 |
| --- | --- | --- | --- |
| [uscensusbureau/us-census-bureau-data-api-mcp@`5dcaa63`](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a) | Census official，CC0-1.0 | dataset/geography discovery、aggregate query、official prompt/MCP architecture | 需要key和Postgres seed；当前prompt只覆盖population；未固定BFS/BDS lifecycle或time-series conformance |
| [georgemandis/mcp-census-data@`e0491dc`](https://github.com/georgemandis/mcp-census-data/tree/e0491dccd1b784776df794e5ee92f1899e0d5c7e) | community，fixed revision license未确认 | broad Census dataset discovery/query | generic aggregate schema不证明BFS/BDS；license gate未过 |
| [ONSdigital/dp-api-clients-go@`12a8416`](https://github.com/ONSdigital/dp-api-clients-go/tree/12a841643d707974cc18d4dad9011d91d1db3bf5) | ONS official，MIT | dataset/filter/codelist/search client | 含更宽upload/import；不证明annual workbook有Dataset API route |
| [eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | Eurostat official，EUPL | TOC/DSD/SDMX/TSV/cache | generic client不执行business-demography comparability/revision gates |
| [cyanheads/eurostat-mcp-server@`7aa545d`](https://github.com/cyanheads/eurostat-mcp-server/tree/7aa545dca0a8848e4aa0e51a4f8265b633600d11) | community，Apache-2.0 | catalogue/dimension/query/download/observability | hosted/local broad processor；download/dataframe不等于domain authority |
| [pbouill/statistics-canada@`419e087`](https://github.com/pbouill/statistics-canada/tree/419e0870fb6dc36b16a522d160be9b3aa63cd24e) | community，GPL-3.0 | typed WDS client | generic WDS，部分POST 503 posture；不固定MBOC PID/events/revision |
| [Aryan-Jhaveri/mcp-statcan@`ff34ecd`](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33) | community，MIT | WDS/SDMX/CLI/MCP/optional SQLite | hosted processor与broad DB/download；项目也警告LLM可能fabricate |

官方Census MCP是本轮发现的authority-maintained Agent surface，但不是domain Skill。没有发现四成员authority维护、同时固定application/formation、unit、lifecycle、cohort、denominator、estimate standing、quality与revision的Business Demography Agent Skill。所有候选仅进入versioned snapshot，不进入active registry。

## 5. 晋级建议

1. 四成员先停在`selected-manual`，冻结program/population/unit/lifecycle/cohort/measure/denominator/estimate/adjustment/release/rights。
2. 用synthetic fixtures先证明application≠birth、opening≠entrant、closure≠exit、projected≠observed、enterprise≠legal unit、job flow≠hire/separation。
3. 分别验证Census BFS/BDS static schema、ONS exact workbook edition、Eurostat current DSD/status与StatCan PID metadata；不得跨program/member fallback。
4. MCP/clients必须通过tool allowlist、key/network/processor isolation、no-write、bounded response、retention和domain conformance；官方身份也不跳过验证。
5. sandbox/canary只允许approved aggregate cells，限制member/dataset/measure/period/row/cell/byte/TTL并监控definition/schema/classification/revision/rights drift。
6. 当前不实现真实Connector，不安装或执行上述项目。

