# UK ONS Family Spending / Living Costs and Food Survey Platform Pack

## 1. 稳定概念与官方事实

[Family Spending FYE 2025](https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure/bulletins/familyspendingintheuk/april2024tomarch2025)发布UK average weekly household expenditure，按COICOP及income、age、economic status、household composition和region分析；release为2026-06-11，reference period为2024-04至2025-03。[LCF QMI](https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/methodologies/livingcostsandfoodsurveyqmi)把LCF定义为annual cross-sectional household expenditure/income survey。

当前workbooks包含nominal与按category CPI deflated real terms。FYE 2025 sample虽回升仍较小，lower-level categories不确定性较高；2026发布还纠正了FYE 2023/2024部分percentage standard errors，旧文件必须保留supersession lineage。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/QMI/technical/classification metadata | `fixture` | calendar-vs-financial year和method revision固定 |
| five Family Spending XLSX workbooks | `file-fixture` | workbook/table/edition/correction固定 |
| ONS generic API | `not-available-for-domain` | workbook不是dataset API contract |
| secure/research microdata | `not-adopted` | aggregate-only |

nominal、real和share不能互换；real change不自动等于volume。region estimates可能使用multi-year pooling；income equivalisation与expenditure unit分别记录。mortgage interest、net rent、gross housing与COICOP categories不能由标题猜测。

## 3. 开源、Skill与验证

[ONS dp-dataset-api@`8ae5bbf`](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6)是authority-org/MIT内部publication service，依赖private/write lifecycle，不是Family Spending public client。未发现programme-owned Skill/MCP，本Pack不以generic spreadsheet parser冒充official route。

Synthetic覆盖FYE/calendar-year、weekly/annualised、nominal/real、COICOP revision、income/equivalised group、one-year/multi-year geography、sample/RSE/correction、net-rent/mortgage/housing和microdata rejection。

## 4. Snapshot与可观测性

Snapshot保存LCF programme、FYE、workbook/table/edition、COICOP/definition、deflator/reference price、sample/weight/RSE、correction/rights与OSS decision。Telemetry逐`FYE × workbook/table × household population × category × nominal/real × breakdown × quality`记录retained/dropped、edition correction、deflator/category mismatch、small-sample warning与zero effects。
