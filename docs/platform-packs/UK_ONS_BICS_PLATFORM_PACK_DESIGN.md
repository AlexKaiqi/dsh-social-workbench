# UK ONS Business Insights and Conditions Survey Platform Pack

## 1. 稳定概念

本成员描述Office for National Statistics Business Insights and Conditions Survey（BICS）的公开aggregate estimates，不描述identified reporting unit、local site、employee、transaction或audited business account。

- BICS是voluntary、twice-monthly survey，当前sample约39,000 UK businesses；private-sector coverage与明确industry exclusions必须固定到method revision。
- reporting unit可覆盖enterprise整体或部分local units；single-site subnational projection不能当national enterprise population。
- questions每月两次review，可added/removed/amended；wave、question wording、routing和reference window必须共同组成identity。
- national variables通常weighted，regional history可能unweighted，single-site subnational另有方法；不能按相同百分比直接比较。
- weighting可为business-count expansion、turnover ratio或employment ratio，并按question处理；缺失weight definition不能默认count-weighted。
- current experience、latest calendar month、year-ago comparison与expectation是不同time role；BICS estimate不是GDP、official forecast或company commitment。

官方入口：[dataset and wave archive](https://www.ons.gov.uk/economy/economicoutputandproductivity/output/datasets/businessinsightsandimpactontheukeconomy)、[BICS QMI](https://www.ons.gov.uk/economy/economicoutputandproductivity/output/methodologies/businessinsightsandconditionssurveybicsqmi)、[20 August 2026 release](https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/bulletins/businessinsightsandimpactontheukeconomy/20august2026)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| financial performance/turnover | release + wave XLSX | concept + workbook fixture |
| workforce/prices/trade/resilience | wave-specific XLSX | question/revision fixture |
| business concerns/shortages/disruption | selected waves | rotating-topic fixture |
| standard error/confidence interval | companion dataset from Wave 92 | quality fixture |
| questionnaire history | current/previous questions linked by QMI | definition/manual fixture |
| microdata | SRS/UKDS accredited access | restricted; excluded |

当前official distribution是版本化dataset landing page和每wave XLSX，不存在BICS-specific public developer API证据。下载链接是revision artifact，不能用通用ONS Dataset API或页面抓取冒充稳定BICS API。

## 3. Agent、MCP 与固定开源候选

- [ONSdigital/dp-dataset-api@`8ae5bbf`](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6)由ONSdigital维护，MIT，是ONS发布系统的dataset/edition/version service实现；它不是BICS client/Skill，README含private/import/state-transition surfaces，且没有BICS wave/question mapping。
- 通用SDMX/Census/ONS MCP不能补出BICS wave-specific workbook、question routing、per-question weight或confidence interval relation。
- 未发现ONS维护、固定BICS question history、wave、population、weighting和quality的Agent Skill或read-only MCP。

本轮未下载XLSX/PDF、未访问SRS/UKDS、未安装或执行repository/MCP，也未调用ONS内部/private API。

## 4. 权利、隐私与安全

- [ONS terms](https://www.ons.gov.uk/help/terms-conditions)说明most content按Open Government Licence开放并要求遵循exemptions与third-party rights；每个artifact仍保存source attribution。
- reporting-unit identity、site、contact、microdata、free text和小样本可识别内容全部排除。
- `low response`、suppression、imputation、unweighted regional result和confidence interval必须作为质量事实，不得用headline覆盖。
- questionnaire submission、SRS accreditation、contact/subscription或任何business response不是Probe。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / official workbook-route fixture / questionnaire-manual fixture`；`sandbox-live=0 / callable=0 / durable=0`。

下一门槛是手写wave/workbook/question/weight/CI envelopes，验证question addition/removal、Wave 7/54/92/102方法断点、national/regional/single-site分区与revision；真实workbook读取须另行授权。
