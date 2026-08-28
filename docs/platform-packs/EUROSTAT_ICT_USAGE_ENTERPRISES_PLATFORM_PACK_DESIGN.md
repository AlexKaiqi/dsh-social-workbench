# Eurostat ICT Usage and E-commerce in Enterprises Platform Pack

## 1. 定位

Eurostat `isoc_e`是由national statistical institutes执行、基于harmonised model questionnaire的annual enterprise ICT programme。它覆盖internet/e-commerce以及按年度或轮换节奏出现的cloud、AI、analytics、IoT、robotics、security、ICT specialists/training等主题，并提供official Statistics API、SDMX structure/codelist和bulk distributions。

Harmonised不等于每个country拥有相同sample/mode/optional scope；cross-country比较必须保留country quality/deviation。

## 2. 官方知识与路由

- [ICT usage in enterprises ESMS](https://ec.europa.eu/eurostat/cache/metadata/EN/isoc_e_esms.htm)：population、topic cadence、reference periods、sampling、weighting、quality和release。
- [Digital economy information and data](https://ec.europa.eu/eurostat/web/digital-economy-and-society/information-data)：questionnaires、database与主题入口。
- [Digital Intensity Index metadata](https://ec.europa.eu/eurostat/cache/metadata/en/isoc_e_dii_esmsip2.htm)：12-component composite与year-specific composition。
- [Statistics API guide](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started)：JSON-stat dataset route；schema/structure另走SDMX。
- [Copyright/reuse](https://ec.europa.eu/eurostat/help/copyright-notice)：attribution、access date、modification、third-party/country exceptions。

已固定但未调用的数据代码fixture包括`isoc_eb_ai`、`isoc_cicce_use`、`isoc_ec_esels`、`isoc_ske_ittn2`、`isoc_cisce_ra`、`isoc_cisce_ic`和`isoc_e_dii`。代码存在不证明每个period/country/size/indicator cell存在。

## 3. 统计与语义边界

2025主population为指定NACE行业、10+ employed persons/self-employed的enterprises；micro为optional。不同question可使用enterprise share、employee share、turnover share或currency。reference period可为survey current situation或prior calendar year。

| Eurostat concept | Canonical binding | 拒绝推断 |
| --- | --- | --- |
| enterprise uses technology | use + exact indicator | installed inventory/success/value |
| e-sales/orders/turnover | order/turnover representation | payment、fulfilment、transaction truth |
| AI | AI taxonomy revision | generative AI unless exact indicator says so |
| ICT specialists/training | skill-workforce | person fact/hire/training outcome |
| security measure | control | effectiveness/compliance |
| security incident/consequence | reported incident | verified breach/vulnerability/root cause |
| DII 0–12/bands | publisher composite + component set/year | raw adoption fact或stable longitudinal index |

DII由12 variables构成、分0–3/4–6/7–9/10–12 bands；components随survey year变化，必须以component-set revision gate comparability。topic的annual/biennial/occasional cadence也必须保存，不能由相似dataset填补未问年份。

## 4. Connector、OSS与Skill

未来Connector capability：dataflow/dataset discovery、SDMX DSD/codelist fixture、approved Statistics API small-cell read、bulk-envelope fixture、country quality/release reconciliation和schema/licence drift。没有survey submission、national respondent lookup、microdata或Probe。

[Eurostat restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)固定于`a0bce063c60aef1033ea696d91d26e1158c2c4b0`，authority-org、EUPL。它是R transport client，支持SDMX/TSV、DSD/codelist和cache；不含本Channel的taxonomy/question/stage/denominator/DII comparison semantics。未install、download或execute。

未发现Eurostat权威domain Agent Skill。generic SDMX/JSON-stat Skill即使可调用，也只提升transport layer，不提升domain maturity。

## 5. Snapshot、动态索引与可观测性

Snapshot保存programme/model-questionnaire、population/optional micro、dataset/code/DSD/codelist、technology/question/indicator、reference period、representation/weight、country deviation、DII components、release/revision/rights和fixed OSS SHA。分析库未来只存approved aggregate cells。

物化索引必须按`dataset + indicator + technology + unit + size + industry + geography + time-role + period + component-set + release`重建；DII与raw components分开。

Drift至少覆盖：dataset code/DSD/key/codelist、question/indicator label、topic cadence、NACE/population/size、current/prior-year role、unit/weight、country deviations、DII components、provisional/revision/suppression、licence与zero effects。

Fixture至少证明：10+不由optional micro补齐；enterprise/employee/turnover/currency不互换；AI不泛化为genAI；security incident不成为breach；DII跨year composition变化触发quarantine；API 200或JSON-stat parse不升级domain readiness。

当前`selected-manual`，`callable=0 / durable=0`。
