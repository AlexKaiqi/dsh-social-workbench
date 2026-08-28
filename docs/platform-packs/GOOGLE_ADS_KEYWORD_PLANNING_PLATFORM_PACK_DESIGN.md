# Google Ads Keyword Planning Platform Pack 设计

状态：`researched / fixture-eligible / account-and-permissible-use-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`google-ads-keyword-planning/v0-design`

## 1. 定位与访问合同

本Pack只覆盖Google Ads API v25的Keyword Planning read/computation methods，用来发现provider-generated keyword ideas、近似历史搜索次数、广告竞价上下文和配置相关forecast。它不覆盖campaign performance、Search Console、Google Trends，也不创建或修改campaign/ad group/keyword/budget/audience。

官方来源：[Keyword Planning](https://developers.google.com/google-ads/api/docs/keyword-planning/overview)、[ideas](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-keyword-ideas)、[historical metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)、[forecast metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-forecast-metrics)、[developer token](https://developers.google.com/google-ads/api/docs/api-policy/developer-token)、[permissible use](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)与[API Terms](https://developers.google.com/google-ads/api/docs/api-policy/terms)。

一个binding必须固定Ads customer、manager relationship、developer-token access level、permissible-use decision、OAuth principal、API version/schema digest、exact methods、seed/target profile、data-use/storage/retention和valid window。credential只保存ref。当前未申请或使用developer token/OAuth/account。

## 2. 概念与能力映射

| Google Ads concept / method | `ExternalSearchDemand*`映射 | 需求解释边界 |
| --- | --- | --- |
| `GenerateKeywordIdeas` | keyword-idea-set + provider-suggestion | suggestions由seed/expansion产生，不是observed query corpus |
| keyword/URL/site seed | seed binding | URL/site可能包含内部或竞品信息，restricted payload |
| keyword text + close variants | exact subject + close-variant policy | metrics可能合并close variants，不可称exact-only count |
| avg monthly searches | approximate-historical-count | 近12个月平均，不是当前月或unique users |
| monthly search volumes | approximate-historical-count series | provider approximate；month/window/network/geo/language固定 |
| competition/index | advertiser-auction measure | ad slots filled/available，与用户痛点或产品竞争度无关 |
| low/high top-of-page bid | advertiser-auction currency measure | 20/80 percentile bid，不是WTP或成交价格 |
| `GenerateKeywordForecastMetrics` | configuration-dependent-forecast | account/campaign/bid/negative/period模型输出，不是观测事实 |
| ad group themes | provider suggestion | 广告结构建议，不作为需求taxonomy真值 |

ideas、history、auction与forecast是四个capability populations。一次response同时出现idea和historical metrics时也要分别标注subject source与measure basis。Forecast可由temporary request structures计算，不代表平台创建了campaign；但后续创建campaign属于独立高影响write，本Pack恒拒绝。

## 3. API、权限和成本/限流边界

- 当前contract固定Google Ads API v25。master proto、latest docs或SDK自动升级不能静默改变binding；version sunset产生drift proposal。
- API需要manager account取得developer token、Google Cloud OAuth和有权访问的customer account。Test/Explorer/Basic/Standard access分别影响environment和24-hour operation limits；Basic/Standard还需获批`Researching keywords and recommendations` permissible use。
- OAuth `https://www.googleapis.com/auth/adwords`是宽scope。PortBinding必须再以service/method allowlist限制到`KeywordPlanIdeaService.GenerateKeywordIdeas`、`GenerateKeywordHistoricalMetrics`和可选forecast；GAQL account reporting、RecommendationService和全部mutate默认拒绝。
- planning services比通用API有更严格的requests-per-minute限制，历史指标月更。官方建议cache并不自动授予长期仓储、AI训练、跨客户比较或对外再分发权；实际purpose/retention以API Agreement、token approval和用户组织政策共同决定。
- site seed可从公开站点生成大量ideas，技术上可用不等于允许开放世界竞品扫描。每个URL/site/keyword seed set必须在plan中明确批准，并有size/cost/result limit。
- bid micros、currency、forecast period、account relevance、match type、negative keywords和campaign configuration必须进入forecast binding；缺一项时forecast不可比较。

## 4. Skills、MCP与开源审计

### `google-ads-keyword-contract-research/v1`

只读官方docs/proto/Terms/token policy和用户提供的access artifacts，产出version/method/permissible-use/schema proposal；不登录Ads，不申请token，不调用API。

### `google-ads-keyword-fixture-conformance/v1`

用合成v25 payload验证seed/idea lineage、close variants、approximate monthly metrics、auction semantics、forecast assumptions、pagination/rate和zero mutation。

### `google-ads-approved-keyword-read/v1`（未来）

只允许获批customer/seed/target/method。当前返回`capability-unavailable:no-authorized-google-ads-keyword-binding`；不借用Search Console、Trends UI、community MCP或campaign-wide GAQL fallback。

| Artifact | Fixed revision / license | 决定 |
| --- | --- | --- |
| [googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp/tree/ba47210245f2925a130a2770a4d272d5dd0c91cd) | `ba472102…` / Apache-2.0 | official static reference；当前tools为GAQL search/resource metadata/accessible customers，不暴露KeywordPlanIdeaService；会向Agent暴露account data，不作为本Pack route |
| [googleads/google-ads-python](https://github.com/googleads/google-ads-python/tree/481f2227c996a80f63bb863bbdb2151c5d44fe38) | `481f2227…` / Apache-2.0 | official auth/client/error/sample reference；不直接作为domain adapter |
| [googleapis/googleapis](https://github.com/googleapis/googleapis/tree/d10ac9249540add035ce07b6a54028ab643e1532/google/ads/googleads) | `d10ac924…` / Apache-2.0 | official proto/schema drift reference；binding仍固定v25 artifact |
| [ncosentino/google-keyword-planner-mcp](https://github.com/ncosentino/google-keyword-planner-mcp/tree/e4df7f6593a4a0f5fb06e105aef7630959aab162) | `e4df7f65…` / MIT | community direct-tool/fixture reference；需要宽credential，HTTP普通caller无内建auth，不安装/执行 |

官方MCP本身不是“官方Keyword Planner MCP”。社区MCP的窄tool名称也不能替代developer-token permissible use、OAuth、customer authority、network egress、effect gate与output governance。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| seed keyword原样出现在结果 | source=seed；不标provider-discovered |
| URL/site扩展出250K候选 | provider suggestions + truncated/budgeted coverage；不标250K observed queries |
| historical metric含close variants | exact subject与variant set绑定；不称exact-only volume |
| avg monthly与逐月值同时存在 | average和monthly series分measure；不重复相加 |
| competition=high | advertiser auction context；不生成高需求/高WTP结论 |
| forecast更换bid/account | 新forecast definition；旧/new不可直接比较 |
| developer token用途不含keyword research | preflight拒绝；zero API call |
| MCP/GAQL/mutate请求 | policy拒绝；zero account data expansion/write |

Telemetry按`customer binding × API/schema version × exact method × seed/target profile × window`记录requested/returned/dropped、idea source/expansion、close-variant coverage、approximate/missing monthly values、auction/forecast separation、pagination/quota/cache age、token/access/permissible-use/OAuth/customer drift、URL/term minimization和zero mutations。sandbox需用户另行授权一个test或低风险customer，先验证最小historical/idea request；forecast再单独晋级。operational canary必须监测version sunset、method/schema、quota、token review、customer permission和cost。

本Pack没有广告投放Probe。创建campaign、调整bid/budget、添加keyword或audience会产生费用与真实市场影响，必须进入独立Paid Search Experiment并绑定预算、truthful ad/landing、approval、receipt和reconcile。
