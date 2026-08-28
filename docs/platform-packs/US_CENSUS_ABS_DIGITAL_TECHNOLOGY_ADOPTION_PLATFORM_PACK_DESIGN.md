# U.S. Census / NSF NCSES ABS Digital Technology Adoption Platform Pack

## 1. 定位

Annual Business Survey（ABS）是Census Bureau与NSF NCSES联合统计项目。它按firm/company而非establishment报告，技术内容属于轮换module。本Pack只建模公开programme、question、technology taxonomy、adoption stage、aggregate table/API metadata和release lineage；不接收survey response，不保存identified business或microdata。

`PublicBusinessDigitalAdoptionUSCensusABSProgram`的稳定价值：

- 历史module区分`not applicable`、`applicable but not tested/used`、`tested but not used in processes`、`used`与`don't know`；
- technology类别包括cloud、AI、special software、robotics/specialized equipment等；
- 当前questionnaire扩展到critical/emerging technologies、AI workforce impact与technical expertise source；
- official API/table提供firm count/share、employee/receipt measures和quality flags的历史aggregate route。

这些能力不能推导installed inventory、verified configuration、successful deployment、identified firm pain、vendor revenue或procurement。

## 2. 官方知识与生命周期

- [About ABS](https://www.census.gov/programs-surveys/abs/about.html)：joint programme、annual frequency、coverage与confidentiality。
- [Methodology](https://www.census.gov/programs-surveys/abs/technical-documentation/methodology.html)：company/firm basis、frame、exclusions、sources、sampling/estimation和module rotation。
- [ABS data](https://www.census.gov/programs-surveys/abs/data.html)：release/table目录。
- [ABS APIs](https://www.census.gov/data/developers/data-sets/abs.html)与[technical API page](https://www.census.gov/programs-surveys/abs/technical-documentation/api.html)。
- [2022 ABS business characteristics variables](https://api.census.gov/data/2022/absmcb/variables.html)：historical machine-schema fixture；technology group如`AB2200MCB05`必须固定group/release。
- [2023 instructions](https://www2.census.gov/programs-surveys/abs/information/ABS-2023-Instructions.pdf)：2020–2022 technology adoption stage定义。
- [2026 instructions](https://www2.census.gov/programs-surveys/abs/information/2026/ABS-2026-Instructions.pdf)：reference-year 2025 questionnaire；问卷问题不是已发布结果。
- [API terms](https://www.census.gov/data/developers/about/terms-of-service.html)：真实data query目前需要API key；本轮不申请、不查询。

Programme standing为`active/transitioning`：2026 fielding起ABS与BERD合并，命名从collection year转向reference year；旧release保留旧命名。`2024 ABS`module列表没有technology不能解释为programme不再研究技术；也不能用2026问卷补成2025 statistical result。

## 3. 概念与能力映射

| Source concept | Canonical binding | 拒绝推断 |
| --- | --- | --- |
| firm/company, domestic establishments | population + firm unit | establishment observation或identified company |
| module/questionnaire/revision | question role + release | annual stable series |
| technology category | taxonomy revision | equivalent vendor/product |
| applicability/test/use/intensity | adoption stage | installed/success/value |
| employer-firm count/percent | business-share/count representation | employee/receipt share |
| employment/receipts measure | employee/turnover representation | adoption count或vendor revenue |
| AI workforce impact/expertise source | impact/source measure | person event、contract或lead |

Connector未来只可声明：programme/question/taxonomy discovery、variables/group schema read、approved small aggregate read、release reconciliation和drift watch。没有submission、company lookup、microdata、identity或Probe capability。

## 4. OSS与Skill

[US Census Data API MCP](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a)固定于`5dcaa637871b9ded5dab415118f9008c06d13f2a`，authority-org、CC0。它是generic Census API MCP，需要API key、Docker、Node与local PostgreSQL seed；没有ABS technology module、stage、taxonomy、collection/reference transition或question-result binding。未install/execute。

未发现Census权威维护、承担上述domain semantics的Agent Skill。因此`official-page`、`official-machine-route`、`fixed-OSS`、`Agent-Skill`、`callable`、`durable`分别为独立事实。

## 5. Snapshot、可观测性与验证

Snapshot保存programme/transition、firm population、module/question/stage/taxonomy、group/variables route、representation/estimator/flags、release/rights、OSS SHA和verification lineage；不保存API key、response、downloaded observation或identity。

关键drift：

- collection-year/reference-year naming、ABS/BERD transition；
- module topic、question wording/routing/options与taxonomy；
- variables/group/table/schema与API key policy；
- firm/establishment、business/employee/receipt representation；
- questionnaire-only/results-published、suppression/RSE/flag；
- licence/attribution与zero effects。

Fixture至少证明：historical stage不collapse；2026 question不产出estimate；2024 no-tech module不删除历史technology；API key absence只把route标为not callable；group/schema成功不提升domain readiness。

晋级顺序固定为evidence → static → synthetic → schema/route fixture → approved sandbox single-group read → canary → user-authorized callable/durable。当前`selected-manual`，`callable=0 / durable=0`。
