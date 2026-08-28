# Eurostat HICP Platform Pack

## 1. 概念与能力

`eurostat-hicp`描述Eurostat Harmonised Indices of Consumer Prices，不代表各国national CPI、零售报价或生活成本数据库。稳定概念是HICP/HICP-CT、ECOICOP、household monetary consumption expenditure、item/country weight、chain-linked Laspeyres-type index、monthly/annual/moving-average rate、contribution、first-published value、flash/final/revision与country/EU/euro-area aggregate。

Harmonised表示共同法律与方法框架，不代表各国basket、price source、weight、coverage或household experience完全相同。index、annual rate、monthly rate、moving average、contribution、item weight和country weight分别保存。HICP-CT不等于headline HICP。

只发布knowledge/fixture能力：`consumer-price.program.read`、`classification.read`、`index.read`、`weight.read`、`release.read`、`revision.read`与selected `aggregate.read`。当前不发布quote、average-price、stock availability或affordability能力。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。官方Statistics API为`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{datasetCode}`，返回JSON-stat 2.0；另有SDMX 3.0/2.1和Catalogue API。一个dataset code、完整dimension order/category index、unit、geo、time、status/confidentiality flag共同决定observation；flat value index不能脱离dimension metadata解释。

2026 release将共同index reference改为`2025=100`并采用ECOICOP v2。旧`prc_hicp_midx`已停用并由`prc_hicp_minr`替代；旧ECOICOP v1目录归档，新目录包含回溯序列。item-weight route `prc_hicp_inw`、current index/rate routes和classification version必须由Catalogue/metadata共同固定，不能按旧教程猜测。重基与back-series不等于原月价格发生跳变。

## 3. Snapshot、字段与权利

Snapshot保存dataset/catalogue code、DSD/dimensions/categories、ECOICOP version、index/weight reference、formula/chain link、HICP/HICP-CT、item/country weight、status/confidentiality flags、first-published/current/revision relation、API/version/format、reuse policy与decision。分析库只保存approved aggregate cube observations和typed semantics；不伪造micro quote或country-national metadata。

Eurostat统计数据和metadata通常可在注明来源后商业/非商业复用，但第三方来源、特定国家/材料和单独copyright notice存在例外；修改、翻译和customized dataset需要明确说明并按官方citation规则记录access date。

## 4. 动态视图、可观测性与fixture

动态视图：`dataset-code-dsd-dimension-category-roster`、`ECOICOP-v1-to-v2-classification-lineage`、`2015-to-2025-index-reference-and-back-series`、`index-monthly-annual-moving-average-contribution-separation`、`item-vs-country-weight-reference`、`first-published-vs-current-vs-revised-observation`、`HICP-vs-HICP-CT`、`country-vs-EU-vs-euro-area-aggregation`与`status-confidentiality-flag-audit`。

Telemetry逐`API family/version × dataset code × DSD/classification × unit/geo/time dimensions × measure/change × index/weight reference × HICP/HICP-CT × first/current/revised × obs/conf status × reuse exception`记录query size、HTTP/async posture、returned/null/flagged、dimension decode、unknown category、dataset replacement、classification/rebase drift、revision、cross-country comparison rejection、fallback rejection与zero effects。

Synthetic至少覆盖：JSON-stat flat index按dimension order正确解码；annual rate不当index point；monthly rate不当annual rate；item weight不当country weight；2025=100不当price level；re-reference不产生inflation event；ECOICOP v1 code不与v2同字符串盲merge；first-published与revised并存；HICP不当national CPI；无income denominator不输出affordability；missing/null/flag不当zero或stockout。

## 5. 不可推断与官方资料

必须拒绝：harmonised→identical baskets、index 100→currency price、weight→quantity demanded、rebase→price shock、archived dataset→deleted evidence、null→zero、HICP→individual cost of living、country aggregate→household experience、generic SDMX client→HICP semantics complete。

- [HICP information on data](https://ec.europa.eu/eurostat/web/hicp/information-data)
- [HICP methodology](https://ec.europa.eu/eurostat/web/hicp/methodology)
- [Eurostat API getting started](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started)
- [Statistics API request and JSON-stat model](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)
- [Eurostat data access APIs](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/)
- [Current monthly HICP product (`prc_hicp_minr`)](https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_minr/default/table)
- [HICP item weights (`prc_hicp_inw`)](https://ec.europa.eu/eurostat/web/products-datasets/-/prc_hicp_inw)
- [Eurostat copyright and reuse](https://ec.europa.eu/eurostat/help/copyright-notice)
