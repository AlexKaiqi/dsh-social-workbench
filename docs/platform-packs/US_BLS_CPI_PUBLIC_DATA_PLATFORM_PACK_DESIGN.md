# U.S. BLS CPI Public Data Platform Pack

## 1. 概念与能力

`us-bls-cpi-public-data`描述美国 Bureau of Labor Statistics 的 Consumer Price Index 公开统计产品，不代表 BLS 全部价格、工资或消费数据。稳定概念是 CPI program、CPI-U/CPI-W/C-CPI-U population、item/area series、price observation、average price、expenditure weight/relative importance、index point、rate of change、quality adjustment、release与revision。

CPI测量定义总体中消费品和服务的价格变化；BLS average price估计少数同质商品的价格水平。两者即使来自部分相同price observations也不能互换。CPI-U、CPI-W、C-CPI-U、seasonally adjusted、not seasonally adjusted、index point、monthly/12-month change和annual average分别保留。

只发布knowledge/fixture能力：`consumer-price.program.read`、`classification.read`、`index.read`、`weight.read`、selected `average-price.read`、`release.read`与`adjustment.read`。不发布个体outlet quote、库存、家庭负担或写能力。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。Public Data API v1可匿名访问，v2需注册key；官方当前限制为v1每日25请求、每次25 series、10年，v2每日500请求、每次50 series、20年，均为10秒50请求。固定fixture使用`GET/POST https://api.bls.gov/publicAPI/v2/timeseries/data/`与headline example `CUUR0000SA0`，但series catalog、item/area code、seasonal posture和program metadata必须单独固定；API返回observations/footnotes不等于完整metadata。

未来binding必须固定API version、series ID、survey/program、item/area、seasonal posture、start/end year、calculation/annual-average参数、registration posture、release lag、footnote/status与访问日。不得轮换多个key规避rate limit；429、database lock或one-day availability lag不能silent retry成另一个route。

BLS average-price series和CPI index series走同一time-series API仍是不同measure。average price发布范围有限，且可能因imputation比例超过门槛而不发布；缺值不证明out-of-stock。

## 3. Snapshot、字段与权利

Snapshot保存program/population、series/item/area catalog digest、index/base/seasonal definition、weight vintage、quality/replacement/imputation method、average-price specification、API/limit/terms、release/revision与decision。分析projection只保留opaque series/item/geography、typed measure/change/weight/adjustment/release posture和approved aggregate；不保存未公开outlet identity或restricted quote microdata。

BLS材料通常为public domain，但API Terms要求标注retrieval date、不得虚假表示、不得使用BLS标识暗示背书，并说明BLS不能为下载后的分析质量与时效担保。public domain不消除method、rate、citation和trademark约束。

## 4. 动态视图、可观测性与fixture

动态视图：`program-population-series-item-area-roster`、`index-vs-average-price-measure-separation`、`weight-reference-vs-index-reference-vs-observation-period`、`NSA-vs-SA-and-revision-lineage`、`quality-replacement-imputation-posture`、`release-footnote-and-api-availability-lag`、`average-price-missing-not-stock`与`price-index-plus-compatible-denominator-only-affordability`。

Telemetry逐`API version × registration posture × program/series × item/area × SA/NSA × measure/change × reference/base/weight period × release/footnote × adjustment/missing posture × terms`记录requested/returned/retained/dropped、HTTP/status/message、rate budget、series/year truncation、unknown series、missing value、footnote drift、catalog mismatch、release lag、weight/method revision、cross-measure rejection与zero effects。

Synthetic至少覆盖：headline index不是dollar price；average price不是inflation rate；CPI-U不扩展到每个家庭；SA与NSA不merge；12-month与monthly change不混；1982–84=100不是美元；rebasing不生成price shock；weight不是purchase count；imputed average price不证明库存；缺denominator不输出affordability；v2 key不进入日志/知识/Git；429不做key rotation规避。

## 5. 不可推断与官方资料

必须拒绝：CPI→price level、average price change→pure inflation、weight→demand、missing quote→stockout、CPI-U→individual household burden、index points→percent、NSA→SA、latest observation→final、API success→metadata complete、community MCP/Skill→BLS authority。

- [BLS Public Data API v2 signatures](https://www.bls.gov/developers/api_signature_v2.htm)
- [BLS Public Data API FAQ and limits](https://www.bls.gov/developers/api_faqs.htm)
- [BLS Public Data API terms](https://www.bls.gov/developers/termsOfService.htm)
- [CPI average price data](https://www.bls.gov/cpi/factsheets/average-prices.htm)
- [CPI relative importance and weights](https://www.bls.gov/cpi/tables/relative-importance/)
- [CPI quality adjustment](https://www.bls.gov/cpi/quality-adjustment/home.htm)
- [BLS copyright/public-domain policy](https://www.bls.gov/opub/copyright-information.htm)
