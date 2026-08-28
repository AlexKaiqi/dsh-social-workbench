# UK Innovation Survey Platform Pack

## 1. 定位

UK Innovation Survey（UKIS）由Department for Business and Trade负责、ONS代为执行，是UK business innovation的biennial official survey。UKIS 2025在2025采集、覆盖2022–2024，并于2026-06-04发布report、statistical annex、questionnaire和figure/table data。

它提供product/process innovation、investment amount、novelty、turnover share、abandoned/ongoing activity、constraints、objectives、information sources、cooperation、protection、public support、skills与environmental innovation。

## 2. 官方证据

- [UKIS survey page](https://www.ons.gov.uk/surveys/informationforbusinesses/businesssurveys/ukinnovationsurvey)：DBT/ONS authority、VAT/PAYE frame、population/sample、voluntary、biennial。
- [UKIS 2025 report landing](https://www.gov.uk/government/statistics/uk-innovation-survey-2025-report)：report、XLSX annex、PDF/ODT questionnaire、ODS data及publication date。
- [HTML report](https://www.gov.uk/government/statistics/uk-innovation-survey-2025-report/uk-innovation-survey-2025-report)：10+ population、31,150 sample、14,075 responses、45.2% response、IDBR weighting与self-report caveat。
- [Question list](https://www.ons.gov.uk/surveys/informationforbusinesses/businesssurveys/ukinnovationsurveyukissurveysurveyquestions)：exact wording/routing/scale。
- [UKIS collection](https://www.gov.uk/government/collections/uk-innovation-survey)：historical reports和privacy notice。
- [GOV.UK copyright/OGL](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/)。

Programme=`active`，report/result=`published`。future release date未知不会影响2025 release standing，但不能推定下一cycle。

## 3. Population、时间与估计

UKIS 2025的published analytical population为10+ employees，activity window 2022–2024；innovation investment amount和turnover share锚定2024。business named on form与enterprise group/UK-only reporting boundary必须保留。weighted population estimate不等于respondent count。

| UKIS concept | Canonical binding | 拒绝推断 |
| --- | --- | --- |
| internal/external R&D、equipment/software、knowledge、training、design、market introduction | expenditure activity + 2024 amount | procurement/payment/ROI |
| new/improved goods/services/process | introduced innovation | launch success/customer adoption |
| competitor novelty | new-to-market-like question | first-in-world/patentability |
| abandoned/ongoing | activity status | failed/completed/future outcome |
| high/medium/low/not important constraint | barrier scale | cause/severity/loss/lead |
| information importance | information source | cooperation/reliance/licence |
| R&D/other/business cooperation | exact cooperation scope | contract/endorsement |
| protection/public support | declared method/use | valid right/award/payment |

## 4. Connector、OSS与Skill

未来capability：report/questionnaire/annex discovery、approved workbook-envelope/sheet read、aggregate normalization、release/method drift。无domain public API、survey submission、respondent lookup、microdata或Probe。

[ONS dp-dataset-api](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6)固定于`8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6`，authority-org/MIT，是含MongoDB/Neo4j/Kafka和write lifecycle的内部publication service，不是UKIS public client。未clone/install/execute。

未发现DBT/ONS维护的UKIS domain Agent Skill。HTML/report、file distribution、generic ONS service与domain connector不能互换。

## 5. Snapshot、观测与验证

Snapshot保存authority、population/unit、period/amount year、question/scale/status/novelty、weight/response/method、report/annex/file/rights和fixed OSS decision；不保存workbook/cell、respondent、identity或credential。

监控report/annex/questionnaire revision、sheet/header/category、10+ population、response/weight、question routing、three-year/single-year role、OGL exception和zero effects。

Fixture证明respondent rate不当population rate、investment不当procurement、turnover share不当incremental revenue、abandoned不当failure cause、information source不当cooperation、file presence不当domain callable。

当前`selected-manual`，`callable=0 / durable=0`。
