# Statistics Canada CPI & WDS Platform Pack

## 1. 概念与能力

`statistics-canada-cpi-wds`描述Statistics Canada通过Web Data Service和统计表发布的Canadian CPI、basket weights与selected average retail prices。稳定概念是CPI program、product classification、geography、table/cube PID、coordinate/vector、index point、percentage change、basket/price/link period、weight、average retail price、release、status/symbol与revision。

CPI table、basket-weight table和average-retail-price table是不同统计产品。average prices用于price level，受product rotation、quality/quantity、package standardization和偏好变化影响；纯价格变化应使用CPI/sub-index。表、coordinate、vector和data point是不同identity层。

只发布knowledge/fixture能力：`consumer-price.program.read`、`classification.read`、`index.read`、`weight.read`、selected `average-price.read`、`release.read`与`revision.read`。不发布retailer transaction microdata、库存或individual affordability能力。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。固定官方产品为CPI table PID `1810000401`、basket weights PID `1810000701`、average retail prices PID `1810024501`及food view `1810024502`。WDS提供cube metadata、coordinate/vector series、changed series/cubes、date/latest-period data和`getFullTableDownloadCSV/{PID}/{language}`；全表CSV/SDMX与discrete JSON calls是不同route。

WDS文档声明24/7服务、business day 08:30 ET更新、server 50 req/s及单IP 25 req/s；午夜至08:30部分method可能无数据，table更新期间可能409。future binding必须固定PID、language、cube metadata、dimension/member/code sets、coordinate/vector、reference/release time、scalar/symbol/status/security/frequency code和full-table content digest。409不能解释为data absent或商品 unavailable。

## 3. Snapshot、字段与权利

Snapshot保存CPI reference paper、PID/table metadata、dimension/member/code set、basket/weight/link/base periods、average-price method/package normalization、WDS revision、table correction、Open Licence、decision与verification。默认不保存scanner transaction或可识别business/retailer；公开aggregate也不得与其他数据库合并以尝试识别个人、企业或组织。

Statistics Canada Open Licence允许复用和value-added product，但要求准确、注明来源、不暗示背书、不误表来源，并禁止以识别个人/企业/组织为目的的linkage。logo/wordmark不进入产品表面。

## 4. 动态视图、可观测性与fixture

动态视图：`PID-cube-dimension-member-coordinate-vector-roster`、`CPI-vs-basket-weight-vs-average-price-product-separation`、`basket-reference-price-link-index-reference-period`、`specific-vs-standardized-package-size`、`reference-time-vs-release-time`、`changed-series-cube-and-table-correction-lineage`、`symbol-status-scalar-security-code-audit`、`WDS-discrete-vs-full-table-route`与`missing-409-not-stock`。

Telemetry逐`WDS method × PID/language × cube/coordinate/vector × geography/product × measure/change × basket/link/base/reference period × status/symbol/scalar/security × issue/release/correction × licence`记录request/rate budget、returned/retained/dropped、409/update window、response status、metadata/data mismatch、dimension drift、vector replacement、table correction、full-table digest、package normalization、fallback rejection与zero effects。

Synthetic至少覆盖：CPI index不当CAD price；average price change不当pure inflation；weight不当purchase quantity；table PID不当vector ID；reference period不当release time；409不当zero/missing product；specific package与standardized package不merge；table correction保留predecessor；current-dollar average不与index point相加；无compatible income/earnings denominator不输出affordability。

## 5. 不可推断与官方资料

必须拒绝：CPI→price level、average price→CPI、weight→demand、missing/409→stockout、Canada aggregate→每省/家庭、table correction→old value从未存在、WDS JSON success→semantic completeness、open licence→identification permission、community client→Statistics Canada authority。

- [Statistics Canada Web Data Service](https://www.statcan.gc.ca/en/developers/wds)
- [WDS User Guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)
- [Canadian CPI Reference Paper](https://www150.statcan.gc.ca/n1/pub/62-553-x/62-553-x2023001-eng.htm)
- [CPI monthly table 18-10-0004-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401)
- [CPI basket weights table 18-10-0007-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000701)
- [Monthly average retail prices table 18-10-0245-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810024501)
- [Statistics Canada Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)
