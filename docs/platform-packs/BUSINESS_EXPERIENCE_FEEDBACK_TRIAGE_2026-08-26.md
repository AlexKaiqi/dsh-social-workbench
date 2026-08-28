# Business Experience Feedback 平台分诊（2026-08-26）

状态：`researched`；requested=4，fixture-eligible=4，callable=0，durable=0  
目标 Channel：`business-experience-feedback/v0-design`

## 1. 第一性原理结论

要发现的是“人对企业、门店、地点或服务提供者的体验与痛点”，不是接口返回的通用 `review`。最小可信证据单元必须同时固定：主体身份、可访问总体、representation、选择/排序、作者与商家回复、评分尺度、体验上下文、使用权、保留和删除义务。

因此不能复用以产品/version为身份中心的 `ProductFeedback*`，也不能把完整历史、最多若干条相关性样本、节选、licensed feed和provider-generated answer互相补全。新增抽象为 `BusinessExperienceFeedback*`。

## 2. 候选与结论

| 候选 | 价值 | 官方入口 | 当前判定 |
| --- | --- | --- | --- |
| Google Business Profile | 已验证且获授权管理地点的评论、评分、媒体与商家回复 | [Reviews API](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews)、[政策](https://developers.google.com/my-business/content/policies) | synthetic fixture eligible；仅自有/获授权地点，标准政策限制存储与聚合；无sandbox/live |
| Google Places API (New) | 公共地点详情、评分、评论相关性样本与地点身份 | [Place resource](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places)、[政策](https://developers.google.com/maps/documentation/places/web-service/policies) | synthetic fixture eligible；最多5条相关性评论，展示/署名与Maps条款不支持默认建成持久评论数仓 |
| Yelp Places / Yelp AI | 本地商业搜索、评分、短评论节选；有官方AI API/MCP路线 | [Places intro](https://docs.developer.yelp.com/docs/places-intro)、[API Terms](https://terms.yelp.com/developers/api_terms/20250909_en_us/) | synthetic fixture eligible；普通API只有节选且AI/NLP受限；未来仅可评估明确许可的AI contract route |
| Trustpilot Business Units / Data Solutions | 企业单元、完整服务评论feed、verified/source/experience date与删除流 | [Business Units API](https://developers.trustpilot.com/business-units-api)、[Data Solutions](https://developers.trustpilot.com/data-solutions-get-started) | synthetic fixture eligible；full feed需合同，未来持久化还必须执行deletions sync |

“fixture-eligible”只允许用手写合成数据验证概念、schema和拒绝逻辑；不证明调用权、内容使用权或可持久化。当前所有网络路线均为fail closed。

## 3. Skills、MCP 与固定开源证据

| 项目 | 固定revision / license | 用途与结论 |
| --- | --- | --- |
| [googlemaps/agent-skills](https://github.com/googlemaps/agent-skills/tree/84f0e9a2527403a408a61b8705bea0c3900b76a8) | `84f0e9a…` / Apache-2.0 | 官方Maps coding/architecture skill；不是评论数据授权路线 |
| [google/mcp](https://github.com/google/mcp/tree/9ebafd607afdc06245323756a07221df23790a93) | `9ebafd6…` / Apache-2.0 | 官方MCP目录；Maps Grounding是provider answer/recommendation表面，不是raw review feed |
| [Yelp/yelp-mcp](https://github.com/Yelp/yelp-mcp/tree/bd1b41c254986864ba65e70f4a192f36a30363b7) | `bd1b41c…` / Apache-2.0 | 官方单工具natural-language agent；answer与可选预订效果必须隔离 |
| [Yelp/yelp-fusion](https://github.com/Yelp/yelp-fusion/tree/b66545583b9d1f337e20582e98aded32160f52cb) | `b665455…` / MIT | 官方API示例/静态schema参考；license不授予Yelp Content使用权 |
| [trustpilot/node-trustpilot](https://github.com/trustpilot/node-trustpilot/tree/0bb51093b3aa25e964260f28717451b2fd42b017) | `0bb5109…` / MIT | 官方SDK静态参考；旧/当前endpoint差异作为drift输入 |
| [trustpilot/documentation-bruno-collection](https://github.com/trustpilot/documentation-bruno-collection/tree/84c3db1fe3f01d60d1b55b747d78f2b1f7269b99) | `84c3db1…` / root license未确认 | 官方request collection；只作固定静态证据 |

社区Google Maps MCP和多站scraper只作为风险/反例记录：不得以技术可抓取替代平台合同，不安装、不执行、不联网验证。

## 4. 下一门槛

四个member先完成synthetic fixture conformance。任何晋级必须分别取得exact product/API、principal、用途、字段、地理、retention、AI/index/derivative rights和删除义务的书面依据；然后才可申请sandbox/live canary。GBP无sandbox，Google Places/Yelp普通API即使技术可调用也不自动满足本系统持久分析用途。
