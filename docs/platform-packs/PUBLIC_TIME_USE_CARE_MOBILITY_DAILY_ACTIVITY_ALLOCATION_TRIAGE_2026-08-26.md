# Public Time Use, Care, Mobility & Daily Activity Allocation Triage — 2026-08-26

## 1. 选择结论

本轮选择“公共时间使用、照护、流动与日常活动配置”。家庭支出只能说明钱花在哪里，不能说明工作、家务、照护、通勤、学习、休息和社交如何争夺同一份时间预算。该Channel只用于形成aggregate friction hypothesis；时间投入本身不证明痛苦、偏好、生产率、服务质量、可替代需求或个人生活方式。

入选成员：

1. U.S. Bureau of Labor Statistics American Time Use Survey（ATUS）；
2. UK Office for National Statistics Online Time Use Survey（OTUS）；
3. Eurostat Harmonised European Time Use Surveys（HETUS）；
4. Statistics Canada Time Use Survey（TUS，General Social Statistics Program）。

四者统一到`PublicTimeUse*`，但programme、population、diary day、episode/slot、primary/secondary role、activity classification、population/participant denominator、weekday/weekend、weight、quality、release和rights保持独立。

## 2. 第一性边界

- diary day不是usual day/week/year；一个零值只表示该日未报告该活动；
- person、respondent、household member、diary day、episode、slot和aggregate series不可互换；
- primary、secondary/simultaneous、secondary childcare和supervisory care分别建模；ATUS一般不采集同时活动，但另有secondary childcare追问；
- duration不是effort、intensity、burden、productivity、preference、satisfaction、outcome或unmet need；
- population mean、participant mean、participation rate、episode count、share of day和time-of-day profile不可互换；
- paid work time不是contract hours、employment status或output；unpaid work/care不是服务购买意愿；
- travel duration不是trip count、distance、delay、reliability、accessibility或commute quality；
- sleep/rest time不是sleep quality或health status；media/screen time不是app telemetry、attention或engagement；
- “free time”依赖publisher classification，不代表真正无约束的可用时间；
- location、with-whom和for-whom是source-defined context，不是精确位置、关系质量或自然人身份；
- 10-minute slot、开放episode、telephone recall、online diary和paper diary存在mode/precision差异；
- weekday/weekend allocation、season、collection wave与COVID-era context必须保留；
- HETUS harmonisation不消除各国sampling、timing、mode、sample size和classification差异；
- demographic breakdown只允许approved aggregate，不形成个人schedule/profile或Probe audience；
- official survey participation、diary submission、microdata申请/下载都不是本系统Probe。

## 3. 成员增量与生命周期

| 成员 | 独特增量 | 官方发布面 | 当前事实 |
| --- | --- | --- | --- |
| BLS ATUS | 单次24小时recall diary、episode start/stop、activity/location/with-whom、annual estimates | [2025 microdata/docs](https://www.bls.gov/tus/data/datafiles-2025.htm)、[tables/database](https://www.bls.gov/tus/data.htm)、BLS Public Data API `TU` | 2003–2025连续资料；2025 results于2026-06-25发布 |
| ONS OTUS | weekday+weekend online diaries、main/secondary activity设计、COVID后时间配置 | [March 2024 dataset](https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/datasets/timeuseintheuk)、XLSX/adhoc tables | March 2024为最新公开edition，`official statistics in development`，next release未宣布；后续采集页不等于已发布结果 |
| Eurostat HETUS | 跨国ACL harmonisation、weekday/weekend diary、10-minute slots、22个HETUS 2020 aggregate tables | Eurobase `tus_00`/`tus_20`、Statistics/SDMX API、restricted scientific-use files | HETUS 2020 round仍在完成中；collection预计2026结束，该轮microdata预计不早于2027 |
| Statistics Canada TUS | 2022 diary、primary/simultaneous activity、location/social context、time pressure/satisfaction | tables `45-10-0104-*`、WDS/SDMX、2022 PUMF | programme active、每5年；2022 collection为2022-07至2023-07，aggregate于2024-06发布，PUMF于2025-03发布 |

## 4. Agent Skill、MCP、SDK与OSS

| 候选 | 固定版本 | 决策 |
| --- | --- | --- |
| [kovashikawa/bls_data](https://github.com/kovashikawa/bls_data/tree/6d1320872dccba3703e44026758714778d3b5c93) | `6d1320872dccba3703e44026758714778d3b5c93` / MIT | BLS v2/MCP transport reference；只覆盖已发布series，内置key rotation不符合rate policy，`fixture-reference-only` |
| [sbirch/TUSK](https://github.com/sbirch/TUSK/tree/957ecb36c4409f0ba7ca55553f5f66b769860a3b) | `957ecb36c4409f0ba7ca55553f5f66b769860a3b` / MIT | 2003–2012 SQLite/lexicon/dictionary工具；README承认PDF自动抽取可能出错，且涉及microdata，`static-counterexample-only` |
| [ONSdigital/dp-dataset-api](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6) | `8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6` / MIT | authority-org内部publication lifecycle service，不是OTUS public client，`reference-only` |
| [eurostat/restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | `a0bce063c60aef1033ea696d91d26e1158c2c4b0` / EUPL | authority-org API/bulk client，README含`tus_00age`例子；不拥有HETUS comparability gates，`reference-only` |
| [eurostat/statistics-coded](https://github.com/eurostat/statistics-coded/tree/ca58d8cad5a33ed5a6e5c97dd0cb1cfb29fbede3) | `ca58d8cad5a33ed5a6e5c97dd0cb1cfb29fbede3` / license未确认 | authority-org reproduction scripts，`static-method-witness-only` |
| [Aryan-Jhaveri/mcp-statcan](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33) | `ff34ecd7462000ac4e23b7b2f1076d93e22b3f33` / MIT | generic WDS/SDMX/MCP；hosted processor、download、SQLite与LLM ambiguity越界，`fixture-reference-only` |
| [warint/statcanR](https://github.com/warint/statcanR/tree/d21b8bf905f32e4ccb8a7d604e24a2e92c184fef) | `d21b8bf905f32e4ccb8a7d604e24a2e92c184fef` / MIT | generic table discovery/full download，不拥有TUS diary semantics，`reference-only` |

未发现由四个programme authority维护并固定本Channel全部语义的Agent Skill或MCP。本轮未clone、install、execute、connect或调用任何候选。

## 5. 晋级与成熟度

`evidence review → static contract → synthetic conformance → table/schema fixture → approved aggregate-only sandbox live → operational canary → callable → durable`。微数据、respondent diary、precise schedule、rare cell和身份始终位于独立高风险门外。

当前：`requested=4 / concept-fixture=4 / programme-fixture=4 / population-fixture=4 / diary-instrument-fixture=4 / classification-fixture=4 / latest-result-fixture=4 / exact-official-machine-route-fixture=3 / official-file-route-fixture=4 / primary-activity=4 / secondary-or-simultaneous=3 / secondary-childcare=2 / population-mean=4 / participant-mean=3 / participation-rate=4 / time-of-day=3 / estimate-quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0`。
