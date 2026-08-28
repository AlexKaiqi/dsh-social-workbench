# Statistics Canada Time Use Survey Platform Pack

## 1. 稳定概念与官方事实

[survey record 4503](https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&SDDS=4503)把2022 Time Use Survey定义为active、每5年一次，目标population为十省内15岁以上、非institutional且不住在First Nations reserves的人；collection从2022-07-16至2023-07-15，aggregate于2024-06-05发布。[quality-of-life source page](https://www160.statcan.gc.ca/society-societe/time-use-emploi-temp-eng.htm)列出`45-10-0104-01`日均活动时间、`0104-02`unpaid domestic/care和`0104-03`transport/mode tables；[PUMF catalogue](https://www150.statcan.gc.ca/n1/en/catalogue/45250001)记录2022 PUMF于2025-03-12发布。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/population/questionnaire/variables/method | `fixture` | GSS→GSSP名称、2022 design和administrative income linkage固定 |
| `45-10-0104-*` aggregate cubes | `wds-or-table-fixture` | PID/vector/coordinate/dimension/status/release固定 |
| 2022 PUMF | `not-adopted` | respondent/diary microdata在高风险门外 |

daily minutes、proportion of day、participation time/rate、primary/simultaneous activities、location/social contact、time pressure和satisfaction分别建模。self-reported stress/satisfaction不由duration推导；income linkage也不能形成个人affordability或consequential score。

## 3. 开源、Skill与验证

[mcp-statcan@`ff34ecd`](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33)是community/MIT generic WDS/SDMX MCP；hosted processor、全库搜索/download/SQLite和LLM ambiguity不进入信任边界。[statcanR@`d21b8bf`](https://github.com/warint/statcanR/tree/d21b8bf905f32e4ccb8a7d604e24a2e92c184fef)是community/MIT generic client，也不拥有TUS activity/diary/denominator语义。未发现programme-owned Skill/MCP；均未安装、连接或执行。

Synthetic覆盖age/geography exclusions、collection-vs-reference time、primary/simultaneous、duration/share/rate、activity/location/social contact、care/travel mode、time pressure/satisfaction、weight/imputation/status、PID revision、GSS/GSSP lineage和PUMF rejection。

## 4. Snapshot与可观测性

Snapshot保存programme/design/population、questionnaire/variable、PID/table/vector/coordinate、activity/context、measure/denominator、weight/imputation/quality、release/rights和OSS decision。Telemetry逐`survey year × PID/coordinate × population × activity-role/category × measure/representation × time × weight × status`记录retained/dropped、dimension/PID drift、duration-rate conflict、GSS/GSSP naming drift、collection-result/PUMF lifecycle与zero effects。
