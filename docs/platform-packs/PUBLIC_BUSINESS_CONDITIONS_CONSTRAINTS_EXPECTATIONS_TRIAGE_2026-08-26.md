# 公共企业经营状况、约束与预期候选分流（2026-08-26）

## 1. 结论

下一Channel选择U.S. Census BTOS、UK ONS BICS、European Commission Business and Consumer Surveys中的business surveys与Statistics Canada CSBC。现有Business Demography、Insolvency与Business Credit Channels分别描述企业population lifecycle、formal distress和lender-reported financing conditions，却缺少企业直接报告的经营活动、成本、需求、供应链、人员约束、韧性与行动预期。

本Channel仍是aggregate survey evidence，不是identified business lead、audited performance、transaction、order、vacancy、investment、loan、forecast或因果证据。

| 成员 | 独特价值 | 官方接入 | 本轮成熟度 | 主要边界 |
| --- | --- | --- | --- | --- |
| U.S. Census BTOS | biweekly recent condition + six-month outlook | dedicated BTOS API + XLSX | exact API route + bulk | panel cadence、2023 population break、index vs response share |
| UK ONS BICS | fast changing questions、per-question weights、CI | versioned wave XLSX | workbook route + manual questionnaire | wave/question drift、national/regional/single-site、weight kind |
| EU Commission BCS | harmonised sector balances、composites、capacity/investment | Redisstat SDMX + ZIP/XLSX | SDMX route family + bulk | partner method、balance/composite、question cadence、transition |
| Statistics Canada CSBC | explicit obstacles、expectations、liquidity/actions | WDS PID tables + questionnaire | exact WDS route + programme ending | quarterly/PID drift、2020 break、corrections、final cycle |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / current-activity fixture=4 / demand-or-order fixture=2 / price-cost fixture=4 / workforce fixture=4 / supply-chain-or-input-constraint fixture=4 / explicit-obstacle fixture=4 / resilience-or-liquidity fixture=2 / confidence-or-uncertainty fixture=4 / capacity-utilisation fixture=1 / investment-intention fixture=1 / expectation fixture=4 / planned-action fixture=2 / response-quality fixture=4 / programme-lifecycle fixture=4 / selected-manual=4 / callable=0 / durable=0`。

本轮只读official pages、methodology、questionnaire索引、terms、static route contracts、fixed-SHA source text与`git ls-remote`；未请求observation/API/CSV/SDMX/XLSX/PDF data file、key/account、MCP/Skill执行或survey response，也未产生平台副作用。

## 2. 第一性原理边界

1. 目标是发现企业自己报告的constraint和expectation，不是寻找看起来像“商业景气”的统一指数。
2. survey respondent view、published weighted estimate、publisher composite、administrative outturn和audited company fact是五种不同事实。
3. employer business、enterprise、establishment、reporting unit、local unit、manager response和aggregate series不是同一unit。
4. sample invitation、respondent、response、weighted response、estimate、index和release不是同一record。
5. operating status、performance、revenue/turnover/sales、demand/orders、employment、hours、price、inventory与resilience不能互换。
6. reported obstacle只证明response category被选；不自动证明最严重、持续、造成损失、阻止增长或因果成立。
7. selected obstacle、most challenging obstacle、expected impact、expected duration和planned response有不同question及denominator。
8. recent past、current assessment、next month/quarter、next six months、next 12 months和planned action是不同time role。
9. expectation不是realised outturn、publisher forecast、commitment、budget或approved plan；事后比较必须有exact relation。
10. respondent plan不是实际investment、procurement、hire、price change、credit application或完成行动。
11. response percentage、unweighted share、balance、diffusion index、quantitative estimate、qualitative band和composite index不共用scale。
12. positive value没有全局方向：可能表示increase、improvement、optimism、higher costs、stronger constraint或composite improvement。
13. count/design/nonresponse/calibrated/turnover/employment/enterprise-size/country/sector weights不可互换。
14. national weighted、regional unweighted、single-site、country aggregate与EU/euro-area aggregate必须分区。
15. core、rotating、supplemental、ad-hoc、monthly、quarterly、biannual、annual和suspended question必须保留role。
16. same label跨question wording、routing、response options或reference-period change不能自动join。
17. SA、NSA、imputed、back-cast、corrected、experimental、official-statistics-in-development与suppressed是不同standing。
18. null、NA、don't know、not applicable、not asked、suppressed和too unreliable都不等于zero/no change。
19. programme ending、final collection、final release、archive与API/table availability是不同lifecycle facts。
20. harmonisation不证明national partner sample/mode完全相同，也不证明跨国rank或common denominator。
21. official page、machine route、fixed OSS、Agent Skill、callable connector与durable licensed storage是独立结论。
22. aggregate pressure可以生成市场研究hypothesis，不能生成identified lead、company score或定向外联。

## 3. 官方成员证据

### 3.1 U.S. Census BTOS

- [About](https://www.census.gov/hfp/btos/about)和[Methodology V6](https://www.census.gov/hfp/btos/downloads/methodology/Business_Trends_and_Outlook_Survey_Methodology_V6.pdf)固定target population、six panels、biweekly collection、12-week respondent recurrence、previous-two-week与six-month outlook。
- [current data](https://www.census.gov/hfp/btos/data)固定current/future indexes和statistical-significance display；[downloads](https://www.census.gov/hfp/btos/data_downloads)固定XLSX、questionnaire、supplement和historical access。
- [BTOS API reference](https://www.census.gov/hfp/btos/downloads/BTOS%20API%20Reference%20Documentation.pdf)固定period/question/answer/strata route与API coverage gap。
- [Census API terms](https://www.census.gov/data/developers/about/terms-of-service.html)固定public API use和anti-identification boundary。

### 3.2 UK ONS BICS

- [BICS QMI](https://www.ons.gov.uk/economy/economicoutputandproductivity/output/methodologies/businessinsightsandconditionssurveybicsqmi)固定voluntary/twice-monthly、sample/population、question revision、per-question weighting、CI、national/regional/single-site与method breaks。
- [dataset](https://www.ons.gov.uk/economy/economicoutputandproductivity/output/datasets/businessinsightsandimpactontheukeconomy)固定wave XLSX和previous versions；当前无BICS-specific developer API证据。
- [ONS terms](https://www.ons.gov.uk/help/terms-conditions)固定OGL default、exemptions与third-party handling。

### 3.3 European Commission BCS

- [methodological concepts](https://economy-finance.ec.europa.eu/economic-forecast-and-surveys/business-and-consumer-surveys/methodology-business-and-consumer-surveys/methodological-concepts_en)固定sector surveys、partner institutes、balance formula、country/EU aggregation、question cadence和composites。
- [time-series distribution](https://economy-finance.ec.europa.eu/economic-forecast-and-surveys/business-and-consumer-surveys/download-business-and-consumer-survey-data/time-series_en)固定Redisstat testing、API/SDMX-CSV与Excel/ZIP parallel transition、SA/NSA/backcast/suspended archives。
- [March 2026 user guide](https://economy-finance.ec.europa.eu/document/download/426aefda-4888-42e7-ac02-1ac85f979b3d_en?filename=bcs_user_guide_Mar_26.pdf)固定harmonised question and indicator definitions。
- [Commission legal notice](https://commission.europa.eu/legal-notice_en)固定CC BY 4.0 default、attribution/change indication与exceptions。

### 3.4 Statistics Canada CSBC

- [survey page](https://www.statcan.gc.ca/en/survey/business/5318)固定Q3 2026 collection、voluntary/confidential、business conditions/expectations/liquidity/debt topics。
- [Q3 questionnaire](https://www.statcan.gc.ca/en/statistical-programs/instrument/5318_Q1_V26)固定obstacle、trade/action、liquidity/debt和future outlook routing；questionnaire不能冒充released estimates。
- [Q2 release](https://www150.statcan.gc.ca/n1/daily-quotidien/260527/dq260527a-eng.htm)固定employer-business population、quarterly/calibrated result与final-cycle notice；[release schedule](https://www150.statcan.gc.ca/n1/dai-quo/cal2-eng.htm)将Q3 release列为2026-08-31，当前尚未发生。
- [WDS guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)固定PID/cube/vector/full CSV/SDMX routes；[Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)固定attribution、no endorsement和anti-reidentification。

## 4. 固定版本 OSS、MCP 与 Agent Skill 审计

| 候选 | 身份/许可 | 有价值能力 | 不能证明/风险 |
| --- | --- | --- | --- |
| [uscensusbureau/us-census-bureau-data-api-mcp@`5dcaa63`](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a) | Census Bureau组织，CC0-1.0 | Census Data API dataset/geography/aggregate discovery | 面向`api.census.gov`而非BTOS `/hfp` API；需key、Docker/Postgres seed；无BTOS domain semantics |
| [ONSdigital/dp-dataset-api@`8ae5bbf`](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6) | ONSdigital，MIT | dataset/edition/version publication service implementation | 不是BICS public client/Skill；含private/import/write lifecycle；无BICS mapping |
| [Baffelan/sdmx-mcp-gateway@`7a385c0`](https://github.com/Baffelan/sdmx-mcp-gateway/tree/7a385c0bcb2b85b8e592c9c03a05370244c7721f) | community；README称MIT但SHA无LICENSE文件 | progressive SDMX metadata discovery、bounded queries | endpoints不含ECFIN Redisstat；hosted/`npx -y`不可采用；license evidence conflict |
| [pbouill/statistics-canada@`419e087`](https://github.com/pbouill/statistics-canada/tree/419e0870fb6dc36b16a522d160be9b3aa63cd24e) | community，GPL-3.0 | generic WDS cube/metadata/download client | README称部分POST routes 503；无CSBC question/quality/program lifecycle |
| [sdmx-twg/sdmx-rest@`46bba52`](https://github.com/sdmx-twg/sdmx-rest/tree/46bba52cb8a8a21704019f949987ee21adefdd5e) | SDMX TWG normative repo；LICENSE未声明 | SDMX REST/OpenAPI semantics | protocol reference不是client/Skill；不含任一survey domain mapping |

未发现四成员authority维护、同时固定programme/population/question/response scale/time role/weighting/estimate/quality/revision/lifecycle的Business Conditions Agent Skill。所有候选只进入versioned knowledge snapshot，不进入runtime或callable registry。

## 5. 晋级建议

1. 四成员先冻结programme standing、population/unit、question/revision、scale、measure、time、weight、estimate、quality、route与rights。
2. synthetic fixtures先证明respondent report不等于outturn，expectation/plan不等于forecast/commitment，share/balance/composite不互换。
3. 分别验证BTOS route envelope、BICS workbook/wave、BCS Redisstat DSD/key和CSBC PID/correction/lifecycle metadata；禁止cross-member fallback。
4. generic MCP/client必须通过fixed version、license、tool allowlist、no-install/no-write、bounded network、schema preservation与domain conformance；能返回数值不升级成熟度。
5. sandbox/canary只允许approved aggregate metadata/cells，并限制member/question/period/cell/byte/TTL，监控question/weight/schema/quality/licence/program lifecycle drift。
6. 当前不实现真实Connector、不安装或执行候选、不读取observations。
