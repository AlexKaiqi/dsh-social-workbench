# Public Health-Care Access, Unmet Need & Patient-Reported Barriers Triage — 2026-08-26

## 1. 选择结论

本轮选择“公共医疗服务可及性、未满足需求与患者报告障碍”。药品短缺和临床试验是供给侧信号，支出/时间配置也不能回答人在需要服务时是否因费用、等待、距离、预约或可用性而延迟或放弃。本Channel只形成aggregate access-friction hypothesis，不产生诊断、临床必要性判断、个人脆弱性画像、医疗建议或资格决策。

成员为U.S. NCHS NHIS、England GP Patient Survey（GPPS）、Eurostat EU-SILC health module和Australia ABS Patient Experiences，统一到`PublicHealthCareAccess*`，但service、need/outcome、barrier、question、window、denominator、weight、quality和lifecycle独立。

## 2. 第一性边界

- self-reported need不是临床必要性、诊断或eligibility；care received不是及时、适当、有效或安全；
- delayed、did not receive、did not seek、contact、appointment、attendance和treatment不可互换；
- cost、waiting list、subjectively unacceptable wait、distance/transport、availability、appointment、time/caregiving、fear、wait-and-see和other reason分别建模；main reason不是any reason；
- total population、people needing care、service users、registered patients、eligible question base和valid respondents是不同denominator；
- medical、GP/primary、specialist、dental、prescription、mental-health、hospital、ED、after-hours、pharmacy和telehealth不可合并；
- 12-month、last contact、last appointment和urgent episode不可互换；experience/acceptability不是客观quality、outcome或provider performance；
- preliminary/final、questionnaire/result、2024-series break、sample/mode/geography change、suppression与zero/missing必须保留；
- health condition、disability、poverty、age和ethnicity只保留approved aggregate，不形成individual targeting或consequential input；survey response、care contact和appointment booking都不是Probe。

## 3. 成员与生命周期

| 成员 | 官方发布面 | 当前事实 |
| --- | --- | --- |
| NCHS NHIS | [DQS](https://www.cdc.gov/nchs/nhis/products/data-query-systems.html)、early release、annual docs/PDF/files | 2019–2024 final、2019–2025 preliminary query；2025启用新sample design，preliminary不冒充final |
| GPPS | [2026 results](https://www.gp-patient.co.uk/latest-survey/results)、national/region/ICS/PCN/practice CSV/XLSX | 2026结果于2026-07-09发布；2024为新time series起点；registered patients age 16+ |
| Eurostat EU-SILC | `hlth_silc_08/08b/08c` + Statistics/SDMX API | age 16+、prior 12 months、自报medical/dental need；total-population与needed-population denominator必须按dataset固定 |
| ABS Patient Experiences | [2024–25 release](https://www.abs.gov.au/statistics/health/health-services/patient-experiences/2024-25)、28组XLSX cubes | age 15+ private dwellings；2024–25排除very remote/Indigenous Community Strata；DataLab microdata不采用 |

## 4. OSS / Skill 决策

| 候选 | 固定版本 | 决策 |
| --- | --- | --- |
| [soda-lmu/nhisml](https://github.com/soda-lmu/nhisml/tree/d287cb69450435c8693da6e5b1f4ba8fdba99c60) | `d287cb6` / MIT | public-use microdata下载、ML与subgroup pipeline，越过aggregate-only且非CDC，`rejected-for-route` |
| [nhsengland/GPPS-online-services](https://github.com/nhsengland/GPPS-online-services/tree/ad11afb5a7b32c0fd22c48d70bc83c09e2bef428) | `ad11afb` / MIT | authority-org 2021 respondent-level internal analysis，需IG clearance，`static-method-witness-only` |
| [eurostat/restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | `a0bce06` / EUPL | generic SDMX/TSV transport，不拥有EU-SILC denominator/question semantics，`reference-only` |
| [MattCowgill/readabs](https://github.com/MattCowgill/readabs/tree/b6b0c0da5c989e801d21c55a655f2fca69683965) | `b6b0c0d` / MIT | community spreadsheet/API downloader，不证明Patient Experiences dataflow/schema，`reference-only` |

未发现覆盖本Channel语义的authority-owned Agent Skill/MCP。候选均未clone、install、execute或connect。

## 5. 成熟度

`evidence review → static contract → synthetic conformance → table/schema fixture → approved aggregate-only sandbox live → operational canary → callable → durable`。当前`requested=4 / concept=4 / programme=4 / population=4 / questionnaire=4 / latest-result=4 / official-machine-route=2 / official-file=4 / need=4 / delay-or-nonreceipt=4 / cost=4 / waiting=3 / distance=2 / availability-or-appointment=3 / experience=3 / quality=4 / lifecycle=4 / manual=4 / callable=0 / durable=0`。
