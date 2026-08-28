# Public Business Innovation Activities, Constraints & Collaboration Triage — 2026-08-26

## 1. 选择结论

本轮选择“公共企业创新活动、约束与协作”，因为现有体系可以观察数字技术采用、R&D/投资披露、经营压力和产品发布，却不能稳定回答企业是否真正引入product/business-process innovation、哪些活动仍在进行或已放弃、投入了什么、与谁合作、使用哪些知识来源、为何不创新以及使用了何种公共支持。

入选成员：

1. U.S. Census Bureau / NSF NCSES Annual Business Survey（ABS）Innovation；
2. UK Innovation Survey（UKIS，DBT owner、ONS administration）；
3. Eurostat Community Innovation Survey（CIS）；
4. Statistics Canada Survey of Innovation and Business Strategy（SIBS）。

它们统一到`PublicBusinessInnovation*`，但programme、population、statistical unit、innovation definition、activity status、novelty、question、time role、representation、estimator、quality、release和rights保持独立。

## 2. 第一性边界

- idea、invention、R&D、technology purchase或innovation activity不自动等于innovation；product必须made available，process必须brought into use；
- product、goods、service与business-process innovation分开；new-to-business、new-to-market、new-to-world与significantly-different不是同义词；
- introduced、completed-not-implemented、ongoing、abandoned/suspended和no activity是不同状态；`innovation-active`不等于成功、增长或有价值；
- 三年activity window与单年expenditure/turnover/employment不能互换；collection/publication year不是reference year；
- internal development、joint development、adaptation与external development不证明ownership、contract或procurement；
- cooperation要求source定义的shared responsibility；information source、outsourcing和普通business cooperation不能补成innovation cooperation；
- barrier/non-activity reason必须保留question与denominator；不是cause、severity、loss、WTP或identified lead；
- public support use/receipt不是eligibility、application、award、obligation、payment、effectiveness或additionality；
- protection method或filing不是valid/granted/enforceable IP right；
- turnover share不是incremental revenue、profit、causal impact或vendor revenue；
- respondent-declared objective/benefit/environmental contribution不是independent causal effect、ROI、saving、LCA或compliance；
- innovation rate、innovation-active share、product rate和process rate不可互换；harmonised survey不代表country sample/mode/optional variables相同；
- official survey submission不是Probe；mandatory与voluntary response都不得由系统代填。

## 3. 成员增量与生命周期

| 成员 | 独特增量 | Population/period | Route | 当前状态 |
| --- | --- | --- | --- | --- |
| Census/NCSES ABS | product/process、activity status、partner、barrier、support、environmental benefit | U.S. for-profit employer companies 1+；current questionnaire 2023–2025 | Census API metadata/key-gated aggregates + NCSES tables | active/transitioning；current questionnaire result未发布 |
| UKIS 2025 | investment categories/amounts、constraints、information、cooperation、protection、skills/environment | UK business 10+；2022–2024，amount year 2024 | HTML report + XLSX/ODS/PDF/ODT | active biennial；2025 report published 2026-06-04 |
| Eurostat CIS 2022 | harmonised EU indicators、introduced/ongoing/abandoned、mandatory/optional、country quality | core sectors、enterprise 10+；2020–2022，selected 2022 amounts | Statistics API/SDMX/bulk | active biennial；not panel |
| Statistics Canada SIBS | innovation + strategy/global value chain、obstacles/measures、critical partner/program | selected 14 sectors、20+ and CAD 250k threshold；2023–2025 current questionnaire | WDS PIDs/cubes + official tables | active biennial；2025 results尚未证实发布 |

## 4. Agent Skill、MCP、SDK与OSS

| 候选 | 固定版本 | Domain结论 |
| --- | --- | --- |
| [US Census Data API MCP](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a) | `5dcaa637871b9ded5dab415118f9008c06d13f2a` | authority-org/CC0；generic API、key、Docker/Postgres seed；不含innovation definition/status/novelty/question semantics |
| [ONS dp-dataset-api](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6) | `8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6` | authority-org/MIT；内部publication lifecycle service，含private/write dependencies；不是UKIS public client |
| [Eurostat restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | `a0bce063c60aef1033ea696d91d26e1158c2c4b0` | authority-org/EUPL；R SDMX/TSV transport client；不含CIS question/status/optional/country semantics |
| [statistics-canada](https://github.com/pbouill/statistics-canada/tree/bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423) | `bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423` | community/GPL-3.0；generic WDS client；不含SIBS questionnaire/population/PID-release semantics |

GitHub检索未发现由四个programme权威维护、承担本Channel语义的Agent Skill。官方页面、questionnaire、machine route、fixed OSS、Skill、installed、callable和durable分别记录。本轮只读refs/README/LICENSE类证据；未clone、install或execute。

## 5. 晋级与成熟度

晋级严格为evidence review → static contract → synthetic conformance → route/schema fixture → sandbox live → operational canary → callable → durable。generic client成功、HTML可读、数字返回或同名indicator不能跳级。

暂停条件包括：question无法绑定result、population/denominator未知、Oslo definition或activity status漂移未解释、只能抓网页或运行未知代码、需要restricted microdata/identity、或把survey barrier用于company profiling/lead generation。

成熟度：`requested=4 / concept-fixture=4 / current-questionnaire fixture=4 / current-or-latest-published-result fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / product-innovation fixture=4 / business-process-innovation fixture=4 / activity-status fixture=4 / novelty fixture=4 / expenditure fixture=4 / turnover-share fixture=4 / developer-source fixture=4 / cooperation fixture=4 / information-source fixture=3 / objective-or-benefit fixture=4 / explicit-barrier fixture=4 / public-support fixture=4 / protection fixture=4 / environmental-benefit fixture=4 / estimate-quality fixture=4 / programme-lifecycle fixture=4 / selected-manual=4 / callable=0 / durable=0`。
