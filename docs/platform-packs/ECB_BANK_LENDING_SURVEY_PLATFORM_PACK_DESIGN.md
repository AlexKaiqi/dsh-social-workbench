# ECB Bank Lending Survey Platform Pack

## 1. 稳定概念

本成员描述European Central Bank/Eurosystem的euro area Bank Lending Survey（BLS）公开聚合。

- BLS自2003年运行，通常每年四次，面向约160家代表性euro-area banks；它补充loan/rate statistics，不是enterprise或loan census。
- 22个standard questions包含18个backward-looking与4个forward-looking问题，并可增加ad-hoc questions；question revision和time role必须同行。
- `net percentage`对credit standards是tightened minus eased，对loan demand是increased minus decreased。
- `diffusion index`按response intensity给“considerably”两倍于“somewhat”的分值；它不是net percentage的别名。
- national aggregation可用implicit sample weighting或individual-bank loan-stock weighting；euro-area aggregation再按national shares of outstanding loans加权。
- enterprises、households、loan purpose、maturity、firm size、past/expected、country和measure形成不同series partitions。
- respondent judgment、reported factor和open-ended answer不能升级为causality、individual credit decision或firm-level pain。

官方入口：[BLS overview](https://www.ecb.europa.eu/stats/ecb_surveys/bank_lending_survey/html/index.en.html)、[methodology/data](https://data.ecb.europa.eu/methodology/bank-lending-survey-bls)、[user guide](https://www.ecb.europa.eu/stats/pdf/bls_user_guide_202604.en.pdf)、[questionnaire](https://www.ecb.europa.eu/stats/ecb_surveys/bank_lending_survey/pdf/ecb.bls_questionnaire.en.pdf)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| standards/demand/terms/factors | quarterly report + annex | concept/result fixture |
| past and expected responses | standard questions | exact time-role fixture |
| euro area and country results | ECB Data Portal `BLS` | exact official SDMX route-fixture |
| net percentage/diffusion index/mean | BLS data + methodology | balance-definition fixture |
| respondent microdata/open comments | not public aggregate route | unsupported |

[ECB Data API](https://data.ecb.europa.eu/help/api/data)定义`https://data-api.ecb.europa.eu/service/data/{flowRef}/{key}`，BLS dataflow通过ECB Data Portal发布SDMX 2.1 CSV/bulk。route存在只证明可请求series；必须先固定DSD、dimension order、question code、unit、frequency、adjustment与country weighting，不能通过自然语言猜key。

## 3. Agent、MCP 与固定开源候选

- [scka-de/ecb-mcp@`bc50c66`](https://github.com/scka-de/ecb-mcp/tree/bc50c668b7dcf1269bef174ec25d8c693f56e112)是community MIT MCP，支持dataset search/explain和通用SDMX数据请求，无API key。其built-in tools面向汇率、利率、通胀等，BLS只能走generic discovery；它不执行question/sign/weighting/time-role conformance。README中的`npx -y`会安装并执行latest，当前禁止。
- [sdmx-twg/sdmx-rest@`46bba52`](https://github.com/sdmx-twg/sdmx-rest/tree/46bba52cb8a8a21704019f949987ee21adefdd5e)是normative protocol reference而非BLS client，且仓库未声明LICENSE。
- 未发现ECB/Eurosystem维护、把BLS questionnaire、net percentage、diffusion index、country weighting与forward-looking boundary绑定起来的Agent Skill。

本轮未执行SDMX query、未下载CSV/report/annex、未安装或连接MCP。

## 4. 权利、隐私与安全

- [ESCB statistics reuse policy](https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html)允许公开statistics免费复用，要求source attribution且不得把修改后的statistics冒充原值；third-party/confidential data除外。
- [ECB disclaimer](https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html)要求准确再现、标注修改并保留付费产品中的免费来源提示。
- individual bank response、open text、contact和microdata不进入Pack；SAFE microdata等其他产品的使用协议不能外推到BLS aggregate。
- 本成员没有Probe，不提交survey、不联系NCB/银行、不改变贷款条件。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / exact official SDMX route-fixture / selected-manual`；`sandbox-live=0 / callable=0 / durable=0`。

下一门槛是冻结一个BLS dataflow/DSD snapshot并以合成series证明question、country、borrower、loan category、net percentage/diffusion index、past/expected与weighting不丢失；真实observation读取另行授权。
