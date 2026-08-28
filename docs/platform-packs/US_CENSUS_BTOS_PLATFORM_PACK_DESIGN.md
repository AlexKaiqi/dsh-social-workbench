# U.S. Census Business Trends and Outlook Survey Platform Pack

## 1. 稳定概念

本成员描述U.S. Census Bureau Business Trends and Outlook Survey（BTOS）的公开aggregate estimates，不描述identified establishment、respondent、customer、order、transaction或audited company result。

- 2023-09起population为美国、华盛顿特区和Puerto Rico的nonfarm employer businesses，包含single/multi-location，但仍有明确sector exclusions；早期single-location population不能静默拼接。
- 约120万businesses分成六个panel，每两周调查一个约20万panel；同一business通常每12周收到一次，不能把release cadence当respondent cadence。
- core question与AI、WFH等supplement有独立questionnaire/revision/coverage；supplement不能回填core历史。
- previous-two-week assessment与next-six-month outlook是不同time role；future index不是official forecast或business commitment。
- response percentage、current/future index、statistical-significance arrow与raw answer category不是同一representation。
- revenue、demand、employment、hours、input price、performance与operating status不能压成单一“景气”。

官方入口：[programme](https://www.census.gov/programs-surveys/btos.html)、[About](https://www.census.gov/hfp/btos/about)、[current data](https://www.census.gov/hfp/btos/data)、[downloads](https://www.census.gov/hfp/btos/data_downloads)、[Methodology V6](https://www.census.gov/hfp/btos/downloads/methodology/Business_Trends_and_Outlook_Survey_Methodology_V6.pdf)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| current/recent activity | dashboard、XLSX、BTOS API | concept + route fixture |
| six-month outlook | dashboard、XLSX、BTOS API | expectation fixture |
| sector/state/MSA/size breakdown | XLSX；部分API | population/coverage fixture |
| question/answer metadata | BTOS API question routes、questionnaire | definition fixture |
| supplement/state×sector/URR | XLSX；API不完整 | official bulk fixture；不得API fallback |
| microdata | FSRDC approved research only | unsupported by default |

[BTOS API reference](https://www.census.gov/hfp/btos/downloads/BTOS%20API%20Reference%20Documentation.pdf)固定`/hfp/btos/api/periods`、`questions`、`questions/answers`、period data与strata routes；每个period是独立dataset，time series需要显式join，且supplement、URR、state×sector等并非都在API。suppressed XLSX cell在API可能是null/NA，不能转成zero。真实route读取不在本轮执行。

## 3. Agent、MCP 与固定开源候选

- [uscensusbureau/us-census-bureau-data-api-mcp@`5dcaa63`](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a)由Census Bureau组织维护，CC0-1.0，提供Census Data API dataset/geography/aggregate discovery；它面向`api.census.gov`并要求key、Docker/Postgres seed，未声明BTOS `/hfp/btos/api`、question revision或index semantics，不能作为BTOS exact adapter。
- [sdmx-twg/sdmx-rest@`46bba52`](https://github.com/sdmx-twg/sdmx-rest/tree/46bba52cb8a8a21704019f949987ee21adefdd5e)是SDMX规范参考且当前仓库未声明LICENSE；BTOS不是由该规范自动获得domain semantics。
- 未发现authority维护、固定BTOS population break、panel cadence、question/supplement、index construction和suppression语义的Agent Skill。

本轮仅阅读official pages/PDF索引与固定SHA源码文本；未下载BTOS observations/XLSX、未请求API key、未安装/执行MCP或初始化数据库。

## 4. 权利、隐私与安全

- [Census API terms](https://www.census.gov/data/developers/about/terms-of-service.html)允许search/display/analyse/retrieve public API information，同时禁止识别survey respondent；citation与website policies必须随snapshot保存。
- respondent identity、business/contact/address、microdata、open text和可重识别细分全部pre-gate drop。
- aggregate estimate不得生成company lead、经营评分、信用建议或确定性预测。
- survey response、API key registration、subscription/contact、FSRDC application和数据下载均不是本Channel Probe。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / exact official API-route fixture / official-bulk fixture / selected-manual`；`sandbox-live=0 / callable=0 / durable=0`。

下一门槛是用手写period/question/answer/strata envelopes验证population break、panel/release cadence、current/future role、index/share、suppression与API coverage gap；真实single-period metadata read须另行授权。
