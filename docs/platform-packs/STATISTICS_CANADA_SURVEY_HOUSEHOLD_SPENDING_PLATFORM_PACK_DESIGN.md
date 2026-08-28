# Statistics Canada Survey of Household Spending Platform Pack

## 1. 稳定概念与官方事实

[SHS 2023 release](https://www150.statcan.gc.ca/n1/daily-quotidien/250521/dq250521a-eng.htm)发布current-dollar average annual spending；total current consumption与其他disbursements保持不同概念。[2023 user guide](https://www150.statcan.gc.ca/n1/pub/62f0026m/62f0026m2025001-eng.htm)说明questionnaire与diary使用不同weights，官方estimates经annualisation、nonresponse/calibration、imputation、tax adjustment和outlier处理。

公开表为11-10-0222-01至11-10-0227-01，按income quintile、household type、tenure、area size和reference-person age等发布。[2025 questionnaire](https://www23.statcan.gc.ca/imdb/p2sv.pl?Function=getSurvInstrumentList&Id=1552496)有效期到2026-02-10，但它不证明2025 results已经发布。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/questionnaire/diary/user-guide metadata | `fixture` | 2023 result与2025 fielded instrument分开 |
| selected tables via WDS/SDMX | `route-fixture` | PID/code/coordinate/status固定 |
| PUMF/RDC/RTRA | `not-adopted` | household/person microdata |
| survey/diary response | `forbidden` | zero effects |

Canada aggregate在release中只含provinces；territories/territorial capitals coverage须按exact table说明。questionnaire/diary weights不能互用。不同recall windows随monthly collection变化；2010–2016、2017–2023 weighting/geography series存在break。

## 3. 开源、Skill与验证

[mcp-statcan@`ff34ecd`](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33)和[statcanR@`d21b8bf`](https://github.com/warint/statcanR/tree/d21b8bf905f32e4ccb8a7d604e24a2e92c184fef)只作generic WDS/SDMX/static client reference；hosted processor、full download、SQLite与optional LLM search不进入信任边界。未发现SHS programme-owned Skill/MCP，候选均未安装/执行。

Synthetic覆盖household definition、province/territory coverage、questionnaire/diary weights、monthly collection与recall windows、annualisation/tax/imputation/outlier、current consumption/non-consumption、PID/status/CV/suppression、2016→2017 break、2025 questionnaire-only和microdata rejection。

## 4. Snapshot与可观测性

Snapshot保存cycle、questionnaire/diary、table PID/code set、classification/category、population/window、weight/annualisation/imputation/quality、release/rights与OSS decision。Telemetry逐`cycle × instrument × table/PID/coordinate × household population × category/window × representation/weight/status`记录retained/dropped/suppressed、weight/window/PID/correction drift、questionnaire-as-result rejection、microdata quarantine与zero effects。
