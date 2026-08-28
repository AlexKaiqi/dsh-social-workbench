# US EPA ECHO / ICIS-NPDES Platform Pack 设计

状态：`concept-fixture + exact official route fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`us-epa-echo-icis-npdes/v0-design`

## 1. 稳定概念与官方证据

[ECHO Web Services](https://echo.epa.gov/tools/web-services)是公开只读查询服务；批量应走[Data Downloads](https://echo.epa.gov/tools/data-downloads)，不能机器人抓ECHO UI。[ICIS-NPDES DMR与Limit数据](https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set)来自ICIS-NPDES system of record，许可条件/限值、permittee-reported measurement与是否超限必须保留共同revision。[ICIS-NPDES Download Summary](https://echo.epa.gov/tools/data-downloads/icis-npdes-download-summary)还区分系统生成的non-receipt/exceedance violation与人工录入single-event violation。

## 2. 概念映射

| Native | `PublicEnvironmentalRegulation*` |
| --- | --- |
| FRS Registry ID / permit ID / monitoring location or outfall | facility、permit、outfall/point独立identity；只用source-declared relation |
| permit limit / DMR requirement | condition/limit与monitoring requirement；固定parameter/unit/statistic/period |
| DMR actual value | licensee-reported measurement；不假装regulator observation |
| exceedance indicator / E90 | source-reported comparison或system-generated violation，不能直接当authority finding |
| D80/D90 non-receipt | late/nonreceipt qualifier与system violation；不是零排放 |
| inspection / single-event violation / enforcement | assessment、authority finding与enforcement分链 |

## 3. 期望只读能力与边界

`definition.read`、`service/schema.read`、`bulk-resource.metadata.read`和`selected-public-record.metadata.read`只作为fixture capability。未来canary必须固定exact ECHO service或ICIS-NPDES file、program/population、query columns、pagination/download watermark、schema、known-data-alert revision和field allowlist；大批量禁止回退到UI。

[About the Data](https://echo.epa.gov/resources/echo-data/about-the-data)说明小设施与州级数据可滞后或不完整；[Known Data Problems](https://echo.epa.gov/resources/echo-data/known-data-problems)触发对应jurisdiction/period quarantine。任何application/report/complaint/contact/subscribe或write拒绝。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖permit revision→multiple limits、same pollutant but incompatible unit/statistic/period、below-detection、no-discharge、late/nonreceipt、corrected DMR、permittee-reported exceedance、system E90、manual single-event violation、inspection→finding→enforcement、known-data alert false-missing quarantine和FRS/permit/outfall identity separation。

Telemetry逐`service/file × program × schema/known-alert revision × permit/outfall/parameter × measurement-kind/method/unit/statistic/period × derivation/reporting-basis/qualifier × comparison/compliance authority × coverage`记录returned/retained/dropped/quarantined、nonreceipt、incompatibility、correction、orphan relation、fallback rejection和zero effects。本轮没有请求任何数据行。
