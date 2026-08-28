# UK ONS Consumer Price Inflation Platform Pack

## 1. 概念与能力

`uk-ons-consumer-price-inflation`描述Office for National Statistics的英国consumer price inflation产品。稳定概念是CPIH、CPI、RPI、Household Costs Indices、COICOP classification、representative item、consumption segment、traditional price quote、scanner/alternative data、basket weight、elementary/higher aggregate、index/rate、release、revision与analytical microdata。

CPIH、CPI、RPI和HCI总体、housing treatment、formula与用途不同。price quote、consumption-segment index、average price、all-items index、monthly change和12-month rate分别保存。2025起consumption segment替代部分item index；2026 grocery scanner data改变quote coverage，这些是schema/product revision而非普通新增行。

只发布knowledge/fixture能力：`consumer-price.program.read`、`classification.read`、`index.read`、`weight.read`、selected `quote.read`、selected `average-price.read`、`release.read`与`adjustment.read`。quote/aggregated microdata保持research/analytical standing，不因由ONS发布就升级为accredited official statistic。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。ONS API以`dataset → edition → version → dimensions/options → observation`组织；固定示例为`cpih01/editions/time-series/versions/{version}`，version必须先发现再绑定，不能硬编码“latest”。综合时序产品MM23、月度tables、API observations、consumption-segment/quote files是不同route，不做silent fallback。

从2026年3月起，CPIH/CPI的COICOP Division 1和2因scanner data接入不再发布individual price quotes；其余locally collected quotes仍为research用途，并发布aggregated microdata、regional consumption-segment indices/weights和indicator-marker counts。未来canary必须固定edition/file date、classification framework、glossary、quote/segment coverage、format/content digest与superseded/correction lineage。

## 3. Snapshot、字段与权利

Snapshot保存program/method、CPIH/CPI/RPI/HCI边界、classification/consumption-segment revision、API dataset/edition/version/dimensions、MM23 release、quote/aggregated microdata roster、weight/chain-link、quality/replacement/alternative-data method、OGL与decision。默认不长期保存quote bulk或可识别retailer/service-provider信息。

旧price quote数据按较粗地域发布以避免识别retailer，2026后scanner provider agreements进一步限制细粒度发布。精确outlet、provider、restricted scanner transaction、合同字段和可重识别组合默认drop/quarantine；OGL v3适用于标明内容，第三方权利与特定dataset说明仍需逐资源检查。

## 4. 动态视图、可观测性与fixture

动态视图：`program-measure-and-housing-treatment-roster`、`dataset-edition-version-dimension-option-lineage`、`classification-item-to-consumption-segment-transition`、`traditional-vs-scanner-vs-aggregated-microdata-coverage`、`quote-average-index-rate-separation`、`weight-reference-chain-link-and-index-reference-period`、`scheduled-revision-correction-and-superseded-file-history`、`research-vs-accredited-statistic-standing`与`retailer-confidentiality-drop-audit`。

Telemetry逐`program × dataset/edition/version/file × classification/segment × quote/scanner/aggregate source × measure/change × geography × weight/base/reference period × release/revision × research/accredited standing × OGL/confidentiality`记录dimension discovery、requested/returned/dropped、version churn、file digest、quote coverage loss、unknown marker、classification remap、correction/supersession、fallback rejection与zero effects。

Synthetic至少覆盖：CPIH不等于CPI/RPI；quote不等于index；item index与consumption segment不盲merge；March 2026后Division 1/2 missing quote不解释为商品缺货；research microdata不升级为official statistic；regional average不证明个体outlet price；annual basket update保留old weight；index reference 100不是currency；MM23 modelled history标记为indicative；无income denominator不输出affordability。

## 5. 不可推断与官方资料

必须拒绝：CPI/CPIH/RPI同名component→可比、price quote→representative market price、quote missing→stockout、research microdata→accredited statistic、scanner transaction→可公开outlet、scheduled update→error correction、index→household burden、ONS client library→consumer-price semantics complete。

- [ONS API dataset/version model](https://developer.ons.gov.uk/dataset/)
- [ONS observation request guide](https://developer.ons.gov.uk/observations/)
- [Consumer price inflation time series (MM23)](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindices)
- [Consumer price inflation consumption segment indices and price quotes](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindicescpiandretailpricesindexrpiitemindicesandpricequotes)
- [Consumer prices technical guidance](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/consumerpricesindicestechnicalguidance)
- [Scope and coverage](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/scopeandcoverageofconsumerpricesindices)
- [Higher-level aggregation and weights](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/higherlevelaggregationandweightsinconsumerprices)
- [2026 microdata provision changes](https://www.ons.gov.uk/economy/inflationandpriceindices/articles/changestotheprovisionofmicrodataoutputsforconsumerpriceinflationstatistics/january2026)
