# Eurostat EU-SILC Housing Cost Burden Platform Pack

## 1. 概念与能力

`eurostat-eu-silc-housing-cost-burden`只描述EU Statistics on Income and Living Conditions公开housing-cost与tenure aggregate，不代表HICP rent index、property listing、national microdata或每个居民的经历。稳定概念是private household/person target population、cross-sectional/longitudinal data、tenure、housing-cost components、housing allowance treatment、disposable household income、income reference period、cost share、overburden threshold、population rate、dimension/codelist/status、release与break。

只发布knowledge/fixture能力：`rental-housing.program.read`、`population.read`、`tenure.read`、`burden-definition.read`、`burden-aggregate.read`、`estimate-quality.read`与`release.read`。不发布rent level/index、vacancy、household microdata、scientific-use access或写能力。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。固定official Statistics API为`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{datasetCode}`，核心fixture固定`ilc_lvho07a` housing cost overburden rate，并以`ilc_lvho07c`、`ilc_mded01`和`ilc_lvho02`作为tenure/cost-share/population语义候选；任何dataset code必须先通过Catalogue/metadata与全部dimension/codelist重新确认，不能仅靠文章引用晋级。

EU-SILC annual income reference通常是survey前一calendar year，其他housing facts可有不同reference period。overburden rate以persons living in households为reporting unit，阈值是housing costs net of housing allowances超过disposable income的40%；它不是“40%家庭”的同义表达。EU aggregate还受population coverage和national input validation约束。

## 3. Snapshot、字段与权利

Snapshot保存EU-SILC legislation/method、target population、cross-sectional/longitudinal posture、dataset/DSD/dimension/codelist、tenure、housing-cost components、allowance/income/threshold、reference periods、unit、geo、status/break、quality、DOI/access date、reuse exception与release。默认只保留published aggregate；restricted scientific-use microdata、household/person identity和small-cell重识别组合不进入projection。

Eurostat statistical data/metadata通常可在注明来源后商业或非商业复用，但individual document和third-party exception需检查；修改/翻译需明确。数据许可不由MCP或client license替代。

## 4. 动态视图、可观测性与fixture

动态视图：`dataset-dsd-dimension-codelist-status`、`private-household-vs-person-reporting-population`、`tenure-market-reduced-free-owner`、`housing-cost-component-and-allowance-treatment`、`income-vs-housing-cost-reference-period`、`cost-share-vs-overburden-threshold-vs-rate`、`country-vs-EU-population-weighted-aggregate`、`break-revision-quality-and-microdata-boundary`。

Telemetry逐`API/version × dataset/DSD × unit/geo/time × age/sex/tenure/income-group/household dimensions × cost/allowance/income definition × threshold × person/household population × status/break/release × reuse`记录dimension decode、requested/returned/null/flagged、unknown category、time-period mismatch、aggregate coverage、break/revision、suppression、cross-dataset join rejection、microdata attempt rejection与zero effects。

Synthetic至少覆盖：person rate不当household rate；40% threshold不当mean cost share；net-of-allowance不与gross cost merge；income reference year不当survey year；market/reduced/free tenure不merge；EU aggregate不当unweighted country mean；null/flag不当zero；dataset label不替代DSD；HICP actual rent index不替代EU-SILC burden；published aggregate不反推household。

## 5. 不可推断与官方资料

必须拒绝：overburden→homelessness、cost share→rent level、person share→household share、threshold crossing→individual hardship、harmonised framework→identical national collection、EU aggregate→country fact、income year→publication year、microdata availability→public access、generic Eurostat MCP→EU-SILC semantics complete。

- [EU-SILC information on data](https://ec.europa.eu/eurostat/web/income-and-living-conditions/information-data)
- [EU-SILC methodology](https://ec.europa.eu/eurostat/web/income-and-living-conditions/methodology)
- [Housing cost overburden dataset reference](https://ec.europa.eu/eurostat/web/products-eurostat-news/-/ddn-20220616-1)
- [EU-SILC microdata access boundary](https://ec.europa.eu/eurostat/web/microdata/collections-research/european-union-statistics-on-income-and-living-conditions)
- [Eurostat Statistics API](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)
- [Eurostat copyright and reuse](https://ec.europa.eu/eurostat/help/copyright-notice)
