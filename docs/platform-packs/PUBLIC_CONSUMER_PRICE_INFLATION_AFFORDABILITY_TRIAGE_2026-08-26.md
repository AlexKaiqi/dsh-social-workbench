# 公共消费价格、通胀与可负担性候选分流（2026-08-26）

## 1. 结论

本轮选择四个官方统计体系。它们共同支持发现价格压力、品类变化、发布摩擦、方法误解和生活成本痛点，但不能被压成一个“价格API”或跨国家庭负担排行榜。

| 成员 | 核心价值 | 当前成熟度 | 主要缺口 |
| --- | --- | --- | --- |
| U.S. BLS CPI | CPI-U/W/C-CPI-U、item/area series、relative/cost weights、selected average prices、quality adjustment与Public Data API | concept + exact API/series/weight/average-price/method fixture | API observation metadata有限；v2需key；average price不是inflation；无公开quote、stock或affordability denominator |
| UK ONS consumer prices | CPIH/CPI/RPI/HCI、versioned multidimensional API、MM23、classification/weights、consumption segments及selected research quote/aggregated microdata | concept + exact API/dataset/version/file/method fixture + quote coverage fixture | 2026 scanner integration改变grain/coverage；Division 1/2不再发布individual quote；research data非accredited statistic |
| Eurostat HICP | harmonised HICP/HICP-CT、ECOICOP、item/country weights、index/rates/contributions、JSON-stat/SDMX/Catalogue API | concept + exact current dataset/API/DSD/weight/rebase/revision fixture | 2026改为ECOICOP v2与2025=100，旧dataset replaced；无quote/average price/stock/affordability capability |
| Statistics Canada CPI | CPI、basket weights、selected average retail prices、PID/cube/vector WDS与full-table CSV/SDMX | concept + exact PID/WDS/method/licence fixture | WDS update window/409与code sets需canary；average price不是pure inflation；无retailer transaction/stock/affordability denominator |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official index route-fixture=4 / weight route-or-method fixture=4 / average-price route-fixture=3 / quote-microdata route-fixture=1 / source availability posture=2 / inventory availability=0 / affordability denominator=0 / selected-manual=4 / callable=0 / durable=0`。

本轮只读取官方网页/API文档、methodology/licence、公开repository页面、`git ls-remote` revision和固定SHA静态文本；没有请求统计data rows或下载bulk/quote/scanner文件，没有注册key/account，没有clone、install、build或execute OSS/MCP/Skill，也没有订阅、联系机构/retailer或产生平台副作用。

## 2. 第一性原理边界

1. observed quote、transaction price、average price、elementary aggregate、basket weight、index point、rate of change、contribution和affordability ratio是不同事实。
2. CPI/HICP测量定义总体和basket下的价格变化，不是普遍price level、literal household budget或individual hardship。
3. price observation period、price/link reference period、weight reference period、index reference/base period和publication period分别保存。
4. rebase/re-reference把某一period设为100，只改变index scale；不证明当期价格突然变化。
5. one-month、12-month/annual、annual-average、moving-average rate和index-point change不能按“inflation”混用。
6. expenditure/relative-importance weight不是quantity、purchase count、demand或household burden。
7. quality adjustment、replacement、item/outlet substitution、imputation、carry-forward、package normalization、seasonal treatment和tax treatment分别保存。
8. missing/imputed/suppressed quote可能来自采集、季节、替换、样本或发布门槛；不证明out-of-stock。只有publisher明确且定义的availability才形成availability evidence。
9. CPI-U/CPI-W/C-CPI-U、CPI/CPIH/RPI/HCI、HICP/HICP-CT和Canadian CPI分别绑定population/method；同名headline不merge。
10. harmonised standard不证明各国basket、weight、source或household experience相同。
11. nominal price必须绑定currency、quantity/package、tax、discount、outlet/channel、geography和period才可解释。
12. affordability至少需要兼容income/earnings/expenditure denominator、household type、geography、period和method；CPI单独不够。
13. published average描述总体估计，不代表任何individual household、store或transaction。
14. preliminary/current/revised/corrected/rebased/backcast/first-published/final值保留lineage，新release不覆盖旧evidence。
15. quote/scanner microdata、outlet identity和provider contracts可能restricted/confidential；公开aggregate不能反推出来源企业。
16. 跨成员比较必须逐项通过population、classification、measure、formula、base、seasonal、period与revision compatibility。

## 3. 官方成员证据

### 3.1 U.S. BLS CPI

[Public Data API v2](https://www.bls.gov/developers/api_signature_v2.htm)以series ID请求time-series observations；[FAQ](https://www.bls.gov/developers/api_faqs.htm)固定v1/v2的registration、query/series/year/rate limits。[API feature notes](https://www.bls.gov/bls/api_features.htm)提醒API主要返回observational values与footnotes，series metadata并不完整，因此`CUUR0000SA0`等ID必须与独立catalog/method snapshot绑定。

[Average Price Data](https://www.bls.gov/cpi/factsheets/average-prices.htm)明确average price估计price level，CPI测量price change；average price还受quality change、sample rotation、imputation和季节影响。[relative importance/weights](https://www.bls.gov/cpi/tables/relative-importance/)说明2023起annual spending-weight update使用两年前消费支出；[quality adjustment](https://www.bls.gov/cpi/quality-adjustment/home.htm)证明相同商品标签也可能需要显式质量处理。

### 3.2 UK ONS consumer prices

[ONS API](https://developer.ons.gov.uk/dataset/)将dataset按edition/version/dimension/option/observation版本化，[observation guide](https://developer.ons.gov.uk/observations/)用`cpih01`展示exact dimension query。MM23、CPI tables、API与microdata files是不同product route。

[technical guidance](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/consumerpricesindicestechnicalguidance)与[weights](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/higherlevelaggregationandweightsinconsumerprices)区分price quote、elementary aggregate、consumption segment和higher-level index。[current quote/segment dataset](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindicescpiandretailpricesindexrpiitemindicesandpricequotes)说明2026年3月起因scanner agreements不再发布Division 1/2 individual quotes，剩余detail为research用途、非accredited official statistic。

### 3.3 Eurostat HICP

[HICP information](https://ec.europa.eu/eurostat/web/hicp/information-data)说明2026 release改用ECOICOP v2和2025=100，旧ECOICOP v1目录归档，并分别发布index、monthly/annual/moving-average rate、contribution、first-published data与annual item/country weights。旧`prc_hicp_midx`已被current `prc_hicp_minr`替代。

[methodology](https://ec.europa.eu/eurostat/web/hicp/methodology)定义chain-linked Laspeyres-type aggregation；[Statistics API](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)返回JSON-stat cube，必须按dimension/category index解码。[API overview](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started)另列SDMX 3.0/2.1与Catalogue API，不能把wire相同当semantic complete。

### 3.4 Statistics Canada CPI

[WDS](https://www.statcan.gc.ca/en/developers/wds)与[User Guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)提供15个metadata/data/change/full-table method，并区分PID、cube、coordinate、vector、reference time和release time；更新窗口可能返回409。[CPI table](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401)、[weight table](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000701)和[average-price table](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810024501)是不同PID/product。

[average-price methodology notes](https://www150.statcan.gc.ca/n1/daily-quotidien/250402/dq250402b-eng.pdf)提醒average prices来自scanner/transaction data，product rotation、quality/quantity和preferences会影响时间比较；纯price change应使用CPI。Open Licence允许复用，但明确禁止以识别个人、企业或组织为目的的数据linkage。

## 4. 固定版本OSS、MCP与Skill审计

以下候选均未clone、install、build或execute：

| 候选 | 固定revision / license | 可借鉴 | 不可晋级原因 |
| --- | --- | --- | --- |
| [kovashikawa/bls_data@`6d13208`](https://github.com/kovashikawa/bls_data/tree/6d1320872dccba3703e44026758714778d3b5c93) | MIT，community | BLS v2 client、chunk/retry、series resolver、MCP tool拆分和ambiguity candidate | 内置key rotation有规避rate policy风险；catalog/alias和fine-tuned model不具authority；仅少量CPI概念，无weight/base/revision/average-price语义 |
| [larasrinath/bls_mcp@`96274b7`](https://github.com/larasrinath/bls_mcp/tree/96274b7f5658ee150d0bc4df074774fe05564e54) | MIT，3 commits，community | 6个read tools与`skills/bls-query/SKILL.md`/series catalog | Skill建议在API calculation不可用时自行算percent change，却未固定change window/base/revision；headline mapping过窄，无测试成熟度/average/weight语义，不能采用为权威Skill |
| [ONSdigital/dp-api-clients-go@`12a8416`](https://github.com/ONSdigital/dp-api-clients-go/tree/12a841643d707974cc18d4dad9011d91d1db3bf5) | MIT，ONS official | dataset/dimension/filter/download/search/releasecalendar client、health与bounded batch pattern | ONS内部通用API client，不是consumer-price adapter；不固定CPIH/CPI/RPI、quote coverage、classification、method或rights |
| [eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | EUPL，Eurostat org | SDMX DSD/codelist/search/filter、TSV/bulk、cache与large-table策略 | R client会网络下载/缓存；通用Eurostat层不拥有HICP dataset replacement、ECOICOP v2、rebase、status或affordability semantics |
| [rOpenGov/eurostat@`c3d556b`](https://github.com/rOpenGov/eurostat/tree/c3d556bbbc6121f75ab895329da38968907c2993) | BSD-2-Clause，community | Statistics API/JSON-stat、search、cache、label与error handling | 明确非Eurostat endorsed；依赖较多且会下载；不能替代official DSD/method/revision fixture |
| [warint/statcanR@`d21b8bf`](https://github.com/warint/statcanR/tree/d21b8bf905f32e4ccb8a7d604e24a2e92c184fef) | MIT，community | WDS table discovery、PID/full-table download、language与ranked ambiguity explanation | 下载完整table且optional LLM search不是authority；不固定coordinate/vector/status、CPI/weight/average semantics、privacy或revision |
| [pbouill/statistics-canada@`419e087`](https://github.com/pbouill/statistics-canada/tree/419e0870fb6dc36b16a522d160be9b3aa63cd24e) | GPL-3.0，community | typed async WDS client、metadata models、rate/retry pattern | README声称的endpoint数量和POST 503状态需独立验证；geo/census focus、自动生成enum和live tests不证明CPI语义或稳定性 |
| [SkillMedev/live-data government-open-data@`5e82454`](https://github.com/SkillMedev/live-data/tree/5e8245435c2b69821ed7e09545385ed75f3bb8de/skills/government-open-data) | MIT，community Skill | indicator/dataset code先解析、null和JSON-stat dimension提醒 | 默认World Bank且只给generic Eurostat recipe；没有HICP classification/rebase/weight/revision，不能用于BLS/ONS/StatsCan或生活成本结论 |

没有发现由BLS、ONS、Eurostat HICP team或Statistics Canada维护、能同时固定program population、classification、quote/average/index/weight、period、revision、availability和affordability denominator的domain Agent Skill。检索结果中的BLS Skill与government-open-data Skill只能进入candidate snapshot，不进入active skill registry。

## 5. 晋级建议

1. 四成员先停在`selected-manual`；冻结program/population、product identity、classification/method、measure、period、release/revision与rights。
2. 先用手写synthetic fixture证明quote、average、weight、index、change、availability与affordability全部拒绝误合并。
3. 另行授权后先做catalog/metadata-only canary，再做一个series/PID/dataset、一个短period的read；不得默认full-history/bulk/quote下载。
4. BLS重点验证series metadata/API lag/rate；ONS验证version与2026 quote coverage；Eurostat验证`prc_hicp_minr`、ECOICOP v2和flags；StatsCan验证PID/code set/409/update/correction。
5. 只有compatible denominator另行route-fixed并通过population/time/unit对账后，才允许affordability materialized view。
6. 当前不实现任何真实Connector，不安装或执行上述项目。
