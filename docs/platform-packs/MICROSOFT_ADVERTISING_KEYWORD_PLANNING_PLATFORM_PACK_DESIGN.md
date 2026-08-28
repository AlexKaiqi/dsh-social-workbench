# Microsoft Advertising Keyword Planning Platform Pack 设计

状态：`researched / fixture-eligible / account-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`microsoft-advertising-keyword-planning/v0-design`

## 1. 定位与原生边界

本Pack覆盖Microsoft Advertising Ad Insight v13中的keyword idea、historical monthly counts和traffic estimate read/computation，不覆盖Campaign Management mutation、现有广告表现、Bing Webmaster、自有搜索点击流或全网搜索市场。一个binding必须固定Advertising user/customer/account、developer token、OAuth principal/provider、production或sandbox environment、REST/SOAP interface、v13 schema digest、exact operations、target/seed profile、rights/retention和valid window。

官方来源：[Keyword Ideas and Traffic Estimates](https://learn.microsoft.com/en-us/advertising/guides/keyword-ideas-traffic-estimates?view=bingads-13)、[`GetKeywordIdeas`](https://learn.microsoft.com/en-us/advertising/ad-insight-service/getkeywordideas?view=bingads-13)、[`KeywordIdea`](https://learn.microsoft.com/en-us/advertising/ad-insight-service/keywordidea?view=bingads-13)、[`GetKeywordTrafficEstimates`](https://learn.microsoft.com/en-us/advertising/ad-insight-service/getkeywordtrafficestimates?view=bingads-13)、[Get Started](https://learn.microsoft.com/en-us/advertising/guides/get-started?view=bingads-13)与[sandbox](https://learn.microsoft.com/en-us/advertising/guides/sandbox?view=bingads-13)。本轮未创建账号、OAuth app或sandbox customer，未调用API。

## 2. 概念、能力与表示

| Microsoft concept | `ExternalSearchDemand*`映射 | 约束 |
| --- | --- | --- |
| Query/URL/Category seed | seed binding | seed source精确保留；URL restricted |
| language/location/network/device | target binding | 缺任一核心criteria不可比较 |
| `KeywordIdea.Keyword` | generated idea subject | provider suggestion，不是observed query |
| `Source` | seed/suggestion attribution | Seed、SuggestionFromKeyword/URL/Category、Unknown分开 |
| `MonthlySearchCounts` | historical count series | target/window内的search term count；month anchor必须固定 |
| `Competition` | advertiser-auction measure | bidding advertisers相对强度，不是需求竞争 |
| `SuggestedBid` | advertiser-auction currency measure | location/network与平均CPC推导的estimate |
| relevance | provider ranking/selection | 未定义稳定range，不跨request/platform比较 |
| ad impression share | account/ad context measure | 自有广告impressions / exact-match searches，不是市场份额 |
| traffic estimate | configuration-dependent-forecast | bid/budget/match/negative/target dependent；非预测保证 |

`MonthlySearchCounts[0]`默认是最近可用月，但上月数据可延迟72小时；未显式提供DateRange时不能确定它对应上月还是前月。Pack要求exact month mapping或整体quarantine，禁止用采集时间倒推。

## 3. Access、sandbox与effect合同

- 所有请求需要DeveloperToken和代表有权Advertising user的OAuth token；部分操作还需CustomerId/AccountId。Microsoft OAuth与Google OAuth现在都可作为identity provider，但不会改变API语义或account authority。
- production与sandbox endpoints/credentials分离；sandbox有通用developer token但仍需用户、application ID和sandbox account。sandbox成功只验证transport/schema/effect，不验证production permission、数据质量或用途。
- 初始allowlist只有Ad Insight v13的`GetKeywordIdeas`、`GetKeywordIdeaCategories`和可选`GetKeywordTrafficEstimates`。Campaign Management、Bulk、audience、budget、bid、keyword/campaign mutation与account discovery expansion默认deny。
- REST/SOAP只是wire representation。相同v13 operation可共享semantic fixture，但必须分别固定schema/serialization/error evidence；一个interface成功不自动证明另一个。
- ideas results受search/filter/attribute选择影响。Competition是required attribute，Keyword总是返回；optional/missing metrics必须保持unknown。
- traffic estimates提供min/max或provider estimate，官方明确“不构成未来表现预测或保证”。所有bid、budget、negative keywords、match type、network、language、location和device假设必须保留。

## 4. Skills与开源审计

### `microsoft-ads-keyword-contract-research/v1`

只读Microsoft Learn、官方docs repo/SDK、release notes和用户提供的account/use artifacts，产出operation/schema/permission proposal；不申请token/OAuth，不调用sandbox。

### `microsoft-ads-keyword-fixture-conformance/v1`

用合成REST/SOAP v13 fixtures验证seed/source、month order/lag、optional attributes、competition/suggested bid、targeting、forecast assumptions、unknown和zero write。

### `microsoft-ads-approved-keyword-read/v1`（未来）

只允许获批environment/account/operation/seed/target。当前返回`capability-unavailable:no-authorized-microsoft-advertising-binding`；不fallback到Keyword Planner UI、Bing Webmaster、browser、community MCP或Campaign Management。

| Artifact | Fixed revision / license | 决定 |
| --- | --- | --- |
| [MicrosoftDocs/Advertising](https://github.com/MicrosoftDocs/Advertising/tree/a21125df151aeb0aad524bbce3ef4938c77714c0) | `a21125df…` / CC-BY-4.0 | official docs/release/schema drift source；contract reference |
| [BingAds-Python-SDK](https://github.com/BingAds/BingAds-Python-SDK/tree/cce8cc7510dfd8c909bbcf2ecc59893755f78cd6) | `cce8cc75…` / MIT | official auth/service/serialization seam；不是domain semantics或许可证明 |

未发现官方Microsoft Advertising Keyword Planner MCP/Agent Skill。任何跨Google/Microsoft Ads的community MCP即使只提供read tool，也必须分别通过account、terms、operation和output治理，不能共享credential或maturity。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| result source=Seed | seed subject；不标generated discovery |
| DateRange缺失且最新月尚未ready | month anchor unknown；series quarantine |
| 12个月数组长度完整 | API-field complete；不表示market history complete |
| Competition高、monthly低 | 保留两个measure；不相互覆盖 |
| relevance数值跨度异常 | provider-defined non-comparable；不归一化成需求分 |
| traffic estimate更换bid/match/network | 新forecast definition |
| sandbox通用token成功 | sandbox transport verified only；production仍blocked |
| Campaign Management operation | policy拒绝；zero platform write |

Telemetry按`environment × account binding × v13 interface/schema × operation × seed/target profile × window`记录requested/returned/dropped、source/idea lineage、month anchor/lag/missing、competition/bid/relevance/ad-share basis、forecast config、REST/SOAP drift、OAuth/developer-token/account permission、quota/error和zero writes。sandbox live需用户另行授权；只运行一项最小idea或category request且不产生campaign。production canary另需account/use approval、rate/cost/retention和kill switch。

本Pack没有Paid Search Probe。真实campaign、bid、budget、keyword和广告投放属于独立实验；sandbox estimate不能作为真实市场反应或用户需求证据。
