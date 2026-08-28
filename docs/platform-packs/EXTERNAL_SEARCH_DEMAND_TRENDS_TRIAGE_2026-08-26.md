# External Search Demand & Trends 候选分流

状态：`researched / design-only`  
核验日期：2026-08-26

## 1. 第一性结论

站外搜索数据能补充需求的频率、季节性、地域与关联措辞，但不直接提供痛点语境、购买意愿或人数。本轮必须先拆开六种不可互换的representation：

1. 经抽样、隐私处理和归一化的relative search interest；
2. 跨请求尺度一致，但仍不是absolute volume的interest；
3. 广告规划上下文中的approximate historical search counts；
4. 平台加权计算的search index；
5. 根据keyword/URL/site/category seed生成的provider suggestion；
6. 依赖账户、出价、预算、match type与negative keyword的forecast/model output。

`AggregateDatasetMetadata`继续回答“cell怎样roll up”；新增的`ExternalSearchDemand*`回答“这个数究竟是什么”。它不复用站内`SearchIntent*`，因为站内query是自有surface的captured interaction，而本Channel是provider aggregate/model population。

## 2. 候选成熟度

| Member | 官方机器面 | 语义 / 权限结论 | 当前决定 |
| --- | --- | --- | --- |
| Google Trends | 限量alpha API；public BigQuery Top/Rising datasets | API是consistent-scale interest，不是绝对量；BigQuery是Top 25截断榜单，不是任意词时序 | `alpha-contract-gated / public-dataset-fixture-eligible / no binding` |
| Google Ads Keyword Planning | Google Ads API v25；developer token + OAuth + Ads customer | keyword ideas、approximate 12-month history、auction competition/bid与configuration forecast分开；permissible use必须允许keyword research | `account-contract-gated / fixture-eligible / no binding` |
| Microsoft Advertising Ad Insight | REST/SOAP v13；developer token + OAuth + account；sandbox独立 | idea/monthly counts/competition/suggested bid与traffic estimates分开；network/filter/month anchor必须固定 | `account-gated / fixture-eligible / no binding` |
| 百度指数 | 首页宣传付费数据接口；旧帮助仍写无开放API；无public schema | search index是加权频次指数，不是count；public web/cookie/internal endpoint不是路由 | `commercial-contract-only / schema-blocked / no binding` |

requested=4；fixture-eligible=3；callable=0。Google Trends只有public BigQuery representation可进合成fixture，alpha API在取得实际schema/terms artifact前不计fixture-eligible。百度指数需要官方商业接口合同、schema和数据用途证据，无HTML/Cookie/内部接口fallback。

## 3. 官方证据与概念

### 3.1 Google Trends

- [Google Trends API alpha](https://developers.google.com/search/apis/trends)当前仍需申请限量测试；提供rolling 5 years、daily/weekly/monthly/yearly interval、region/sub-region和跨request consistent scale，但官方明确其数值不是absolute count。
- [Trends data FAQ](https://support.google.com/trends/answer/4365533)说明通用Trends数据是搜索sample，经anonymize/category/aggregate；UI数据按地域/时间的总搜索归一并0–100 scaling，有低量threshold、duplicate filter、statistical noise和irregular-activity caveat。这些通用知识不得用来猜测alpha API未公开的exact schema/scaling。
- [term vs topic](https://support.google.com/trends/answer/17309543)是稳定概念边界：term是特定语言字符串，topic是Knowledge Graph聚合的跨语言概念；两者不可按label合并。
- [Google Trends BigQuery dataset](https://support.google.com/trends/answer/12764470)只提供Top 25 overall/rising；US覆盖210 DMAs，daily rolling 5 years/hourly rolling 1 year，international约50 countries与sub-regions，daily rolling 5 years。这是ranked/truncated population，BigQuery sandbox/free tier不等于zero cost或任意保留授权。

### 3.2 Google Ads Keyword Planning

- [Keyword Planning overview](https://developers.google.com/google-ads/api/docs/keyword-planning/overview)区分ideas、ad-group themes、historical metrics和forecast metrics；历史metrics月更新，planning services的rate limit比通用service更严。
- [GenerateKeywordIdeas](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-keyword-ideas)允许keyword、URL、keyword+URL或site seed，并固定language、geo、network、adult、annotation和historical options；site seed可返回大量provider-generated ideas，不能被当作observed queries。
- [Historical metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)提供近12月average、逐月approximate search counts、close variants、auction competition/index和20/80 percentile top-of-page bid。competition反映ad slots filled，不是user pain、付费意愿或竞品数。
- [Forecast metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-forecast-metrics)依赖account relevance、campaign/ad-group structure、negative keywords、bid strategy和forecast period；impressions/clicks/cost/CTR是model output，不是历史需求事实。
- [Access levels and permissible use](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)将developer token的Test/Explorer/Basic/Standard和功能用途分开；keyword planning需匹配“Researching keywords and recommendations”用途。OAuth `adwords` scope较宽，不能用scope本身代替exact method/effect allowlist。

### 3.3 Microsoft Advertising

- [Keyword Ideas and Traffic Estimates](https://learn.microsoft.com/en-us/advertising/guides/keyword-ideas-traffic-estimates?view=bingads-13)将`GetKeywordIdeas`与`GetKeywordTrafficEstimates`分开；phrase/URL/category seed与language/location/network为核心定义。
- [`KeywordIdea`](https://learn.microsoft.com/en-us/advertising/ad-insight-service/keywordidea?view=bingads-13)提供source、monthly counts、competition、relevance、suggested bid和ad impression share。monthly list默认最近12个月、最新月可lag 72 hours；不指定DateRange时甚至无法确认第一个cell是上月还是前一月。
- [`KeywordEstimate`](https://learn.microsoft.com/en-us/advertising/ad-insight-service/keywordestimate?view=bingads-13)和`GetKeywordTrafficEstimates`依赖bid/language/location/network/budget/negative filters；官方明确不是prediction或guarantee。
- [Get Started](https://learn.microsoft.com/en-us/advertising/guides/get-started?view=bingads-13)和[OAuth quick start](https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-quick-start?view=bingads-13)要求Advertising account、developer token、OAuth user consent，并在需要时提供customer/account ID。[sandbox](https://learn.microsoft.com/en-us/advertising/guides/sandbox?view=bingads-13)与production credential/environment隔离，成功调用sandbox不提升production/data-use成熟度。

### 3.4 百度指数

- [当前首页](https://index.baidu.com/v2/)宣传“实时调用数据接口化获取”和付费API加词，证明商业机器面可能存在；但本轮未发现无需签约的public API/schema docs。
- [官方帮助](https://index.baidu.com/Helper/?tpl=help)仍声明大众版不支持下载、暂不提供开放API；定义search index为以搜索量为基础的加权搜索频次，分PC/mobile，且需求图谱的前/后相关词、资讯指数、媒体指数和人群属性是不同产品。新词创建是付费且不可撤回的platform write。
- [版权声明](https://index.baidu.com/Helper/?tpl=copyright)限制未经授权的复制、发布、改写、再发行和商业使用。因此“付费token可调”、“代码是MIT”和“可长期保存/索引/AI分析数据”是三个独立事实。

## 4. Skills、MCP与开源候选

| Artifact | Fixed revision / license | 价值 | 决定 |
| --- | --- | --- | --- |
| [googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp/tree/ba47210245f2925a130a2770a4d272d5dd0c91cd) | `ba472102…` / Apache-2.0 | 官方MCP；GAQL account search、resource metadata、accessible customers、tool config | `official-static-reference`；未暴露KeywordPlanIdeaService，且会向Agent暴露account data，不是本Channel route |
| [googleads/google-ads-python](https://github.com/googleads/google-ads-python/tree/481f2227c996a80f63bb863bbdb2151c5d44fe38) | `481f2227…` / Apache-2.0 | 官方auth/client/error/sample reference | `official-reference-only` |
| [googleapis/googleapis](https://github.com/googleapis/googleapis/tree/d10ac9249540add035ce07b6a54028ab643e1532/google/ads/googleads) | `d10ac924…` / Apache-2.0 | 官方proto/schema drift source | `official-schema-reference`；live仍固定API version |
| [GoogleTrends/data](https://github.com/GoogleTrends/data/tree/44ce5e8cdb786b6bd5257dd5e9ea6af58fcffe16) | `44ce5e8c…` / CC-BY-4.0 | 官方开源Trends data/index与attribution参考 | `official-data-reference`；不是alpha/BigQuery connector |
| [MicrosoftDocs/Advertising](https://github.com/MicrosoftDocs/Advertising/tree/a21125df151aeb0aad524bbce3ef4938c77714c0) | `a21125df…` / CC-BY-4.0 | 官方v13 docs、release/schema drift | `official-contract-reference` |
| [BingAds Python SDK](https://github.com/BingAds/BingAds-Python-SDK/tree/cce8cc7510dfd8c909bbcf2ecc59893755f78cd6) | `cce8cc75…` / MIT | 官方auth/service client seam | `official-reference-only`；不定义需求语义 |
| [ncosentino/google-keyword-planner-mcp](https://github.com/ncosentino/google-keyword-planner-mcp/tree/e4df7f6593a4a0f5fb06e105aef7630959aab162) | `e4df7f65…` / MIT | 窄Keyword Planner MCP、ideas/history/forecast tool shape、Go/C# dual fixtures | `community-static-reference`；HTTP默认无caller auth、依赖宽`adwords` credential，不安装/执行 |
| [GeneralMills/pytrends](https://github.com/GeneralMills/pytrends/tree/a9984ffdc9b31d853dde2ab614a77ecbf2bf33a1) | `a9984ffd…` / Apache-2.0 | UI的term/topic/geo/time/related mapping和失败样本 | `rejected-undocumented-route`；README自称unofficial/待maintainer |
| [pat310/google-trends-api](https://github.com/pat310/google-trends-api/tree/7d7f0ea669dddc579d128272430fb1c41e5bd298) | `7d7f0ea6…` / MIT | UI interest/related/ranked response shape | `rejected-undocumented-route` |
| [lampofaladdin/baidu-index](https://github.com/lampofaladdin/baidu-index/tree/f1b10ab2992056cc73c14664cbe72299547f7b05) | `f1b10ab2…`；manifest声称MIT但无root LICENSE | 付费token/task/refresh flow候选知识 | `contract-schema-reference-only`；非官方，不证明数据权利 |
| [longxiaofei/spider-BaiduIndex](https://github.com/longxiaofei/spider-BaiduIndex/tree/fe251d22a9938ee9f0bd667ad153cd9f1da20fef) | `fe251d22…` / MIT | cookie/internal endpoint/decryption/rate failure modes | `rejected-private-route`；不作Connector或fixture数据源 |

未发现官方Google Trends、Microsoft Ads Keyword Planner或百度指数Agent Skill/MCP。未安装、执行、连接或导入任何候选，也未读取其他仓库携带的真实query/index数据。

## 5. 共同验证要求

1. term/topic/category/generated idea/close variant不按文本label自动合并；只生成review candidate。
2. relative/consistent interest、approximate count、weighted index、rank、advertiser competition/bid和forecast各自固定measure basis。
3. seed、expansion、network、geo、language、device、category、match type、window、interval、normalization、noise/threshold、refresh与coverage不得默认补全。
4. Top 25、page complete、monthly list完成和API response complete不得提升为market coverage。
5. low-volume zero、missing month、suppressed term、empty result、lag和quota error必须可区分。
6. URL/site seed与query text通过字段级敏感处理，不将account/customer/keyword identity扩大到人物画像。
7. public UI、undocumented endpoint、Cookie、proxy、community MCP/Skill不是官方路由的fallback。
8. 任何申请alpha/developer token、OAuth、广告账号访问、BigQuery query/cost、付费接口或新词创建均需用户另行授权。
