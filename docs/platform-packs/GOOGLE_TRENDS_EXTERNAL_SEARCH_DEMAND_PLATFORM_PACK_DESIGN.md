# Google Trends External Search Demand Platform Pack 设计

状态：`researched / public-dataset-fixture-eligible / alpha-contract-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`google-trends-external-search-demand/v0-design`

## 1. 定位与 representations

本Pack表达Google Trends的search interest，不表达绝对搜索次数、搜索人数、Google Ads volume、Search Console impressions或购买意愿。它把三个官方representations分开：

| Representation | Population | 当前路线 |
| --- | --- | --- |
| Trends UI/export | request-local 0–100 normalized interest | presentation/manual only；无自动网页路线 |
| Trends API alpha | consistently-scaled interest，rolling 5 years | contract-gated；无公开exact schema/binding |
| public BigQuery datasets | Top 25 overall/rising ranked terms by geography/time | schema fixture-eligible；live query/cost未授权 |

官方来源：[API alpha](https://developers.google.com/search/apis/trends)、[data FAQ](https://support.google.com/trends/answer/4365533)、[term vs topic](https://support.google.com/trends/answer/17309543)和[BigQuery dataset](https://support.google.com/trends/answer/12764470)。本Pack不申请alpha、不访问UI/undocumented endpoints、不运行BigQuery，不导入真实query。

## 2. 概念与抽象映射

| Google Trends concept | `ExternalSearchDemand*`映射 | 约束 |
| --- | --- | --- |
| search term | exact-term subject | 特定语言字符串；不包含同义/翻译 |
| topic | provider-topic subject | Knowledge Graph概念；provider ID/type必须保留 |
| interest over time | interest-series record | window/interval/geo/search surface/category固定 |
| interest by region | regional-interest record | relative proportion；不用地区人口补成count |
| normalized UI score | sampled-normalized-interest | request-local scale；变更comparison set/window即新definition |
| alpha API interest | consistently-scaled-interest | 可跨request比，仍不是absolute count |
| Top / Rising | ranked-truncated-list | Top 25 population；rank/growth不补全long tail |
| low-volume zero | thresholded/suppressed state | 不证明zero searches |
| statistical noise | computation noise policy | 不将孤立小spike解释为真实事件 |

term、topic、Top story和related query是不同identity。只有exact provider topic ID或reviewed bridge才能关联；名称、翻译、字段相似只产生candidate。任何query/term原文均进schema-bound payload，低频或敏感词不广泛展示。

## 3. Alpha API 与 BigQuery 合同

### 3.1 Alpha API

- 只有通过alpha申请并取得实际docs/schema/terms的principal才能提议binding；公开概览页不是API contract。
- 当前可建模的稳定知识只有rolling five-year window、daily/weekly/monthly/yearly aggregation、region/sub-region和consistent scale，以及不是absolute count。
- endpoint、auth、quota、topic/term schema、sampling/scaling/noise、lag、retention和用途权在actual alpha artifact到达前均为unknown。不能借用UI或BigQuery字段补全。

### 3.2 Public BigQuery

- US daily数据为rolling 5 years，hourly为rolling 1 year，覆盖210 DMAs；international daily覆盖约50 countries/sub-regions，以官方当前schema/roster为准。
- dataset只是Top 25 overall/rising。partition查询耗尽不证明市场全量；未出现不表示零需求。
- BigQuery sandbox/free tier是技术访问/计费条件，不替代dataset license、attribution、purpose和retention。live plan必须固定project/billing mode、maximum bytes/cost、partition、schema digest、geography roster和CC-BY attribution。
- daily/hourly/international是独立representations，不按term/date直接相加。

## 4. Skills与开源审计

### `google-trends-contract-research/v1`

只读官方docs/help、官方固定data repo和用户提供的alpha contract artifacts，产生term/topic/computation/schema/rights proposal；不申请alpha或请求数据。

### `google-trends-public-dataset-fixture/v1`

用合成BigQuery rows验证Top/Rising、rank、geo/time representation、Top 25 truncation、missing/zero、attribution和cost gate。

### `google-trends-approved-read/v1`（未来）

只允许已批准alpha或BigQuery binding的exact representation/query profile。当前返回`capability-unavailable:no-authorized-trends-binding`；不fallback到UI、pytrends、undocumented JSON、RSS、browser或community MCP。

固定官方[GoogleTrends/data `44ce5e8c…`](https://github.com/GoogleTrends/data/tree/44ce5e8cdb786b6bd5257dd5e9ea6af58fcffe16)为CC-BY-4.0 static data/attribution reference。[pytrends `a9984ffd…`](https://github.com/GeneralMills/pytrends/tree/a9984ffdc9b31d853dde2ab614a77ecbf2bf33a1)和[pat310/google-trends-api `7d7f0ea6…`](https://github.com/pat310/google-trends-api/tree/7d7f0ea669dddc579d128272430fb1c41e5bd298)均使用未公开UI endpoint，作rejected route/schema-drift reference。未发现官方Google Trends MCP/Agent Skill。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| UI 0–100的window/comparison set变化 | 新definition；旧/new value不直接join |
| alpha consistent-scale value | consistent interest；不标absolute count |
| exact term和topic label相同 | two subjects；不自动merge |
| Top 25 partition完整 | record completion=true，market coverage=truncated |
| 词未进Top 25 | absent-in-ranked-population；不标zero |
| low-volume value=0 | threshold/noise-aware unknown；不标zero searches |
| 单日小spike | provider interest observation；不自动生成demand event |
| BigQuery bytes超budget | preflight拒绝；zero query/cost |

Telemetry按`representation × schema/computation revision × subject kind × geo/surface/category × window/interval`记录requested/returned/retained/dropped、rank/Top-N coverage、zero/missing/threshold/noise、term/topic conflict、data lag/rolling expiry、schema/geography/terms/license drift、BigQuery bytes/cost和zero UI/write。晋级顺序为official evidence → synthetic fixture → actual contract/schema review → sandbox query → operational canary；alpha和BigQuery分别晋级。

本Pack没有search-manipulation Probe。不通过自动搜索、点击、重复query或刷趋势测试需求；真实广告/landing/content experiment属独立Probe Channel。
