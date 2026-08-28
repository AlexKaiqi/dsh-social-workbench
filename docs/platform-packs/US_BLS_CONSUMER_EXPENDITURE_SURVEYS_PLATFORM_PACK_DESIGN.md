# U.S. BLS Consumer Expenditure Surveys Platform Pack

## 1. 稳定概念与官方事实

[BLS CE 2024 report](https://www.bls.gov/opub/reports/consumer-expenditures/2024/home.htm)基于Interview与Diary两项调查，并按consumer unit及reference-person characteristics发布名义美元支出。[CE table guide](https://www.bls.gov/cex/tables-getting-started-guide.htm)说明publication tables含all-CU population means、shares、SE/RSE、aggregates和部分percent reporting；CU不严格等同household。

[CE FAQ](https://www.bls.gov/cex/csxfaqs.htm)说明Interview每3个月一次、最多四个季度，适合较大或经常性支出；Diary为连续两个1-week diary，适合频繁小额支出。Integrated table从两项调查选择source；同名item不能自行相加。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/instrument/UCC/stub/method metadata | `fixture` | sponsor/collector、Interview/Diary分开 |
| annual publication tables | `file-fixture` | table type/statistic/instrument/year固定 |
| detailed requested tables | `not-adopted` | request/contact是外部流程 |
| PUMD | `not-adopted` | respondent/consumer-unit microdata |

annual mean与weekly/quarterly percent reporting不可直接相除；先把time basis对齐。all-CU mean不是reporter mean；aggregate不等于PCE/national accounts或market size。gift treatment在2020 midyear后变化，必须产生classification/inclusion break。

## 3. 开源、Skill与验证

[bls_data@`6d13208`](https://github.com/kovashikawa/bls_data/tree/6d1320872dccba3703e44026758714778d3b5c93)是MIT的BLS time-series API/MCP，但CE tables不属于该timeseries route，且多key rotation不符合本系统rate-policy边界；拒绝作为Connector候选。未发现BLS CE programme-owned Agent Skill/MCP。

Synthetic覆盖consumer-unit/household、Interview/Diary/integrated、3-month/two-week/annualised、all-CU/reporter/percent-reporting、mean/share/aggregate、UCC/stub revision、gift change、SE/RSE/high variance与PUMD rejection。当前不下载table或microdata。

## 4. Snapshot与可观测性

Snapshot保存programme、instrument coverage、UCC/stub、table type、source-selection、time basis、weight/variance、gift/inclusion、release/rights和OSS decision。Telemetry逐`year × table × CU population × instrument × category × statistic × time basis × weight`记录retained/dropped、source mismatch、annualisation error、RSE warning、classification/inclusion drift和zero effects。
