# Statistics Canada Canadian Survey on Business Conditions Platform Pack

## 1. 稳定概念

本成员描述Statistics Canada Canadian Survey on Business Conditions（CSBC，record 5318）的公开aggregate tables，不描述identified business/organization、owner、respondent、loan application或transaction。

- current results适用于Canada employer businesses；sampling unit、questionnaire中的business/organization categories与发布population不能按字段名自行统一。
- CSBC是quarterly cross-sectional voluntary survey，使用stratified random sample和calibrated weights；2020 March crowdsourced iteration与后来probability sample不可直接拼接。
- obstacle selected、most challenging obstacle、expected impact和expected duration是不同question/denominator。
- next-three-month sales/employment/price/profitability expectation、next-12-month optimism与current liquidity有不同horizon。
- plan to apply for credit、ability to take debt和reported barrier不是application、approval、loan、credit supply或lender assessment。
- 2026 Q1发生weight correction；release/correction lineage必须保留。
- Statistics Canada已宣布summer 2026为final collection、final release安排在2026-08-31；programme ending不等于历史tables消失或当前final result已发布。

官方入口：[survey page](https://www.statcan.gc.ca/en/survey/business/5318)、[Q3 2026 questionnaire](https://www.statcan.gc.ca/en/statistical-programs/instrument/5318_Q1_V26)、[Q2 2026 release](https://www150.statcan.gc.ca/n1/daily-quotidien/260527/dq260527a-eng.htm)、[release schedule](https://www150.statcan.gc.ca/n1/dai-quo/cal2-eng.htm)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| sales/employment/price/profitability expectations | quarterly tables | expectation fixture |
| obstacles/most challenging/input/supply chain | quarterly tables | constraint fixture |
| liquidity/debt/future outlook | tables + questionnaire | resilience fixture |
| emerging topic/planned action | changing questionnaires | rotating-topic fixture |
| table metadata/full CSV/SDMX | WDS by PID | exact official machine route fixture |
| respondent microdata | protected/restricted | unsupported |

[WDS](https://www.statcan.gc.ca/en/developers/wds)与[WDS user guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)固定PID/cube metadata、changed-cube、vector、full-table CSV/SDMX routes。CSBC每季度可发布多个occasional PIDs，PID必须绑定questionnaire/release，不能把相同title跨quarter当稳定series。

## 3. Agent、MCP 与固定开源候选

- [pbouill/statistics-canada@`419e087`](https://github.com/pbouill/statistics-canada/tree/419e0870fb6dc36b16a522d160be9b3aa63cd24e)是community GPL-3.0 Python WDS client；README说明部分POST endpoints处于503 recovery，功能偏generic cube/population discovery，不包含CSBC question/horizon/obstacle/quality/lifecycle语义。
- generic SDMX MCP只能解释transport envelope，不能决定occasional PID、question population、calibrated estimator或final-program lifecycle。
- 未发现Statistics Canada维护、固定CSBC questionnaire revision、weights、quality grade、correction和programme ending的Agent Skill或MCP。

本轮未调用WDS/SDMX、未下载table、未安装/执行client、未提交survey或申请credit。

## 4. 权利、隐私与安全

- [Statistics Canada Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)允许使用、再发布与value-added products，要求准确、attribution、no endorsement，并禁止为识别individual/business/organization而link database。
- ownership group、contact、open text、sensitive business data、record linkage、microdata和rare cell全部pre-gate drop。
- liquidity/debt response不用于credit scoring、distress lead、underwriting或金融建议。
- survey submission、credit application、contact、download、subscription和WDS/MCP执行都不是Probe。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / exact official WDS-route fixture / official-table fixture / programme-ending`；`sandbox-live=0 / callable=0 / durable=0`。

下一门槛是用手写PID/cube/question/quality/correction/program-lifecycle envelopes验证2020 population break、quarter-specific tables、calibrated weighting、A-F reliability/suppression、Q1 correction和final release；8月31日后需重新evidence review，不能预先宣称final data内容。
