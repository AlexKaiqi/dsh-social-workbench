# European Commission Business and Consumer Surveys Platform Pack

## 1. 稳定概念

本成员只使用European Commission DG ECFIN Joint Harmonised Business and Consumer Surveys中的business sectors，不把consumer responses混入企业需求信号。

- business population按industry、services、retail trade和construction分survey；national partner负责fieldwork，DG ECFIN接收aggregate并形成EU/euro-area result。
- harmonised questionnaire不意味着national sample frame、mode、size或additional questions完全相同；partner metadata仍是definition的一部分。
- balance通常是positive response share减negative response share；six-option scale还带intensity weight。balance不是response percentage或level。
- Economic Sentiment Indicator、sector confidence、Employment Expectations Indicator等是publisher composite，不是单一question response。
- monthly、quarterly、biannual和annual/investment questions有不同cadence；suspended question与archived series不能由相近label补齐。
- seasonally adjusted、non-seasonally adjusted、back-cast与unvalidated subsector series必须形成不同estimate standing。

官方入口：[programme](https://economy-finance.ec.europa.eu/economic-forecast-and-surveys/business-and-consumer-surveys_en)、[methodology](https://economy-finance.ec.europa.eu/economic-forecast-and-surveys/business-and-consumer-surveys/methodology-business-and-consumer-surveys_en)、[methodological concepts](https://economy-finance.ec.europa.eu/economic-forecast-and-surveys/business-and-consumer-surveys/methodology-business-and-consumer-surveys/methodological-concepts_en)、[March 2026 user guide](https://economy-finance.ec.europa.eu/document/download/426aefda-4888-42e7-ac02-1ac85f979b3d_en?filename=bcs_user_guide_Mar_26.pdf)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| business question balances | Redisstat BCS + ZIP tables | concept + route fixture |
| confidence/ESI/EEI/uncertainty | data browser + release annex | composite fixture |
| production/orders/prices/employment | monthly sector surveys | observation/expectation fixture |
| capacity utilisation/investment | quarterly/biannual/annual questions | cadence fixture |
| country/EU/euro-area aggregate | partner results + Commission weights | aggregation fixture |
| partner method/national questionnaire | official metadata pages | selected-manual fixture |

[time-series page](https://economy-finance.ec.europa.eu/economic-forecast-and-surveys/business-and-consumer-surveys/download-business-and-consumer-survey-data/time-series_en)说明新Redisstat browser仍在testing，Excel/ZIP distribution在transition期继续；browser支持SDMX-CSV、structural metadata和API。[ECFIN Redisstat API documentation](https://economy-finance.ec.europa.eu/economic-research-and-databases/economic-databases/ameco-database/bulk-downloads-and-api-access_en)固定ECFIN-specific SDMX 2.1/3.0 endpoint family，但具体BCS dataflow/key仍需fixture，不能误用generic Eurostat endpoint。

## 3. Agent、MCP 与固定开源候选

- [Baffelan/sdmx-mcp-gateway@`7a385c0`](https://github.com/Baffelan/sdmx-mcp-gateway/tree/7a385c0bcb2b85b8e592c9c03a05370244c7721f)是community progressive SDMX MCP；固定源码配置含Eurostat、ECB等endpoint但不含ECFIN Redisstat。README声称MIT并指向LICENSE，而该SHA没有LICENSE文件，许可证据不完整；hosted endpoint与`npx -y`均不可采用。
- [sdmx-twg/sdmx-rest@`46bba52`](https://github.com/sdmx-twg/sdmx-rest/tree/46bba52cb8a8a21704019f949987ee21adefdd5e)提供规范/OpenAPI参考但仓库未声明LICENSE，且不包含BCS question/balance/composite/partner semantics。
- 未发现DG ECFIN维护、固定BCS programme、question cadence、balance、composite、weights和partner metadata的Agent Skill或MCP。

本轮未请求SDMX data/ZIP/XLSX、未调用hosted MCP、未安装/执行源码或`npx`。

## 4. 权利、隐私与安全

- [European Commission legal notice](https://commission.europa.eu/legal-notice_en)默认将EU-owned website content置于CC BY 4.0，要求credit和changes indication，并排除third-party/trademark等内容。
- 仅保留business aggregate；consumer microdata、firm identity、partner respondent、contact和free text不进入本Channel。
- country/EU aggregate不用于company lead、country ranking或确定性经济预测。
- survey response、partner contact、release subscription与任何data submission均不是Probe。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / official SDMX-route-family fixture / official-bulk fixture / selected-manual`；`sandbox-live=0 / callable=0 / durable=0`。

下一门槛是固定BCS dataflow/DSD/codelist/key synthetic envelope，验证question frequency、balance formula、country/sector weight、SA/NSA、composite constituent、backcast/suspension和Redisstat transition；真实metadata或observation读取须另行授权。
