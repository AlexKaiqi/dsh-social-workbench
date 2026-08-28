# External Search Demand & Trends Channel Pack 设计

状态：`researched`；4个候选成员，3个fixture-eligible representation，0个callable member  
核验日期：2026-08-26  
Channel Pack ref：`external-search-demand-trends/v0-design`

## 1. 目的、成员与覆盖分母

本Channel回答“哪些主题/措辞在什么引擎、地域、语言、网络和时间窗中表现出搜索兴趣、近似历史量、相关词或季节性”。它不回答用户具体痛点、unique users、购买意愿、全市场规模或实验因果。

| Member | Platform Pack | 当前coverage |
| --- | --- | --- |
| Google Trends | [Google Trends Pack](GOOGLE_TRENDS_EXTERNAL_SEARCH_DEMAND_PLATFORM_PACK_DESIGN.md) | public BigQuery Top/Rising synthetic fixture；alpha API contract-gated |
| Google Ads Keyword Planning | [Google Ads Pack](GOOGLE_ADS_KEYWORD_PLANNING_PLATFORM_PACK_DESIGN.md) | v25 ideas/history/forecast synthetic fixture；account/use absent |
| Microsoft Advertising Ad Insight | [Microsoft Ads Pack](MICROSOFT_ADVERTISING_KEYWORD_PLANNING_PLATFORM_PACK_DESIGN.md) | v13 ideas/monthly/estimate REST/SOAP synthetic fixture；account absent |
| 百度指数 | [百度指数 Pack](BAIDU_INDEX_EXTERNAL_SEARCH_DEMAND_PLATFORM_PACK_DESIGN.md) | concepts/negative fixture only；commercial schema absent |

requested=4、fixture-eligible=3、callable=0。Google Trends alpha和public BigQuery是同一provider的两个独立member representations；只有后者当前可做schema fixture。百度指数negative fixture不计机器能力的fixture-eligible分母。

## 2. 共同抽象与不可比较边界

共同`ExternalSearchDemandDefinitionMetadata`固定provider/surface/access population、API/schema、term/topic/idea taxonomy、representation和measure basis、seed/expansion、network/geo/language/locale/device/category/match target、sampling/normalization/scaling/noise/threshold/suppression/approximation/refresh、selection/rank、rights/retention/deletion和valid window。`ExternalSearchDemandRecordMetadata`再绑定dataset、subjects、seed、target、computation、forecast assumptions、window/interval、Top-N、history与coverage；数值留在schema-bound payload，rollup继续由`AggregateDatasetMetadata`约束。

必须保留：

- Google Trends term、provider topic、Ads exact term/close variants、provider-generated idea、百度组合词是不同subject identities；
- request-local normalized interest、consistent-scale interest、approximate historical count、weighted index、rank和forecast不共享unit或denominator；
- advertiser competition、suggested bid/CPC不是用户需求、产品竞争度、WTP或成交价；
- forecast依赖account/campaign/bid/budget/match/negative/window，不能与observed history混合；
- provider idea由seed/expansion生成，不证明有人搜索过该idea，更不证明独立需求；
- Top 25、API page completion、12个月array完整和sandbox成功只证明本地representation，不证明market coverage；
- engine/network/geo/language/device/category/timezone/window不同，不跨成员相加search counts或构造market share；
- low-volume zero、missing/suppressed、lag、not-in-top-list与API error分别保留；
- query/URL/site seed可含敏感或商业信息，默认restricted；不关联搜索用户身份；
- official docs/SDK/MCP、技术credential和数据用途/保留权是三个独立事实。

## 3. 动态物化视图

- `search-interest-seasonality-by-reviewed-subject`：在单member/representation/definition内计算seasonality/change candidates；不跨scale拼接。
- `historical-volume-and-interest-corroboration`：把Trends interest、Google/Microsoft approximate counts和百度weighted index并排展示并保留units；不求总量或平均。
- `emerging-ranked-and-related-term-candidates`：从Top/Rising/related/provider ideas形成候选，明确rank/seed/source/coverage；不称observed pain。
- `seed-to-provider-suggestion-lineage`：追踪keyword/URL/site/category到idea及close variants，防止provider expansion冒充用户语言。
- `regional-language-network-demand-context`：只在兼容target/interval中比较member-local变化；禁止从relative region interest反推人数。
- `external-search-demand-evidence-schema-and-methodology-drift`：监控alpha access、API version、token/use、schema、term/topic、normalization/noise、month lag、network roster、license/cost/retention。
- `search-signal-to-authored-pain-corroboration-candidates`：只生成与support/review/interview/issue/owned search的bridge proposal；需exact reviewed subject和独立authority。

所有projection固定Channel/member/representation/definition、subject bridge revision、target、window、rights和watermark。Dolt snapshot保存Platform Pack、methodology/schema/evidence、bridge和projection revisions；未来获准的高频cells进入分析存储。物化视图可重建，methodology、rights或rolling-window expiry触发失效，不改写旧knowledge decision。

## 4. Channel Skills 与 Probe

### `external-search-demand-source-research/v1`

只读官方docs/spec/help/Terms、固定版本官方/社区仓库和用户提供contract artifacts，输出member/abstraction/drift proposal；不申请alpha/token、OAuth、登录、调用API/BigQuery或读取真实query。

### `approved-external-search-demand-read/v1`（未来）

只调度verified member binding和approved subject/seed/target/query profile。当前所有成员返回`no-authorized-member-binding`；禁止fallback到Trends UI、HTML、browser、Cookie、undocumented endpoint、proxy、community MCP/Skill/SDK或另一member。

### `external-search-demand-channel-conformance/v1`

先运行member fixture，再验证subject bridge、measure basis、target/window、zero/missing/suppression、Top-N/member coverage、forecast separation、privacy/cost与zero write。

本Channel没有搜索操纵或广告写入Probe。主动probe只能进入独立、获批的Paid Search/Landing/Content Experiment：使用真实可交付产品、truthful ad/landing、预算上限、平台政策、逐effect approval、assignment/exposure/receipt/reconcile。自动搜索、刷词、点击、创建百度新词、批量污染autocomplete/trends或未获批广告投放均禁止。

## 5. Fixture矩阵与可观测性

| 场景 | 必须结果 |
| --- | --- |
| 同label的Trends topic和Ads term | two subject authorities；只产生bridge candidate |
| Google Ads 1000 searches vs Trends 80 | 保留approximate count与interest scale；不算比例 |
| Microsoft monthly count与Google close-variant count | variant/network/engine不同；不相加 |
| 百度PC/mobile index与Google count | weighted indices独立；不换算绝对量 |
| idea在两个provider出现 | two provider suggestions；不计two independent user demands |
| Top 25无某词但Ads有volume | ranked-list absence与historical metric可并存 |
| forecast clicks高于historical count | schema/assumption conflict候选；forecast不覆盖history |
| one member auth/schema/policy drift | member quarantine，Channel partial；不fallback |
| UI/Cookie/community MCP/write请求 | preflight拒绝；zero network/account/cost/write |

Telemetry按`Channel × member binding × population/representation × definition/schema × subject bridge × target/window`记录expected/fixture/callable/succeeded/blocked/quarantined、requested/returned/dropped、measure-basis rejection、subject/seed/variant lineage、rank/Top-N/month/market coverage、zero/missing/suppression/lag、methodology/schema/token/permission/license/cost/retention drift和zero UI/write。至少一个真实member binding经fixture与sandbox canary后Channel才可成为`modeled-partial`；不同representation、production和Paid Search Probe分别晋级。
