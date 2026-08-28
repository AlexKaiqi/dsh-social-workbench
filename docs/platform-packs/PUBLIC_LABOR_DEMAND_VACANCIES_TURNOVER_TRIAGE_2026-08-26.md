# 公共劳动力需求、职位空缺与周转统计候选分流（2026-08-26）

## 1. 结论

下一统计型Channel选择U.S. BLS JOLTS、UK ONS Vacancy Survey、Eurostat Job Vacancy Statistics与Statistics Canada JVWS。它们补足`JobPosting*`不能证明的总体、分母、抽样误差、季调和修订：公开职位是一个平台placement，统计vacancy是来源定义下的paid post estimate；两者不能按标题、公司或数量互相补全。

| 成员 | 独特价值 | 官方接入 | 本轮成熟度 | 主要边界 |
| --- | --- | --- | --- | --- |
| U.S. BLS JOLTS | job openings、hires、quits、layoffs/discharges、other/total separations与rate | Public Data API v2、LABSTAT flat-file catalogue、release/revision tables | exact official machine route + selected manual | month-end stock与whole-month flow分开；series allowlist尚未做response fixture |
| UK ONS Vacancy Survey | headline 3-month moving-average vacancy stock、single-month X06、industry/size与vacancy-rate method transition | versioned VACS01/02/03、X06 XLS/XLSX editions | official workbook route + selected manual | GB sample加权到UK；无region；2026年rate denominator切换 |
| Eurostat JVS | cross-country vacancy/occupied-post/rate、NACE与country quality reports | Statistics API/SDMX 3.0，`jvs_q_r21` | exact official machine route + selected manual | country recording time、population和coverage不完全一致；flash可impute |
| Statistics Canada JVWS | vacancy、payroll employees、rate、offered wage、occupation与recruitment characteristics | WDS/SDMX/full-table CSV，PIDs 14100398/399/400/441/442/443/444 | exact official machine route + selected manual | first-day-or-during-month definition；quarter distinct positions；offered wage非actual pay |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-workbook route-fixture=4 / vacancy-stock fixture=4 / occupied-or-employment-denominator fixture=4 / vacancy-rate fixture=4 / hire-flow fixture=1 / separation-flow fixture=1 / offered-wage fixture=1 / recruitment-characteristic fixture=1 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。

本轮只读取官方网页、methodology、licence、公开repository页面、固定SHA文本与`git ls-remote`；没有请求统计data row、API response、CSV/XLSX/SDMX observation或restricted microdata，没有申请key/account，没有clone、install、build或execute OSS/MCP/Skill，也没有联系respondent/agency、订阅、提交survey或产生平台副作用。

## 2. 第一性原理边界

1. job advert/posting是公开placement；job opening/vacancy是统计定义下的paid position。一个vacancy可能从未公开广告，一个posting也可能表达多个岗位、常年招聘或已不再空缺。
2. establishment、enterprise、business location/local unit、paid post、employee job、payroll employee和person是不同统计unit。
3. vacancy/opening是reference-date stock或source-defined multi-month distinct stock；hire、quit、layoff和separation是window flow。
4. JOLTS月末opening不能与整月hire/separation直接相减得到净需求；hire也不证明某个opening被填补。
5. vacancy level、rate、percentage change和percentage-point change不同；任何rate必须携带exact numerator、denominator、scale与period。
6. `employment + openings`、`occupied + vacant posts`、`employee jobs only`、`filled + unfilled jobs`和`payroll employees + vacancies`不能按“都是工作岗位”互换。
7. seasonally adjusted、not seasonally adjusted、directly adjusted、moving average、calibrated、aligned、modelled和imputed是不同产品状态。
8. monthly point stock、three-month moving average、quarter distinct positions和annual average stock不能按相同period label合并。
9. hires、quits、layoffs/discharges、other separations与total separations由来源定义；它们不是unique persons、churn、满意度、冗员、解雇原因或企业困境。
10. offered wage、minimum/lower-bound offer、salary-to-hour conversion和actual paid wage不同；均不等于total compensation或labour cost。
11. occupation/industry/education/experience/duration/strategy aggregate不证明单个岗位要求或技能短缺。
12. NAICS、SIC、NACE、NOC及其revision不是可按label直接join的统一taxonomy。
13. sample、weighted、calibrated、aligned、administrative、synthetic和aggregate均须保留authority；aggregate不反推respondent。
14. preliminary/flash/current/revised/benchmarked/corrected/reclassified/final/superseded必须形成lineage，不能last-write-wins。
15. standard error、CV、confidence、response、significance、suppression和status marker不同；missing、suppressed、low reliability和not significant不等于zero。

## 3. 官方成员证据

### 3.1 U.S. BLS JOLTS

- [JOLTS Concepts](https://www.bls.gov/opub/hom/jlt/concepts.htm)固定job openings、hires、quits、layoffs/discharges、other separations及employment population；openings是last business day stock，hires/separations是whole-month flow。
- [Calculation](https://www.bls.gov/opub/hom/jlt/calculation.htm)固定nonresponse、imputation、benchmark、alignment、seasonal adjustment、variance与state synthetic limitations；显著性通常按90% confidence分析。
- [Presentation](https://www.bls.gov/opub/hom/jlt/presentation.htm)固定preliminary→next-month final与annual five-year benchmark/reseasonalization lineage，以及stock annual average和flow annual sum/rate的不同算法。
- [Public Data API v2](https://www.bls.gov/developers/api_signature_v2.htm)固定`https://api.bls.gov/publicAPI/v2/timeseries/data/`；注册key扩大quota与可选参数，不改变统计语义。series必须来自official JOLTS/LABSTAT catalogue allowlist，本轮未请求series或observation。
- [API Terms](https://www.bls.gov/developers/termsOfService.htm)要求访问日期、派生分析免责声明、不得虚假表示并允许限流；[BLS copyright](https://www.bls.gov/opub/copyright-information.htm)说明大多数发布材料为public domain但logo/trademark除外。

### 3.2 UK ONS Vacancy Survey

- [Vacancy Survey QMI](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/methodologies/vacancysurveyqmi)固定specified-date outside-recruitment定义、GB sample加权到UK、sector exclusions、IDBR frame、weighting/imputation、CV和revision policy。
- headline series是seasonally adjusted three-month moving average；X06是not seasonally adjusted single-month estimate。它们不是同一观察窗口，也不能用一个替代另一个。
- [VACS02](https://www.ons.gov.uk/employmentandlabourmarket/peoplenotinwork/unemployment/datasets/vacanciesbyindustryvacs02)提供versioned XLS/XLSX edition与supersession。当前没有把generic ONS Dataset API/client声明为VACS02 exact route。
- 2026年7–8月并行发布旧`vacancies per 100 employee jobs`与新`vacancies / (filled + unfilled jobs)`；新分母使用最近四个published quarters rolling average，目标自2026年9月仅保留新法。该cutover必须单独version。
- [ONS terms](https://www.ons.gov.uk/help/terms-conditions)以OGL为主并保留third-party exceptions、no endorsement与current-site authority。

### 3.3 Eurostat Job Vacancy Statistics

- [JVS metadata](https://ec.europa.eu/eurostat/cache/metadata/en/jvs_esms.htm)固定paid post、active external recruitment、intended fill、occupied post、rate公式与country quality；季度记录可能是一个date或三月average，没有国际统一时点。
- 当前[季度NACE Rev. 2.1 dataset `jvs_q_r21`](https://ec.europa.eu/eurostat/databrowser/view/jvs_q_r21/default/table?lang=en)提供vacant/occupied posts与rate；DSD/codelist、NACE revision、country coverage、SA/NSA和status必须在fixture中重验。
- [Statistics API](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api) exact shape为`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{datasetCode}`；SDMX 3.0可取DSD/codelist。API只保留latest observation，因此revision lineage必须由本系统snapshot承担。
- flash EU/EA aggregate可能对missing countries做imputation；country population、public sector、size threshold与reference timing存在差异，harmonised definition不等于identical collection。
- [Eurostat reuse](https://ec.europa.eu/eurostat/help/copyright-notice)要求source/access date、修改说明并检查third-party/country exceptions。

### 3.4 Statistics Canada JVWS

- [JVWS Guide](https://www150.statcan.gc.ca/n1/pub/75-514-g/75-514-g2024001-eng.htm)固定first-day-or-becoming-vacant-during-month、work-during-month、active outside recruitment定义，以及location population、monthly/quarterly设计、quality A–F与confidentiality。
- quarterly vacancy和payroll employment是three-month distinct positions/counts，不是monthly estimates的weighted average；monthly estimate只使用当月约三分之一sample。
- offered wage排除overtime/tips/commission/bonus，range取lower value并可由salary换算hourly；它可能不同于filled-position actual wage。
- [WDS](https://www.statcan.gc.ca/en/developers/wds/user-guide)提供metadata/vector/full-table CSV/SDMX与change routes；核心PIDs包括14100398、14100399、14100400、14100441、14100442、14100443、14100444。PID/table revision、symbol/status/scalar与correction必须保留。
- [Statistics Canada Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)要求exact source/adaptation attribution、no endorsement、no misrepresentation，并禁止以linkage尝试识别person/business/organization。

## 4. 固定版本 OSS、MCP 与 Agent Skill 审计

| 候选 | 身份/许可 | 有价值能力 | 不能证明/风险 |
| --- | --- | --- | --- |
| [cyanheads/bls-labor-mcp-server@`3b727e9`](https://github.com/cyanheads/bls-labor-mcp-server/tree/3b727e9f359721cc7372bb878a2edb3059795a2b) | Apache-2.0，community | BLS survey/series discovery、batch history/latest、LABSTAT index、quota/retry、optional DataCanvas/OTel | broad BLS tool；optional mirror/download/SQL扩大数据面；不固定JOLTS definition/denominator/timing/revision，hosted server不进入信任边界 |
| [kovashikawa/bls_mcp@`32cfc87`](https://github.com/kovashikawa/bls_mcp/tree/32cfc8783bb7bb6abdb018ef3ea1b45c41c64347) | community，license需在晋级前复核 | BLS API-shaped tool/test与mock研究 | README说明使用realistic mock；mock success不证明live route、series authority或JOLTS语义 |
| [ONSdigital/dp-api-clients-go@`12a8416`](https://github.com/ONSdigital/dp-api-clients-go/tree/12a841643d707974cc18d4dad9011d91d1db3bf5) | MIT，ONS official | dataset/filter/codelist/search client与bounded concurrent batches | generic internal/public API clients且含upload/import等更宽能力；不证明VACS02已由Dataset API承载 |
| [eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | EUPL，Eurostat official | TOC/DSD/codelist、filtered SDMX、TSV bulk与cache | generic R client；不会自动执行JVS country coverage、recording-time、flash-imputation或rate comparability gate |
| [cyanheads/eurostat-mcp-server@`7aa545d`](https://github.com/cyanheads/eurostat-mcp-server/tree/7aa545dca0a8848e4aa0e51a4f8265b633600d11) | Apache-2.0，community | catalogue/dimension discovery、JSON-stat decode、bounded pagination、OTel | broad hosted/local MCP；generic query/download/SQL不能替代JVS allowlist与domain review |
| [pbouill/statistics-canada@`419e087`](https://github.com/pbouill/statistics-canada/tree/419e0870fb6dc36b16a522d160be9b3aa63cd24e) | GPL-3.0，community | typed async WDS discovery/metadata/data client | README记录部分POST endpoint 503 posture；generic WDS client不固定JVWS PID、symbols、quarter stock或quality |
| [Aryan-Jhaveri/mcp-statcan@`ff34ecd`](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33) | MIT，community | WDS/SDMX search/download、CLI、hosted/local MCP与optional SQLite | hosted third-party processor、broad 7,000+ table/download/DB surface；提示也承认LLM可能fabricate，不是JVWS semantic authority |

没有发现由BLS JOLTS、ONS Vacancy Survey、Eurostat JVS或Statistics Canada JVWS authority维护、同时固定vacancy definition、stock/flow、statistical unit、denominator、adjustment、quality与revision的domain Agent Skill。官方客户端与community MCP只进入versioned candidate snapshot，不进入active registry。

## 5. 晋级建议

1. 四成员先停在`selected-manual`，冻结program/population/statistical unit、vacancy definition、measure、timing、denominator、adjustment、quality、release与rights。
2. 用手写synthetic fixtures证明posting≠vacancy、stock≠flow、rate denominator不丢失、SA/NSA与rolling window不混、offered≠paid、suppressed≠zero。
3. 分别验证BLS series catalogue/API response、ONS exact edition workbook、Eurostat `jvs_q_r21` DSD/status与StatCan PID metadata/symbol schema；不得跨成员fallback。
4. community MCP必须先通过tool allowlist、network/credential isolation、response schema、retention和no-write/no-hosted-processor gate。
5. operational canary只允许approved aggregate series/table，限制member、measure、period、cell/row、TTL和revision digest；任何schema/definition/rights漂移自动降级。
6. 当前不实现真实Connector，不安装或执行上述项目。
