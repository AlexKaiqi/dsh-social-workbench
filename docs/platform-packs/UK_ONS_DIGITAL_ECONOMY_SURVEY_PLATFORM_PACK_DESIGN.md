# UK ONS Digital Economy Survey Platform Pack

## 1. 定位

ONS Digital Economy Survey / E-commerce and ICT activity提供UK business的internet、web presence、e-commerce、software、cloud、digital regulatory difficulty与ICT security signals。其programme已经暂停，历史workbook仍公开；“页面可访问”不能被解释为current programme、current data或可用domain API。

## 2. 官方知识与生命周期

- [Digital Economy Survey](https://www.ons.gov.uk/surveys/informationforbusinesses/businesssurveys/ecommercesurvey)：programme说明、population/sample、mandatory status和paused notice。
- [2022 survey questions](https://www.ons.gov.uk/surveys/informationforbusinesses/businesssurveys/2021digitaleconomysurveysurveyquestions)：questionnaire evidence；不证明2022 results published。
- [ICT activity dataset archive](https://www.ons.gov.uk/businessindustryandtrade/itandinternetindustry/datasets/ictactivityofukbusinessesecommerceandictactivity)：historical workbook/CI files。
- [E-commerce and ICT activity QMI](https://www.ons.gov.uk/businessindustryandtrade/itandinternetindustry/methodologies/ecommerceandictactivityqmi)：population、frame、estimation、question drift、electronic mode break与limitations。
- [ONS terms](https://www.ons.gov.uk/help/terms-conditions)：OGL默认与exceptions。

Standing：programme page明确2023暂停采集；结果dataset的最新release为2019 edition/2021 publication且next release未定。programme=`paused`，result route=`archived/stale`，questionnaire=`published`；三者不能合成“current”。

## 3. 概念与估计边界

约2.2m VAT/PAYE registered trading businesses是target population，约11k sample；enterprise/business proportion、employee percentage和e-commerce monetary value使用不同unit/estimator。QMI记录：

- annual electronic survey、IDBR frame与sector exclusions；
- number-raised business/enterprise proportions；employee measures独立；monetary e-commerce values使用turnover/ratio-like estimation；
- 约40% questions逐年变化，并非所有series annual；
- 2018 paper-to-electronic mode change对micro-enterprise比例形成method break；affected comparison应优先10+ population；
- 无regional publication能力。

| Survey concept | Canonical binding | 不可推断 |
| --- | --- | --- |
| internet/access/speed | connectivity | verified line inventory/performance |
| website/social presence | digital presence | active/owned property或audience |
| online sale/purchase | e-commerce order/turnover | payment、fulfilment、end demand |
| CRM/ERP/software/cloud | technology use | installed licence、successful deployment |
| regulatory difficulty | adoption barrier | cause、severity、legal advice或lead |
| ICT security control | security control | effectiveness/compliance/absence of breach |

## 4. 接入、OSS与Skill

未来Connector只有official page/questionnaire/workbook discovery、approved file-envelope read、sheet/schema fixture、historical aggregate normalization、release/lifecycle drift。没有public domain API、survey submission、business lookup、microdata或Probe。

[ONS dp-dataset-api](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6)固定于`8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6`，authority-org、MIT。它是ONS内部publication system service，依赖MongoDB、Neo4j、Kafka并含private/write lifecycle；不是Digital Economy public client或Agent Skill，权限与副作用过宽。未clone/install/execute。

未发现权威domain Agent Skill。generic ONS dataset/API client不能替代question、estimator、mode effect与paused lifecycle知识。

## 5. Snapshot、可观测性与验证

Snapshot保存paused notice、questionnaire revision、dataset/workbook/CI landing、population/unit、question/taxonomy、estimator/mode break、release/rights与fixed OSS decision；不保存files/cells、respondent identity、credential或private ONS metadata。

必须观测：programme paused/archive drift、questionnaire-vs-result、workbook/sheet/column drift、business/employee/money representation conflict、mode/population break、question churn、missing/CI/suppression、OGL exception与zero effects。

Synthetic fixture至少证明：2022 questions不成为2022 estimates；historical workbook不成为current series；micro pre/post mode比例不直接join；generic dp API不提升maturity；workbook不存在时不回退HTML scraping或third-party mirror。

当前`selected-manual`，仅concept、questionnaire、historical file-route fixture；`callable=0 / durable=0`。
