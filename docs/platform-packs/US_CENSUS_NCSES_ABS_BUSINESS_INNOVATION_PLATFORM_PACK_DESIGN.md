# U.S. Census / NSF NCSES ABS Business Innovation Platform Pack

## 1. 定位

ABS Innovation是Census Bureau与NSF NCSES联合programme中的business innovation模块。它使用Oslo Manual 2018概念，按company/firm统计U.S. employer companies；本Pack只建模公开questionnaire、definition、aggregate tables/API metadata、quality与release lineage。

核心能力包括product/business-process innovation、new-to-business/new-to-market、innovation activities、cooperation/partner location、abandoned/ongoing activity、no-activity reasons、barriers、government support、activity cost、turnover share与reported environmental benefit。

## 2. 官方证据与生命周期

- [ABS about](https://www.census.gov/programs-surveys/abs/about.html)与[methodology](https://www.census.gov/programs-surveys/abs/technical-documentation/methodology.html)：joint programme、company/firm basis、population、sampling与module rotation。
- [ABS data](https://www.census.gov/programs-surveys/abs/data.html)：innovation由NCSES发布，Census API与NCSES tables属于不同distribution products。
- [2026 questionnaire](https://www2.census.gov/programs-surveys/abs/information/abs_2026.pdf)：2023–2025 innovation question、activity status、cooperation、barrier、support与environmental benefit；问卷不等于结果。
- [2023 innovation release](https://ncses.nsf.gov/pubs/nsf26306)：data year 2022、activity window 2020–2022、tables/figures与sampling-error说明。
- [ABS 2023 survey page](https://ncses.nsf.gov/surveys/annual-business-survey/2023)：full tables、technical notes、RSE/imputation lineage。
- [ABS APIs](https://www.census.gov/data/developers/data-sets/abs.html)与[API documentation](https://www.census.gov/programs-surveys/abs/technical-documentation/api.html)：module metadata/aggregate route；data query需要key，本轮未调用。
- [API terms](https://www.census.gov/data/developers/about/terms-of-service.html)。

Programme=`active/transitioning`；2026 fielding的ABS/BERD整合与collection-year→reference-year命名变化需要独立revision。2026 questionnaire结果尚未发布，不得由2022结果、历史API或current form拼接。

## 3. 概念边界

| ABS concept | Canonical binding | 拒绝推断 |
| --- | --- | --- |
| product innovation | made-available product | invention、success、sales growth |
| business-process innovation | brought-into-use process | software install、verified improvement |
| innovation activity | R&D/software/equipment/management等 | introduced innovation |
| abandoned/ongoing | activity status | failure reason、future completion |
| cooperation | shared responsibility + partner/location | contract、procurement、information source |
| reasons no activity/barriers | population-specific barrier | cause、pain、lead |
| government programme used | support | application、award、payment、effectiveness |
| most-important innovation sales share | turnover-share representation | incremental revenue/ROI |
| environmental contribution | reported benefit/extent | verified impact/LCA/compliance |

2021 ABS只问product innovation的年份不能补成product-or-process total。company totals与industry/state/company-size tables必须保存denominator、RSE/imputation/rounding和dominant-establishment payroll classification。

## 4. Connector、OSS与Skill

未来capability仅包括programme/questionnaire/table/API-schema discovery、approved small aggregate read、quality/release reconciliation和drift watch；无survey submission、company lookup、microdata、identity或Probe。

[US Census Data API MCP](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a)固定于`5dcaa637871b9ded5dab415118f9008c06d13f2a`，authority-org/CC0，但需要key、Docker/Node/Postgres seed且仅是generic Census API。它不理解NCSES release、Oslo definition、activity status、novelty、question-result和ABS/BERD transition。未install/execute。

未发现权威ABS Innovation Agent Skill；official table、API metadata、fixed OSS、Skill、callable与durable分别记账。

## 5. Snapshot、观测与验证

Snapshot保存programme/transition、population/unit、Oslo/question/status/novelty、table/API group、representation/estimator/quality、release/rights与OSS SHA；不保存key、response、cell/file、identity或microdata。

监控module/question/definition、2023–2025 result standing、collection/reference naming、API group/variables、NCSES table/product、population/classification、RSE/imputation/suppression、rights和zero effects。

Fixture证明current form不生成result、activity不生成innovation、ongoing/abandoned不生成outcome、cooperation不生成contract、barrier不生成lead、historical product-only year不补process、API success不提升domain readiness。

当前`selected-manual`，`callable=0 / durable=0`。
