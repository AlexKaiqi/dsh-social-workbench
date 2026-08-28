# FDA Drug Shortages / openFDA Platform Pack 设计

状态：`researched / concept+native-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`fda-drug-shortages/v0-design`

## 1. 产品、概念与价值

本Pack描述FDA Drug Shortage Database经openFDA提供的公开JSON与bulk representation。官方[overview](https://open.fda.gov/apis/drug/drugshortages/)说明原始数据来自FDA Drug Shortages、经openFDA转换并可附加harmonized fields，覆盖2012年至今并daily更新；[fields](https://open.fda.gov/apis/drug/drugshortages/searchable-fields/)包含package NDC、generic/proprietary name、company、presentation、availability、status、shortage reason及多类日期。

| Native concept | `PublicMedicineSupply*` | 约束 |
| --- | --- | --- |
| shortage record | event/notification revision | API未显式稳定ID时必须定义composite identity并审计碰撞 |
| generic/proprietary/presentation/NDC | product/presentation identity | harmonization可能缺失；共享名称不等于相同规格 |
| status/update type/availability | native state + lifecycle | 三者不互相替代 |
| shortage reason | source-reported cause | FDA/manufacturer attribution分开，不视为verified root cause |
| related/resolved notes | mitigation/resolution span | 不生成替代或治疗建议 |

`contact_info`即使公开也在普通projection中drop。openFDA明确要求不得用于医疗决策。

## 2. 能力、route与历史

concept capabilities为public search/read/count、field discovery和bulk snapshot discovery。[官方route](https://open.fda.gov/apis/drug/drugshortages/how-to-use-the-endpoint/)固定为`GET https://api.fda.gov/drug/shortages.json`，单次limit最大100，支持openFDA query syntax；API key影响配额，不改变数据权限。route fixture记录query、sort/count、limit/skip、错误、rate headers、meta last_updated、field reference revision和HTTPS。

bulk与API返回同格式，但[下载说明](https://open.fda.gov/apis/drug/drugshortages/download/)指出一次更新可能修改旧记录，完整刷新必须重新获取全部文件。因此cursor不能伪装成append-only；每次snapshot都要做record diff、tombstone候选和schema/terms drift。

[Terms](https://open.fda.gov/terms/)通常以CC0提供，但第三方内容例外、disclaimer和rate policy逐snapshot固定。API、bulk、FDA source page是同源representation，不重复计数。

## 3. OSS/Skill、Fixture与晋级

[FDA/openfda@fdbe543](https://github.com/FDA/openfda/tree/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c)是官方CC0 source reference。两个community MCP/Skill固定样本把route写成`drugshortages`或`/drug/drugshortages.json`，并使用当前官方fields中不存在的名称；它们进入route-drift负面fixture，不得执行或复用。

synthetic fixture覆盖presentation identity、missing NDC、current→resolved→relisted、status/availability冲突、旧记录被修订、cause authority、contact drop、API/bulk common-origin、limit/rate/terms drift和zero writes。Telemetry按`query × composite event/product/presentation × status/update/availability × source snapshot × schema/terms revision`记录identity collision、field omission、history gap、contact drop和rights block。

metadata-only canary需用户批准。bulk corpus、durable history、source notes和harmonized third-party fields另审；任何shortage report、contact、医疗判断或替代建议拒绝。
