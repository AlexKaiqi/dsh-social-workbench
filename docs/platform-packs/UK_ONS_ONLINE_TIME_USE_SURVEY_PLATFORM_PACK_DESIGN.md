# UK ONS Online Time Use Survey Platform Pack

## 1. 稳定概念与官方事实

[March 2024 dataset](https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/datasets/timeuseintheuk)发布成年人paid work、unpaid household work、unpaid care、travel与entertainment的average daily time，标记为`official statistics in development`，next release为`to be announced`。[March 2023 methodology](https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/bulletins/timeuseintheuk/march2023)记录OTUS曾以experimental方式运行，并向参与者分配一个weekday和一个weekend diary day；main activity为10-minute period，最多五项secondary activities为5-minute period，但该release estimates仅基于main activity。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| edition/programme/status metadata | `fixture` | 2024公开结果与后续邀请/collection page分开 |
| March 2024 XLSX + adhoc workbooks | `file-fixture` | edition、sheet/table、weekday/weekend与quality note固定 |
| ONS generic dataset API | `not-available-for-domain` | 当前OTUS公开面是页面/XLSX，不冒充API contract |
| respondent diary/microdata | `not-adopted` | aggregate-only |

2023方法不能未经edition evidence自动覆盖2024；每个release独立固定sample、valid-diary threshold、weight、geography和mode。main-only estimate不能拿secondary diary entries补齐；self-perceived productivity表也不是客观productivity telemetry。

## 3. 开源、Skill与验证

[ONS dp-dataset-api@`8ae5bbf`](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6)是authority-org/MIT内部publication lifecycle service，含private/write依赖，不是OTUS public client。未发现programme-owned Skill/MCP；generic spreadsheet parser只能通过本Pack fixture，不能取得authority。候选未安装或执行。

Synthetic覆盖edition lifecycle、development status、weekday/weekend diary、main/secondary role、10/5-minute granularity、adult population、UK/GB geography、valid-diary/response/weight、main-only estimate、self-perceived measure和respondent-data rejection。

## 4. Snapshot与可观测性

Snapshot保存programme/edition/status、workbook/sheet/table、population/geography、diary/mode、classification、representation、weight/quality、release/rights和OSS decision。Telemetry逐`edition × workbook/table × geography/population × weekday/weekend × main/secondary × category × representation × quality`记录retained/dropped、edition/method drift、main-secondary misuse、geography mismatch、development-status change与zero effects。
