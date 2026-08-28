# Eurostat EU-SILC Energy Poverty Platform Pack

[Eurostat indicator metadata](https://ec.europa.eu/eurostat/cache/metadata/en/sdg_07_60_esmsip2.htm)把unable to keep home adequately warm定义为EU-SILC self-reported、annual、percentage-of-population indicator；它不是实测temperature、energy consumption、health harm或法律认定。[`ilc_mdes01`](https://ec.europa.eu/eurostat/databrowser/view/ilc_mdes01/default/table)固定warmth item，[`ilc_mdes07`](https://ec.europa.eu/eurostat/web/products-datasets/-/ILC_MDES07)固定utility-bill arrears。arrears on mortgage/rent/hire purchase等更宽组合不得冒充utility-only item。

采用Statistics API/SDMX/bulk的dataset/DSD/codelist/status fixture；country、year、unit、poverty status、sex/age/household type等breakdown仅按exact dimension和approved aggregate用途进入。household response转换成percentage of persons living in households时，household、person与respondent denominator不能互换；2021 Regulation 2019/1700后的method framework建立lineage。

[Eurostat reuse policy](https://ec.europa.eu/eurostat/help/copyright-notice)允许statistical data/metadata在attribution下再利用，并保留resource-level和third-party exceptions。

固定候选：

- [restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)是Eurostat维护的EUPL generic transport reference；
- [eurostat-mcp@`984a7c7`](https://github.com/dcerecedo/eurostat-mcp/tree/984a7c70cda926bdf245d4d1314c6909f1ac4b15)暴露search/dimensions/data，但README license claim与artifact证据需补强，且不含energy-poverty semantic gates。

二者只作static route/schema witness，不安装执行。Telemetry按`dataset × year × country × population/denominator × indicator/item × breakdown × unit/status × DSD/revision`记录latest revision、dimension drift和zero effects。
